const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api', (req, res) => {
    res.json({ message: 'API Dex fonctionnelle' });
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`API démarrée sur http://localhost:${PORT}`);
});