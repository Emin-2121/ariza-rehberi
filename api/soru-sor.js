export default async function handler(req, res) {
  // Sadece POST isteklerine izin ver
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Yalnızca POST istekleri desteklenir.' });
  }

  const { soru } = req.body;
  if (!soru || typeof soru !== 'string') {
    return res.status(400).json({ error: 'Lütfen geçerli bir soru iletin.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API anahtarı yapılandırılmamış.' });
  }

  // En hızlı model: gemini-2.5-flash
  // Thinking budget sıfırlanıp token sayısı kısaltılarak milisaniyeler içinde yanıt alınır
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const systemInstruction = 
    "Sen pratik ve net konuşan bir beyaz eşya/kombi ustasısın. " +
    "Gereksiz nezaket ve uzun selamlama cümlelerini atla. " +
    "Kullanıcının sorununa doğrudan 3 veya 4 kısa madde halinde, evde yapılabilecek en acil kontrolleri söyle. " +
    "Cevabın kesinlikle 60 kelimeyi geçmesin.";

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [{ text: `${systemInstruction}\n\nKullanıcı Sorunu: ${soru}` }]
      }
    ],
    generationConfig: {
      temperature: 0.2, // Hızlı ve kararlı yanıt
      maxOutputTokens: 250, // Yanıtı kısa tutarak üretim süresini minimuma indirir
      thinkingConfig: {
        thinkingBudget: 0 // Düşünme gecikmesini tamamen kapatır, anında yazar
      }
    }
  };

  try {
    const apiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
      // Hata durumunda yedek flash çağrısı (fallback)
      return res.status(500).json({ error: data.error?.message || 'Yapay zeka servisi yanıt vermedi.' });
    }

    const rawCevap = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawCevap) {
      return res.status(500).json({ error: 'Yapay zeka boş yanıt döndürdü.' });
    }

    return res.status(200).json({ cevap: rawCevap.trim() });
  } catch (err) {
    return res.status(500).json({ error: 'Bağlantı hatası: ' + err.message });
  }
}