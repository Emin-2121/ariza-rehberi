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
      error: 'Vercel üzerinde GEMINI_API_KEY bulunamadı.' 
    });
  }

  const sistemTalimati = 
    "Sen pratik bir teknik servis ustasısın. " +
    "Giriş ve selamlama yapmadan doğrudan kullanıcıya yönelik en etkili 3 çözüm adımını madde madde yaz. " +
    "Her madde 1-2 kısa cümle olsun. En alta tek satır '⚠️ Çözülmezse: ...' diyerek arızalı olabilecek parçayı ekle. " +
    "Cümleleri yarım bırakma, net ve anlaşılır bitir.";

  const istekGovdesi = {
    contents: [
      {
        parts: [
          { text: `${sistemTalimati}\n\nKullanıcı Sorunu: ${soru}` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 600
    }
  };

  // Sırasıyla denenecek modeller (biri yoğunsa diğerine geçer)
  const modeller = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

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

      // Eğer yoğunluk (503 / high demand) veya kota hatası verdiyse döngü sonraki modeli dener
      console.warn(`${model} yanıt vermedi, sıradaki modele geçiliyor...`);
    } catch (e) {
      console.warn(`${model} bağlantı hatası:`, e.message);
    }
  }

  return res.status(500).json({ 
    error: 'Servis şu an aşırı yoğun. Lütfen birkaç saniye sonra tekrar deneyin.' 
  });
}