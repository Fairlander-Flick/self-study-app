import { useState } from 'react';
import { motion } from 'framer-motion';
import './FlashCard.css';

export default function FlashCard({ card, onAnswer }) {
    const [flipped, setFlipped] = useState(false);
    const [answered, setAnswered] = useState(false);

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
                    <div className="flashcard-topic">{card.topicName}</div>
                    <div className="flashcard-question">
                        <h3>{card.question}</h3>
                    </div>
                    <button
                        className="btn btn-primary flashcard-flip-btn"
                        onClick={() => setFlipped(true)}
                    >
                        Show Answer ↻
                    </button>
                </div>

                {/* Back */}
                <div className="flashcard-face flashcard-back">
                    <div className="flashcard-topic">{card.topicName}</div>
                    <div className="flashcard-answer">
                        <p>{card.answer}</p>
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
                </div>
            </motion.div>
        </div>
    );
}
