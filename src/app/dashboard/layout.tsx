import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { Sidebar } from "@/components/dashboard/sidebar";
import { signOut } from "@/features/auth/actions";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  const displayName = String(data.user.user_metadata.display_name ?? data.user.user_metadata.full_name ?? "Explorador");
  return <div className="dashboard-shell"><Sidebar /><div className="dashboard-main"><header className="dashboard-header"><div><span>Conta conectada</span><strong>{displayName}</strong></div><form action={signOut}><button className="icon-button" type="submit" aria-label="Sair da conta"><LogOut /></button></form></header>{children}</div></div>;
}
