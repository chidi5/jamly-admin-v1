"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/hooks/use-current-user";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export const UserButton = () => {
  const { user } = useUser();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none focus:outline-none focus:ring-0">
        <Avatar>
          <AvatarImage src={user?.image || ""} />
          <AvatarFallback>
            <Image
              src="/avatar.png"
              fill
              className="rounded-full object-cover"
              alt="avatar image"
            />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-4 w-[250px] mr-6 space-y-10">
        <DropdownMenuLabel>
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 relative flex-none">
              <Image
                src={user?.image || "/avatar.png"}
                fill
                className="rounded-full object-cover"
                alt="avatar image"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="font-bold">{`${user?.firstName} ${user?.lastName}`}</h1>
              <h3 className="font-normal">{user?.email}</h3>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuItem>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              signOut({
                callbackUrl: `${process.env.NEXT_PUBLIC_URL}`,
                redirect: true,
              })
            }
            className="flex items-center gap-4 text-muted-foreground"
          >
            <LogOut className="w-5 h-5" />
            <p>Sign out</p>
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
