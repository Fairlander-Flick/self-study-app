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
            if (animating || currentIndex >= topics.length) return;
            if (e.key === 'ArrowRight') handleSwipe('right');
            if (e.key === 'ArrowLeft') handleSwipe('left');
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [currentIndex, topics, animating]);

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
                />
            )}

            {/* Last action toast */}
            {lastAction && (
                <div
                    key={`${lastAction}-${currentIndex}`}
                    className={`swipe-toast swipe-toast-${lastAction}`}
                >
                    {lastAction === 'like' ? '✓ Added' : '✗ Skipped'}
                </div>
            )}
        </div>
    );
}

function FinishedView({ liked, skipped, deckId, navigate }) {
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

    // Save selected topics to sessionStorage for the confirm page
    sessionStorage.setItem(`swipe_liked_${deckId}`, JSON.stringify(liked));
    sessionStorage.setItem(`swipe_skipped_${deckId}`, JSON.stringify(skipped));

    return (
        <div className="swipe-finished animate-fade-in">
            <div className="swipe-finished-icon">🎯</div>
            <h2>Selection Complete!</h2>
            <p>
                <strong className="text-success">{liked.length} topics</strong> selected,{' '}
                <strong className="text-muted">{skipped.length} topics</strong> skipped.
            </p>

            <div className="swipe-finished-summary">
                <div className="swipe-finished-col liked">
                    <h4>✓ To Study</h4>
                    <ul>
                        {liked.map(t => <li key={t.id}>{t.topic}</li>)}
                    </ul>
                </div>
                {skipped.length > 0 && (
                    <div className="swipe-finished-col skipped">
                        <h4>✗ Skipped</h4>
                        <ul>
                            {skipped.map(t => <li key={t.id}>{t.topic}</li>)}
                        </ul>
                    </div>
                )}
            </div>

            <div className="swipe-finished-actions">
                <button
                    className="btn btn-ghost"
                    onClick={() => window.location.reload()}
                >
                    ↺ Reselect
                </button>
                <button
                    id="start-study-btn"
                    className="btn btn-primary btn-lg"
                    onClick={() => navigate(`/study/${deckId}`)}
                >
                    🚀 Start Studying!
                </button>
            </div>
        </div>
    );
}
