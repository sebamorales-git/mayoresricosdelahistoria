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
        // gpt-oss "piensa" antes de responder y esos tokens TAMBIÉN cuentan
        // dentro de max_completion_tokens. Con esfuerzo bajo + límite amplio
        // le queda margen para la respuesta (que igual está acotada a 70
        // palabras por el prompt).
        reasoning_effort: 'low',
        max_completion_tokens: 2048
      })
    });

    const data = await groqRes.json();

    if (!groqRes.ok) {
      console.error('Groq error:', JSON.stringify(data).slice(0, 2000));
      const msg = data?.error?.message || 'Error en la API de Groq.';
      return res.status(groqRes.status).json({ error: `Groq (${model}): ${msg}` });
    }

    const choice = data?.choices?.[0] || {};
    const message = choice.message || {};
    const text = typeof message.content === 'string' ? message.content.trim() : '';

    if (!text) {
      // Se loguea la respuesta cruda para diagnosticar en los Function Logs de Vercel.
      console.error('Groq sin texto:', JSON.stringify(data).slice(0, 2000));
      const reason = choice.finish_reason ? ` (finish_reason: ${choice.finish_reason})` : '';
      return res.status(500).json({ error: `Groq (${model}) no devolvió texto${reason}. Probá de nuevo; si persiste, revisá los Function Logs en Vercel.` });
    }

    return res.status(200).json({ response: text });
  } catch (err) {
    console.error('Proxy Groq:', err?.message);
    return res.status(500).json({ error: err?.message || 'Error interno.' });
  }
}
