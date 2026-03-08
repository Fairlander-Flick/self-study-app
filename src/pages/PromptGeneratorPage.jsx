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
        return `I am studying "${topic.trim()}" and I need you to analyze all the attached sources in this NotebookLM project.

Please act as an expert tutor and instructional designer. Extract the key information from these sources and convert it into a JSON structure for a flashcard study web app.

Follow these strict rules for the JSON output:
1. Return ONLY valid JSON. No markdown formatting, no introductory text, no conversational filler.
2. The root must be a JSON Array [ ... ].
3. Group the information into logical "topics". CRITICAL VOLUME RULE: You MUST create AT LEAST ${qPerSource} granular topics PER LECTURE SOURCE/PAGE. The total output MUST reach a minimum of ${totalQ} total flashcards. Do not summarize entire lectures into one topic — break them down.
4. For each topic, provide:
   - "id": A unique string (e.g., "1", "2").
   - "topic": A short title for this group.
   - "lecture_text": A comprehensive 3-4 paragraph study guide. Use Markdown (**bold**, *italics*, bullet points) and relevant EMOJIS (🧠, 💡, ⚠️). Sourced ENTIRELY from the provided documents — do not invent facts.
   - "summary_points": Array of strings. Max 4 bullet points.
   - "flashcards": Array of objects. Min 5 per topic. EVERY flashcard MUST be type "multiple_correct". No basic short-answer questions.
      * Format: { "type": "multiple_correct", "question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."], "answer": ["A) ..."], "explanation": "..." }
      * "answer" MUST ALWAYS be an array of strings, even for a single correct answer (e.g., ["C) ..."]).
      * "explanation" MUST be 1-2 sentences explaining why correct answers are right and key distractors are wrong.
      * ALWAYS provide exactly 5 options (A, B, C, D, E).
5. QUESTION QUALITY RULE: ALL questions MUST test conceptual understanding and critical thinking. NEVER ask rote memorization questions (no specific dates, exact names, trivial facts).
6. Make answers clear and easy to read quickly.
7. Output Language: Match the language of the sources.

Example format (abbreviated):
[{"id":"1","topic":"Topic Title","lecture_text":"3-4 paragraphs with **bold** and 🧠 emojis...","summary_points":["Key point 1","Key point 2"],"flashcards":[{"type":"multiple_correct","question":"Which of the following best describes X?","options":["A) ...","B) ...","C) ...","D) ...","E) ..."],"answer":["B) ..."],"explanation":"B is correct because... A and C are wrong because..."}]}]`;
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
