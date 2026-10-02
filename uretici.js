const fs = require('fs');
const path = require('path');

// 1. Arıza Listesi ve Çözüm Verileri
const arizalar = [
  { slug: "f5-e05", baslik: "Kombi F5 / E05 Hava Akış Arızası", marka: "Genel Kombi", desc: "Prosestat veya fan motoru hava akış hatası çözümü ve kontrol adımları.", adimlar: ["Baca borusunun yerinden çıkıp çıkmadığını kontrol edin.", "Fan motoru ve prosestat soketlerini kontrol edin.", "Cihazı resetleyip tekrar çalıştırın."] },
  { slug: "demirdokum-f28", baslik: "Demirdöküm Kombi F28 Ateşleme Hatası", marka: "Demirdöküm", desc: "Demirdöküm kombilerde gaz yokluğu veya ateşleme başarısızlığı çözümü.", adimlar: ["Daire gaz vanasının ve ocakların açık olduğunu teyit edin.", "Kombi su basıncının 1.5 bar seviyesinde olduğundan emin olun.", "Reset (R) tuşuna 5 saniye basılı tutarak cihazı yeniden başlatın."] },
  { slug: "baymak-e03", baslik: "Baymak Kombi E03 Aşırı Isınma Arızası", marka: "Baymak", desc: "Baymak kombilerde aşırı ısınma termostatı hatası ve resetleme adımları.", adimlar: ["Petek vanalarının en az iki tanesinin açık olduğunu kontrol edin.", "Tesisat su basıncını 1.5 bara ayarlayın.", "Cihazı kapatıp 15 dakika soğumasını bekledikten sonra resetleyin."] },
  { slug: "eca-e4", baslik: "ECA Kombi E4 Düşük Su Basıncı Arızası", marka: "ECA", desc: "ECA kombilerde su basıncı düşüklüğü ve su basma vanası çözümü.", adimlar: ["Kombinin altındaki mavi/siyah doldurma musluğunu sola çevirin.", "Bar göstergesi 1.5 olana kadar su basın ve musluğu iyice kapatın.", "Ekranda hata silinmezse reset tuşuna basın."] },
  { slug: "e01-a01-f28", baslik: "Kombi E01 / A01 / F28 Ateşleme Başarısızlığı", marka: "Genel Kombi", desc: "Kombilerde alev oluşmaması ve gaz besleme sorunları.", adimlar: ["Gaz vanasının açık olduğundan emin olun.", "İyonizasyon çubuğu ve ateşleme elektrotlarını kontrol ettirin.", "Kombiyi 3 kez resetleyin."] },
  { slug: "f10-e03", baslik: "Kombi F10 / E03 Tesisat Basınç Hatası", marka: "Genel Kombi", desc: "Düşük veya aşırı tesisat su basıncı arızası çözümleri.", adimlar: ["Basınç 1.0 bar altındaysa su doldurma musluğunu açın.", "Basınç 2.5 bar üzerindeyse petek pürjöründen su tahliye edin."] },
  { slug: "f1-e02", baslik: "Kombi F1 / E02 Aşırı Isınma Emniyeti", marka: "Genel Kombi", desc: "Limit termostat atması ve aşırı sıcaklık uyarısı.", adimlar: ["Petek vanalarını kontrol edin, tıkalı olmasın.", "Pompa motorunun sıkışıp sıkışmadığını kontrol ettirin."] },
  { slug: "f22-f75", baslik: "Vaillant Kombi F22 / F75 Basınç ve Pompa Hatası", marka: "Vaillant", desc: "Vaillant kombilerde susuz çalışma veya su basınç sensörü arızası.", adimlar: ["Su basıncını 1.5 bara getirin.", "F75 hatası devam ediyorsa basınç sensörü veya devirdaim pompası arızalı olabilir."] },
  { slug: "ea-ce", baslik: "Bosch Kombi EA / CE Alev Algılama Hatası", marka: "Bosch", desc: "Bosch kombilerde alev algılanamadı hatası ve kontrol yöntemleri.", adimlar: ["Gaz beslemesini kontrol edin.", "Reset düğmesine basarak kombiyi yeniden başlatın."] },
  { slug: "buderus-3c", baslik: "Buderus Kombi 3C Diferansiyel Basınç Hatası", marka: "Buderus", desc: "Buderus kombilerde fan veya atık gaz tahliye arızası.", adimlar: ["Bacanın tıkalı veya yerinden oynamış olmadığını kontrol edin.", "Fan motorunun devreye girip girmediğini dinleyin."] },
  { slug: "alarko-f4", baslik: "Alarko Kombi F4 Ateşleme Sorunu", marka: "Alarko", desc: "Alarko kombilerde alev kaybı veya gaz yetersizliği.", adimlar: ["Gaz vanasını kontrol edin.", "Cihazı kapatıp açarak resetleyin."] },
  { slug: "ferroli-a01", baslik: "Ferroli Kombi A01 Brülör Ateşleme Hatası", marka: "Ferroli", desc: "Ferroli kombilerde brülörün yanmaması ve çözüm yolları.", adimlar: ["Gaz girişini teyit edin.", "Elektrot kablolarının takılı olduğunu kontrol edin."] },
  { slug: "e08-f08", baslik: "Çamaşır Makinesi E08 / F08 Rezistans Hatası", marka: "Çamaşır Makinesi", desc: "Isıtıcı rezistans veya NTC sıcaklık sensörü arızası.", adimlar: ["Makinenin suyu ısıtıp ısıtmadığını camdan kontrol edin.", "Rezistans kireçlenmiş veya kopmuş olabilir, ölçüm gerekir."] },
  { slug: "e18-f18", baslik: "Bosch / Siemens E18 - F18 Su Tahliye Hatası", marka: "Bosch / Siemens", desc: "Pompa filtresi tıkanıklığı veya tahliye hortumu bükülmesi.", adimlar: ["Ön alt kapağı açıp pompa filtresini temizleyin.", "Gider hortumunun tıkalı veya ezilmiş olmadığını kontrol edin."] },
  { slug: "bosch-e23", baslik: "Bosch Çamaşır Makinesi E23 Aquastop Hatası", marka: "Bosch", desc: "Tabana su kaçması ve Aquastop emniyet sisteminin devreye girmesi.", adimlar: ["Cihazın fişini hemen çekin.", "Cihazı 45 derece öne eğip tabandaki suyu boşaltın ve sızıntı yerini bulun."] },
  { slug: "samsung-3e", baslik: "Samsung Çamaşır Makinesi 3E Motor Hatası", marka: "Samsung", desc: "Motor takometresi veya aşırı yük hatası.", adimlar: ["Kazana aşırı çamaşır yüklenip yüklenmediğini kontrol edin.", "Makineyi 10 dakika fişten çekip bekletin."] },
  { slug: "samsung-4c-4e", baslik: "Samsung 4C / 4E Su Alma Hatası", marka: "Samsung", desc: "Su giriş hortumu, filtre tıkanıklığı veya şebeke suyu kesintisi.", adimlar: ["Su vanasının sonuna kadar açık olduğunu kontrol edin.", "Giriş hortumunun arkasındaki minik filtreyi fırçalayın."] },
  { slug: "arcelik-e01-kapi", baslik: "Arçelik Çamaşır Makinesi E01 Kapak Hatası", marka: "Arçelik", desc: "Kapak kilidi devreye girmedi hatası.", adimlar: ["Kapağı sertçe kapatıp kilit sesini duyun.", "Kapak mandalının kırık olup olmadığını kontrol edin."] },
  { slug: "e15", baslik: "Bosch Bulaşık Makinesi E15 Su Sızıntı Hatası", marka: "Bosch", desc: "Alt tabana su sızması ve flatör anahtarının devreye girmesi.", adimlar: ["Cihazın fişini çekin ve musluğu kapatın.", "Cihazı öne doğru eğerek tabandaki suyu tahliye edin ve kurutun."] },
  { slug: "bosch-e09", baslik: "Bosch Bulaşık Makinesi E09 Isıtma Hatası", marka: "Bosch", desc: "Isıtıcı yıkama motoru (ısı pompalı motor) rezistans arızası.", adimlar: ["Filtrelerin temiz olduğunu kontrol edin.", "E09 uyarısı genellikle pompa rezistansının değişmesini gerektirir."] },
  { slug: "beko-e02-bulasik", baslik: "Beko Bulaşık Makinesi E02 Su Alma Sorunu", marka: "Beko", desc: "Su sayacı veya ventil arızası.", adimlar: ["Musluğun açık olduğunu kontrol edin.", "Hortum filtresini temizleyin."] },
  { slug: "kurutma-filtre", baslik: "Kurutma Makinesi Filtre ve Isınma Uyarısı", marka: "Kurutma Makinesi", desc: "Hava kanallarının tıkanması ve cihazın durması.", adimlar: ["Kapak altındaki hav filtresini yıkayıp kurutun.", "Kondenser peteklerini elektrik süpürgesiyle temizleyin."] },
  { slug: "robot-lds", baslik: "Robot Süpürge LDS / Lidar Lazer Sensör Hatası", marka: "Robot Süpürge", desc: "Lazer kule dönmüyor veya sensör tozlanmış hatası.", adimlar: ["Lazer kulesini hafifçe üfleyerek veya pamuklu çubukla temizleyin.", "Kulenin elle rahatça dönüp dönmediğini kontrol edin."] },
  { slug: "robot-error2-bumper", baslik: "Robot Süpürge Tampon (Bumper) Sıkışma Hatası", marka: "Robot Süpürge", desc: "Ön darbe sensörünün takılı kalması.", adimlar: ["Ön tampona hafifçe tıklatarak yayların serbest kalmasını sağlayın."] },
  { slug: "airfryer-e1-e2", baslik: "Airfryer E1 / E2 Sensör Hatası", marka: "Airfryer", desc: "Termal sensör (NTC) veya aşırı ısınma arızası.", adimlar: ["Cihazı fişten çekip 20 dakika soğumaya bırakın."] },
  { slug: "philips-pot-hatasi", baslik: "Philips Airfryer Hazne (Pot) Algılanmadı Hatası", marka: "Philips", desc: "Hazne mikrosivici algılamıyor uyarısı.", adimlar: ["Hazneyi tam ittiğinizden emin olun.", "İç kısımdaki emniyet pimini kontrol edin."] },
  { slug: "buzdolabi-unlem", baslik: "Buzdolabı Kırmızı Ünlem (!) veya A2 Uyarısı", marka: "Buzdolabı", desc: "Yüksek sıcaklık ve soğutmama uyarısı.", adimlar: ["Kapak fitillerinin tam kapandığından emin olun.", "Alarm tuşuna 3 saniye basarak uyarıyı resetleyin."] },
  { slug: "samsung-22e", baslik: "Samsung Buzdolabı 22E Fan Motoru Hatası", marka: "Samsung", desc: "Dondurucu fan motoru buzlanması veya arızası.", adimlar: ["Cihazı 24 saat fişten çekip kapakları açık şekilde buzunu çözdürün."] },
  { slug: "termosifon-salter", baslik: "Termosifon Şalter / Sigorta Attırıyor", marka: "Termosifon", desc: "Rezistans patlaması veya gövdeye kaçak arızası.", adimlar: ["Cihazı kullanmayı durdurun ve sigortayı açmaya zorlamayın.", "Rezistans ve kireç kontrolü yaptırın."] },
  { slug: "termosifon-damlatma", baslik: "Termosifon Emniyet Ventili Su Damlatıyor", marka: "Termosifon", desc: "Yüksek şebeke basıncı veya emniyet ventili açılması.", adimlar: ["Su basınç düşürücü regülatör takılmasını değerlendirin."] },
  { slug: "ch05-e1", baslik: "Klima CH05 / E1 İletişim Hatası", marka: "Klima", desc: "İç ve dış ünite haberleşme kablosu arızası.", adimlar: ["Klimanın sigortasını kapatıp 3 dakika sonra yeniden açın."] },
  { slug: "arcelik-ch02", baslik: "Arçelik Klima CH02 İç Ünite Sensör Hatası", marka: "Arçelik", desc: "Boru sıcaklık sensörü arızası.", adimlar: ["Hava filtrelerini temizleyin ve cihazı kapatıp açın."] },
  { slug: "lg-ch01", baslik: "LG Klima CH01 Oda Sıcaklık Sensörü Hatası", marka: "LG", desc: "Ortam termistör arızası ve çözümü.", adimlar: ["Ön kapağı açıp sensör soketini kontrol ettirin."] },
  { slug: "u4-a6", baslik: "Daikin Klima U4 / A6 Fan ve İletişim Hatası", marka: "Daikin", desc: "Dış ünite haberleşme veya fan motoru sıkışması.", adimlar: ["Dış ünitenin pervanesine yabancı cisim kaçmadığını kontrol edin."] },
  { slug: "mitsubishi-e6", baslik: "Mitsubishi Klima E6 / E7 Haberleşme Arızası", marka: "Mitsubishi", desc: "İç ve dış ünite sinyal hatası.", adimlar: ["Ana besleme şalterini kapatıp 5 dakika bekledikten sonra açın."] }
];

