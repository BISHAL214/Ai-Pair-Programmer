import * as dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

import { createClient } from "@supabase/supabase-js";
// import { cookies } from "next/headers";
// import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { type SupabaseClient } from "@supabase/supabase-js";

const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabase_anon_key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase_service_role_key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const createSupabaseServerClient = (): SupabaseClient =>
  createClient(supabase_url, supabase_service_role_key);

// export const createSupabaseFromToken = (accessToken: string) =>
//   createClient(supabase_url, supabase_anon_key, {
//     global: {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//     },
//   });
