import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Graduation Party RSVP — Tanmay Garg, Class of 2026",
  description:
    "You're invited to Tanmay Garg's Graduation Party! RSVP for Saturday, May 23rd 2026 at 801 S Plymouth Ct, Chicago, IL.",
  openGraph: {
    title: "Graduation Party RSVP — Tanmay Garg",
    description:
      "Join us for a Graduation Celebration! Saturday, May 23rd, 6:00–8:30 PM.",
    images: ["/Invitation.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
