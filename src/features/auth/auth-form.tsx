"use client";

import Link from "next/link";
import { useActionState } from "react";

import { requestPasswordReset, signIn, signUp, updatePassword } from "@/features/auth/actions";
import { initialAuthState } from "@/lib/validations/auth";

type Mode = "login" | "signup" | "forgot" | "update";

const copy: Record<Mode, { title: string; eyebrow: string; submit: string }> = {
  login: { title: "Entre no seu universo", eyebrow: "Bem-vindo de volta", submit: "Entrar" },
  signup: { title: "Comece sua órbita", eyebrow: "Conta gratuita", submit: "Criar minha conta" },
  forgot: { title: "Recupere seu acesso", eyebrow: "Redefinição segura", submit: "Enviar instruções" },
  update: { title: "Crie uma nova senha", eyebrow: "Quase lá", submit: "Salvar nova senha" },
};

const actions = { login: signIn, signup: signUp, forgot: requestPasswordReset, update: updatePassword };

export function AuthForm({ mode, next = "/dashboard" }: { mode: Mode; next?: string }) {
  const [state, action, pending] = useActionState(actions[mode], initialAuthState);
  const fields = state.fields ?? {};

  return (
    <div className="auth-panel">
      <span className="eyebrow">{copy[mode].eyebrow}</span>
      <h1>{copy[mode].title}</h1>
      <p className="auth-intro">
        {mode === "forgot"
          ? "Informe seu e-mail e enviaremos um link de recuperação."
          : mode === "update"
            ? "Use uma senha forte que você ainda não utiliza em outro serviço."
            : "Um espaço só seu para reunir links, conteúdo e identidade."}
      </p>

      <form action={action} className="auth-form">
        <input type="hidden" name="next" value={next} />
        {mode === "signup" && (
          <label>
            Nome
            <input name="name" autoComplete="name" placeholder="Como devemos chamar você?" />
            {fields.name?.map((error) => <small key={error}>{error}</small>)}
          </label>
        )}
        {mode !== "update" && (
          <label>
            E-mail
            <input name="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" />
            {fields.email?.map((error) => <small key={error}>{error}</small>)}
          </label>
        )}
        {mode !== "forgot" && (
          <label>
            {mode === "update" ? "Nova senha" : "Senha"}
            <input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="Mínimo de 8 caracteres" />
            {fields.password?.map((error) => <small key={error}>{error}</small>)}
          </label>
        )}

        {state.message && <p className={`form-message ${state.status}`} role="status" aria-live="polite">{state.message}</p>}

        <button className="button primary wide" disabled={pending} type="submit">
          {pending ? "Processando…" : copy[mode].submit}
        </button>
      </form>

      {mode === "login" && <Link className="quiet-link" href="/esqueci-minha-senha">Esqueci minha senha</Link>}
      {mode === "login" && <p className="auth-switch">Ainda não tem conta? <Link href="/cadastro">Cadastre-se</Link></p>}
      {mode === "signup" && <p className="auth-switch">Já tem uma conta? <Link href="/login">Entrar</Link></p>}
      {(mode === "forgot" || mode === "update") && <Link className="quiet-link" href="/login">Voltar para o login</Link>}
    </div>
  );
}
