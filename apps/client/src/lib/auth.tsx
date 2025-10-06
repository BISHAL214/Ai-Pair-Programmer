// "use client";

// import React from "react";
// import { createContext, useContext, useEffect, useState } from "react";
// import { Session, User } from "@supabase/supabase-js";
// import { createSupabaseBrowserClient } from "@ai_pair_programmer/supabse-client";
// import { supabaseAnonKey, supabaseUrl } from "@/constants";

// type AuthContextType = {
//   supabase: ReturnType<typeof createSupabaseBrowserClient>;
//   session: Session | null;
//   user: User | null;
//   loading: boolean;
// };

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// // const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const supabase = createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey);
//   const [session, setSession] = useState<Session | null>(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     setLoading(true);
//     const getSession = async () => {
//       const { data } = await supabase.auth.getSession();
//       setSession(data.session ?? null);
//       setLoading(false);
//     };

//     const { data: listener } = supabase.auth.onAuthStateChange(
//       (_event, session) => {
//         setSession(session ?? null);
//       },
//     );

//     getSession();

//     return () => {
//       listener.subscription.unsubscribe();
//     };
//   }, [supabase]);

//   return (
//     <AuthContext.Provider
//       value={{
//         supabase,
//         session,
//         user: session?.user ?? null,
//         loading,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // export const useAuth = () => {
// //   const context = useContext(AuthContext);
// //   if (!context) throw new Error("useAuth must be used within AuthProvider");
// //   return context;
// // };
