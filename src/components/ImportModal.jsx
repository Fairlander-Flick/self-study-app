import { useState } from 'react';
import { saveDeck } from '../services/db.js';
import './ImportModal.css';

const SAMPLE_JSON = `[
  {
    "id": "1",
    "topic": "Cell Biology Basics",
    "lecture_text": "Cell biology is the study of cells, their physiology, structure, and life cycle. The cell is the basic structural, functional, and biological unit of all known organisms. A cell is the smallest unit of life. Key components include the **cell membrane**, which is selectively permeable meaning it controls what enters and exits the cell. Inside the cell, the **nucleus** contains the genetic material (DNA) and coordinates cell activities. The **mitochondria** are often referred to as the powerhouse of the cell because they generate most of the cell's supply of ATP, used as a source of chemical energy.",
    "summary_points": [
      "Cell membrane is selectively permeable",
      "Mitochondria produces ATP (energy)",
      "Nucleus contains DNA"
    ],
    "flashcards": [
      {
        "type": "basic",
        "question": "What is the primary function of the cell membrane?",
        "answer": "It is selectively permeable—it controls what enters and exits the cell."
      },
      {
        "type": "multiple_choice",
        "question": "Which organelle acts as the powerhouse of the cell?",
        "options": [
          "A) Nucleus",
          "B) Ribosome",
          "C) Mitochondria",
          "D) Golgi Apparatus",
          "E) Endoplasmic Reticulum"
        ],
        "answer": "C) Mitochondria"
      },
      {
        "type": "multiple_correct",
        "question": "Which of the following are true about eukaryotic cells? (Choose all that apply)",
        "options": [
          "A) They have a nucleus",
          "B) They are always single-celled",
          "C) They contain membrane-bound organelles",
          "D) They do not have DNA",
          "E) Their DNA is linear"
        ],
        "answer": [
          "A) They have a nucleus",
          "C) They contain membrane-bound organelles",
          "E) Their DNA is linear"
        ]
      }
    ]
  },
  {
    "id": "2",
    "topic": "Photosynthesis",
    "lecture_text": "Photosynthesis is a process used by plants and other organisms to convert light energy into chemical energy that, through cellular respiration, can later be released to fuel the organism's activities. This chemical energy is stored in carbohydrate molecules, such as glucose, which are synthesized from **carbon dioxide** and **water** – hence the name photosynthesis. Oxygen is also released as a waste product. **Sunlight** provides the initial energy input required for this transformation.",
    "summary_points": [
      "Process by which plants make food",
      "Requires sunlight, CO2, and water",
      "Produces glucose and oxygen"
    ],
    "flashcards": [
      {
        "type": "multiple_correct",
        "question": "What are the required inputs for photosynthesis? (Choose all that apply)",
        "options": [
          "A) Oxygen",
          "B) Carbon Dioxide",
          "C) Water",
          "D) Glucose",
          "E) Sunlight"
        ],
        "answer": [
          "B) Carbon Dioxide",
          "C) Water",
          "E) Sunlight"
        ]
      },
      {
        "type": "basic",
        "question": "What are the primary outputs of photosynthesis?",
        "answer": "Glucose (sugar) for energy and oxygen (O2) as a byproduct."
      }
    ]
  },
  {
    "id": "3",
    "topic": "Evolution Theory",
    "lecture_text": "Evolution is change in the heritable characteristics of biological populations over successive generations. These characteristics are the expressions of genes that are passed on from parent to offspring during reproduction. Charles Darwin's theory of **natural selection** explains that organisms more suited to their environment are more likely to survive and pass on the genes that aided their success. This process causes species to change and diverge over time.",
    "summary_points": [
      "Proposed by Charles Darwin",
      "Natural selection is the driving mechanism",
      "Organisms adapt to their environments over time"
    ],
    "flashcards": [
      {
        "type": "basic",
        "question": "Who is primarily credited with the theory of evolution by natural selection?",
        "answer": "Charles Darwin, largely based on his observations in the Galapagos Islands."
      },
      {
        "type": "basic",
        "question": "Briefly define 'Natural Selection'.",
        "answer": "The process where organisms better adapted to their environment tend to survive and produce more offspring."
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
        t => !t.topic || !t.lecture_text || !Array.isArray(t.summary_points) || !Array.isArray(t.flashcards)
      );
      if (missing !== -1) {
        setIsValid(false);
        setError(`Topic ${missing + 1} is missing fields. Each topic must include "topic", "lecture_text", "summary_points", and "flashcards".`);
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
                placeholder={'Paste your JSON here...\n[\n  {\n    "id": "3",\n    "topic": "Evolution Theory",\n    "lecture_text": "Evolution is change in the heritable characteristics of biological populations over successive generations. These characteristics are the expressions of genes that are passed on from parent to offspring during reproduction. Charles Darwin\'s theory of **natural selection** explains that organisms more suited to their environment are more likely to survive and pass on the genes that aided their success. This process causes species to change and diverge over time.",\n    "summary_points": [\n      "Proposed by Charles Darwin", "Organisms adapt to environment"\n    ],\n    "flashcards": [\n      { "question": "Q?", "answer": "A." }\n    ]\n  }\n]'}
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
