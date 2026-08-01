import { AuthShell } from "@/components/auth/auth-shell";
import { AuthForm } from "@/features/auth/auth-form";

export default function ForgotPasswordPage() {
  return <AuthShell social={false}><AuthForm mode="forgot" /></AuthShell>;
}
