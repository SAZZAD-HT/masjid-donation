// components/SkeletonCard.js
export default function SkeletonCard() {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {/* Header shimmer */}
      <div style={{ height: 140, background: 'linear-gradient(90deg, #e8e4da 25%, #f2ead8 50%, #e8e4da 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />

      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Title */}
        <div style={{ height: 20, borderRadius: 8, width: '75%', background: 'linear-gradient(90deg, #e8e4da 25%, #f2ead8 50%, #e8e4da 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite 0.1s' }} />
        {/* Description lines */}
        <div style={{ height: 14, borderRadius: 8, width: '100%', background: 'linear-gradient(90deg, #e8e4da 25%, #f2ead8 50%, #e8e4da 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite 0.2s' }} />
        <div style={{ height: 14, borderRadius: 8, width: '85%', background: 'linear-gradient(90deg, #e8e4da 25%, #f2ead8 50%, #e8e4da 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite 0.3s' }} />
        {/* Progress bar */}
        <div style={{ height: 8, borderRadius: 999, background: 'linear-gradient(90deg, #e8e4da 25%, #f2ead8 50%, #e8e4da 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite 0.4s' }} />
        {/* Button */}
        <div style={{ height: 48, borderRadius: 999, background: 'linear-gradient(90deg, #e8e4da 25%, #f2ead8 50%, #e8e4da 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite 0.5s' }} />
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
