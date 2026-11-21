import { Suspense } from 'react';
import MapView from '@/components/MapView';

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div
          className="page-container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            color: 'var(--text-muted)',
          }}
        >
          載入中...
        </div>
      }
    >
      <MapView />
    </Suspense>
  );
}
