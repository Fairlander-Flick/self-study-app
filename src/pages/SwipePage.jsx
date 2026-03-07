import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDeck } from '../services/db.js';
import SwipeCard from '../components/SwipeCard.jsx';
import './SwipePage.css';

export default function SwipePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [deck, setDeck] = useState(null);
    const [topics, setTopics] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [liked, setLiked] = useState([]);   // sağa kaydırılan
    const [skipped, setSkipped] = useState([]); // sola kaydırılan
    const [lastAction, setLastAction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        getDeck(id).then(d => {
            if (!d) { navigate('/'); return; }
            setDeck(d);
            setTopics(d.topics);
            setLoading(false);
        });
    }, [id, navigate]);

    // keyboard support
    useEffect(() => {
        const onKey = (e) => {
            if (animating) return;
            if (currentIndex < topics.length) {
                if (e.key === 'ArrowRight') handleSwipe('right');
                if (e.key === 'ArrowLeft') handleSwipe('left');
            }
            if (e.key === 'ArrowUp' || e.key === 'Backspace') handleUndo();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [currentIndex, topics, animating]);

    const handleUndo = () => {
        if (animating || currentIndex === 0) return;
        setAnimating(true);
        const prevCard = topics[currentIndex - 1];

        // Check where this card went
        if (liked.length > 0 && liked[liked.length - 1].id === prevCard.id) {
            setLiked(prev => prev.slice(0, -1));
        } else if (skipped.length > 0 && skipped[skipped.length - 1].id === prevCard.id) {
            setSkipped(prev => prev.slice(0, -1));
        }

        setLastAction('undo');
        setCurrentIndex(prev => prev - 1);
        setTimeout(() => setAnimating(false), 200); // slightly faster animation for undo
    };

    const handleSwipe = (direction) => {
        if (animating || currentIndex >= topics.length) return;
        setAnimating(true);
        const topic = topics[currentIndex];
        if (direction === 'right') {
            setLiked(prev => [...prev, topic]);
            setLastAction('like');
        } else {
            setSkipped(prev => [...prev, topic]);
            setLastAction('skip');
        }
        setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
            setAnimating(false);
        }, 350);
    };

    const finished = !loading && currentIndex >= topics.length;
    const progress = topics.length > 0 ? currentIndex / topics.length : 0;

    if (loading) return (
        <div className="page-center">
            <div className="loading-spinner" />
        </div>
    );

    return (
        <div className="swipe-page animate-fade-in">
            {/* Top bar */}
            <div className="swipe-topbar">
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>
                    ← Back
                </button>
                <div className="swipe-deck-name">{deck?.name}</div>
                <div className="swipe-counter">
                    {Math.min(currentIndex + 1, topics.length)} / {topics.length}
                </div>
            </div>

            {/* Progress bar */}
            <div className="swipe-progress">
                <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${progress * 100}%` }} />
                </div>
                <div className="swipe-progress-labels">
                    <span className="text-success">✓ {liked.length} selected</span>
                    <span className="text-muted">✗ {skipped.length} skipped</span>
                </div>
            </div>

            {/* Card area */}
            {!finished ? (
                <div className="swipe-arena">
                    {/* Legend */}
                    <div className="swipe-legend">
                        <span className="swipe-hint skip">← Know it / Skip</span>
                        <span className="swipe-hint like">Will Study →</span>
                    </div>

                    {/* Stack: render current + next behind it */}
                    <div className="swipe-stack">
                        {/* Background card (next) */}
                        {currentIndex + 1 < topics.length && (
                            <div className="swipe-card-bg">
                                <div className="swipe-card-bg-inner" />
                            </div>
                        )}

                        {/* Active card */}
                        <SwipeCard
                            key={currentIndex}
                            topic={topics[currentIndex]}
                            onSwipe={handleSwipe}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="swipe-buttons">
                        <button
                            id="btn-skip"
                            className="swipe-btn swipe-btn-skip"
                            onClick={() => handleSwipe('left')}
                            aria-label="Skip topic"
                        >
                            <span className="swipe-btn-icon">✗</span>
                            <span>Skip</span>
                        </button>
                        <button
                            className="swipe-btn swipe-btn-undo"
                            onClick={handleUndo}
                            disabled={currentIndex === 0 || animating}
                            aria-label="Undo last swipe"
                            style={{ opacity: currentIndex === 0 ? 0.3 : 1, width: '56px', height: '56px', marginTop: '16px' }}
                        >
                            <span className="swipe-btn-icon" style={{ fontSize: '18px' }}>↺</span>
                            <span>Undo</span>
                        </button>
                        <button
                            id="btn-like"
                            className="swipe-btn swipe-btn-like"
                            onClick={() => handleSwipe('right')}
                            aria-label="Study this topic"
                        >
                            <span>Study</span>
                            <span className="swipe-btn-icon">✓</span>
                        </button>
                    </div>

                    <p className="swipe-keyboard-hint">You can also use ← → arrow keys</p>
                </div>
            ) : (
                /* Done — show confirm screen inline */
                <FinishedView
                    liked={liked}
                    skipped={skipped}
                    deckId={id}
                    navigate={navigate}
                    deckName={deck?.name}
                />
            )}

            {/* Last action toast */}
            {lastAction && (
                <div
                    key={`${lastAction}-${currentIndex}`}
                    className={`swipe-toast swipe-toast-${lastAction}`}
                >
                    {lastAction === 'like' ? '✓ Added' : lastAction === 'skip' ? '✗ Skipped' : '↺ Undone'}
                </div>
            )}
        </div>
    );
}

function FinishedView({ liked, skipped, deckId, navigate, deckName }) {
    const [editedTopics, setEditedTopics] = useState(liked);
    const [showPromptModal, setShowPromptModal] = useState(false);
    const [magicPrompt, setMagicPrompt] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (editedTopics.length > 0) {
            sessionStorage.setItem(`swipe_liked_${deckId}`, JSON.stringify(editedTopics));
            sessionStorage.setItem(`swipe_skipped_${deckId}`, JSON.stringify(skipped));
        }
    }, [editedTopics, skipped, deckId]);

    const handlePointChange = (topicIndex, pointIndex, value) => {
        const updated = [...editedTopics];
        updated[topicIndex].summary_points[pointIndex] = value;
        setEditedTopics(updated);
    };

    const handleGenerateDeepDive = () => {
        const topicText = editedTopics.map(t => {
            return `Topic: ${t.topic}\nPoints to cover:\n` + t.summary_points.map(p => `- ${p}`).join('\n');
        }).join('\n\n');

        const prompt = `I am studying "${deckName || 'this subject'}" and I want to deeply study the following specific topics and points. Please act as an expert tutor and instructional designer.

${topicText}

Generate a deep-dive flashcard deck for me based ONLY on these exact points. Follow these strict rules for the JSON output:
1. Return ONLY valid JSON. No markdown formatting (\`\`\`json), no introductory text, no conversational filler.
2. The root must be a JSON Array [ ... ].
3. For each topic above, provide:
   - "id": A unique string.
   - "topic": The exact topic name provided above.
   - "lecture_text": A comprehensive 2-3 paragraph deep-dive study guide explaining the specifics of these points (Markdown supported). CRITICAL: This text MUST be sourced ENTIRELY from the provided NotebookLM documents, do not invent external facts.
   - "summary_points": The exact points provided above.
   - "flashcards": An array of objects. Create AT LEAST 5 (ideally 5-8) thought-provoking flashcards per topic that deeply test understanding of these specific points. Use a mix of:
      * Basic: { "type": "basic", "question": "...", "answer": "..." }
      * Multiple Choice (1 correct): { "type": "multiple_choice", "question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."], "answer": "C) ..." } (ALWAYS exactly 5 options)
      * Multiple Correct (Choose all that apply): { "type": "multiple_correct", "question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."], "answer": ["A) ...", "C) ..."] } (ALWAYS exactly 5 options)
4. Make questions thought-provoking but concise.
5. Make answers clear and easy to read quickly.
6. Output Language: Keep the language of the output the same as the points provided above.

Example expected format:
[
  {
    "id": "1",
    "topic": "Example Topic",
    "lecture_text": "Here is a detailed paragraph explaining the specifics of Point 1 and Point 2 in depth...",
    "summary_points": ["Point 1", "Point 2"],
    "flashcards": [
      { "type": "basic", "question": "Q?", "answer": "A." },
      { "type": "multiple_choice", "question": "Q?", "options": ["A) 1", "B) 2", "C) 3", "D) 4", "E) 5"], "answer": "C) 3" },
      { "type": "multiple_correct", "question": "Q (Choose all)?", "options": ["A) 1", "B) 2", "C) 3", "D) 4", "E) 5"], "answer": ["A) 1", "D) 4"] }
    ]
  }
]`;
        setMagicPrompt(prompt);
        setShowPromptModal(true);
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(magicPrompt);
            setCopied(true);
            setTimeout(() => setCopied(false), 10000);
        } catch (err) {
            console.error('Copy failed', err);
            const textArea = document.createElement("textarea");
            textArea.value = magicPrompt;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                setCopied(true);
                setTimeout(() => setCopied(false), 10000);
            } catch (e) {
                console.error('Fallback copy failed', e);
            }
            document.body.removeChild(textArea);
        }
    };

    if (liked.length === 0) {
        return (
            <div className="swipe-finished animate-fade-in">
                <div className="swipe-finished-icon">😅</div>
                <h2>No topics selected!</h2>
                <p>You need to swipe at least one topic right to study it.</p>
                <button className="btn btn-primary mt-lg" onClick={() => window.location.reload()}>
                    Start Over
                </button>
            </div>
        );
    }

    return (
        <div className="swipe-finished animate-fade-in">
            <div className="swipe-finished-header">
                <div className="swipe-finished-icon">🎯</div>
                <h2>Selection Complete!</h2>
                <p>
                    <strong className="text-success">{liked.length} topics</strong> selected,{' '}
                    <strong className="text-muted">{skipped.length} topics</strong> skipped.
                </p>
                <p className="swipe-finished-subtitle">You can edit the points below to fine-tune your focus.</p>
            </div>

            <div className="swipe-finished-editable-list">
                {editedTopics.map((t, tIndex) => (
                    <div key={t.id} className="editable-topic-card">
                        <h4>{t.topic}</h4>
                        {t.summary_points.map((p, pIndex) => (
                            <input
                                key={pIndex}
                                type="text"
                                className="input point-input"
                                value={p}
                                onChange={(e) => handlePointChange(tIndex, pIndex, e.target.value)}
                            />
                        ))}
                    </div>
                ))}
            </div>

            <div className="swipe-finished-actions-row">
                <button
                    className="btn btn-ghost"
                    onClick={() => window.location.reload()}
                >
                    ↺ Reselect
                </button>
                <button
                    className="btn btn-primary btn-outline"
                    onClick={handleGenerateDeepDive}
                >
                    ✨ Deep-Dive Prompt
                </button>
                <div className="finish-actions" style={{ flexDirection: 'column', gap: '12px' }}>
                    <button
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%', fontSize: '1.1rem' }}
                        onClick={() => navigate(`/guide/${deckId}`)}
                    >
                        📖 Read Study Guide
                    </button>
                    <button
                        className="btn btn-ghost btn-lg"
                        style={{ width: '100%' }}
                        onClick={() => navigate(`/study/${deckId}`)}
                    >
                        🃏 Skip to Flashcards
                    </button>
                </div>
            </div>

            {/* Prompt Modal */}
            {showPromptModal && (
                <div className="modal-overlay" onClick={() => setShowPromptModal(false)}>
                    <div className="modal magic-prompt-modal" onClick={e => e.stopPropagation()}>
                        <div className="import-modal-header">
                            <div>
                                <h2 className="import-modal-title">Magic Deep-Dive Prompt</h2>
                                <p className="import-modal-subtitle">Copy this to NotebookLM/ChatGPT!</p>
                            </div>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowPromptModal(false)}>✕</button>
                        </div>
                        <div className="import-field">
                            <textarea
                                className="input textarea-large"
                                value={magicPrompt}
                                readOnly
                                style={{ minHeight: '250px' }}
                            />
                        </div>
                        <div className="prompt-actions" style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                            <button
                                className={`btn ${copied ? 'btn-success' : 'btn-primary'}`}
                                onClick={handleCopy}
                                style={{ flex: 1 }}
                            >
                                {copied ? '✓ Copied!' : '📋 Copy Prompt'}
                            </button>
                            <button className="btn btn-ghost" onClick={() => setShowPromptModal(false)}>Close</button>
                        </div>
                        {copied && (
                            <p className="import-success" style={{ marginTop: '12px', fontSize: '13px' }}>
                                Next: Paste this to AI, get new JSON, and create a new deep-dive deck!
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
