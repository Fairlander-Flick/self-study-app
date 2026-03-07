import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDeck, saveSession } from '../services/db.js';
import FlashCard from '../components/FlashCard.jsx';
import './StudyPage.css';

export default function StudyPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [deck, setDeck] = useState(null);
    const [queue, setQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [sessionStats, setSessionStats] = useState({
        correct: 0,
        totalAnswered: 0,
        startTime: Date.now(),
        masteredTopics: new Set(),
        reviewTopics: new Set()
    });

    useEffect(() => {
        getDeck(id).then(d => {
            if (!d) { navigate('/'); return; }
            setDeck(d);

            // Load liked topics from sessionStorage
            const likedJson = sessionStorage.getItem(`swipe_liked_${id}`);
            const liked = likedJson ? JSON.parse(likedJson) : [];

            if (liked.length === 0) {
                // Fallback: load all flashcards or redirect
                navigate(`/swipe/${id}`);
                return;
            }

            // Build flashcard queue
            let cards = [];
            liked.forEach(topic => {
                topic.flashcards.forEach(card => {
                    cards.push({ ...card, topicId: topic.id, topicName: topic.topic });
                });
            });

            // Shuffle cards
            cards = cards.sort(() => Math.random() - 0.5);

            setQueue(cards);
            setLoading(false);
        });
    }, [id, navigate]);

    const finishSession = async (stats) => {
        // If a topic is in review, remove from mastered
        for (const topic of stats.reviewTopics) {
            stats.masteredTopics.delete(topic);
        }

        const score = Math.round((stats.correct / stats.totalAnswered) * 100) || 0;
        const durationMs = Date.now() - stats.startTime;

        const sessionId = await saveSession(id, {
            score,
            totalCards: stats.totalAnswered, // Total attempts
            masteredTopics: Array.from(stats.masteredTopics),
            reviewTopics: Array.from(stats.reviewTopics),
            durationMs
        });

        // Save current session ID temporarily to sessionStorage for the Results page
        sessionStorage.setItem(`last_session_${id}`, sessionId);
        navigate(`/results/${id}`);
    };

    const handleAnswer = async (knewIt) => {
        const currentCard = queue[currentIndex];
        const newStats = { ...sessionStats };
        newStats.totalAnswered += 1;

        if (knewIt) {
            newStats.correct += 1;
            newStats.masteredTopics.add(currentCard.topicName);
        } else {
            newStats.reviewTopics.add(currentCard.topicName);
            // Re-queue the card at the end
            setQueue(prev => [...prev, currentCard]);
        }

        setSessionStats(newStats);

        const nextIndex = currentIndex + 1;
        if (nextIndex >= queue.length + (knewIt ? 0 : 1)) {
            // Finish session
            finishSession(newStats);
        } else {
            setCurrentIndex(nextIndex);
        }
    };

    if (loading) return <div className="page-center"><div className="loading-spinner" /></div>;

    const currentCard = queue[currentIndex];
    if (!currentCard) {
        finishSession(sessionStats);
        return null;
    }

    const progress = currentIndex / queue.length;

    return (
        <div className="study-page animate-fade-in">
            <div className="study-topbar">
                <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/swipe/${id}`)}>
                    ← Quit
                </button>
                <div className="study-progress-container">
                    <div className="progress-bar">
                        <div className="progress-bar-fill" style={{ width: `${progress * 100}%` }} />
                    </div>
                    <div className="study-progress-text">
                        {currentIndex + 1} / {queue.length} left
                    </div>
                </div>
            </div>

            <div className="study-arena">
                <FlashCard
                    key={currentIndex}
                    card={currentCard}
                    onAnswer={handleAnswer}
                />
            </div>
        </div>
    );
}
