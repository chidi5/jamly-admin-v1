"use client";

import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className=" space-y-2">
          <Skeleton className="h-5 w-[200px]" />
          <Skeleton className="h-4 w-[250px]" />
        </div>
        <div>
          <div className="flex items-center py-4">
            <Skeleton className="h-8 w-72" />
          </div>
          <Skeleton className="h-52 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export default Loading;
