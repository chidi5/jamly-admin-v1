"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { buttonVariants } from "./ui/button";
import { usePathname } from "next/navigation";

type Props = {
  user: any;
};

const Navigation = ({ user }: Props) => {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

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

  const routes = [
    {
      href: "/site/pricing",
      label: "Pricing",
      active: pathname === "/site/pricing",
    },
    {
      href: "/site/features",
      label: "Features",
      active: pathname === "/site/features",
    },
    {
      href: "/site/about",
      label: "About",
      active: pathname === "/site/about",
    },
    {
      href: "/site/documentation",
      label: "Documentation",
      active: pathname === "/site/documentation",
    },
  ];

  return (
    <div
      className={cn(
        "fixed z-50 top-0 inset-x-0 h-[4.5rem]",
        scrolled ? "bg-white border-b" : "bg-[#f9fafb]"
      )}
    >
      <header className="relative">
        <MaxWidthWrapper>
          <div className="flex h-[4.5rem] items-center">
            <aside className="flex">
              <Link href={"/"} className="flex items-center gap-2">
                <Image
                  src={"/assets/plura-logo.svg"}
                  width={40}
                  height={40}
                  alt="plur logo"
                />
                <span className="text-xl font-bold"> Jamly.</span>
              </Link>
            </aside>
            <nav className="hidden md:flex mx-6">
              <ul className="flex items-center justify-center gap-8">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "transition-colors hover:text-primary",
                      route.active
                        ? "text-black dark:text-white"
                        : "text-slate-500"
                    )}
                  >
                    {route.label}
                  </Link>
                ))}
              </ul>
            </nav>
            <div className="ml-auto flex items-center space-x-4">
              <Link
                href="/sign-in"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  user ? "hidden" : ""
                )}
              >
                Login
              </Link>
              <Link href="/store" className={buttonVariants()}>
                {user ? "Dashboard" : "Get Started"}
              </Link>
            </div>
          </div>
        </MaxWidthWrapper>
      </header>
    </div>
  );
};

export default Navigation;
