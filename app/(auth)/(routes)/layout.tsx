export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-[url('/assets/blob-scene.svg')] bg-cover bg-no-repeat overflow-y-hidden">
      {children}
    </div>
  );
}
