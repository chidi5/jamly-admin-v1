"use client";

import { TeamModal } from "@/components/modals/team-modal";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { useState } from "react";
import { TeamColumn, columns } from "./columns";
import InvitationAlert from "@/components/invitation-alert";
import { Invitation } from "@prisma/client";

type TeamClientProps = {
  data: TeamColumn[];
  storeId: string;
  invitation: Invitation[];
};

const TeamClient = ({ data, storeId, invitation }: TeamClientProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TeamModal
        isOpen={open}
        onClose={() => setOpen(false)}
        storeId={storeId}
      />
      <div className="flex items-center justify-between">
        <Heading
          title={`Team (${data.length})`}
          description="Manage team for your store"
        />
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Member
        </Button>
      </div>
      <Separator />
      {invitation.length !== 0 && <InvitationAlert data={invitation} />}
      <DataTable searchKey="name" columns={columns} data={data} />
    </>
  );
};

export default TeamClient;
