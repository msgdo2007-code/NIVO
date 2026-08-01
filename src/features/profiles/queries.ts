import "server-only";

import { requireUser } from "@/lib/permissions/auth";
import type { Profile, ProfileBlock, ProfileSettings, ProfileTemplate } from "@/types/profiles";

export async function getOwnProfileBundle() {
  const { supabase, user } = await requireUser();
  const [profileResult, settingsResult, blocksResult] = await Promise.all([
    supabase.from("profiles").select("id,username,display_name,avatar_url,bio,professional_title,location,onboarding_completed,is_published").eq("id", user.id).single(),
    supabase.from("profile_settings").select("profile_id,theme_key,accent_color,background_color,background_type,background_value,button_style,link_layout,button_radius,show_nivo_branding").eq("profile_id", user.id).single(),
    supabase.from("profile_blocks").select("id,profile_id,type,position,title,content,is_visible,is_enabled,published_at").eq("profile_id", user.id).order("position"),
  ]);

  if (profileResult.error || !profileResult.data) throw new Error("Perfil não encontrado.");
  if (settingsResult.error || !settingsResult.data) throw new Error("Configurações do perfil não encontradas.");
  if (blocksResult.error) throw new Error("Não foi possível carregar os blocos.");

  return {
    user,
    profile: profileResult.data as Profile,
    settings: settingsResult.data as ProfileSettings,
    blocks: (blocksResult.data ?? []) as ProfileBlock[],
  };
}

export async function getActiveTemplates() {
  const { supabase } = await requireUser();
  const { data, error } = await supabase.from("templates").select("id,name,slug,description,theme_config").eq("is_active", true).order("created_at");
  if (error) throw new Error("Não foi possível carregar os templates.");
  return (data ?? []) as ProfileTemplate[];
}
