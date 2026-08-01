import { AuthShell } from "@/components/auth/auth-shell";
import { AuthForm } from "@/features/auth/auth-form";

export default function SignupPage() {
  return <AuthShell><AuthForm mode="signup" /></AuthShell>;
}
