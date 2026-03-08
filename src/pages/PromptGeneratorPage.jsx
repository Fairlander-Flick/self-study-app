import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PromptGeneratorPage.css';

export default function PromptGeneratorPage() {
    const navigate = useNavigate();
    const [topic, setTopic] = useState('');
    const [qPerSource, setQPerSource] = useState('10');
    const [totalQ, setTotalQ] = useState('100');
    const [copied, setCopied] = useState(false);

    const isFormValid = topic.trim().length > 0 && qPerSource > 0 && totalQ > 0;

    const generatePrompt = () => {
        return `Analyze all sources in this NotebookLM project about "${topic.trim()}" and output a JSON flashcard deck.

RULES (follow strictly):
1. Output ONLY valid JSON. No markdown, no extra text.
2. Root is a JSON Array [ ... ].
3. Create AT LEAST ${qPerSource} topics per source/page, minimum ${totalQ} total flashcards. Break topics down granularly — do NOT summarize whole lectures into one topic.
4. Each topic object:
   "id": unique string | "topic": short title | "lecture_text": 3-4 paragraph Markdown study guide with bold, bullets, and emojis (🧠💡⚠️) sourced only from the documents | "summary_points": max 4 strings | "flashcards": array (min 5 per topic).
5. Every flashcard MUST be type "multiple_correct", 5 options (A–E), answer is ALWAYS an array of strings (even if only 1 correct), plus a 1-2 sentence "explanation" of why correct answers are right and distractors are wrong.
6. Questions must test conceptual understanding and critical thinking. NO rote memorization (no dates, names, trivial facts).
7. Match the output language to the source language.

JSON format:
[{"id":"1","topic":"...","lecture_text":"...","summary_points":["..."],"flashcards":[{"type":"multiple_correct","question":"...","options":["A)...","B)...","C)...","D)...","E)..."],"answer":["A)..."],"explanation":"..."}]}]`;
    };


    const handleCopy = async () => {
        if (!isFormValid) return;
        const prompt = generatePrompt();

        try {
            await navigator.clipboard.writeText(prompt);
            setCopied(true);
            setTimeout(() => setCopied(false), 10000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = prompt;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                setCopied(true);
                setTimeout(() => setCopied(false), 10000);
            } catch (err) {
                console.error('Fallback copy failed', err);
            }
            document.body.removeChild(textArea);
        }
    };

    return (
        <div className="prompt-page animate-fade-in">
            <div className="prompt-container">

                <button className="btn btn-ghost btn-sm prompt-back" onClick={() => navigate('/')}>
                    ← Back to Dashboard
                </button>

                <div className="prompt-header">
                    <div className="prompt-icon">✨</div>
                    <h1>Magic Prompt for NotebookLM</h1>
                    <p>
                        Just type the name of the lesson you are studying. We'll give you a magic prompt that tells NotebookLM to read all your selected sources and generate your flashcards.
                    </p>
                </div>

                <div className="prompt-form card">
                    <div className="form-group">
                        <label htmlFor="topic-input" style={{ marginBottom: '8px', display: 'block', fontWeight: '600' }}>What's the name of this lesson/topic?</label>
                        <input
                            id="topic-input"
                            className="input"
                            type="text"
                            placeholder="e.g. World War II, AI Perspectives, Cellular Biology..."
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            autoFocus
                            style={{ marginBottom: '16px' }}
                        />

                        <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <label htmlFor="q-per-source" style={{ marginBottom: '8px', display: 'block', fontWeight: '600', fontSize: '14px' }}>Topics to extract per slide/page</label>
                                <input
                                    id="q-per-source"
                                    className="input"
                                    type="number"
                                    min="1"
                                    value={qPerSource}
                                    onChange={(e) => setQPerSource(e.target.value)}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label htmlFor="total-q" style={{ marginBottom: '8px', display: 'block', fontWeight: '600', fontSize: '14px' }}>Minimum Total Flashcards</label>
                                <input
                                    id="total-q"
                                    className="input"
                                    type="number"
                                    min="10"
                                    value={totalQ}
                                    onChange={(e) => setTotalQ(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="prompt-actions">
                        <button
                            className={`btn btn-lg ${copied ? 'btn-success' : 'btn-primary'}`}
                            onClick={handleCopy}
                            disabled={!isFormValid}
                        >
                            {copied ? '✓ Copied to Clipboard!' : '📋 Copy Magic Prompt'}
                        </button>
                    </div>

                    {copied && (
                        <div className="prompt-success-msg animate-fade-in">
                            <p><strong>Awesome! Now what?</strong></p>
                            <ol>
                                <li>Open your project in <a href="https://notebooklm.google.com" target="_blank" rel="noreferrer">NotebookLM</a></li>
                                <li>Make sure your sources for this lesson are selected</li>
                                <li>Paste this prompt into the bottom chat box and hit enter</li>
                                <li>Copy the JSON that NotebookLM prints out</li>
                                <li>Come back here and paste the JSON into the <strong>+ New Deck</strong> modal</li>
                            </ol>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
