import { Orbit, Sparkles } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { OAuthButtons } from "@/features/auth/oauth-buttons";

export function AuthShell({ children, social = true, next }: { children: ReactNode; social?: boolean; next?: string }) {
  return (
    <main className="auth-page">
      <Link className="brand auth-brand" href="/" aria-label="NIVO — página inicial">
        <span className="brand-mark"><Orbit /></span><strong>NIVO</strong>
      </Link>
      <section className="auth-card">
        <aside className="auth-art" aria-hidden="true">
          <div className="auth-planet"><span /></div>
          <span className="eyebrow"><Sparkles /> Seu universo começa aqui</span>
          <h2>Links que parecem<br />verdadeiramente seus.</h2>
          <p>Crie, personalize e evolua sua presença digital em uma única órbita.</p>
        </aside>
        <div className="auth-content">
          {social && <OAuthButtons next={next} />}
          {children}
        </div>
      </section>
    </main>
  );
}
