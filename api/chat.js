export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST requis' });

  const { contents, systemInstruction } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("Clé API manquante sur Vercel");
    return res.status(500).json({ error: "Clé API non configurée" });
  }

  try {
    // Utilisation de l'endpoint stable v1
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: contents,
        // CORRECTION : "system_instruction" au lieu de "systemInstruction"
        system_instruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
        generationConfig: { maxOutputTokens: 1000, temperature: 0.7 }
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("Erreur Google:", data.error.message);
      return res.status(500).json({ error: data.error.message });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Pas de réponse";
    return res.status(200).json({ text: aiText });

  } catch (error) {
    console.error("Erreur Vercel:", error);
    return res.status(500).json({ error: "Erreur interne du serveur" });
  }
}
