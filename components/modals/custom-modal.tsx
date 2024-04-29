"use client";

import Modal from "@/components/ui/modal";
import { useModal } from "@/providers/cutom-modal-provider";

type CustomModalProps = {
  title: string;
  subheading: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

export const CustomModal: React.FC<CustomModalProps> = ({
  title,
  subheading,
  children,
  defaultOpen,
}) => {
  const { isOpen, setClose } = useModal();

  return (
    <Modal
      title={title}
      description={subheading}
      onClose={setClose}
      isOpen={isOpen || defaultOpen!}
    >
      <div>{children}</div>
    </Modal>
  );
};
