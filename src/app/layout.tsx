import type { Metadata, Viewport } from "next";
import { Geist, Noto_Sans_Bengali } from "next/font/google";
import { IdentityProvider } from "@/components/identity-provider";
import { PrivacyFab } from "@/components/privacy-fab";
import { Providers } from "@/components/providers";
import { cn } from "@/lib/utils";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const notoBn = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-bn",
  display: "swap",
});

export const metadata: Metadata = {
  title: "নজর · Nojor",
  description: "যাচাইকৃত অপরাধ-ভিডিও আর্কাইভ · নজর",
  applicationName: "নজর",
  icons: {
    icon: [{ url: "/brand/nojor-mark.svg", type: "image/svg+xml" }],
    apple: [{ url: "/brand/nojor-mark.png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="bn"
      data-theme="youtube"
      className={cn("h-full", geist.variable, notoBn.variable)}
      suppressHydrationWarning
    >
      <body className="m-0 h-full min-h-dvh w-full overflow-hidden p-0 font-sans antialiased">
        <Providers>
          <IdentityProvider>
            {children}
            <PrivacyFab />
          </IdentityProvider>
        </Providers>
      </body>
    </html>
  );
}
