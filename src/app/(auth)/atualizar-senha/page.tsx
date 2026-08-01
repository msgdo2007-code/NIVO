import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { AuthForm } from "@/features/auth/auth-form";
import { createClient } from "@/lib/supabase/server";

export default async function UpdatePasswordPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  return <AuthShell social={false}><AuthForm mode="update" /></AuthShell>;
}
