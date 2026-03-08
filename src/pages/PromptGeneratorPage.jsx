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
1. Return ONLY valid JSON. No markdown formatting (\`\`\`json), no introductory text, no conversational filler.
2. The root must be a JSON Array [ ... ].
3. Group the information into logical "topics". CRITICAL VOLUME RULE: Because there are many pages/slides of sources, you MUST create AT LEAST ${qPerSource} granular topics PER LECTURE SOURCE/PAGE. The total output MUST reach an absolute minimum of ${totalQ} total flashcards across all topics to ensure absolute granular mastery. Whichever number is higher (topics per page vs total flashcards), fulfill that! Do not summarize entire lectures into one topic! Break them down.
4. For each topic, provide:
   - "id": A unique string (e.g., "1", "2").
   - "topic": A short title for this group of information.
   - "lecture_text": A comprehensive, well-structured, 3-4 paragraph study guide. CRITICAL: Use Markdown (e.g., **bold**, *italics*, bullet points) and liberally use relevant EMOJIS (🧠, 💡, ⚠️, etc.) to make it highly engaging and visually broken down. This text MUST be sourced ENTIRELY from the provided NotebookLM documents, do not invent external facts.
   - "summary_points": An array of strings. Maximum 4 bullet points.
   - "flashcards": An array of objects. CRITICAL: Provide AT LEAST 5 flashcards per topic (ideally 5-10) to help reach the minimum total of ${totalQ} flashcards. EVERY single flashcard MUST be of type "multiple_correct". DO NOT create basic short answer questions.
      * Format: { "type": "multiple_correct", "question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."], "answer": ["A) ...", "C) ..."], "explanation": "..." }
      * CRITICAL REQUIREMENT: The "answer" field MUST ALWAYS BE AN ARRAY OF STRINGS. Even if there is only ONE correct answer to the question conceptually, format the answer as a single-element array (e.g., ["C) ..."]).
      * CRITICAL REQUIREMENT: The "explanation" field MUST be a 1-2 sentence string explaining exactly why the correct answer(s) are correct, and why key distractors are incorrect.
      MAKE SURE questions ALWAYS have exactly 5 options (A, B, C, D, E).
5. QUESTION QUALITY RULE (CRITICAL): ALL questions MUST test conceptual understanding, main ideas, and critical thinking. NEVER ask rote memorization questions (like asking for specific dates, exact names, or trivial facts). Focus entirely on "genel bilgi ve fikri anlama" (general knowledge and comprehension).
6. Make answers clear and easy to read quickly.
7. Output Language: Keep the language of the output the same as the sources.

Example expected format:
[
  {
    "id": "1",
    "topic": "Photosynthesis Basics",
    "lecture_text": "Photosynthesis is the fundamental process by which plants, algae, and some bacteria capture sunlight to create their own food. It takes place primarily in the chloroplasts, where light energy is used to convert water and carbon dioxide into oxygen and energy-rich organic compounds like glucose. This process is the foundation of most life on Earth, as it provides the primary source of organic matter.",
    "summary_points": [
      "Plants use sunlight to make food."
    ],
      {
        "type": "multiple_correct",
        "question": "Which organelle is responsible for photosynthesis?",
        "options": ["A) Nucleus", "B) Ribosome", "C) Chloroplast", "D) Mitochondria", "E) Endoplasmic Reticulum"],
        "answer": ["C) Chloroplast"],
        "explanation": "Chloroplasts contain chlorophyll, which captures sunlight to drive photosynthesis. The other organellas serve different functions, such as the Mitochondria handling cellular respiration."
      },
      {
        "type": "multiple_correct",
        "question": "Which of the following are REQUIRED for photosynthesis to occur? (Choose all that apply)",
        "options": ["A) Sunlight", "B) Oxygen", "C) Water", "D) Glucose", "E) Carbon Dioxide"],
        "answer": ["A) Sunlight", "C) Water", "E) Carbon Dioxide"],
        "explanation": "Photosynthesis uses Sunlight to convert Water and Carbon Dioxide into energy. Oxygen and Glucose are the outputs, not the required inputs."
      }
    ]
  }
]`;
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
