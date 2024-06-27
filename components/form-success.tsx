import { CheckCircle2 } from "lucide-react";
import React from "react";

type FormSuccessProps = {
  message?: string;
};

export const FormSuccess = ({ message }: FormSuccessProps) => {
  if (!message) return null;
  return (
    <div className="text-emerald-500 text-sm flex items-center gap-x-2">
      <CheckCircle2 fill="green" className="w-5 h-5 text-white" />
      <p>{message}</p>
    </div>
  );
};
