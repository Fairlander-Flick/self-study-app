import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDeck } from '../services/db.js';
import './StudyGuidePage.css';

export default function StudyGuidePage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [deck, setDeck] = useState(null);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const deckData = await getDeck(Number(id));
                if (!deckData) {
                    setError('Deck not found');
                    return;
                }
                setDeck(deckData);

                // Get selected topic IDs from session storage
                const stored = sessionStorage.getItem(`study_topics_${id}`);
                const selectedIds = stored ? JSON.parse(stored) : null;

                let topicsToShow = deckData.topics;
                if (selectedIds && selectedIds.length > 0) {
                    topicsToShow = deckData.topics.filter(t => selectedIds.includes(t.id));
                }

                setTopics(topicsToShow);
            } catch (err) {
                console.error(err);
                setError('Failed to load study guide');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    if (loading) return <div className="loading">Loading Study Guide...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!topics.length) return <div className="error-message">No topics selected for study.</div>;

    return (
        <div className="study-guide-page animate-fade-in">
            <header className="guide-header">
                <button className="btn btn-ghost btn-sm guide-back" onClick={() => navigate('/')}>
                    ← Back
                </button>
                <div className="guide-title-container">
                    <h1>{deck.name}</h1>
                    <p className="guide-subtitle">Study Guide</p>
                </div>
                <button
                    className="btn btn-primary btn-sm guide-action"
                    onClick={() => navigate(`/study/${id}`)}
                >
                    Test Yourself →
                </button>
            </header>

            <main className="guide-content">
                {topics.map((topic, index) => (
                    <article key={topic.id} className="guide-topic-section">
                        <h2 className="guide-topic-title">
                            <span className="guide-topic-number">{index + 1}.</span> {topic.topic}
                        </h2>

                        {topic.lecture_text ? (
                            <div className="guide-lecture-text">
                                {topic.lecture_text.split('\n').map((paragraph, i) => (
                                    paragraph.trim() ? <p key={i}>{paragraph}</p> : <br key={i} />
                                ))}
                            </div>
                        ) : (
                            <div className="guide-no-text">
                                <p>No detailed lecture text provided for this topic.</p>
                            </div>
                        )}

                        <div className="guide-summary-box">
                            <h3>Key Takeaways</h3>
                            <ul>
                                {topic.summary_points.map((point, i) => (
                                    <li key={i}>{point}</li>
                                ))}
                            </ul>
                        </div>
                    </article>
                ))}
            </main>

            <footer className="guide-footer">
                <p>Ready to test your knowledge?</p>
                <button
                    className="btn btn-primary btn-lg"
                    onClick={() => navigate(`/study/${id}`)}
                >
                    🚀 Start Flashcards
                </button>
            </footer>
        </div>
    );
}
