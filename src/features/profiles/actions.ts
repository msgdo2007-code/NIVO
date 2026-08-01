"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/lib/permissions/auth";
import {
  appearanceSchema,
  blockMutationSchema,
  blockTypeSchema,
  onboardingSchema,
  profileSchema,
  type ProfileActionState,
} from "@/lib/validations/profile";

type MutationResult = { success: true; message?: string } | { success: false; message: string };

function formBoolean(value: FormDataEntryValue | null) {
  return value === "true" || value === "on";
}

export async function completeOnboarding(
  _state: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const parsed = onboardingSchema.safeParse({
    username: formData.get("username"),
    displayName: formData.get("displayName"),
    templateSlug: formData.get("templateSlug"),
  });
  if (!parsed.success) return { status: "error", message: "Revise os campos.", fields: parsed.error.flatten().fieldErrors };

  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("complete_onboarding", {
    requested_username: parsed.data.username,
    requested_display_name: parsed.data.displayName,
    requested_template_slug: parsed.data.templateSlug,
  });

  if (error) {
    if (error.code === "23505") return { status: "error", message: "Este username já está em uso.", fields: { username: ["Escolha outro username."] } };
    return { status: "error", message: "Não foi possível concluir o onboarding." };
  }

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/editor");
}

export async function updateProfile(
  _state: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const parsed = profileSchema.safeParse({
    displayName: formData.get("displayName"),
    bio: formData.get("bio"),
    professionalTitle: formData.get("professionalTitle"),
    location: formData.get("location"),
    isPublished: formBoolean(formData.get("isPublished")),
  });
  if (!parsed.success) return { status: "error", message: "Revise os dados do perfil.", fields: parsed.error.flatten().fieldErrors };

  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("profiles").update({
    display_name: parsed.data.displayName,
    bio: parsed.data.bio || null,
    professional_title: parsed.data.professionalTitle || null,
    location: parsed.data.location || null,
    is_published: parsed.data.isPublished,
  }).eq("id", user.id);

  if (error) return { status: "error", message: "Não foi possível salvar o perfil." };
  revalidatePath("/dashboard", "layout");
  return { status: "success", message: "Perfil atualizado." };
}

export async function updateAppearance(
  _state: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const parsed = appearanceSchema.safeParse({
    accentColor: formData.get("accentColor"),
    backgroundColor: formData.get("backgroundColor"),
    buttonStyle: formData.get("buttonStyle"),
    buttonRadius: Number(formData.get("buttonRadius")),
    linkLayout: formData.get("linkLayout"),
  });
  if (!parsed.success) return { status: "error", message: "Configuração visual inválida.", fields: parsed.error.flatten().fieldErrors };

  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("profile_settings").update({
    accent_color: parsed.data.accentColor,
    background_color: parsed.data.backgroundColor,
    button_style: parsed.data.buttonStyle,
    button_radius: parsed.data.buttonRadius,
    link_layout: parsed.data.linkLayout,
  }).eq("profile_id", user.id);

  if (error) return { status: "error", message: "Não foi possível salvar a aparência." };
  revalidatePath("/dashboard/editor");
  return { status: "success", message: "Aparência atualizada." };
}

const defaultBlocks: Record<z.infer<typeof blockTypeSchema>, { title: string; content: Record<string, string | string[]> }> = {
  link: { title: "Novo link", content: { url: "", description: "" } },
  heading: { title: "Novo título", content: { level: "2" } },
  text: { title: "", content: { text: "Escreva algo sobre você." } },
  image: { title: "Imagem", content: { url: "", alt: "" } },
  gallery: { title: "Galeria", content: { images: [] } },
  separator: { title: "", content: { style: "stars" } },
  socials: { title: "Redes sociais", content: { items: [] } },
  youtube: { title: "YouTube", content: { url: "" } },
  spotify: { title: "Spotify", content: { url: "" } },
  video: { title: "Vídeo", content: { url: "" } },
  discord: { title: "Comunidade no Discord", content: { url: "" } },
  product: { title: "Produto", content: { url: "", description: "" } },
  contact: { title: "Entre em contato", content: { text: "" } },
  countdown: { title: "Contagem regressiva", content: { date: "" } },
  faq: { title: "Perguntas frequentes", content: { text: "" } },
};

export async function createBlock(typeValue: string): Promise<MutationResult> {
  const parsed = blockTypeSchema.safeParse(typeValue);
  if (!parsed.success) return { success: false, message: "Tipo de bloco inválido." };
  const { supabase, user } = await requireUser();
  const { data: lastBlock } = await supabase.from("profile_blocks").select("position").eq("profile_id", user.id).order("position", { ascending: false }).limit(1).maybeSingle();
  const preset = defaultBlocks[parsed.data];
  const { error } = await supabase.from("profile_blocks").insert({ profile_id: user.id, type: parsed.data, position: (lastBlock?.position ?? -1) + 1, title: preset.title, content: preset.content });
  if (error) return { success: false, message: "Não foi possível adicionar o bloco." };
  revalidatePath("/dashboard/editor");
  return { success: true };
}

