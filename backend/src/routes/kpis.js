const express = require('express');
const { get } = require('../db');

const router = express.Router();

// "Awaiting approval" = partner has finished (Completed) but a manager has not yet approved.
router.get('/', async (req, res, next) => {
  try {
    const row = await get(`SELECT
      COALESCE(SUM(status = 'Pending'), 0) AS pending,
      COALESCE(SUM(status = 'Completed'), 0) AS awaitingApproval
      FROM Tickets`);
    res.json(row);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
