"use client";

import { useEffect, useState } from "react";

import AdditionalInfoForm from "@/app/(dashboard)/store/[storeId]/(routes)/products/[productId]/components/additional-info-form";
import Modal from "@/components/ui/modal";
import { AdditionalInfoSchema } from "@/lib/schema";
import { z } from "zod";

type AdditionalInfoDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: z.infer<typeof AdditionalInfoSchema>) => void;
  initialData?: any;
  index: number;
  remove: (index: number) => void;
};

export const AdditionalInfoModal: React.FC<AdditionalInfoDialogProps> = ({
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
    <Modal
      title=""
      description=""
      isOpen={isOpen}
      onClose={onClose}
      className="!max-w-3xl"
    >
      <AdditionalInfoForm
        onAdd={onAdd}
        initialData={initialData}
        index={index}
        remove={remove}
      />
    </Modal>
  );
};
