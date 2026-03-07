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
3. Group the information into logical "topics" based on the sources.
4. For each topic, provide:
   - "id": A unique string (e.g., "1", "2").
   - "topic": A short title for this group of information.
   - "summary_points": An array of strings. Maximum 4 bullet points summarizing the key takeaways for this topic.
   - "flashcards": An array of objects, containing "question" and "answer". Create 3-5 flashcards that test the user on the summary points.
5. Make questions thought-provoking but concise.
6. Make answers clear and easy to read quickly.
7. Output Language: Keep the language of the output the same as the sources.

Example expected format:
[
  {
    "id": "1",
    "topic": "Photosynthesis Basics",
    "summary_points": [
      "Plants use sunlight to make food.",
      "Requires water and carbon dioxide."
    ],
    "flashcards": [
      {
        "question": "What are the two main inputs for photosynthesis?",
        "answer": "Water and carbon dioxide."
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
            setTimeout(() => setCopied(false), 2000);
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
                setTimeout(() => setCopied(false), 2000);
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
