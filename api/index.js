export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usá POST.' });
  }
  try {
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Falta el prompt.' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Falta GROQ_API_KEY en las Environment Variables de Vercel (creala en https://console.groq.com/keys).' });
    }

    const model = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    const data = await groqRes.json();

    if (!groqRes.ok) {
      const msg = data?.error?.message || 'Error en la API de Groq.';
      return res.status(groqRes.status).json({ error: msg });
    }

    const text = data?.choices?.[0]?.message?.content?.trim();

    if (!text) {
      return res.status(500).json({ error: 'Groq no devolvió texto.' });
    }

    return res.status(200).json({ response: text });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Error interno.' });
  }
}
