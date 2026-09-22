export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Yalnızca POST istekleri desteklenir.' });
  }

  const { soru } = req.body;
  if (!soru || typeof soru !== 'string') {
    return res.status(400).json({ error: 'Lütfen bir soru veya arıza belirtin.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'Vercel üzerinde GEMINI_API_KEY tanımlı değil veya okunamadı. Lütfen Vercel panelindeki Environment Variables alanını kontrol edin.' 
    });
  }

  const sistemTalimati = 
    "Sen deneyimli ve pratik bir beyaz eşya/kombi ustasısın. " +
    "Gereksiz selamlama ve nezaket ifadelerini atla. " +
    "Kullanıcının sorunu için evde yapabileceği en acil kontrolleri 3 veya 4 kısa madde halinde yaz. " +
    "Cevabın 60 kelimeyi geçmesin.";

  const istekGovdesi = {
    contents: [
      {
        parts: [
          { text: `${sistemTalimati}\n\nKullanıcı Sorunu: ${soru}` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 250
    }
  };

  // Kararlı Gemini modelleri
  const modeller = ['gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash'];
  let sonHataMesaji = '';

  for (const model of modeller) {
    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      const apiRes = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(istekGovdesi)
      });

      const data = await apiRes.json();

      if (apiRes.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return res.status(200).json({ 
          cevap: data.candidates[0].content.parts[0].text.trim() 
        });
      }

      // Google'ın döndürdüğü gerçek hata mesajını kaydet
      if (data.error) {
        sonHataMesaji = `${model} Hatası: ${data.error.message || JSON.stringify(data.error)}`;
      }
    } catch (err) {
      sonHataMesaji = `Bağlantı hatası (${model}): ${err.message}`;
    }
  }

  return res.status(500).json({ 
    error: sonHataMesaji || 'Yapay zeka modellerine ulaşılamadı. API anahtarınızı veya internet bağlantısını kontrol edin.' 
  });
}