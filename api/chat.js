export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST requis' });

  const { contents, systemInstruction } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Clé API non configurée dans Vercel" });
  }

  try {
    // On utilise v1 (stable) car v1beta semble poser problème sur ton projet
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    // MÉTHODE ROBUSTE : On insère l'instruction système au début du message
    // Cela évite l'erreur "Unknown name system_instruction" que tu as reçue
    const finalContents = JSON.parse(JSON.stringify(contents)); // Copie propre
    
    if (systemInstruction && finalContents.length > 0) {
      const originalText = finalContents[0].parts[0].text;
      finalContents[0].parts[0].text = `INSTRUCTIONS SYSTÈME : ${systemInstruction}\n\n--- REQUÊTE CLIENT : ${originalText}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: finalContents,
        generationConfig: { 
          maxOutputTokens: 1000, 
          temperature: 0.7 
        }
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("Erreur Google:", data.error.message);
      return res.status(500).json({ error: data.error.message });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Désolé, je n'ai pas pu générer de réponse.";
    return res.status(200).json({ text: aiText });

  } catch (error) {
    console.error("Erreur Vercel:", error);
    return res.status(500).json({ error: "Erreur interne serveur" });
  }
}
