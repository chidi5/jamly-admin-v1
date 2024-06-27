"use client";

import { AlertModal } from "@/components/modals/alert-modal";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useUser } from "@/hooks/use-current-user";
import { cn } from "@/lib/utils";
import axios from "axios";
import { Trash } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { useState } from "react";

type StoreDeleteProps = {
  className: string;
  params: { storeId: string };
};

const StoreDelete = ({ className, params }: StoreDeleteProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const { user } = useUser();

  if (!user) redirect("/sign-in");

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/stores/${params.storeId}`);
      router.push("/store");
      toast({ description: "Store deleted." });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "There was a problem with your request";
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };
  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <Button
        type="button"
        variant="destructive"
        onClick={() => setOpen(true)}
        size="sm"
        className={cn(
          className,
          user.role === "STORE_OWNER" ? "block" : "hidden"
        )}
      >
        <Trash className="h-4 w-4" />
      </Button>
    </>
  );
};

export default StoreDelete;
