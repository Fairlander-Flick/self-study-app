import { useState, useEffect } from 'react';
import './FlashCard.css';

export default function FlashCard({ card, onAnswer, onDiscard }) {
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [isEvaluated, setIsEvaluated] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const correctAnswers = Array.isArray(card.answer) ? card.answer : [card.answer];
    const isMultiSelect = correctAnswers.length > 1;
    const options = card.options || [];

    // ── Keyboard shortcuts ──────────────────────────────────
    useEffect(() => {
        const handleKey = (e) => {
            // 1-5: select option by index
            if (!isEvaluated && e.key >= '1' && e.key <= '5') {
                const idx = parseInt(e.key, 10) - 1;
                if (idx < options.length) {
                    const opt = options[idx];
                    if (isMultiSelect) {
                        setSelectedOptions(prev =>
                            prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
                        );
                    } else {
                        handleEvaluate([opt]);
                    }
                }
            }
            // Enter / Space: check (multi-select) or go next (post-eval)
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (isEvaluated) {
                    if (onAnswer) onAnswer(isCorrect);
                } else if (isMultiSelect && selectedOptions.length > 0) {
                    handleEvaluate(selectedOptions);
                }
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isEvaluated, isCorrect, selectedOptions, isMultiSelect, options]);


    const toggleOption = (opt) => {
        if (isEvaluated) return;
        if (isMultiSelect) {
            setSelectedOptions(prev =>
                prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
            );
        } else {
            handleEvaluate([opt]);
        }
    };

    const handleEvaluate = (selections = selectedOptions) => {
        if (selections.length === 0) return;
        setIsEvaluated(true);
        setSelectedOptions(selections);
        const isPerfectMatch =
            selections.length === correctAnswers.length &&
            selections.every(s => correctAnswers.includes(s));
        setIsCorrect(isPerfectMatch);
    };

    return (
        <div className="fc-card">
            {/* Header row */}
            <div className="fc-header">
                <button
                    className="fc-discard-btn"
                    onClick={(e) => { e.stopPropagation(); if (onDiscard) onDiscard(); }}
                >
                    🗑️ Discard
                </button>
                <span className="fc-topic">{card.topicName}</span>
                {card.lecture_text && (
                    <button
                        className="fc-context-btn"
                        onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
                    >
                        📖
                    </button>
                )}
            </div>

            {/* Question */}
            <div className="fc-question">
                <p>{card.question}</p>
            </div>

            {/* Hint for multi-select */}
            {isMultiSelect && !isEvaluated && (
                <p className="fc-hint">Select ALL that apply, then tap Check</p>
            )}

            {/* Result banner */}
            {isEvaluated && (
                <div className={`fc-result-banner ${isCorrect ? 'correct' : 'incorrect'}`}>
                    <span className="fc-result-title">
                        {isCorrect ? '✅  Correct!' : '❌  Wrong — see correct answers below'}
                    </span>
                    {card.explanation && (
                        <span className="fc-result-explanation">💡 {card.explanation}</span>
                    )}
                </div>
            )}

            {/* Options */}
            <div className="fc-options">
                {(card.options || []).map((opt, i) => {
                    const isSelected = selectedOptions.includes(opt);
                    const isActuallyCorrect = correctAnswers.includes(opt);
                    let cls = 'fc-option';
                    if (isEvaluated) {
                        if (isActuallyCorrect) cls += ' fc-correct';
                        else if (isSelected) cls += ' fc-incorrect';
                    } else if (isSelected) {
                        cls += ' fc-selected';
                    }
                    return (
                        <button
                            key={i}
                            className={cls}
                            onClick={() => toggleOption(opt)}
                            disabled={isEvaluated}
                        >
                            <span className="fc-indicator" />
                            <span className="fc-opt-text">{opt}</span>
                        </button>
                    );
                })}
            </div>


            {/* Footer actions */}
            <div className="fc-footer">
                {!isEvaluated ? (
                    isMultiSelect ? (
                        <button
                            className="fc-check-btn"
                            onClick={() => handleEvaluate()}
                            disabled={selectedOptions.length === 0}
                        >
                            Check Answer
                        </button>
                    ) : (
                        <p className="fc-hint" style={{ margin: 0 }}>Tap an option to answer</p>
                    )
                ) : (
                    <button
                        className={`fc-next-btn ${isCorrect ? 'success' : 'retry'}`}
                        onClick={() => onAnswer(isCorrect)}
                    >
                        {isCorrect ? 'Next Question ➔' : 'Got it, retry later ➔'}
                    </button>
                )}
            </div>

            {/* Keyboard hint */}
            <div className="fc-keyboard-hint">
                ⌨️ <strong>1–5</strong> select · <strong>Enter</strong> {isEvaluated ? 'next' : 'check'}
            </div>

            {/* Context Modal */}
            {showModal && (
                <div
                    className="modal-overlay"
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
