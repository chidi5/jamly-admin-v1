"use client";

import { useEffect, useState } from "react";

import Modal from "@/components/ui/modal";
import { optionSchema } from "@/lib/schema";
import { z } from "zod";
import OptionForm from "@/app/(dashboard)/store/[storeId]/(routes)/products/[productId]/components/option-form";

type OptionDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: z.infer<typeof optionSchema>) => void;
  initialData?: any;
  index: number;
  remove: (index: number) => void;
};

export const OptionModal: React.FC<OptionDialogProps> = ({
  isOpen,
  onClose,
  onAdd,
  initialData,
  index,
  remove,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Modal title="" description="" isOpen={isOpen} onClose={onClose}>
      <OptionForm
        onAdd={onAdd}
        initialData={initialData}
        index={index}
        remove={remove}
      />
    </Modal>
  );
};
