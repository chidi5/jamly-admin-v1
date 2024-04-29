import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import ModalProvider from "@/providers/modal-provider";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={cn("relative h-full antialiased", inter.className)}>
          <Toaster />
          <ModalProvider />
          <main className="relative flex flex-col min-h-screen h-full">
            <div className="flex-grow flex-1">{children}</div>
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
