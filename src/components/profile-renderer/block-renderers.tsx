/* eslint-disable @next/next/no-img-element -- URLs pertencem aos usuários e não podem ser allowlisted no next/image. */
import { ArrowUpRight, CircleHelp, Clock3, Gamepad2, ImageIcon, Mail, Package, Play, Share2 } from "lucide-react";
import type { ComponentType } from "react";

import { TrackedLink } from "@/components/analytics/tracked-link";
import type { BlockType, ProfileBlock } from "@/types/profiles";

type RendererProps = { block: ProfileBlock; track?: boolean };

function safeExternalUrl(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

function LinkBlock({ block, track }: RendererProps) {
  const href = safeExternalUrl(block.content.url);
  const description = typeof block.content.description === "string" ? block.content.description : "";
  const content = <><span><strong>{block.title || "Abrir link"}</strong>{description && <small>{description}</small>}</span><ArrowUpRight /></>;
  if (!href) return <div className="public-link disabled">{content}</div>;
  return track ? <TrackedLink className="public-link" href={href} profileId={block.profile_id} blockId={block.id}>{content}</TrackedLink> : <a className="public-link" href={href} target="_blank" rel="noreferrer">{content}</a>;
}

function HeadingBlock({ block }: RendererProps) {
  return <h2 className="public-heading">{block.title}</h2>;
}

function TextBlock({ block }: RendererProps) {
  const text = typeof block.content.text === "string" ? block.content.text : "";
  return <p className="public-text">{text}</p>;
}

function ImageBlock({ block }: RendererProps) {
  const src = safeExternalUrl(block.content.url);
  const alt = typeof block.content.alt === "string" ? block.content.alt : block.title;
  return src ? <figure className="public-image"><img src={src} alt={alt || "Imagem do perfil"} loading="lazy" /></figure> : <div className="public-placeholder"><ImageIcon /> Adicione uma imagem</div>;
}

function SeparatorBlock() {
  return <div className="public-separator"><i /><span>✦</span><i /></div>;
}

function FeatureBlock({ block, icon: Icon, track }: RendererProps & { icon: ComponentType<{ "aria-hidden"?: boolean }> }) {
  const href = safeExternalUrl(block.content.url);
  const text = typeof block.content.text === "string" ? block.content.text : "";
  const body = <><Icon aria-hidden /><span><strong>{block.title}</strong>{text && <small>{text}</small>}</span>{href && <ArrowUpRight />}</>;
  if (!href) return <div className={`public-feature type-${block.type}`}>{body}</div>;
  return track ? <TrackedLink className={`public-feature type-${block.type}`} href={href} profileId={block.profile_id} blockId={block.id}>{body}</TrackedLink> : <a className={`public-feature type-${block.type}`} href={href} target="_blank" rel="noreferrer">{body}</a>;
}

const feature = (Icon: ComponentType<{ "aria-hidden"?: boolean }>) => function RegisteredFeature(props: RendererProps) {
  return <FeatureBlock {...props} icon={Icon} />;
};

export const blockRenderers: Record<BlockType, ComponentType<RendererProps>> = {
  link: LinkBlock,
  heading: HeadingBlock,
  text: TextBlock,
  image: ImageBlock,
  gallery: feature(ImageIcon),
  separator: SeparatorBlock,
  socials: feature(Share2),
  youtube: feature(Play),
  spotify: feature(Play),
  video: feature(Play),
  discord: feature(Gamepad2),
  product: feature(Package),
  contact: feature(Mail),
  countdown: feature(Clock3),
  faq: feature(CircleHelp),
};
