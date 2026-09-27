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
    "Sen pratik ve tecrübeli bir teknik servis ustasısın. " +
    "Sadece Türkçe yanıt ver. Asla İngilizce düşünce metni, açıklama veya selamlama yazma. " +
    "Kullanıcının sorununa karşılık doğrudan şu formatta 3 net madde yaz:\n" +
    "1. [İlk Adım]: Kullanıcının doğrudan elle kontrol edeceği şey.\n" +
    "2. [İkinci Adım]: İkinci pratik çözüm veya temizlik adımı.\n" +
    "3. [Üçüncü Adım]: Üçüncü pratik kontrol veya sıfırlama adımı.\n" +
    "⚠️ Çözülmezse: Arızalı olabilecek parçayı tek cümleyle yaz.\n" +
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

  // 3.8 yoğunluk/high demand verirse anında hafif ve kesintisiz 3.5-flash-lite modeline geçer
  const modeller = ['gemini-3.8-flash', 'gemini-3.5-flash-lite'];
  let sonHata = 'API yanıt veremedi.';

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

      if (data.error?.message) {
        sonHata = data.error.message;
      }
    } catch (err) {
      sonHata = err.message;
    }
  }

  return res.status(500).json({ error: sonHata });
}