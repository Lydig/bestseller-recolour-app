require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const { init } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/static', express.static(path.join(__dirname, '..', 'public')));

app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/kpis', require('./routes/kpis'));
app.use('/api/partners', require('./routes/partners'));
app.use('/api/parse', require('./routes/parse'));

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = process.env.PORT || 3000;
init().then(() => app.listen(port, () => console.log(`API listening on http://localhost:${port}`)));
