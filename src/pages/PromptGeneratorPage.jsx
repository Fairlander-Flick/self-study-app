import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PromptGeneratorPage.css';

export default function PromptGeneratorPage() {
    const navigate = useNavigate();
    const [topic, setTopic] = useState('');
    const [notes, setNotes] = useState('');
    const [copied, setCopied] = useState(false);

    const isFormValid = topic.trim().length > 0 && notes.trim().length > 0;

    const generatePrompt = () => {
        return `I am studying "${topic.trim()}" and here are my raw notes/slides text:

"""
${notes.trim()}
"""

Please act as an expert tutor and instructional designer. Convert these notes into a JSON structure for a flashcard study web app.

Follow these strict rules for the JSON output:
1. Return ONLY valid JSON. No markdown formatting (\`\`\`json), no introductory text, no conversational filler.
2. The root must be a JSON Array [ ... ].
3. Group the information into logical "topics".
4. For each topic, provide:
   - "id": A unique string (e.g., "1", "2").
   - "topic": A short title for this group of information.
   - "summary_points": An array of strings. Maximum 4 bullet points summarizing the key takeaways for this topic.
   - "flashcards": An array of objects, containing "question" and "answer". Create 3-5 flashcards that test the user on the summary points.
5. Make questions thought-provoking but concise.
6. Make answers clear and easy to read quickly.
7. Output Language: Keep the language of the output the same as the notes provided above.

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
                    <h1>Magic Prompt Generator</h1>
                    <p>
                        Paste your messy notes, slides, or textbook text below. We'll generate the perfect prompt
                        for you to paste into ChatGPT, Gemini, or Claude.
                    </p>
                </div>

                <div className="prompt-form card">
                    <div className="form-group">
                        <label htmlFor="topic-input">What are you studying?</label>
                        <input
                            id="topic-input"
                            className="input"
                            type="text"
                            placeholder="e.g. World War II, React Hooks, Biology Chapter 4..."
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="notes-input">Paste your raw text/notes here:</label>
                        <textarea
                            id="notes-input"
                            className="input textarea-large"
                            placeholder="Copy and paste all the text from your slides or document here..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
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
                                <li>Open <a href="https://chatgpt.com" target="_blank" rel="noreferrer">ChatGPT</a> or <a href="https://gemini.google.com" target="_blank" rel="noreferrer">Gemini</a></li>
                                <li>Paste the copied text and hit enter</li>
                                <li>Copy the AI's JSON output</li>
                                <li>Come back here and paste the JSON into the <strong>+ New Deck</strong> modal</li>
                            </ol>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
