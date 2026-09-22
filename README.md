# 💰 El Salón de la Fortuna
### Preguntá. Negociá. Amasá.

Aventura gráfica conversacional en español donde hablás cara a cara con 5 magnates históricos: **John D. Rockefeller, Andrew Carnegie, J.P. Morgan, Henry Ford y Cornelius Vanderbilt.**

Elegís un personaje clickeando sobre el escenario y le hacés preguntas en un panel de chat. Cada magnate responde en primera persona, en forma breve y fiel a su historia empresarial documentada, vía IA.

## ✨ Features
- Escenario point-and-click con image-map + sprites y mensajes de hover
- Panel de personaje con retrato y nombre activo
- Chat con historial, estados de carga (`Pensando…`) y manejo de errores
- Respuestas generadas por Groq (`openai/gpt-oss-20b`, gratis), limitadas a 70 palabras, sin inventar hechos
- Escenario 100% configurable por `config.json` sin tocar código

## 🛠️ Stack
- **Frontend:** HTML + CSS + JS vanilla (sin frameworks)
- **Backend:** Serverless Function `api/index.js` como proxy seguro a Groq
- **IA:** `openai/gpt-oss-20b` (gratuito, configurable por `GROQ_MODEL`)
- **Deploy:** Vercel

## 📁 Estructura
```
ricos/
├── index.html      # layout: personaje / escenario / logo / chat
├── config.json     # escenario, rostros y áreas clickeables
├── scripts/app.js  # carga config, sprites y chat con /api
├── api/index.js    # POST {prompt} -> Groq
├── styles/style.css
└── images/
```

## ⚙️ Configuración
`config.json` define todo el nivel:

```json
{
  "escenario": "./images/salon-de-las-ideas.png",
  "rostros": { "Henry Ford": "./images/confucio.png" },
  "areasPersonajes": ["<area shape=\"rect\" coords=\"...\" alt=\"Henry Ford\">"]
}
```

## 🚀 Uso local
1. `npm i -g vercel` y `vercel dev`
2. Setear env var: `GROQ_API_KEY=tu_key` (la creás en https://console.groq.com/keys; opcional: `GROQ_MODEL=openai/gpt-oss-20b`)
3. Abrir `http://localhost:3000` y clickear un magnate para empezar a preguntar.
