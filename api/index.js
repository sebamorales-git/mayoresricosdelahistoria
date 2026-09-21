export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usá POST.' });
  }
  try {
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Falta el prompt.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Falta GEMINI_API_KEY en las Environment Variables de Vercel.' });
    }

    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      const msg = data?.error?.message || 'Error en la API de Gemini.';
      return res.status(geminiRes.status).json({ error: msg });
    }

    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('').trim();

    if (!text) {
      return res.status(500).json({ error: 'Gemini no devolvió texto.' });
    }

    return res.status(200).json({ response: text });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Error interno.' });
  }
}
