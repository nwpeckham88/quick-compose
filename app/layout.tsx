import type {Metadata} from 'next';
import './globals.css';
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: 'My Google AI Studio App',
  description: 'My Google AI Studio App',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={cn("font-sans")}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
