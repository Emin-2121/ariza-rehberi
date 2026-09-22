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

  // Yoğunluk anında birbirini yedekleyen modeller
  const candidateModels = [
    'gemini-2.5-pro',
    'gemini-3.6-flash'
  ];

  let lastError = null;

  for (const model of candidateModels) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }]
          })
        }
      );

      const data = await response.json();

      if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return res.status(200).json({
          cevap: data.candidates[0].content.parts[0].text
        });
      }

      // Yoğunluk (high demand) veya kota uyarısı gelirse diğer modele geç
      lastError = data.error?.message || 'Model yanıt vermedi.';
    } catch (err) {
      lastError = err.message;
    }
  }

  return res.status(500).json({
    error: `Servis geçici olarak yoğun, lütfen birkaç saniye sonra tekrar deneyin. (${lastError})`
  });
}