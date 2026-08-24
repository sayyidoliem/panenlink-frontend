import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export async function createClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Konfigurasi Supabase belum lengkap.");
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },

      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          /*
           * setAll dapat dipanggil dari Server Component yang tidak dapat
           * menulis cookie. Session tetap diperbarui melalui middleware.
           */
        }
      },
    },
  });
}
