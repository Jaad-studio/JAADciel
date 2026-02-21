/**
 * Version finale ultra-stable - Utilise v1beta pour Gemini 1.5 Flash
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "La clé GEMINI_API_KEY n'est pas configurée sur Vercel." });
  }

  // Correction de l'URL : On utilise v1beta car gemini-1.5-flash y est mieux supporté
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: `Tu es JAAD AI, l'assistant expert de l'agence JAAD Studio (Web, 3D, IA). Réponds de manière professionnelle et concise. Client : ${message}` }] 
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: data.error?.message || "Erreur de réponse Google" 
      });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Je n'ai pas pu générer de réponse.";
    res.status(200).json({ text: aiText });

  } catch (error) {
    res.status(500).json({ error: "Erreur de connexion serveur : " + error.message });
  }
}
