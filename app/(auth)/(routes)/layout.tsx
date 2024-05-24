export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex items-center justify-center h-full bg-[url('/assets/blob-scene.svg')] bg-cover bg-no-repeat">
      {children}
    </div>
  );
}
