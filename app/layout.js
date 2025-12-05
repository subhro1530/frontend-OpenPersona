import "./globals.css";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { ToastProvider } from "@/components/ui/ToastProvider";

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});
const jetBrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-mono",
});

export const metadata = {
  title: "OpenPersona | AI Identity OS",
  description: "Build cinematic AI-native portfolios with OpenPersona.",
};

const RootLayout = ({ children }) => (
  <html lang="en" className={`${grotesk.variable} ${jetBrains.variable}`}>
    <body>
      <ToastProvider>{children}</ToastProvider>
    </body>
  </html>
);

export default RootLayout;
