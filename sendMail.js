require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

app.post('/api/send-mail', async (req, res) => {
    const { html, subject, to, from } = req.body;
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Missing RESEND_API_KEY' });
    }
    try {
        const result = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from,
                to,
                subject,
                html
            })
        });
        const data = await result.json();
        if (!result.ok) {
            return res.status(result.status).json({ error: data });
        }
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Mail backend running on port ${PORT}`);
});
