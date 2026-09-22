export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Yalnızca POST istekleri desteklenir.' });
  }

  const { soru } = req.body;
  if (!soru || soru.trim() === '') {
    return res.status(400).json({ error: 'Lütfen bir soru veya arıza açıklaması girin.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API anahtarı sunucuda tanımlanmamış.' });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const promptText = `Sen deneyimli, güvenilir bir kombi ve beyaz eşya teknik servis uzmanısın. 
Kullanıcının ilettiği arıza/sorun durumuna göre kısa, anlaşılır ve güvenliği ön planda tutan adım adım kontroller öner. 
Kritik elektrik veya gaz kaçağı riski varsa mutlaka açıkça uyar. 
Cevabını doğrudan maddeler halinde, teknik jargona boğmadan ver.

Kullanıcının sorusu: "${soru}"`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Gemini yanıt veremedi.' });
    }

    const cevap = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Yanıt alınamadı.';
    return res.status(200).json({ cevap });

  } catch (err) {
    return res.status(500).json({ error: 'Sunucu hatası: ' + err.message });
  }
}