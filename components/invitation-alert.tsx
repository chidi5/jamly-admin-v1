"use client";

import { XIcon } from "lucide-react";
import React, { useTransition } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { Invitation } from "@prisma/client";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";
import { useRouter } from "next/navigation";
import {
  revokeInvitation,
  saveActivityLogsNotification,
} from "@/lib/queries/invitation";
import Spinner from "./Spinner";

type InvitationProps = {
  data: Invitation[];
};

const InvitationAlert = ({ data }: InvitationProps) => {
  const router = useRouter();
  const [loading, startTransition] = useTransition();

  const handleRevoke = async (value: any) => {
    startTransition(async () => {
      const response = await revokeInvitation(value.id);

      if (response.success) {
        const res = await saveActivityLogsNotification({
          storeId: value.storeId,
          description: `Revoked ${value.email}`,
        });

        if (res.success) {
          toast({
            description: response.success,
          });
        } else {
          toast({
            variant: "destructive",
            description: res.error,
          });
        }
      } else {
        toast({
          variant: "destructive",
          description: response.error,
        });
      }
      router.refresh();
    });
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
                  "bg-yellow-500": invitation,
                })}
              >
                Pending
              </Badge>
              <div className="flex ml-auto">
                <Button
                  variant="outline"
                  className=" text-red-500 hover:text-red-600"
                  onClick={() => handleRevoke(invitation)}
                >
                  {loading ? <Spinner /> : <XIcon className="w-5 h-5" />}
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
