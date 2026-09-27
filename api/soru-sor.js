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
    "Kullanıcının sorununa karşılık gereksiz giriş-çıkış veya nezaket lafları etmeden doğrudan en etkili 3 veya 4 çözümü yaz. " +
    "Formatın kesinlikle şu olsun:\n" +
    "• Kısa, net ve eyleme yönelik maddeler (Örn: '1. Pervaneyi Temizleyin: ...').\n" +
    "• Her madde maksimum 1-2 cümle olsun; doğrudan kullanıcının eliyle yapacağı kontrole odaklansın.\n" +
    "• En sona tek satırla: '⚠️ Çözülmezse: ...' diyerek muhtemel arızalı parçayı belirt.\n" +
    "Asla uzun paragraflar yazma, göz yormayan hap bilgi ver.";

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

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
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

    if (data.error) {
      return res.status(500).json({ error: data.error.message || 'API yanıt veremedi.' });
    }

    return res.status(500).json({ error: 'Beklenmeyen bir yanıt alındı.' });
  } catch (err) {
    return res.status(500).json({ error: 'Bağlantı hatası: ' + err.message });
  }
}