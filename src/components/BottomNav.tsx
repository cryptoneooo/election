'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', icon: '🏠', label: '首頁' },
  { href: '/candidates', icon: '👤', label: '候選人' },
  { href: '/map', icon: '🗺', label: '地圖' },
  { href: '/checks', icon: '✓', label: '查核' },
  { href: '/methodology', icon: '📋', label: '方法' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="gta-nav">
      <div className="gta-nav-inner">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`gta-nav-item ${isActive ? 'gta-nav-item--active' : ''}`}
            >
              <span className="gta-nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
