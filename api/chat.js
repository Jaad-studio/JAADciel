export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST requis' });

  const { contents, systemInstruction } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Clé API non configurée dans Vercel" });
  }

  try {
    // 1. CORRECTION ICI : Utilisation obligatoire de v1beta pour supporter systemInstruction
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: contents,
      generationConfig: { 
        maxOutputTokens: 1000, 
        temperature: 0.7 
      }
    };

    // 2. Le format JSON propre qu'on a mis en place
    if (systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erreur de l'API Google:", data.error?.message);
      return res.status(response.status).json({ error: data.error?.message || "Erreur API Google" });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Désolé, je n'ai pas pu générer de réponse.";
    return res.status(200).json({ text: aiText });

  } catch (error) {
    console.error("Erreur critique Vercel:", error);
    return res.status(500).json({ error: "Erreur interne du serveur" });
  }
}
