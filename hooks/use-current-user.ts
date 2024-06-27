import { auth } from "@/auth";
import { useSession } from "next-auth/react";

export const currentUser = async () => {
  const session = await auth();
  return session?.user;
};

export const useUser = () => {
  const { data: session, status } = useSession();

  if (status === "loading" || !session?.user) {
    return { user: null, isLoaded: false };
  }

  return { user: session.user, isLoaded: true };
};
