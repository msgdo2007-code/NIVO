import { ExternalLink } from "lucide-react";
import Link from "next/link";

import { ProfileSettingsForm } from "@/components/profile/profile-settings-form";
import { getOwnProfileBundle } from "@/features/profiles/queries";

export default async function ProfileSettingsPage() {
  const { profile, settings } = await getOwnProfileBundle();
  return <main className="settings-page"><header className="subpage-heading with-action"><div><span className="eyebrow">Meu perfil</span><h1>Sua identidade pública.</h1><p>Atualize informações, avatar e aparência usando valores seguros.</p></div>{profile.username && <Link className="button ghost" href={`/${profile.username}`} target="_blank">Abrir perfil <ExternalLink /></Link>}</header><ProfileSettingsForm profile={profile} settings={settings} /></main>;
}
