export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="fixed flex items-center justify-center w-full h-full bg-[url('/assets/blob-scene.svg')] bg-cover bg-no-repeat overflow-y-hidden">
      {children}
    </div>
  );
}
