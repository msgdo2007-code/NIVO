export const blockTypes = [
  "link", "heading", "text", "image", "gallery", "separator", "socials",
  "youtube", "spotify", "video", "discord", "product", "contact",
  "countdown", "faq",
] as const;

export type BlockType = (typeof blockTypes)[number];
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
export type BlockContent = { [key: string]: JsonValue };

export type Profile = {
  id: string;
  username: string | null;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  professional_title: string | null;
  location: string | null;
  onboarding_completed: boolean;
  is_published: boolean;
};

export type ProfileSettings = {
  profile_id: string;
  theme_key: string;
  accent_color: string;
  background_color: string;
  background_type: "solid" | "gradient" | "image";
  background_value: string;
  button_style: "glass" | "solid" | "outline" | "soft";
  link_layout: "stack" | "grid";
  button_radius: number;
  show_nivo_branding: boolean;
};

export type ProfileBlock = {
  id: string;
  profile_id: string;
  type: BlockType;
  position: number;
  title: string;
  content: BlockContent;
  is_visible: boolean;
  is_enabled: boolean;
  published_at: string | null;
};

export type ProfileTemplate = {
  id: string;
  name: string;
  slug: string;
  description: string;
  theme_config: Record<string, string>;
};
