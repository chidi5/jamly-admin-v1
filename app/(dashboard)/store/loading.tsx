"use client";

import { BarLoader } from "react-spinners";

const Loading = () => {
  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
      <div className="flex flex-col items-center space-y-5">
        <h2 className="text-2xl font-bold">Jamly</h2>
        <BarLoader color="#3498db" height={7} width={400} />
        <p className="text-base">Loading your dashboard...</p>
      </div>
    </div>
  );
};

export default Loading;
