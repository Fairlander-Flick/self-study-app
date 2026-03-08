import './Skeleton.css';

/**
 * Generic skeleton loader. Renders an animated placeholder block.
 * @param {number} width  - CSS width string, e.g. '100%' or '200px'
 * @param {number} height - CSS height string, e.g. '24px'
 * @param {string} style  - optional extra style class
 */
export default function Skeleton({ width = '100%', height = '20px', borderRadius = '8px', style = {} }) {
    return (
        <div
            className="skeleton-block"
            style={{ width, height, borderRadius, ...style }}
            aria-hidden="true"
        />
    );
}

/** Pre-built skeleton for a deck card */
export function DeckCardSkeleton() {
    return (
        <div className="deck-card card skeleton-card">
            <div className="deck-card-body">
                <div className="deck-card-top">
                    <Skeleton width="48px" height="48px" borderRadius="12px" />
                </div>
                <Skeleton width="70%" height="20px" style={{ marginTop: '16px', marginBottom: '8px' }} />
                <Skeleton width="40%" height="14px" />
            </div>
            <div className="deck-card-footer">
                <Skeleton width="60%" height="14px" />
            </div>
        </div>
    );
}

/** Pre-built skeleton for the stats bar */
export function StatsSkeleton() {
    return (
        <div className="home-stats-bar" style={{ gap: '12px' }}>
            {[1, 2, 3].map(i => (
                <div key={i} className="stat-card">
                    <Skeleton width="32px" height="32px" borderRadius="50%" style={{ margin: '0 auto 8px' }} />
                    <Skeleton width="60%" height="22px" style={{ margin: '0 auto 4px' }} />
                    <Skeleton width="80%" height="12px" style={{ margin: '0 auto' }} />
                </div>
            ))}
        </div>
    );
}
