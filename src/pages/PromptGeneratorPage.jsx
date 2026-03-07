import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PromptGeneratorPage.css';

export default function PromptGeneratorPage() {
    const navigate = useNavigate();
    const [topic, setTopic] = useState('');
    const [copied, setCopied] = useState(false);

    const isFormValid = topic.trim().length > 0;

    const generatePrompt = () => {
        return `I am studying "${topic.trim()}" and I need you to analyze all the attached sources in this NotebookLM project.

Please act as an expert tutor and instructional designer. Extract the key information from these sources and convert it into a JSON structure for a flashcard study web app.

Follow these strict rules for the JSON output:
1. Return ONLY valid JSON. No markdown formatting (\`\`\`json), no introductory text, no conversational filler.
2. The root must be a JSON Array [ ... ].
3. Group the information into logical "topics" based on the sources. CRITICAL: Be extremely thorough. Create a high volume of topics to ensure no key information is left out.
4. For each topic, provide:
   - "id": A unique string (e.g., "1", "2").
   - "topic": A short title for this group of information.
   - "lecture_text": A comprehensive, well-written, 2-3 paragraph study guide explaining the topic context fully (Markdown supported). CRITICAL: This text MUST be sourced ENTIRELY from the provided NotebookLM documents, do not invent external facts.
   - "summary_points": An array of strings. Maximum 4 bullet points.
   - "flashcards": An array of objects. Mix 3 types of flashcards. CRITICAL: Provide AT LEAST 5 flashcards per topic (ideally 5-8) to ensure full coverage:
      * Type 1 (Basic/Standard): { "type": "basic", "question": "...", "answer": "..." }
      * Type 2 (Multiple Choice - 1 correct): { "type": "multiple_choice", "question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."], "answer": "C) ..." } 
      * Type 3 (Multiple Correct / Choose all that apply): { "type": "multiple_correct", "question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."], "answer": ["A) ...", "C) ..."] }
      MAKE SURE multiple choice and multiple correct questions ALWAYS have exactly 5 options (A, B, C, D, E).
5. Make questions thought-provoking but concise.
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
    "flashcards": [
      {
        "type": "basic",
        "question": "What are the two main inputs for photosynthesis?",
        "answer": "Water and carbon dioxide."
      },
      {
        "type": "multiple_choice",
        "question": "Which organelle is responsible for photosynthesis?",
        "options": ["A) Nucleus", "B) Ribosome", "C) Chloroplast", "D) Mitochondria", "E) Endoplasmic Reticulum"],
        "answer": "C) Chloroplast"
      },
      {
        "type": "multiple_correct",
        "question": "Which of the following are REQUIRED for photosynthesis to occur? (Choose all that apply)",
        "options": ["A) Sunlight", "B) Oxygen", "C) Water", "D) Glucose", "E) Carbon Dioxide"],
        "answer": ["A) Sunlight", "C) Water", "E) Carbon Dioxide"]
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
                        <label htmlFor="topic-input">What's the name of this lesson/topic?</label>
                        <input
                            id="topic-input"
                            className="input"
                            type="text"
                            placeholder="e.g. World War II, AI Perspectives, Cellular Biology..."
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            autoFocus
                        />
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
