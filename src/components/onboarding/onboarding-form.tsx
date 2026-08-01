"use client";

import { Check, Orbit, Sparkles } from "lucide-react";
import { useActionState, useState } from "react";

import { completeOnboarding } from "@/features/profiles/actions";
import { initialProfileState } from "@/lib/validations/profile";
import type { ProfileTemplate } from "@/types/profiles";

export function OnboardingForm({ displayName, templates, siteHost }: { displayName: string; templates: ProfileTemplate[]; siteHost: string }) {
  const [state, action, pending] = useActionState(completeOnboarding, initialProfileState);
  const [selected, setSelected] = useState(templates[0]?.slug ?? "");

  return <form action={action} className="onboarding-form"><input type="hidden" name="templateSlug" value={selected} /><section className="onboarding-step"><span className="step-number">01</span><div><span className="eyebrow">Sua identidade</span><h2>Como seu universo será encontrado?</h2><div className="onboarding-fields"><label>Nome público<input name="displayName" defaultValue={displayName} required maxLength={80} />{state.fields?.displayName?.map((error) => <small key={error}>{error}</small>)}</label><label>Username<div className="username-input"><span>{siteHost}/</span><input name="username" placeholder="seunome" required minLength={3} maxLength={30} /></div>{state.fields?.username?.map((error) => <small key={error}>{error}</small>)}</label></div></div></section><section className="onboarding-step"><span className="step-number">02</span><div><span className="eyebrow">Ponto de partida</span><h2>Escolha sua primeira atmosfera.</h2><div className="template-grid">{templates.map((template) => { const active = selected === template.slug; return <button className={`template-choice ${active ? "selected" : ""}`} key={template.id} type="button" onClick={() => setSelected(template.slug)} aria-pressed={active}><div className={`template-art ${template.slug}`}><Orbit /><i /><i /><i /></div><span>{template.name}</span><p>{template.description}</p>{active && <b><Check /> Selecionado</b>}</button>; })}</div></div></section>{state.message && <p className={`form-message ${state.status}`} role="status">{state.message}</p>}<button className="button primary onboarding-submit" disabled={pending || !selected} type="submit"><Sparkles /> {pending ? "Criando seu universo…" : "Entrar em órbita"}</button></form>;
}
