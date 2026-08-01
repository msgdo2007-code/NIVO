import { AuthShell } from "@/components/auth/auth-shell";
import { AuthForm } from "@/features/auth/auth-form";
import { safeRedirectPath } from "@/lib/utils";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const params = await searchParams;
  const next = safeRedirectPath(params.next ?? null);
  return (
    <AuthShell next={next}>
      {params.error && <p className="form-message error oauth-error">Não foi possível entrar com o provedor. Verifique a configuração e tente novamente.</p>}
      <AuthForm mode="login" next={next} />
    </AuthShell>
  );
}
