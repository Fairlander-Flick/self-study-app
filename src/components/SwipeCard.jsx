import { useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import './SwipeCard.css';

const SWIPE_THRESHOLD = 100; // px

export default function SwipeCard({ topic, onSwipe }) {
    const [isDragging, setIsDragging] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const x = useMotionValue(0);

    // Rotate slightly as card is dragged
    const rotate = useTransform(x, [-300, 0, 300], [-18, 0, 18]);

    // Overlay opacity for like/skip indicators
    const likeOpacity = useTransform(x, [20, 120], [0, 1], { clamp: true });
    const skipOpacity = useTransform(x, [-120, -20], [1, 0], { clamp: true });

    const handleDragEnd = (_, info) => {
        setIsDragging(false);
        const offset = info.offset.x;
        if (offset > SWIPE_THRESHOLD) {
            flyOut('right');
        } else if (offset < -SWIPE_THRESHOLD) {
            flyOut('left');
        } else {
            // snap back
            animate(x, 0, { type: 'spring', stiffness: 300, damping: 20 });
        }
    };

    const flyOut = (direction) => {
        animate(x, direction === 'right' ? 600 : -600, {
            duration: 0.3,
            ease: 'easeOut',
            onComplete: () => onSwipe(direction),
        });
    };

    return (
        <>
            <motion.div
                className={`swipe-card ${isDragging ? 'dragging' : ''}`}
                style={{ x, rotate }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.9}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={handleDragEnd}
                whileTap={{ cursor: 'grabbing' }}
            >
                {/* Like overlay */}
                <motion.div className="swipe-overlay like-overlay" style={{ opacity: likeOpacity }}>
                    <span>STUDY ✓</span>
                </motion.div>

                {/* Skip overlay */}
                <motion.div className="swipe-overlay skip-overlay" style={{ opacity: skipOpacity }}>
                    <span>SKIP ✗</span>
                </motion.div>

                {/* Card content */}
                <div className="swipe-card-content">
                    <div className="swipe-card-header">
                        <div className="swipe-card-number">Topic</div>
                        <h2 className="swipe-card-topic">{topic.topic}</h2>
                    </div>

                    <div className="swipe-card-divider" />

                    <div className="swipe-card-points">
                        <p className="swipe-card-points-label">Key Points</p>
                        <ul className="swipe-card-points-list">
                            {topic.summary_points.map((point, i) => (
                                <li key={i} className="swipe-card-point">
                                    <span className="swipe-card-point-dot" />
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="swipe-card-footer-hint">
                        <span>← Swipe Skip</span>
                        {topic.lecture_text && (
                            <button
                                className="btn btn-ghost btn-sm swipe-card-info-btn"
                                style={{ position: 'relative', zIndex: 10, touchAction: 'none' }}
                                onPointerDownCapture={(e) => e.stopPropagation()}
                                onTouchStartCapture={(e) => e.stopPropagation()}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowModal(true); }}
                            >
                                📖 Read Intro
                            </button>
                        )}
                        <span>Study →</span>
                    </div>
                </div>

            </motion.div>

            {/* Info Modal */}
            {showModal && (
                <div
                    className="modal-overlay"
                    style={{ zIndex: 9999 }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => setShowModal(false)}
                >
                    <div className="modal swipe-info-modal" onClick={e => e.stopPropagation()}>
                        <div className="import-modal-header">
                            <div>
                                <h2 className="import-modal-title">{topic.topic}</h2>
                                <p className="import-modal-subtitle">Lecture Overview</p>
                            </div>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="swipe-info-content" style={{ textAlign: 'left' }}>
                            {topic.lecture_text.split('\n').map((paragraph, i) => (
                                paragraph.trim() ? <p key={i}>{paragraph}</p> : <br key={i} />
                            ))}
                        </div>
                        <div className="import-actions" style={{ marginTop: '24px' }}>
                            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowModal(false)}>Got it</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
