export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { contents, systemInstruction } = req.body;
  const apiKey = process.env.GEMINI_API_KEY; 

  if (!apiKey) {
    return res.status(500).json({ error: "La clé API n'est pas configurée sur Vercel." });
  }

  // Utilisation du modèle stable
  const modelName = "gemini-1.5-flash"; 

  try {
    // Changement de l'URL : on utilise /v1/ au lieu de /v1beta/
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: contents,
        // La structure reste la même pour le modèle 1.5
        systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
        generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7,
        }
      })
    });

    const data = await response.json();

    if (data.error) {
        console.error("Erreur Google API:", data.error.message);
        return res.status(500).json({ text: "Erreur Google : " + data.error.message });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
        return res.status(200).json({ text: "Désolé, je ne peux pas répondre pour le moment." });
    }

    return res.status(200).json({ text: aiText });

  } catch (error) {
    console.error("Erreur Fetch:", error);
    return res.status(500).json({ error: "Erreur technique." });
  }
}
