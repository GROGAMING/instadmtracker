import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/** Plain anon-key client. Row level security allows the anon role. */
export function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
}

export const WHO_COOKIE = "rampp_who";

/** The profile id of whoever picked themselves on the "Who are you?" screen. */
export async function whoAmI(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(WHO_COOKIE)?.value ?? null;
}
