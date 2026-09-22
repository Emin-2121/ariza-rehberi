export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Yalnızca POST istekleri desteklenir.' });
  }

  const { soru } = req.body || {};
  if (!soru || soru.trim() === '') {
    return res.status(400).json({ error: 'Lütfen bir arıza açıklaması veya soru yazın.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Vercel üzerinde GEMINI_API_KEY tanımlı değil.' });
  }

  const promptText = `Sen kombi, klima ve beyaz eşya konusunda uzman, can ve mal güvenliğini ön planda tutan deneyimli bir teknik servis ustasısın.
Kullanıcının ilettiği arıza/sorun durumuna göre kısa, net, anlaşılır ve güvenliği ön planda tutan adım adım kontroller öner.
Kritik gaz kaçağı veya elektrik tehlikesi varsa en başta uyar.
Cevabını doğrudan maddeler halinde ver.

Kullanıcının sorusu: "${soru}"`;

  // Google'ın zorunlu kıldığı güncel model
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

  // Geçici yoğunluk (high demand) durumunda pes etmeyip 3 kez deneme mekanizması
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      });

      const data = await response.json();

      if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return res.status(200).json({
          cevap: data.candidates[0].content.parts[0].text
        });
      }

      // Yoğunluk hatası verirse 1 saniye bekleyip tekrar dene
      if (attempt < 3) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        return res.status(500).json({
          error: data.error?.message || 'Yapay zeka yanıt veremedi.'
        });
      }
    } catch (err) {
      if (attempt === 3) {
        return res.status(500).json({ error: 'Sunucu hatası: ' + err.message });
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}