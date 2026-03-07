import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDeck, getSessionsForDeck } from '../services/db.js';
import './ResultsPage.css';

export default function ResultsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [deck, setDeck] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadResults = async () => {
            const d = await getDeck(id);
            if (!d) { navigate('/'); return; }
            setDeck(d);

            const sessionId = sessionStorage.getItem(`last_session_${id}`);
            if (!sessionId) {
                navigate('/');
                return;
            }

            // Fetch all sessions to find this one
            const sessions = await getSessionsForDeck(id);
            const currentSession = sessions.find(s => s.id === sessionId);

            if (!currentSession) {
                navigate('/');
                return;
            }

            setSession(currentSession);
            setLoading(false);
        };

        loadResults();
    }, [id, navigate]);

    if (loading) return <div className="page-center"><div className="loading-spinner" /></div>;

    const { score, totalCards, masteredTopics, reviewTopics } = session;

    let feedbackMsg = "Good effort!";
    let scoreClass = "score-average";

    if (score >= 90) {
        feedbackMsg = "Outstanding! 🏆";
        scoreClass = "score-perfect";
    } else if (score >= 70) {
        feedbackMsg = "Great job! 🔥";
        scoreClass = "score-good";
    } else if (score < 40) {
        feedbackMsg = "Keep practicing! 💪";
        scoreClass = "score-low";
    }

    return (
        <div className="results-page animate-fade-in">
            <div className="results-header">
                <h1>Session Complete</h1>
                <p className="results-subtitle">Deck: {deck.name}</p>
            </div>

            <div className="score-hero">
                <div className={`score-circle ${scoreClass}`}>
                    <div className="score-value">{score}%</div>
                    <div className="score-label">Accuracy</div>
                </div>
                <h2 className="score-feedback">{feedbackMsg}</h2>
                <p className="score-details">{totalCards} cards reviewed</p>
            </div>

            <div className="results-summary">
                {masteredTopics.length > 0 && (
                    <div className="results-card mastered">
                        <h3>✓ Mastered Topics</h3>
                        <ul>
                            {masteredTopics.map((t, i) => (
                                <li key={i}>{t}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {reviewTopics.length > 0 && (
                    <div className="results-card review">
                        <h3>🔁 Needs Review</h3>
                        <ul>
                            {reviewTopics.map((t, i) => (
                                <li key={i}>{t}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

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
