import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProfileRenderer } from "@/components/profile-renderer/profile-renderer";
import { ProfileAnalytics } from "@/components/analytics/profile-analytics";
import { createClient } from "@/lib/supabase/server";
import { usernameSchema } from "@/lib/validations/profile";
import type { Profile, ProfileBlock, ProfileSettings } from "@/types/profiles";

async function loadPublicProfile(usernameValue: string) {
  const parsed = usernameSchema.safeParse(usernameValue);
  if (!parsed.success) return null;
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("id,username,display_name,avatar_url,bio,professional_title,location,onboarding_completed,is_published").eq("username", parsed.data).eq("is_published", true).maybeSingle();
  if (!profile) return null;
  const [settingsResult, blocksResult] = await Promise.all([
    supabase.from("profile_settings").select("profile_id,theme_key,accent_color,background_color,background_type,background_value,button_style,link_layout,button_radius,show_nivo_branding").eq("profile_id", profile.id).single(),
    supabase.from("profile_blocks").select("id,profile_id,type,position,title,content,is_visible,is_enabled,published_at").eq("profile_id", profile.id).order("position"),
  ]);
  if (!settingsResult.data) return null;
  return { profile: profile as Profile, settings: settingsResult.data as ProfileSettings, blocks: (blocksResult.data ?? []) as ProfileBlock[] };
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const bundle = await loadPublicProfile(username);
  return bundle ? { title: bundle.profile.display_name, description: bundle.profile.bio ?? `Perfil de @${bundle.profile.username} no NIVO` } : { title: "Perfil não encontrado" };
}

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const bundle = await loadPublicProfile(username);
  if (!bundle) notFound();
  return <main className="public-profile-page"><ProfileAnalytics profileId={bundle.profile.id} /><ProfileRenderer {...bundle} /></main>;
}
