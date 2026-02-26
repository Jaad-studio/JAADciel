export default async function handler(req, res) {
  // 1. On bloque tout ce qui n'est pas une requête POST
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST requis' });

  const { contents, systemInstruction } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // 2. Sécurité : vérifier que la clé est bien lue par Vercel
  if (!apiKey) {
    console.error("Clé API introuvable.");
    return res.status(500).json({ error: "Clé API non configurée dans Vercel" });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    // 3. Construction propre du corps de la requête (payload)
    const payload = {
      contents: contents,
      generationConfig: { 
        maxOutputTokens: 1000, 
        temperature: 0.7 
      }
    };

    // 4. LA MAGIE EST ICI : Le format exact exigé par Google pour le System Prompt
    if (systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    // 5. Appel à l'API Google
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    // 6. Gestion propre des erreurs renvoyées par Google
    if (!response.ok) {
      console.error("Erreur de l'API Google:", data.error?.message);
      return res.status(response.status).json({ error: data.error?.message || "Erreur API Google" });
    }

    // 7. Extraction du texte et renvoi au frontend
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Désolé, je n'ai pas pu générer de réponse.";
    return res.status(200).json({ text: aiText });

  } catch (error) {
    console.error("Erreur critique Vercel:", error);
    return res.status(500).json({ error: "Erreur interne du serveur" });
  }
}
