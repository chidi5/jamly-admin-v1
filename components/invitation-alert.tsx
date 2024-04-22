import { XIcon } from "lucide-react";
import React from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { Invitation } from "@prisma/client";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "./ui/button";
import { getInviteId, revokeInvitation } from "@/lib/queries";
import { toast } from "./ui/use-toast";
import { useRouter } from "next/navigation";

type InvitationProps = {
  data: Invitation[];
};

const InvitationAlert = async ({ data }: InvitationProps) => {
  const router = useRouter();

  const handleRevoke = async (value: any) => {
    try {
      const invitation_id = await getInviteId(data);
      await revokeInvitation(value.id, invitation_id?.id);
      router.refresh();
      toast({
        title: "Success",
        description: "Invitation Revoked",
      });
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Oppse!",
        description: "Could not revoke invitation",
      });
    }
  };

  return (
    <>
      {data.map((invitation) => (
        <Alert key={invitation.id} className="max-w-2xl mb-3">
          <AlertDescription>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                <div className="h-11 w-11 relative flex-none">
                  <Image
                    src="/user-profile.png"
                    fill
                    className="rounded-full object-cover"
                    alt="avatar image"
                  />
                </div>
                <span className="text-base">{invitation.email}</span>
              </div>
              <Badge
                className={cn({
                  "bg-emerald-500": invitation.status === "ACCEPTED",
                  "bg-yellow-500": invitation.status === "PENDING",
                  "bg-red-500": invitation.status === "REVOKED",
                })}
              >
                {invitation.status}
              </Badge>
              <div className="flex ml-auto">
                <Button
                  variant="outline"
                  className=" text-red-500 hover:text-red-600"
                  onClick={() => handleRevoke(invitation)}
                >
                  <XIcon className="w-5 h-5" />
                  &nbsp;Revoke invite
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </>
  );
};

export default InvitationAlert;
