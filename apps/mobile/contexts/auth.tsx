import React, { createContext, useContext } from "react";
import { useRouter, useSegments } from "expo-router";
import { authClient } from "../lib/auth-client";

type AuthContextType = {
  user: any | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, isLoading: true });

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const segments = useSegments();
  const router = useRouter();

  React.useEffect(() => {
    if (isPending) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (!session?.user && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
    } else if (session?.user && inAuthGroup) {
      router.replace("/(app)/(tabs)");
    }
  }, [session, isPending, segments]);

  return (
    <AuthContext.Provider value={{ user: session?.user ?? null, isLoading: isPending }}>
      {children}
    </AuthContext.Provider>
  );
}
