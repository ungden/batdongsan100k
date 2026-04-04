import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SavedProvider } from "@/components/SavedContext";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SavedProvider>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </SavedProvider>
  );
}
