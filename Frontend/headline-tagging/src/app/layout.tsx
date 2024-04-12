import type { Metadata } from "next";
import styles from "./page.module.css";
import "bootstrap/dist/css/bootstrap.min.css";

// IF NEEDED CHANGE THIS URL TO WHATEVER YOUR BACKEND URL IS
export const BACKEND_URL: string = "http://127.0.0.1:5000";

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang="en">
         <head>
            <title>Headline Tagger</title>
         </head>
         <body className={styles.body}>{children}</body>
      </html>
   );
}