// 2. Çıktı Klasörü
const outputDir = path.join(__dirname, 'ariza');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 3. HTML Üretici Fonksiyon
function generateHTML(ariza) {
  const adimlarHtml = ariza.adimlar.map((adim, index) => {
    return `<div style="background:#1e293b; padding:16px; border-radius:12px; margin-bottom:12px; border:1px solid #334155; display:flex; gap:12px; align-items:flex-start;">
      <span style="background:#2563eb; color:#fff; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; flex-shrink:0;">${index + 1}</span>
      <p style="margin:0; font-size:15px; line-height:1.5; color:#e2e8f0;">${adim}</p>
    </div>`;
  }).join('\n');

  const stepsSchema = JSON.stringify(ariza.adimlar.map((adim, i) => ({
    "@type": "HowToStep",
    "position": i + 1,
    "name": `Adım ${i + 1}`,
    "text": adim
  })));

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${ariza.baslik} - Kesin Çözüm ve Kontrol Rehberi</title>
  <meta name="description" content="${ariza.desc}">
  <link rel="canonical" href="[https://ariza-rehberi.vercel.app/ariza/$](https://ariza-rehberi.vercel.app/ariza/$){ariza.slug}">
  <script type="application/ld+json">
  {
    "@context": "[https://schema.org](https://schema.org)",
    "@type": "HowTo",
    "name": "${ariza.baslik}",
    "description": "${ariza.desc}",
    "step": ${stepsSchema}
  }
  </script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0f19; color: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 720px; margin: 0 auto; background: #131b2e; border: 1px solid #1e293b; border-radius: 20px; padding: 28px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    h1 { font-size: 24px; color: #60a5fa; margin-top: 0; line-height: 1.3; }
    .badge { display: inline-block; background: #1e3a8a; color: #93c5fd; padding: 4px 12px; border-radius: 999px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 24px; border-radius: 12px; font-weight: bold; text-align: center; margin-top: 20px; width: 100%; box-sizing: border-box; }
    .btn:hover { background: #1d4ed8; }
    .btn-secondary { background: #334155; margin-top: 10px; }
    .desc { color: #94a3b8; font-size: 16px; line-height: 1.6; margin-bottom: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <span class="badge">${ariza.marka}</span>
    <h1>${ariza.baslik}</h1>
    <p class="desc">${ariza.desc}</p>
    
    <h3 style="color:#e2e8f0; margin-bottom:16px;">🛠️ Servis Çağırmadan Önce Yapılacak Kontroller:</h3>
    ${adimlarHtml}

    <a href="/#${ariza.slug}" class="btn">🤖 Yapay Zeka Usta ile Detaylı Çöz / Bütçe Hesapla</a>
    <a href="/" class="btn btn-secondary">← Tüm Arıza Kodları Listesine Dön</a>
  </div>
</body>
</html>`;
}

// 4. Dosyaları Üret
arizalar.forEach(ariza => {
  const filePath = path.join(outputDir, `${ariza.slug}.html`);
  fs.writeFileSync(filePath, generateHTML(ariza), 'utf-8');
});

console.log(`✅ Başarılı: ${arizalar.length} adet arıza sayfası 'ariza/' klasörüne üretildi!`);