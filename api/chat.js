/**
 * Ce code est le "cerveau" serveur.
 * À mettre dans le dossier "api", dans le fichier "chat.js".
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Clé API absente des réglages Vercel." });
  }

  // URL stable (v1) de l'API Google Gemini
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: `Tu es JAAD AI, l'assistant expert de l'agence JAAD Studio. Réponds de façon pro et courte. Client : ${message}` }] 
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: data.error?.message || "Erreur Google Gemini" 
      });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Désolé, je n'ai pas pu générer de réponse.";
    res.status(200).json({ text: aiText });

  } catch (error) {
    res.status(500).json({ error: "Erreur serveur Vercel : " + error.message });
  }
}
