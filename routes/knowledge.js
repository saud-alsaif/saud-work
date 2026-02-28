const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET /api/knowledge?type=quote|book|note
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const { rows } = type
      ? await db.query('SELECT * FROM knowledge_items WHERE type = $1 ORDER BY created_at DESC', [type])
      : await db.query('SELECT * FROM knowledge_items ORDER BY type ASC, created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/knowledge
router.post('/', async (req, res) => {
  const {
    type,
    quote_text, quote_author,
    book_title, book_author, book_status,
    note_title, note_content,
  } = req.body;
  try {
    const { rows } = await db.query(
      `INSERT INTO knowledge_items
         (type, quote_text, quote_author, book_title, book_author, book_status, note_title, note_content)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        type,
        quote_text || null, quote_author || null,
        book_title || null, book_author || null, book_status || null,
        note_title || null, note_content || null,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/knowledge/:id
router.put('/:id', async (req, res) => {
  const {
    type,
    quote_text, quote_author,
    book_title, book_author, book_status,
    note_title, note_content,
  } = req.body;
  try {
    const { rows } = await db.query(
      `UPDATE knowledge_items
       SET type         = $1,
           quote_text   = $2, quote_author = $3,
           book_title   = $4, book_author  = $5, book_status = $6,
           note_title   = $7, note_content = $8
       WHERE id = $9 RETURNING *`,
      [
        type,
        quote_text || null, quote_author || null,
        book_title || null, book_author || null, book_status || null,
        note_title || null, note_content || null,
        req.params.id,
      ]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/knowledge/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM knowledge_items WHERE id = $1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
