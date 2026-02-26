export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { contents, systemInstruction } = req.body;
  const apiKey = process.env.GEMINI_API_KEY; // Vercel injecte la clé ici

  const modelName = "gemini-1.5-flash"; // Utilise un modèle stable

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined
      })
    });

    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Désolé, je n'ai pas pu générer de réponse.";

    return res.status(200).json({ text: aiText });
  } catch (error) {
    return res.status(500).json({ error: "Erreur lors de l'appel à Gemini" });
  }
}
