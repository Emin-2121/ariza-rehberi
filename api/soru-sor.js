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
    "Sen kombi, beyaz eşya, klima ve küçük ev aletleri konusunda uzmanlaşmış kıdemli bir teknik servis ustasısın. " +
    "Kullanıcının ilettiği arıza veya belirti için yüzeysel ve tek cümlelik yanıtlar verme; kullanıcıya yol gösteren, doyurucu ve net bir rehber hazırla. " +
    "Yanıtını şu başlıklar altında düzenle:\n" +
    "1. Olası Nedenler: Arızaya yol açabilecek 2-3 temel mekanik ya da elektriksel sebebi açıkla.\n" +
    "2. Evde Yapılacak Kontroller & Çözüm: Kullanıcının servis çağırmadan önce güvenle yapabileceği adımları (vana, filtre, resetleme, temizlik vb.) maddeler halinde açıkla.\n" +
    "3. Tahmini Maliyet & Servis Durumu: Hangi parçanın arızalanmış olabileceğini, evde çözülmezse servise ne zaman başvurulması gerektiğini ve ortalama parça durumunu belirt.\n" +
    "Gereksiz selamlama cümleleri kurmadan doğrudan konuya gir ve profesyonel usta dili kullan.";

  const istekGovdesi = {
    contents: [
      {
        parts: [
          { text: `${sistemTalimati}\n\nKullanıcı Sorunu: ${soru}` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1000
    }
  };

  // Standart ve kararlı model endpoint'i
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