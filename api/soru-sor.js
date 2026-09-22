export default async function handler(req, res) {
  // Sadece POST isteklerini kabul et
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Yalnızca POST istekleri desteklenir.' });
  }

  const { soru } = req.body;
  if (!soru || typeof soru !== 'string') {
    return res.status(400).json({ error: 'Lütfen geçerli bir arıza veya soru belirtin.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API anahtarı (GEMINI_API_KEY) tanımlanmamış.' });
  }

  const sistemTalimati = 
    "Sen deneyimli ve pratik bir beyaz eşya ve kombi ustasısın. " +
    "Gereksiz nezaket ve selamlama cümlelerini atla. " +
    "Kullanıcının ilettiği soruna yönelik evde yapılabilecek en kritik kontrolleri doğrudan 3 veya 4 kısa madde halinde yaz. " +
    "Cevabın net olsun ve 60-70 kelimeyi geçmesin.";

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
      maxOutputTokens: 300
    }
  };

  // 1. Tercih: gemini-2.5-flash (En hızlı model)
  // 2. Tercih (Yedek): gemini-1.5-flash
  const modeller = ['gemini-2.5-flash', 'gemini-1.5-flash'];

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
        const cevapMetni = data.candidates[0].content.parts[0].text.trim();
        return res.status(200).json({ cevap: cevapMetni });
      }
      
      console.warn(`${model} yanıt vermedi, sonraki modele geçiliyor:`, data.error?.message);
    } catch (err) {
      console.error(`${model} bağlantı hatası:`, err.message);
    }
  }

  return res.status(500).json({ 
    error: 'Yapay zeka servisi şu an meşgul. Lütfen sorunuzu biraz daha sadeleştirip tekrar deneyin.' 
  });
}