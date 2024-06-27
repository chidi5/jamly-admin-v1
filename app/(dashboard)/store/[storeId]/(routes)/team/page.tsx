import prismadb from "@/lib/prismadb";
import TeamClient from "./components/client";
import { TeamColumn } from "./components/columns";

type TeamProps = {
  params: { storeId: string };
};

const TeamPage = async ({ params }: TeamProps) => {
  const team = await prismadb.user.findMany({
    where: {
      stores: {
        some: {
          id: params.storeId,
        },
      },
    },
  });

  const invitation = await prismadb.invitation.findMany({
    where: {
      Store: {
        id: params.storeId,
      },
    },
  });

  const formattedTeam: TeamColumn[] = team.map((item) => ({
    id: item.id,
    name: `${item.firstName} ${item.lastName}`,
    email: item.email,
    image: item.image,
    role: item.role,
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <TeamClient
          data={formattedTeam}
          storeId={params.storeId}
          invitation={invitation}
        />
      </div>
    </div>
  );
};

export default TeamPage;
