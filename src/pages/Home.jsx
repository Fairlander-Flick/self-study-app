import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllDecks, deleteDeck, getBestScore } from '../services/db.js';
import ImportModal from '../components/ImportModal.jsx';
import './Home.css';

export default function Home() {
    const [decks, setDecks] = useState([]);
    const [showImport, setShowImport] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const loadDecks = async () => {
        const allWithScores = await Promise.all(
            all.reverse().map(async deck => {
                const bestScore = await getBestScore(deck.id);
                return { ...deck, bestScore };
            })
        );
        setDecks(allWithScores);
        setLoading(false);
    };

    useEffect(() => { loadDecks(); }, []);

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this deck?')) return;
        await deleteDeck(id);
        loadDecks();
    };

    const handleImported = (deckId) => {
        setShowImport(false);
        navigate(`/swipe/${deckId}`);
    };

    return (
        <div className="home-page animate-fade-in">
            {/* Hero Header */}
            <div className="home-hero">
                <div className="home-hero-content">
                    <div className="home-hero-badge badge badge-primary">
                        <span>✨</span> AI-Powered Study
                    </div>
                    <h1 className="home-hero-title">
                        Study <span className="gradient-text">Smarter</span>,<br />
                        Not Harder
                    </h1>
                    <p className="home-hero-desc">
                        Import your AI-generated notes, swipe through topics, and master your material with interactive flashcards.
                    </p>
                    <button
                        id="new-deck-btn"
                        className="btn btn-primary btn-lg"
                        onClick={() => setShowImport(true)}
                    >
                        <span>+</span> New Deck
                    </button>
                </div>
                <div className="home-hero-visual" aria-hidden="true">
                    <div className="hero-card hero-card-1">
                        <div className="hero-card-icon">🧬</div>
                        <div className="hero-card-text">Cellular Biology</div>
                    </div>
                    <div className="hero-card hero-card-2">
                        <div className="hero-card-icon">🤖🫠</div>
                        <div className="hero-card-text">AI Perspectives</div>
                    </div>
                    <div className="hero-card hero-card-3">
                        <div className="hero-card-icon">⚖️</div>
                        <div className="hero-card-text">Business Law</div>
                    </div>
                </div>
            </div>

            {/* Decks Section */}
            <div className="home-decks-section">
                <div className="container">
                    <div className="home-decks-header">
                        <h2>Your Decks</h2>
                        {decks.length > 0 && (
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => setShowImport(true)}
                            >
                                + Add New
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="home-loading">
                            <div className="loading-spinner" />
                        </div>
                    ) : decks.length === 0 ? (
                        <div className="home-empty">
                            <div className="home-empty-icon">📦</div>
                            <h3>No decks yet</h3>
                            <p>Import your first AI-generated study deck to get started.</p>
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowImport(true)}
                            >
                                Import Your First Deck
                            </button>
                        </div>
                    ) : (
                        <div className="decks-grid">
                            {decks.map((deck, i) => (
                                <DeckCard
                                    key={deck.id}
                                    deck={deck}
                                    index={i}
                                    onStudy={() => navigate(`/swipe/${deck.id}`)}
                                    onDelete={(e) => handleDelete(e, deck.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showImport && (
                <ImportModal
                    onClose={() => setShowImport(false)}
                    onImported={handleImported}
                />
            )}
        </div>
    );
}

function DeckCard({ deck, index, onStudy, onDelete }) {
    const createdDate = new Date(deck.createdAt).toLocaleDateString('tr-TR', {
        day: 'numeric', month: 'long', year: 'numeric'
    });

    const colors = [
        'var(--clr-primary)',
        '#a855f7',
        '#22d3ee',
        '#4ade80',
        '#fbbf24',
        '#f87171',
    ];
    const accent = colors[index % colors.length];

    const bestScore = deck.bestScore;
    let scoreColor = 'var(--clr-text-muted)';
    if (bestScore >= 90) scoreColor = 'var(--clr-success)';
    else if (bestScore >= 70) scoreColor = 'var(--clr-primary)';
    else if (bestScore !== null) scoreColor = '#F59E0B';

    return (
        <div
            className="deck-card card animate-fade-in"
            style={{ '--accent': accent, animationDelay: `${index * 0.07}s` }}
            onClick={onStudy}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onStudy()}
            aria-label={`Study deck: ${deck.name}`}
        >
            <div className="deck-card-accent" />
            <div className="deck-card-body">
                <div className="deck-card-top">
                    <div className="deck-card-icon" style={{ background: `${accent}22`, color: accent }}>
                        📚
                    </div>
                    <button
                        className="deck-delete-btn"
                        onClick={onDelete}
                        aria-label="Delete deck"
                        title="Delete deck"
                    >
                        🗑️
                    </button>
                </div>
                <h3 className="deck-card-name">{deck.name}</h3>
                <div className="deck-card-meta">
                    <span className="badge badge-primary">{deck.topicCount} topics</span>
                    <span className="deck-card-date">{createdDate}</span>
                </div>
            </div>
            <div className="deck-card-footer">
                {bestScore !== null ? (
                    <span className="deck-best-score" style={{ color: scoreColor }}>
                        <strong>{bestScore}%</strong> Best Score
                    </span>
                ) : (
                    <span className="deck-best-score">Not studied yet</span>
                )}
                <span className="deck-study-hint">Tap to study →</span>
            </div>
        </div>
    );
}
