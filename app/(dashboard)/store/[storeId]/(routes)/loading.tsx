"use client";

import { Loader } from "@/components/ui/loader";

const Loading = () => {
  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <Loader />
    </div>
  );
};

export default Loading;
