"use client";

import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import { User } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import WidthWrapper from "./WidthWrapper";

type Props = {
  user?: null | User;
};

const Navigation = ({ user }: Props) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 16) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={cn("fixed top-0 right-0 left-0 py-4 h-20 z-10", {
        "bg-black text-white": scrolled,
      })}
    >
      <WidthWrapper className="flex justify-between">
        <aside className="flex items-center gap-2">
          <Image
            src={"./assets/plura-logo.svg"}
            width={40}
            height={40}
            alt="plur logo"
          />
          <span className="text-xl font-bold"> Jamly.</span>
        </aside>
        <nav className="hidden md:block absolute left-[50%] top-[50%] transform translate-x-[-50%] translate-y-[-50%]">
          <ul className="flex items-center justify-center gap-8">
            <Link href={"#"}>Pricing</Link>
            <Link href={"#"}>About</Link>
            <Link href={"#"}>Documentation</Link>
            <Link href={"#"}>Features</Link>
          </ul>
        </nav>
        <aside className="flex gap-2 items-center">
          <Link
            href={"/store"}
            className="bg-primary text-white p-2 px-4 rounded-md hover:bg-primary/80"
          >
            Login
          </Link>
          <UserButton />
        </aside>
      </WidthWrapper>
    </div>
  );
};

export default Navigation;
