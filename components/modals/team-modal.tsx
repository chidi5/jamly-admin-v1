"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import Spinner from "@/components/Spinner";
import Modal from "@/components/ui/modal";
import SendInvitation from "../send-invitation";

interface TeamModalProps {
  storeId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const TeamModal: React.FC<TeamModalProps> = ({
  storeId,
  isOpen,
  onClose,
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
      <SendInvitation storeId={storeId} onClose={onClose} />
    </Modal>
  );
};
