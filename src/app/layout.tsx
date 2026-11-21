import type { Metadata } from 'next';
import './globals.css';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: '大文山政見地圖 — 從你生活的地方，看候選人提出了什麼',
  description:
    '2026 新北市議員第九選區（新店、深坑、石碇、坪林、烏來）候選人政見整理與事實查核',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <main style={{ paddingBottom: '70px' }}>{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
