import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://batdongsan100k.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "TitanHome | Nền tảng Bất Động Sản hàng đầu Việt Nam",
    template: "%s | TitanHome",
  },
  description:
    "Tìm kiếm mua bán, cho thuê bất động sản tại Việt Nam. Hơn 4,500+ chung cư, nhà phố, biệt thự, đất nền, văn phòng với giá tốt nhất. Cập nhật mỗi ngày.",
  keywords: [
    "bất động sản", "mua bán nhà đất", "cho thuê nhà", "chung cư",
    "nhà phố", "biệt thự", "đất nền", "văn phòng cho thuê",
    "bất động sản Hồ Chí Minh", "bất động sản Hà Nội", "TitanHome",
  ],
  authors: [{ name: "TitanHome" }],
  creator: "TitanHome",
  publisher: "TitanHome",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: SITE_URL,
    siteName: "TitanHome",
    title: "TitanHome | Nền tảng Bất Động Sản hàng đầu Việt Nam",
    description:
      "Hơn 4,500+ bất động sản đang bán và cho thuê. Chung cư, nhà phố, biệt thự, đất nền tại Hồ Chí Minh, Hà Nội và 63 tỉnh thành.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TitanHome - Nền tảng Bất Động Sản Việt Nam",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TitanHome | Bất Động Sản hàng đầu Việt Nam",
    description:
      "Hơn 4,500+ bất động sản đang bán và cho thuê tại Việt Nam.",
    images: ["/og-image.png"],
    creator: "@titanhome",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon.svg" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-surface text-on-surface font-[var(--font-be-vietnam-pro)] selection:bg-primary/20">
        {children}
      </body>
    </html>
  );
}
