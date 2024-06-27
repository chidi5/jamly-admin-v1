import { OctagonAlert } from "lucide-react";
import React from "react";

type FormErrorProps = {
  message?: string;
};

export const FormError = ({ message }: FormErrorProps) => {
  if (!message) return null;
  return (
    <div className="text-destructive text-sm flex items-center gap-x-2">
      <OctagonAlert fill="red" className="w-5 h-5 text-white" />
      <p>{message}</p>
    </div>
  );
};
