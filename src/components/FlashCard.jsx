import { useState } from 'react';
import { motion } from 'framer-motion';
import './FlashCard.css';

export default function FlashCard({ card, onAnswer, onDiscard }) {
    const [flipped, setFlipped] = useState(false);
    const [answered, setAnswered] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleAnswer = (knewIt) => {
        setAnswered(true);
        // Add small delay so animations play properly
        setTimeout(() => {
            onAnswer(knewIt);
        }, 150);
    };

    return (
        <div className="flashcard-container">
            <motion.div
                className="flashcard-inner"
                animate={{ rotateX: flipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Front */}
                <div className="flashcard-face flashcard-front">
                    <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={(e) => { e.stopPropagation(); if (onDiscard) onDiscard(); }}
                            title="Discard this question permanently"
                            style={{ color: 'var(--clr-danger)', padding: '6px 10px', fontSize: '12px', border: '1px solid rgba(248, 113, 113, 0.3)', background: 'rgba(248, 113, 113, 0.05)' }}
                        >
                            🗑️ Discard
                        </button>
                    </div>
                    <div className="flashcard-topic">{card.topicName}</div>
                    <div className="flashcard-question-area">
                        <h3>{card.question}</h3>
                        {card.options && card.options.length > 0 && (
                            <div className="flashcard-options">
                                {card.options.map((opt, i) => (
                                    <div key={i} className="flashcard-option-item">{opt}</div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flashcard-front-actions" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%', marginTop: 'auto' }}>
                        {card.lecture_text && (
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
                                style={{ marginRight: 'auto', fontSize: '13px' }}
                            >
                                📖 Read Context
                            </button>
                        )}
                        <button
                            className="btn btn-primary flashcard-flip-btn"
                            onClick={() => setFlipped(true)}
                        >
                            Show Answer ↻
                        </button>
                    </div>
                </div>

                {/* Back */}
                <div className="flashcard-face flashcard-back">
                    <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={(e) => { e.stopPropagation(); if (onDiscard) onDiscard(); }}
                            title="Discard this question permanently"
                            style={{ color: 'var(--clr-danger)', padding: '6px 10px', fontSize: '12px', border: '1px solid rgba(248, 113, 113, 0.3)', background: 'rgba(248, 113, 113, 0.05)' }}
                        >
                            🗑️ Discard
                        </button>
                    </div>
                    <div className="flashcard-topic">{card.topicName}</div>
                    <div className="flashcard-answer">
                        {Array.isArray(card.answer) ? (
                            <div className="flashcard-answer-list">
                                {card.answer.map((ans, i) => (
                                    <div key={i} className="flashcard-answer-item">{ans}</div>
                                ))}
                            </div>
                        ) : (
                            <p>{card.answer}</p>
                        )}
                    </div>
                    <div className="flashcard-actions">
                        <button
                            className="btn btn-danger flashcard-btn"
                            onClick={() => handleAnswer(false)}
                            disabled={answered}
                        >
                            <span>Ask Again</span>
                            <span className="icon">🔁</span>
                        </button>
                        <button
                            className="btn btn-success flashcard-btn"
                            onClick={() => handleAnswer(true)}
                            disabled={answered}
                        >
                            <span>Got it</span>
                            <span className="icon">✓</span>
                        </button>
                    </div>
                    {card.lecture_text && (
                        <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                            <button
                                className="btn btn-ghost btn-icon"
                                onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
                                title="Read Context"
                            >
                                📖
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Context Modal */}
            {showModal && (
                <div
                    className="modal-overlay"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => setShowModal(false)}
                    style={{ zIndex: 9999 }}
                >
                    <div className="modal swipe-info-modal" onClick={e => e.stopPropagation()}>
                        <div className="import-modal-header">
                            <div>
                                <h2 className="import-modal-title" style={{ fontSize: '1.2rem' }}>{card.topicName}</h2>
                                <p className="import-modal-subtitle">Lecture Context</p>
                            </div>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="swipe-info-content" style={{ textAlign: 'left' }}>
                            {card.lecture_text.split('\n').map((paragraph, i) => (
                                paragraph.trim() ? <p key={i}>{paragraph}</p> : <br key={i} />
                            ))}
                        </div>
                        <div className="import-actions" style={{ marginTop: '24px' }}>
                            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowModal(false)}>Got it</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
