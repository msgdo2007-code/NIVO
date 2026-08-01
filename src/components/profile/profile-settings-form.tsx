/* eslint-disable @next/next/no-img-element -- A origem do avatar é dinâmica e validada no upload. */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImageUp, Save } from "lucide-react";
import { useActionState, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { updateAppearance, updateProfile, uploadAvatar } from "@/features/profiles/actions";
import { appearanceSchema, initialProfileState, profileSchema } from "@/lib/validations/profile";
import type { Profile, ProfileSettings } from "@/types/profiles";

type ProfileValues = z.infer<typeof profileSchema>;
type AppearanceValues = z.infer<typeof appearanceSchema>;

export function ProfileSettingsForm({ profile, settings }: { profile: Profile; settings: ProfileSettings }) {
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const [avatarState, avatarAction, avatarPending] = useActionState(uploadAvatar, initialProfileState);
  const profileForm = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), defaultValues: { displayName: profile.display_name, bio: profile.bio ?? "", professionalTitle: profile.professional_title ?? "", location: profile.location ?? "", isPublished: profile.is_published } });
  const appearanceForm = useForm<AppearanceValues>({ resolver: zodResolver(appearanceSchema), defaultValues: { accentColor: settings.accent_color, backgroundColor: settings.background_color, buttonStyle: settings.button_style, buttonRadius: settings.button_radius, linkLayout: settings.link_layout } });

  function saveProfile(values: ProfileValues) {
    const data = new FormData();
    data.set("displayName", values.displayName); data.set("bio", values.bio); data.set("professionalTitle", values.professionalTitle); data.set("location", values.location); data.set("isPublished", String(values.isPublished));
    startTransition(async () => { const result = await updateProfile(initialProfileState, data); setMessage(result.message ?? ""); });
  }

  function saveAppearance(values: AppearanceValues) {
    const data = new FormData();
    data.set("accentColor", values.accentColor); data.set("backgroundColor", values.backgroundColor); data.set("buttonStyle", values.buttonStyle); data.set("buttonRadius", String(values.buttonRadius)); data.set("linkLayout", values.linkLayout);
    startTransition(async () => { const result = await updateAppearance(initialProfileState, data); setMessage(result.message ?? ""); });
  }

  return <div className="settings-grid"><section className="settings-card"><span className="eyebrow">Imagem de perfil</span><div className="avatar-editor">{profile.avatar_url ? <img src={profile.avatar_url} alt="Avatar atual" /> : <span>{profile.display_name.slice(0, 1)}</span>}<form action={avatarAction}><label className="button ghost"><ImageUp /> Escolher imagem<input name="avatar" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required /></label><button className="button primary" disabled={avatarPending} type="submit">{avatarPending ? "Enviando…" : "Atualizar avatar"}</button></form></div>{avatarState.message && <p className={`form-message ${avatarState.status}`}>{avatarState.message}</p>}</section><section className="settings-card"><span className="eyebrow">Informações públicas</span><form className="settings-form" onSubmit={profileForm.handleSubmit(saveProfile)}><label>Nome<input {...profileForm.register("displayName")} />{profileForm.formState.errors.displayName && <small>{profileForm.formState.errors.displayName.message}</small>}</label><label>Título profissional<input {...profileForm.register("professionalTitle")} placeholder="Designer, criador, artista…" /></label><label>Biografia<textarea {...profileForm.register("bio")} rows={4} /></label><label>Localização<input {...profileForm.register("location")} /></label><label className="check-field"><input type="checkbox" {...profileForm.register("isPublished")} /> Perfil publicado</label><button className="button primary" disabled={pending} type="submit"><Save /> Salvar perfil</button></form></section><section className="settings-card"><span className="eyebrow">Aparência</span><form className="settings-form" onSubmit={appearanceForm.handleSubmit(saveAppearance)}><div className="color-fields"><label>Cor de destaque<input type="color" {...appearanceForm.register("accentColor")} /></label><label>Fundo<input type="color" {...appearanceForm.register("backgroundColor")} /></label></div><label>Estilo dos botões<select {...appearanceForm.register("buttonStyle")}><option value="glass">Vidro</option><option value="solid">Sólido</option><option value="outline">Contorno</option><option value="soft">Suave</option></select></label><label>Arredondamento<input type="range" min="0" max="32" {...appearanceForm.register("buttonRadius", { valueAsNumber: true })} /></label><label>Layout<select {...appearanceForm.register("linkLayout")}><option value="stack">Lista</option><option value="grid">Grade</option></select></label><button className="button primary" disabled={pending} type="submit"><Save /> Salvar aparência</button></form></section>{message && <p className="form-message success settings-message" role="status">{message}</p>}</div>;
}
