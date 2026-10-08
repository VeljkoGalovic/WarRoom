import { Rajdhani, JetBrains_Mono } from "next/font/google";
import { WarMapPreviewClient } from "./WarMapPreviewClient";

// Route-scoped fonts - loaded only for this route
const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--wm-font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--wm-font-mono",
  display: "swap",
});

export default function WarMapPreviewPage() {
  return (
    <div className={`${rajdhani.variable} ${jetbrainsMono.variable}`}>
      <WarMapPreviewClient />
    </div>
  );
}