export default async function handler(req, res) {
  // 1. Autoriser uniquement le POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { contents, systemInstruction } = req.body;
  const apiKey = process.env.GEMINI_API_KEY; 

  // 2. Vérifier si la clé est bien présente
  if (!apiKey) {
    console.error("Erreur : GEMINI_API_KEY est manquante dans les variables d'environnement Vercel.");
    return res.status(500).json({ error: "La clé API n'est pas configurée sur Vercel." });
  }

  // 3. Utiliser un modèle dont on est sûr du nom
  const modelName = "gemini-1.5-flash"; 

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: contents,
        systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
        generationConfig: {
            maxOutputTokens: 800,
            temperature: 0.7,
        }
      })
    });

    const data = await response.json();

    // 4. Si Google renvoie une erreur (ex: clé invalide)
    if (data.error) {
        console.error("Erreur Google API:", data.error.message);
        return res.status(500).json({ text: "Erreur Google : " + data.error.message });
    }

    // 5. Extraction de la réponse
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
        console.error("Réponse Google vide ou bloquée par filtre de sécurité:", data);
        return res.status(200).json({ text: "Je ne peux pas répondre à cette question pour le moment (filtre de sécurité ou réponse vide)." });
    }

    return res.status(200).json({ text: aiText });

  } catch (error) {
    console.error("Erreur Fetch:", error);
    return res.status(500).json({ error: "Erreur technique lors de l'appel à l'IA." });
  }
}
