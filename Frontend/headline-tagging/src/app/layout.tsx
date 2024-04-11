import type { Metadata } from "next";
import styles from "./page.module.css";
import "bootstrap/dist/css/bootstrap.min.css";

export const metadata: Metadata = {
   title: "Headline Tagger",
   description: "Give tags to your headlines",
};

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang="en">
         <body className={styles.body}>{children}</body>
      </html>
   );
}