export async function updateBlock(formData: FormData): Promise<MutationResult> {
  const parsed = blockMutationSchema.safeParse({
    id: formData.get("id"), title: formData.get("title"), text: formData.get("text"),
    url: formData.get("url"), isVisible: formBoolean(formData.get("isVisible")),
  });
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Bloco inválido." };
  const scheduleValue = String(formData.get("publishedAt") ?? "").trim();
  const scheduledAt = scheduleValue ? new Date(scheduleValue) : null;
  if (scheduledAt && Number.isNaN(scheduledAt.getTime())) return { success: false, message: "Data de publicação inválida." };

  const { supabase, user } = await requireUser();
  const { data: current, error: currentError } = await supabase.from("profile_blocks").select("content").eq("id", parsed.data.id).eq("profile_id", user.id).single();
  if (currentError || !current) return { success: false, message: "Bloco não encontrado." };
  const previousContent = typeof current.content === "object" && current.content ? current.content : {};
  const { error } = await supabase.from("profile_blocks").update({
    title: parsed.data.title,
    content: { ...previousContent, text: parsed.data.text, url: parsed.data.url },
    is_visible: parsed.data.isVisible,
    published_at: scheduledAt?.toISOString() ?? null,
  }).eq("id", parsed.data.id).eq("profile_id", user.id);
  if (error) return { success: false, message: "Não foi possível atualizar o bloco." };
  revalidatePath("/dashboard/editor");
  return { success: true, message: "Bloco salvo." };
}

export async function deleteBlock(blockId: string): Promise<MutationResult> {
  const parsed = z.string().uuid().safeParse(blockId);
  if (!parsed.success) return { success: false, message: "Bloco inválido." };
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("profile_blocks").delete().eq("id", parsed.data).eq("profile_id", user.id);
  if (error) return { success: false, message: "Não foi possível excluir o bloco." };
  revalidatePath("/dashboard/editor");
  return { success: true };
}

export async function duplicateBlock(blockId: string): Promise<MutationResult> {
  const parsed = z.string().uuid().safeParse(blockId);
  if (!parsed.success) return { success: false, message: "Bloco inválido." };
  const { supabase, user } = await requireUser();
  const [{ data: source, error: sourceError }, { data: lastBlock }] = await Promise.all([
    supabase.from("profile_blocks").select("type,title,content,is_visible,is_enabled,published_at").eq("id", parsed.data).eq("profile_id", user.id).single(),
    supabase.from("profile_blocks").select("position").eq("profile_id", user.id).order("position", { ascending: false }).limit(1).maybeSingle(),
  ]);
  if (sourceError || !source) return { success: false, message: "Bloco não encontrado." };
  const { error } = await supabase.from("profile_blocks").insert({ ...source, profile_id: user.id, position: (lastBlock?.position ?? -1) + 1, title: source.title ? `${source.title} (cópia)` : "" });
  if (error) return { success: false, message: "Não foi possível duplicar o bloco." };
  revalidatePath("/dashboard/editor");
  return { success: true };
}

export async function reorderBlocks(blockIds: string[]): Promise<MutationResult> {
  const parsed = z.array(z.string().uuid()).max(100).safeParse(blockIds);
  if (!parsed.success) return { success: false, message: "Ordem de blocos inválida." };
  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("reorder_profile_blocks", { block_ids: parsed.data });
  if (error) return { success: false, message: "Não foi possível salvar a nova ordem." };
  revalidatePath("/dashboard/editor");
  return { success: true };
}

const allowedAvatarTypes = new Map([["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"], ["image/gif", "gif"]]);

export async function uploadAvatar(
  _state: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) return { status: "error", message: "Selecione uma imagem." };
  const extension = allowedAvatarTypes.get(file.type);
  if (!extension || file.size > 5 * 1024 * 1024) return { status: "error", message: "Use JPEG, PNG, WebP ou GIF de até 5 MB." };

  const { supabase, user } = await requireUser();
  const path = `${user.id}/avatar-${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) return { status: "error", message: "Não foi possível enviar a imagem." };
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  const { error } = await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", user.id);
  if (error) return { status: "error", message: "Imagem enviada, mas não foi possível atualizar o perfil." };
  revalidatePath("/dashboard", "layout");
  return { status: "success", message: "Avatar atualizado." };
}
