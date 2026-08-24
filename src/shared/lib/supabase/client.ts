import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL belum dikonfigurasi.");
}

if (!supabaseKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY belum dikonfigurasi.");
}

let client: ReturnType<typeof createBrowserClient> | undefined;

export const createClient = () => {
  if (!client) {
    client = createBrowserClient(supabaseUrl, supabaseKey);
  }

  return client;
};
