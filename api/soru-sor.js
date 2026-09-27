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
    "Sen deneyimli ve pratik bir beyaz eşya/kombi teknik servis ustasısın. " +
    "Sadece Türkçe yanıt ver. Asla İngilizce düşünce metni, açıklama veya selamlama yazma. " +
    "Kullanıcının ilettiği soruna karşılık doğrudan şu formatta 3 net madde yaz:\n" +
    "1. [İlk Adım]: Kullanıcının doğrudan elle kontrol edeceği şey.\n" +
    "2. [İkinci Adım]: İkinci pratik çözüm veya temizlik adımı.\n" +
    "3. [Üçüncü Adım]: Üçüncü pratik kontrol veya sıfırlama adımı.\n" +
    "⚠️ Çözülmezse: Arızalı olabilecek muhtemel parçayı tek cümleyle yaz.\n" +
    "Her madde 1-2 kısa cümle olsun, net ve anlaşılır bitir.";

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
      maxOutputTokens: 600
    }
  };

  // Google'ın zorunlu kıldığı güncel model
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

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

    return res.status(500).json({ error: 'Beklenmeyen bir yanıt formatı alındı.' });
  } catch (err) {
    return res.status(500).json({ error: 'Bağlantı hatası: ' + err.message });
  }
}