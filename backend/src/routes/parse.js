const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');

const router = express.Router();

const PRIORITIES = ['Low', 'Normal', 'High', 'Urgent'];
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001';

const SYSTEM_PROMPT =
  "You are a data extraction assistant. Extract data from the recolour guideline text into a strictly valid JSON object with these exact keys: 'photo_id' (the main item number, usually 8 digits before the underscore, e.g., 15377489), 'style' (a concise string summarizing the requested pantone colors and AOP patterns), 'priority' (choose strictly from: Low, Normal, High, Urgent. If unspecified, use 'Normal'), and 'partner' (extract if explicitly mentioned, otherwise use 'Internal'). Return ONLY JSON, no markdown formatting.";

const MOCK = { photo_id: '12345678', style: 'Mock Style', priority: 'Normal', partner: 'Mock Partner' };

let client;

function parseModelJson(raw) {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  return JSON.parse(cleaned);
}

router.post('/', async (req, res) => {
  const { text } = req.body || {};
  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'text is required' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.json(MOCK);
  }

  try {
    client ||= new Anthropic();
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: text }],
    });
    const block = message.content.find((b) => b.type === 'text');
    const data = parseModelJson(block?.text ?? '');
    res.json({
      photo_id: String(data.photo_id ?? ''),
      style: String(data.style ?? ''),
      priority: PRIORITIES.includes(data.priority) ? data.priority : 'Normal',
      partner: data.partner ? String(data.partner) : 'Internal',
    });
  } catch (err) {
    console.error('Parse failed:', err.message);
    res.status(502).json({ error: 'Failed to parse guideline' });
  }
});

module.exports = router;
