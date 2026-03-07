import { useState } from 'react';
import { saveDeck } from '../services/db.js';
import './ImportModal.css';

const SAMPLE_JSON = `[
  {
    "id": "1",
    "topic": "Hücrenin Yapısı",
    "summary_points": [
      "Hücre zarı seçici geçirgendir",
      "Mitokondri ATP üretir (enerji merkezi)",
      "Çekirdek DNA'yı barındırır"
    ],
    "flashcards": [
      {
        "question": "Hücre zarının temel özelliği nedir?",
        "answer": "Seçici geçirgendir — sadece belirli maddelerin geçişine izin verir."
      },
      {
        "question": "Mitokondri ne iş yapar?",
        "answer": "Hücrenin enerji santralidir. Glikozdan ATP sentezler."
      }
    ]
  }
]`;

export default function ImportModal({ onClose, onImported }) {
    const [deckName, setDeckName] = useState('');
    const [jsonText, setJsonText] = useState('');
    const [error, setError] = useState('');
    const [isValid, setIsValid] = useState(null);
    const [saving, setSaving] = useState(false);

    const validateJSON = (text) => {
        if (!text.trim()) {
            setIsValid(null);
            setError('');
            return;
        }
        try {
            const parsed = JSON.parse(text);
            if (!Array.isArray(parsed)) {
                setIsValid(false);
                setError('JSON must be an array: [ ... ]');
                return;
            }
            if (parsed.length === 0) {
                setIsValid(false);
                setError('JSON array cannot be empty.');
                return;
            }
            const missing = parsed.findIndex(
                t => !t.topic || !Array.isArray(t.summary_points) || !Array.isArray(t.flashcards)
            );
            if (missing !== -1) {
                setIsValid(false);
                setError(`Topic ${missing + 1} is missing fields. Each topic must include "topic", "summary_points" and "flashcards".`);
                return;
            }
            setIsValid(true);
            setError('');
        } catch {
            setIsValid(false);
            setError('Invalid JSON format. Check syntax.');
        }
    };

    const handleJSONChange = (e) => {
        setJsonText(e.target.value);
        validateJSON(e.target.value);
    };

    const handleLoadSample = () => {
        setJsonText(SAMPLE_JSON);
        validateJSON(SAMPLE_JSON);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!deckName.trim()) {
            setError('Please enter a deck name.');
            return;
        }
        if (!isValid) {
            setError('Please paste a valid JSON first.');
            return;
        }
        setSaving(true);
        try {
            const topics = JSON.parse(jsonText);
            const id = await saveDeck(deckName.trim(), topics);
            onImported(id);
        } catch {
            setError('Error occurred while saving.');
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Import new deck">
            <div className="modal import-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="import-modal-header">
                    <div>
                        <h2 className="import-modal-title">Import New Deck</h2>
                        <p className="import-modal-subtitle">Paste your AI-generated JSON below</p>
                    </div>
                    <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close modal">✕</button>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    {/* Deck Name */}
                    <div className="import-field">
                        <label className="import-label" htmlFor="deck-name">Deck Name</label>
                        <input
                            id="deck-name"
                            type="text"
                            className="input"
                            placeholder="e.g. Biology Midterm, History Chapter 5..."
                            value={deckName}
                            onChange={e => setDeckName(e.target.value)}
                            maxLength={80}
                            autoComplete="off"
                            autoFocus
                        />
                    </div>

                    {/* JSON Paste Area */}
                    <div className="import-field">
                        <div className="import-label-row">
                            <label className="import-label" htmlFor="json-input">AI-Generated JSON</label>
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={handleLoadSample}
                            >
                                Load Sample
                            </button>
                        </div>
                        <div className={`json-textarea-wrapper ${isValid === true ? 'valid' : isValid === false ? 'invalid' : ''}`}>
                            <textarea
                                id="json-input"
                                className="input textarea json-textarea"
                                placeholder={'Paste your JSON here...\n[\n  {\n    "id": "1",\n    "topic": "Topic Name",\n    "summary_points": ["point 1", "point 2"],\n    "flashcards": [\n      { "question": "Q?", "answer": "A." }\n    ]\n  }\n]'}
                                value={jsonText}
                                onChange={handleJSONChange}
                                spellCheck={false}
                            />
                            {isValid !== null && (
                                <div className={`json-status-icon ${isValid ? 'valid' : 'invalid'}`}>
                                    {isValid ? '✓' : '✗'}
                                </div>
                            )}
                        </div>

                        {/* Validation feedback */}
                        {error && <p className="import-error">{error}</p>}
                        {isValid && !error && (
                            <p className="import-success">
                                ✓ JSON is valid! {JSON.parse(jsonText).length} topics found.
                            </p>
                        )}
                    </div>

                    {/* Tips */}
                    <div className="import-tips">
                        <p>💡 <strong>How to use:</strong> Take your study notes → Use <a href="/prompt" onClick={onClose}>Magic Prompt</a> → Paste into Gemini/ChatGPT → Paste the output here.</p>
                    </div>

                    {/* Actions */}
                    <div className="import-actions">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            id="import-submit-btn"
                            className="btn btn-primary"
                            disabled={!isValid || !deckName.trim() || saving}
                        >
                            {saving ? 'Saving...' : '🚀 Import & Swipe'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
