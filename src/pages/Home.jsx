import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllDecks, deleteDeck, getBestScore, getProfile, getLevelInfo, getAllSessions } from '../services/db.js';
import ImportModal from '../components/ImportModal.jsx';
import { DeckCardSkeleton, StatsSkeleton } from '../components/Skeleton.jsx';
import './Home.css';

export default function Home() {
    const [decks, setDecks] = useState([]);
    const [showImport, setShowImport] = useState(false);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [globalStats, setGlobalStats] = useState(null);
    const navigate = useNavigate();

    const loadDecks = async () => {
        try {
            const all = await getAllDecks();
            const allWithScores = await Promise.all(
                all.reverse().map(async deck => {
                    const bestScore = await getBestScore(deck.id);
                    return { ...deck, bestScore };
                })
            );
            setDecks(allWithScores);

            // Load profile for XP/Level
            const p = await getProfile();
            setProfile(p);

            // Compute global stats across all sessions
            const sessions = await getAllSessions();
            if (sessions.length > 0) {
                const totalQuestions = sessions.reduce((acc, s) => acc + (s.totalCards || 0), 0);
                const totalCorrect = p.totalCorrect || 0;
                const avgScore = Math.round(
                    sessions.reduce((acc, s) => acc + (s.score || 0), 0) / sessions.length
                );
                setGlobalStats({ totalQuestions, totalCorrect, avgScore, sessionCount: sessions.length });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
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

    const levelInfo = profile ? getLevelInfo(profile.xp) : null;

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
                        Import your AI-generated notes, swipe through topics to filter what you want to learn, and master your material with interactive quizzes.
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

            {/* Level & XP Widget */}
            {!loading && levelInfo && profile.xp > 0 && (
                <div className="home-level-widget container">
                    <div className="level-widget-left">
                        <span className="level-star">⭐</span>
                        <div>
                            <div className="level-label">Level {levelInfo.level}</div>
                            <div className="level-sub">{profile.xp} total XP</div>
                        </div>
                    </div>
                    <div className="level-widget-right">
                        <div className="level-xp-text">
                            {levelInfo.xpIntoCurrentLevel} / {levelInfo.xpForNextLevel} XP to next level
                        </div>
                        <div className="level-bar-track">
                            <div
                                className="level-bar-fill"
                                style={{ width: `${Math.min(levelInfo.progress * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Global Stats */}
            {loading ? (
                <div className="container"><StatsSkeleton /></div>
            ) : globalStats ? (
                <div className="home-stats-bar container">
                    <div className="stat-card">
                        <div className="stat-icon">📚</div>
                        <div className="stat-value">{globalStats.totalQuestions}</div>
                        <div className="stat-label">Questions Answered</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-value">{globalStats.totalCorrect}</div>
                        <div className="stat-label">Correct Answers</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🎯</div>
                        <div className="stat-value">{globalStats.avgScore}%</div>
                        <div className="stat-label">Avg. Accuracy</div>
                    </div>
                </div>
            ) : null}

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
                        <div className="decks-grid">
                            {[1, 2, 3].map(i => <DeckCardSkeleton key={i} />)}
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
    const createdDate = new Date(deck.createdAt).toLocaleDateString('en-US', {
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
