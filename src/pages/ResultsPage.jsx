import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDeck, getSessionsForDeck, getProfile, getLevelInfo } from '../services/db.js';
import './ResultsPage.css';

export default function ResultsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [deck, setDeck] = useState(null);
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [xpEarned, setXpEarned] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadResults = async () => {
            const d = await getDeck(id);
            if (!d) { navigate('/'); return; }
            setDeck(d);

            const sessionId = sessionStorage.getItem(`last_session_${id}`);
            if (!sessionId) { navigate('/'); return; }

            const sessions = await getSessionsForDeck(id);
            const currentSession = sessions.find(s => s.id === sessionId);
            if (!currentSession) { navigate('/'); return; }

            setSession(currentSession);

            const p = await getProfile();
            setProfile(p);

            // XP earned this session: correct * 10 + incorrect * 2
            const correct = currentSession.totalCards && currentSession.score
                ? Math.round((currentSession.score / 100) * currentSession.totalCards)
                : 0;
            const total = currentSession.totalCards || 0;
            setXpEarned(correct * 10 + (total - correct) * 2);

            setLoading(false);
        };

        loadResults();
    }, [id, navigate]);

    if (loading) return <div className="page-center"><div className="loading-spinner" /></div>;

    const { score, totalCards, masteredTopics, reviewTopics } = session;
    const levelInfo = profile ? getLevelInfo(profile.xp) : null;
    // Previous XP (before this session)
    const prevXp = profile ? profile.xp - xpEarned : 0;
    const prevLevel = getLevelInfo(Math.max(0, prevXp));

    let feedbackMsg = "Good effort!";
    let scoreClass = "score-average";

    if (score >= 90) { feedbackMsg = "Outstanding! 🏆"; scoreClass = "score-perfect"; }
    else if (score >= 70) { feedbackMsg = "Great job! 🔥"; scoreClass = "score-good"; }
    else if (score < 40) { feedbackMsg = "Keep practicing! 💪"; scoreClass = "score-low"; }

    // Build topic stats from session (we have mastered/review arrays)
    const allTopics = [
        ...(masteredTopics || []).map(t => ({ name: t, type: 'mastered' })),
        ...(reviewTopics || []).map(t => ({ name: t, type: 'review' })),
    ];

    return (
        <div className="results-page animate-fade-in">
            <div className="results-header">
                <h1>Session Complete</h1>
                <p className="results-subtitle">Deck: {deck.name}</p>
            </div>

            {/* Score hero */}
            <div className="score-hero">
                <div className={`score-circle ${scoreClass}`}>
                    <div className="score-value">{score}%</div>
                    <div className="score-label">Accuracy</div>
                </div>
                <h2 className="score-feedback">{feedbackMsg}</h2>
                <p className="score-details">{totalCards} questions reviewed</p>
            </div>

            {/* XP & Level bar */}
            {levelInfo && (
                <div className="xp-section">
                    <div className="xp-header">
                        <span className="xp-level-badge">⭐ Level {levelInfo.level}</span>
                        <span className="xp-earned">+{xpEarned} XP earned</span>
                        {levelInfo.level > prevLevel.level && (
                            <span className="xp-levelup">🎉 Level Up!</span>
                        )}
                    </div>
                    <div className="xp-bar-track">
                        <div
                            className="xp-bar-fill"
                            style={{ width: `${Math.min(levelInfo.progress * 100, 100)}%` }}
                        />
                    </div>
                    <div className="xp-bar-labels">
                        <span>{levelInfo.xpIntoCurrentLevel} XP</span>
                        <span>{levelInfo.xpForNextLevel} XP needed</span>
                    </div>
                </div>
            )}

            {/* Topic chips */}
            {allTopics.length > 0 && (
                <div className="topic-chips-section">
                    <h3>Topics Covered</h3>
                    <div className="topic-chips">
                        {allTopics.map((t, i) => (
                            <TopicChip key={i} topic={t} />
                        ))}
                    </div>
                </div>
            )}

            <div className="results-actions">
                <button className="btn btn-ghost" onClick={() => navigate(`/swipe/${id}`)}>
                    ↻ Study Different Topics
                </button>
                <button className="btn btn-primary" onClick={() => navigate('/')}>
                    🏠 Back to Dashboard
                </button>
            </div>
        </div>
    );
}

function TopicChip({ topic }) {
    const [showTooltip, setShowTooltip] = useState(false);
    const isMastered = topic.type === 'mastered';

    return (
        <div
            className={`topic-chip ${isMastered ? 'chip-mastered' : 'chip-review'}`}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <span className="chip-icon">{isMastered ? '✓' : '↻'}</span>
            <span className="chip-label">{topic.name}</span>

            {showTooltip && (
                <div className="chip-tooltip">
                    <strong>{topic.name}</strong>
                    <span>{isMastered ? '✅ Mastered this session' : '🔁 Needs more review'}</span>
                </div>
            )}
        </div>
    );
}
