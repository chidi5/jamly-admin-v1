import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import AuthProvider from "@/providers/auth-provider";
import ModalProvider from "@/providers/modal-provider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin Dashboard",
  icons: {
    icon: "/assets/plura-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang="en">
        <body className={cn("relative h-full antialiased", inter.className)}>
          <Toaster />
          <ModalProvider />
          <main className="relative flex flex-col min-h-screen h-full">
            <div className="flex-grow flex-1">{children}</div>
          </main>
        </body>
      </html>
    </AuthProvider>
  );
}
