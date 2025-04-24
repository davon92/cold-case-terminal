import '../styles/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Cold Case Terminal</title>
      </head>
      <body className="min-h-screen bg-[#a0a0a0] font-mono text-black">{children}</body>
    </html>
  );
}
