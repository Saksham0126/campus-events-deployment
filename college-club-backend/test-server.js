const express = require('express');
const app = express();
const PORT = 3000;

app.use(cors());

app.get('/test', (req, res) => {
    res.json({ message: 'Test server is working!' });
});

app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
});
