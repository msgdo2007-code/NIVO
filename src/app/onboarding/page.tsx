import { Orbit } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { getActiveTemplates, getOwnProfileBundle } from "@/features/profiles/queries";
import { getSiteUrl } from "@/lib/supabase/config";

export default async function OnboardingPage() {
  const [{ profile }, templates] = await Promise.all([getOwnProfileBundle(), getActiveTemplates()]);
  if (profile.onboarding_completed) redirect("/dashboard");

  return <main className="onboarding-page"><header><Link className="brand" href="/"><span className="brand-mark"><Orbit /></span><strong>NIVO</strong></Link><span>Configuração inicial</span></header><div className="onboarding-shell"><div className="onboarding-heading"><span className="pill">Seu primeiro voo</span><h1>Prepare seu universo.</h1><p>Duas escolhas rápidas. Você poderá mudar tudo depois no editor.</p></div><OnboardingForm displayName={profile.display_name} templates={templates} siteHost={new URL(getSiteUrl()).host} /></div></main>;
}
