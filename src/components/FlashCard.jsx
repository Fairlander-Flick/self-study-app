import { useState } from 'react';
import { motion } from 'framer-motion';
import './FlashCard.css';

export default function FlashCard({ card, onAnswer, onDiscard }) {
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [isEvaluated, setIsEvaluated] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // card.answer is always an array of strings in our new format (or a string from older decks)
    const correctAnswers = Array.isArray(card.answer) ? card.answer : [card.answer];

    // Determine if it's multiple choice (1 correct) or multiple correct (>1 correct)
    const isMultiSelect = correctAnswers.length > 1;

    const toggleOption = (opt) => {
        if (isEvaluated) return; // Prevent changing after evaluation

        if (isMultiSelect) {
            setSelectedOptions(prev =>
                prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
            );
        } else {
            // Single select: immediately evaluate on click
            handleEvaluate([opt]);
        }
    };

    const handleEvaluate = (selections = selectedOptions) => {
        if (selections.length === 0) return;

        setIsEvaluated(true);
        setSelectedOptions(selections); // ensure state is updated if passed directly

        // Check if selections match correct answers exactly
        const isPerfectMatch =
            selections.length === correctAnswers.length &&
            selections.every(s => correctAnswers.includes(s));

        setIsCorrect(isPerfectMatch);
    };

    const handleNext = () => {
        // Pass whether they got it right to StudyPage queue logic
        onAnswer(isCorrect);
    };

    return (
        <div className="flashcard-container" style={{ height: 'auto', minHeight: '650px', display: 'flex' }}>
            <motion.div
                className="flashcard-inner"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ height: '100%', flex: 1 }}
            >
                {/* Single Face */}
                <div className="flashcard-face" style={{ height: '100%' }}>
                    {/* Card Header (Discard & Topic) */}
                    <div className="flashcard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '12px' }}>
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={(e) => { e.stopPropagation(); if (onDiscard) onDiscard(); }}
                            title="Discard this question permanently"
                            style={{
                                color: 'var(--clr-danger)',
                                padding: '6px 10px',
                                fontSize: '12px',
                                border: '1px solid rgba(248, 113, 113, 0.3)',
                                background: 'rgba(248, 113, 113, 0.05)',
                                flexShrink: 0
                            }}
                        >
                            🗑️ Discard
                        </button>
                        <div className="flashcard-topic" style={{ flex: 1, textAlign: 'right', margin: 0, alignSelf: 'center' }}>
                            {card.topicName}
                        </div>
                    </div>

                    <div className="flashcard-question-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <h3 style={{ fontSize: '1.3rem', textAlign: 'left', marginBottom: '8px' }}>{card.question}</h3>

                        {isMultiSelect && !isEvaluated && (
                            <p style={{ fontSize: '0.85rem', color: 'var(--clr-primary)', marginTop: '-15px' }}>
                                * Select ALL that apply, then click Check Answer
                            </p>
                        )}

                        {card.options && card.options.length > 0 && (
                            <div className="flashcard-options">
                                {card.options.map((opt, i) => {
                                    const isSelected = selectedOptions.includes(opt);
                                    const isActuallyCorrect = correctAnswers.includes(opt);

                                    let optionClass = "flashcard-option-item";
                                    if (isSelected) optionClass += " selected";

                                    if (isEvaluated) {
                                        if (isActuallyCorrect) optionClass += " correct"; // Highlight all correct answers
                                        else if (isSelected && !isActuallyCorrect) optionClass += " incorrect"; // Highlight wrong guesses
                                    }

                                    return (
                                        <div
                                            key={i}
                                            className={optionClass}
                                            onClick={() => toggleOption(opt)}
                                            style={{ cursor: isEvaluated ? 'default' : 'pointer' }}
                                        >
                                            {/* Show checkbox-like indicator for multi-select */}
                                            {isMultiSelect && (
                                                <span style={{ marginRight: '10px', fontSize: '1.1rem' }}>
                                                    {isSelected ? '☑️' : '⬜'}
                                                </span>
                                            )}
                                            {opt}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="flashcard-front-actions">
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {card.lecture_text && (
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
                                    style={{ fontSize: '13px' }}
                                >
                                    📖 Read Context
                                </button>
                            )}
                        </div>

                        {!isEvaluated ? (
                            isMultiSelect ? (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleEvaluate()}
                                    disabled={selectedOptions.length === 0}
                                >
                                    Check Answer
                                </button>
                            ) : null // Single select evaluates implicitly on click
                        ) : (
                            <button
                                className={`btn ${isCorrect ? 'btn-success' : 'btn-danger'}`}
                                onClick={handleNext}
                                style={{ flex: 1, maxWidth: '200px' }}
                            >
                                {isCorrect ? 'Correct! Next ➔' : 'Incorrect ➔'}
                            </button>
                        )}
                    </div>
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
