/* eslint-disable @next/next/no-img-element -- Avatares públicos têm origem dinâmica no Storage. */
import { MapPin, Orbit } from "lucide-react";
import type { CSSProperties } from "react";

import { blockRenderers } from "@/components/profile-renderer/block-renderers";
import type { Profile, ProfileBlock, ProfileSettings } from "@/types/profiles";

type ThemeStyle = CSSProperties & {
  "--profile-accent": string;
  "--profile-background": string;
  "--profile-radius": string;
};

export function ProfileRenderer({ profile, settings, blocks, preview = false }: { profile: Profile; settings: ProfileSettings; blocks: ProfileBlock[]; preview?: boolean }) {
  const visibleBlocks = blocks.filter((block) => block.is_visible && block.is_enabled && (!block.published_at || new Date(block.published_at) <= new Date()));
  const themeStyle: ThemeStyle = {
    "--profile-accent": settings.accent_color,
    "--profile-background": settings.background_color,
    "--profile-radius": `${settings.button_radius}px`,
  };

  return <article className={`public-profile theme-${settings.theme_key} buttons-${settings.button_style} layout-${settings.link_layout} ${preview ? "is-preview" : ""}`} style={themeStyle}><div className="public-stars" aria-hidden="true" /><header className="public-identity">{profile.avatar_url ? <img className="public-avatar" src={profile.avatar_url} alt={`Avatar de ${profile.display_name}`} /> : <div className="public-avatar fallback">{profile.display_name.slice(0, 1).toUpperCase()}</div>}<h1>{profile.display_name}</h1>{profile.professional_title && <strong>{profile.professional_title}</strong>}{profile.username && <span>@{profile.username}</span>}{profile.bio && <p>{profile.bio}</p>}{profile.location && <small><MapPin /> {profile.location}</small>}</header><div className="public-blocks">{visibleBlocks.map((block) => { const Renderer = blockRenderers[block.type]; return <Renderer block={block} key={block.id} track={!preview} />; })}{visibleBlocks.length === 0 && <p className="public-empty">Este universo ainda está ganhando forma.</p>}</div>{settings.show_nivo_branding && <footer className="public-branding"><Orbit /> Feito com NIVO</footer>}</article>;
}
