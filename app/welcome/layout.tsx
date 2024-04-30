import { verifyAndAcceptInvitation } from "@/lib/queries";
import { ReactNode } from "react";

const layout = async ({ children }: { children: ReactNode }) => {
  return <div>{children}</div>;
};

export default layout;
