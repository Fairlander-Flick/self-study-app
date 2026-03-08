import { openDB } from 'idb';

const DB_NAME = 'self-study-app';
const DB_VERSION = 2;

// Initialize the database
const getDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // Decks store: holds all imported decks
      if (!db.objectStoreNames.contains('decks')) {
        const deckStore = db.createObjectStore('decks', { keyPath: 'id' });
        deckStore.createIndex('createdAt', 'createdAt');
      }

      // Sessions store: holds past study session results
      if (!db.objectStoreNames.contains('sessions')) {
        const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
        sessionStore.createIndex('deckId', 'deckId');
        sessionStore.createIndex('createdAt', 'createdAt');
      }

      // Profile store: global user XP, level, and stats (v2)
      if (oldVersion < 2 && !db.objectStoreNames.contains('profile')) {
        db.createObjectStore('profile', { keyPath: 'id' });
      }
    },
  });
};

// ─── XP & Level Helpers ───────────────────────────────────

/** XP required for each level: Level 1 = 10, Level N = Level(N-1) * 1.2 */
export const getLevelInfo = (totalXp) => {
  let level = 1;
  let xpForCurrentLevel = 0;
  let xpForNextLevel = 10;

  while (totalXp >= xpForCurrentLevel + xpForNextLevel) {
    xpForCurrentLevel += xpForNextLevel;
    level++;
    xpForNextLevel = Math.round(xpForNextLevel * 1.2);
  }

  const xpIntoCurrentLevel = totalXp - xpForCurrentLevel;
  const progress = xpForNextLevel > 0 ? xpIntoCurrentLevel / xpForNextLevel : 0;

  return { level, xpIntoCurrentLevel, xpForNextLevel, progress };
};

// ─── Deck Operations ──────────────────────────────────────

/**
 * Save a new deck to IndexedDB
 * @param {string} name - Deck display name
 * @param {Array} topics - Parsed topics array from JSON
 * @returns {string} The generated deck id
 */
export const saveDeck = async (name, topics) => {
  const db = await getDB();
  const id = `deck_${Date.now()}`;
  const deck = {
    id,
    name,
    topics,
    createdAt: new Date().toISOString(),
    topicCount: topics.length,
  };
  await db.put('decks', deck);
  return id;
};

/**
 * Get all decks
 * @returns {Array} Array of deck objects
 */
export const getAllDecks = async () => {
  const db = await getDB();
  return db.getAllFromIndex('decks', 'createdAt');
};

/**
 * Get a single deck by id
 * @param {string} id
 * @returns {Object} Deck object
 */
export const getDeck = async (id) => {
  const db = await getDB();
  return db.get('decks', id);
};

/**
 * Update an existing deck
 * @param {Object} deck - Complete updated deck object
 */
export const updateDeck = async (deck) => {
  const db = await getDB();
  await db.put('decks', deck);
};

/**
 * Delete a deck and its sessions
 * @param {string} id
 */
export const deleteDeck = async (id) => {
  const db = await getDB();
  await db.delete('decks', id);
  // Also delete associated sessions
  const sessions = await db.getAllFromIndex('sessions', 'deckId');
  const deckSessions = sessions.filter(s => s.deckId === id);
  for (const session of deckSessions) {
    await db.delete('sessions', session.id);
  }
};

// ─── Session Operations ───────────────────────────────────

/**
 * Save a completed study session
 * @param {string} deckId
 * @param {Object} results - { score, totalCards, masteredTopics, reviewTopics, durationMs }
 * @returns {string} sessionId
 */
export const saveSession = async (deckId, results) => {
  const db = await getDB();
  const id = `session_${Date.now()}`;
  const session = {
    id,
    deckId,
    ...results,
    createdAt: new Date().toISOString(),
  };
  await db.put('sessions', session);
  return id;
};

/**
 * Get all sessions for a deck
 * @param {string} deckId
 * @returns {Array}
 */
export const getSessionsForDeck = async (deckId) => {
  const db = await getDB();
  const all = await db.getAllFromIndex('sessions', 'deckId');
  return all
    .filter(s => s.deckId === deckId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

/**
 * Get the best session score for a deck
 * @param {string} deckId
 * @returns {number|null}
 */
export const getBestScore = async (deckId) => {
  const sessions = await getSessionsForDeck(deckId);
  if (!sessions.length) return null;
  return Math.max(...sessions.map(s => s.score));
};

// ─── Profile / XP Operations ──────────────────────────────

const PROFILE_ID = 'user_profile';

export const getProfile = async () => {
  const db = await getDB();
  const profile = await db.get('profile', PROFILE_ID);
  return profile || { id: PROFILE_ID, xp: 0, totalQuestions: 0, totalCorrect: 0 };
};

/**
 * Award XP after a session. +10 per correct, +2 per incorrect (encouragement).
 */
export const addXP = async (correct, total) => {
  const db = await getDB();
  const profile = await getProfile();
  const earned = correct * 10 + (total - correct) * 2;
  const updated = {
    ...profile,
    xp: profile.xp + earned,
    totalQuestions: profile.totalQuestions + total,
    totalCorrect: profile.totalCorrect + correct,
  };
  await db.put('profile', updated);
  return updated;
};

/**
 * Get all sessions across all decks (for global stats)
 */
export const getAllSessions = async () => {
  const db = await getDB();
  return db.getAll('sessions');
};
