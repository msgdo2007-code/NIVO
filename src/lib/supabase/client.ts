"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseConfig } from "@/lib/supabase/config";
import { supabaseCookieEncoding } from "@/lib/supabase/cookies";

export function createClient() {
  const { supabaseUrl, supabasePublishableKey } = getSupabaseConfig();
  return createBrowserClient(supabaseUrl, supabasePublishableKey, {
    cookies: { encode: supabaseCookieEncoding },
  });
}
