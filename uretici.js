const fs = require('fs');
const path = require('path');

// Mevcut 35 arıza listesi
const arizalar = [
  { slug: "f5-e05", baslik: "Kombi F5 / E05 Hava Akış Arızası", marka: "Genel Kombi", aciklama: "Kombilerde hava akışı veya prosestat kaynaklı atık gaz tahliye sorunu.", kontroller: ["Bacanın yerinden çıkmadığından ve tıkalı olmadığından emin olun.", "Kombiyi resetleyin ve fan motorunun sesini dinleyin.", "Hava şartları çok rüzgarlıysa fan çıkışını kontrol edin."] },
  { slug: "demirdokum-f28", baslik: "Demirdöküm Kombi F28 Ateşleme Hatası", marka: "Demirdöküm", aciklama: "Demirdöküm kombilerde gaz yokluğu veya ateşleme başarısızlığı çözümü.", kontroller: ["Daire gaz vanasının ve ocakların açık olduğunu teyit edin.", "Kombi su basıncının 1.5 bar seviyesinde olduğundan emin olun.", "Reset (R) tuşuna 5 saniye basılı tutarak cihazı yeniden başlatın."] },
  { slug: "baymak-e03", baslik: "Baymak Kombi E03 Arıza Kodu", marka: "Baymak", aciklama: "Baymak kombilerde aşırı ısınma ve emniyet termostatı devreye girme sorunu.", kontroller: ["Tüm petek vanalarının en az 2-3 tanesinin tamamen açık olduğunu kontrol edin.", "Kombi altındaki tesisat vanalarının açık konumda olduğunu doğrulayın.", "Cihazın soğumasını bekleyip reset düğmesine basın."] },
  { slug: "eca-e4", baslik: "E.C.A Kombi E4 Düşük Basınç Uyarısı", marka: "E.C.A", aciklama: "E.C.A kombilerde kalorifer devresi su basıncının kritik seviyeye düşmesi.", kontroller: ["Kombinin altındaki doldurma musluğunu saat yönünün tersine çevirin.", "Basınç göstergesi 1.5 bara gelene kadar su doldurun.", "Musluğu iyice sıkıp kapatın ve ekrandaki arızanın silinmesini bekleyin."] },
  { slug: "e01-a01-f28", baslik: "Kombi Ateşleme Başarısızlığı (E01 / A01)", marka: "Tüm Kombiler", aciklama: "Gaz gelmemesi, iyonizasyon elektrodu veya gaz valfi kilitlenmesi durumu.", kontroller: ["Ocağı yakarak evinize doğalgaz ulaştığından emin olun.", "Kombi gaz giriş vanasını boruyla paralel konuma getirin.", "Cihazı 3 defadan fazla olmamak şartıyla resetleyin."] },
  { slug: "f10-e03", baslik: "Kombi Düşük Su Basıncı Hatası (F10)", marka: "Genel Kombi", aciklama: "Tesisattaki suyun 0.8 bar altına inmesi sonucu cihazın kendini korumaya alması.", kontroller: ["Doldurma musluğunu bularak yavaşça açın.", "Basınç ibresini takip ederek 1.5 bar değerine getirin.", "Eğer sürekli su eksiliyorsa tesisatta kaçak kontrolü yapın."] },
  { slug: "f1-e02", baslik: "Aşırı Isınma / Limit Termostat Hatası", marka: "Tüm Kombiler", aciklama: "Kombi içindeki su sıcaklığının 95-100 dereceye ulaşıp limit termostatı açması.", kontroller: ["Peteklerin vanalarını kontrol edin, kapalı olanları açın.", "Kombi filtresinin tıkanma ihtimaline karşı servise başvurun.", "Kombiyi kapatıp 15 dakika soğumaya bırakın."] },
  { slug: "f22-f75", baslik: "Kuru Yanma ve Basınç Sensör Arızası", marka: "Vaillant", aciklama: "Sistemde su olmadan pompanın çalışması veya sensörün algılayamaması.", kontroller: ["Su basıncını kontrol edin, gerekiyorsa 1.5 bara tamamlayın.", "Cihazı yeniden başlatın.", "Pompa devir kontrolü gerekebileceğinden devam ederse servis çağırın."] },
  { slug: "ea-ce", baslik: "Ateşleme Algılanamadı (EA / CE Kodları)", marka: "Bosch", aciklama: "Brülörde alev oluşmaması veya alevin kontrol ünitesi tarafından görülmemesi.", kontroller: ["Gaz vanasının açık olduğunu doğrulayın.", "Şebeke voltajında düşüklük olup olmadığını gözlemleyin.", "Reset butonuna basarak tekrar ateşleme yaptırın."] },
  { slug: "buderus-3c", baslik: "Buderus 3C Diferansiyel Basınç Şalteri", marka: "Buderus", aciklama: "Fan motoru veya atık gaz tahliye hattındaki basınç dengesizliği.", kontroller: ["Baca borusunun çıkış ağzında tıkanıklık veya buzlanma var mı bakın.", "Cihazı resetleyin.", "Fan motoru çalışmıyorsa uzman teknisyen müdahalesi gerekir."] },
  { slug: "alarko-f4", baslik: "Alarko Kombi F4 Ateşleme Hatası", marka: "Alarko", aciklama: "Gaz yokluğu veya ateşleme elektrotlarının yıpranması durumu.", kontroller: ["Gaz sayacınızın vanasını ve kombi vanasını kontrol edin.", "Kombiyi 3 kez resetleyin.", "Sorun devam ederse iyonizasyon elektrodu temizliği gereklidir."] },
  { slug: "ferroli-a01", baslik: "Ferroli A01 Brülör Ateşleme Kilitlenmesi", marka: "Ferroli", aciklama: "Gaz valfi bobini veya elektrot sinyal kesintisi nedeniyle kilitlenme.", kontroller: ["Kombiye gaz geldiğinden emin olun.", "Reset tuşuna 1 saniye basıp bırakın.", "Baca ek yerlerinin tam oturduğunu gözle kontrol edin."] },
  { slug: "e08-f08", baslik: "Çamaşır Makinesi Isıtıcı (NTC) Arızası", marka: "Çamaşır Makinesi", aciklama: "Rezistansın suyu ısıtamaması veya sıcaklık sensörü iletişim hatası.", kontroller: ["Programı iptal edip soğuk su programında çalıştırmayı deneyin.", "Kireçlenme rezistansı patlatmış olabilir, makineyi dinlendirin.", "Gider hortumunun doğru yükseklikte takılı olduğunu teyit edin."] },
  { slug: "e18-f18", baslik: "Çamaşır Makinesi Pompa / Tahliye Hatası", marka: "Çamaşır Makinesi", aciklama: "Kazan içerisindeki kirli suyun tahliye edilememesi durumu.", kontroller: ["Sağ alt köşedeki pompa kapağını açıp yabancı cisimleri (bozuk para, toka) temizleyin.", "Gider hortumunun bükülmediğinden emin olun.", "Filtreyi yerine tam sıkı şekilde geri takın."] },
  { slug: "bosch-e23", baslik: "Bosch Çamaşır Makinesi E23 Su Taşma Uyarısı", marka: "Bosch", aciklama: "Taban tepsisinde su birikmesi sonucu Aquastop emniyetinin devreye girmesi.", kontroller: ["Makinenin elektrik fişini güvenlik için hemen prizden çekin.", "Musluğu kapatın.", "Cihazı hafifçe öne doğru eğerek alt haznedeki suyun akmasını sağlayın."] },
  { slug: "samsung-3e", baslik: "Samsung Makine 3E / 3C Motor Sürüş Hatası", marka: "Samsung", aciklama: "Motor takometresi veya sürücü inverter kartının sinyal alamaması.", kontroller: ["Makineye aşırı çamaşır yüklenip yüklenmediğini kontrol edin.", "Kazan elle çevrildiğinde serbest dönüyor mu bakın.", "Fişi çekip 10 dakika beklettikten sonra tekrar çalıştırın."] },
  { slug: "samsung-4c-4e", baslik: "Samsung Çamaşır Makinesi 4C / 4E Su Besleme", marka: "Samsung", aciklama: "Makineye yeterli debide su girişinin gerçekleşmemesi problemi.", kontroller: ["Şebeke suyunun kesik olmadığını teyit edin.", "Su giriş hortumunun musluğunu sonuna kadar açın.", "Hortumun makine girişindeki küçük filtre ızgarasını temizleyin."] },
  { slug: "arcelik-e01-kapi", baslik: "Arçelik E01 Kapak Kilit Arızası", marka: "Arçelik", aciklama: "Kapak emniyet kilidinin kapanmaması veya anakartın sinyali okuyamaması.", kontroller: ["Kapağı sertçe kapatarak 'klik' sesini duymaya çalışın.", "Kapak mandalının kırık veya gevşek olmadığını kontrol edin.", "Programı sıfırlayıp yeniden başlatın."] },
  { slug: "e15", baslik: "Bulaşık Makinesi E15 Taban Sızıntısı", marka: "Bulaşık Makinesi", aciklama: "Tabandaki şamandıra sensörünün su algılayarak sistemi emniyete alması.", kontroller: ["Cihazın fişini çekin ve su musluğunu kapatın.", "Makineyi 45 derece öne doğru eğerek altındaki suyu boşaltın.", "İç hazneye fazla köpüren deterjan konulup konulmadığını inceleyin."] },
  { slug: "bosch-e09", baslik: "Bosch Bulaşık Makinesi E09 Isıtma Hatası", marka: "Bosch", aciklama: "Isıtıcı pompa rezistansının devre dışı kalması ve suların soğuk kalması.", kontroller: ["Program bittiğinde makine içinin ılık olup olmadığını kontrol edin.", "Su giriş filtresinin temiz olduğunu doğrulayın.", "Rezistans arızası durumunda servis değişimi gerekebilir."] },
  { slug: "beko-e02-bulasik", baslik: "Beko Bulaşık Makinesi E02 Su Giriş Hatası", marka: "Beko", aciklama: "Ventil arızası veya şebeke basınç düşüklüğü nedeniyle su alınamaması.", kontroller: ["Giriş musluğunun açık olduğunu kontrol edin.", "Giriş hortumundaki su kesme ventiline elektrik gelip gelmediğine bakın.", "Hortumu söküp ucundaki filtreyi diş fırçasıyla temizleyin."] },
  { slug: "kurutma-filtre", baslik: "Kurutma Makinesi Filtre / Kondenser Uyarısı", marka: "Kurutma Makinesi", aciklama: "Hava sirkülasyon kanallarının tiftik ve tozla tıkanması uyarısı.", kontroller: ["Kapak altındaki lif filtresini ılık suyla yıkayıp kurutun.", "Alt kısımdaki kondenser kapağını açıp metal kanatları süpürgeyle çekin.", "Su tankını tamamen boşaltıp yerine oturtun."] },
  { slug: "robot-lds", baslik: "Robot Süpürge LDS Lidar Sensör Sıkışması", marka: "Robot Süpürge", aciklama: "Üst lazer kulesinin dönmesini engelleyen toz veya cisim sıkışması.", kontroller: ["Lazer kulesini parmağınızla hafifçe sağa sola manuel çevirin.", "İçine saç veya toz kaçmışsa basınçlı hava veya fönle temizleyin.", "Sensör aynalarını temiz kuru bir bezle silin."] },
  { slug: "robot-error2-bumper", baslik: "Robot Süpürge Tampon (Bumper) Sıkışması", marka: "Robot Süpürge", aciklama: "Ön darbe emici tamponun basılı kalması ve serbest kalamaması.", kontroller: ["Ön tampona birkaç kez hafifçe elinizle tıklatarak yaylanmasını sağlayın.", "Tampon kenarlarına sıkışmış kürdan, oyuncak vb. var mı bakın.", "Sensör boşluklarını temizleyin."] },
  { slug: "airfryer-e1-e2", baslik: "Airfryer E1 / E2 Sensör Hatası", marka: "Airfryer", aciklama: "Sıcaklık termokupl sensöründe kısa devre veya temassızlık uyarısı.", kontroller: ["Hazneyi çıkarıp tam oturduğundan emin olun.", "Cihazın fişini çekip 15 dakika soğumasını bekleyin.", "Rezistans etrafında aşırı yağ birikintisi varsa temizleyin."] },
  { slug: "philips-pot-hatasi", baslik: "Philips Airfryer Hazne Tanınmadı Uyarısı", marka: "Philips", aciklama: "İç hazne switch sensörünün yerine oturmadığını bildirmesi.", kontroller: ["Çekmeceyi çıkarıp tabanındaki tırnağın kırık olmadığını kontrol edin.", "İç gövdedeki mikrosviç boşluğunu yumuşak bir bezle silin.", "Hazneyi düzgünce yerine itin."] },
  { slug: "buzdolabi-unlem", baslik: "Buzdolabı Kırmızı Ünlem / Sıcaklık Uyarısı", marka: "Buzdolabı", aciklama: "Dondurucu veya soğutucu bölme sıcaklığının güvenli sınırın üstüne çıkması.", kontroller: ["Kapakların tam kapandığını ve lastiklerin ezilmediğini kontrol edin.", "Arka havalandırma ızgaralarının duvara çok yapışık olmadığını teyit edin.", "Elektrik kesintisi sonrası ise 6-8 saat dolabın soğumasını bekleyin."] },
  { slug: "samsung-22e", baslik: "Samsung Buzdolabı 22E Fan Motor Hatası", marka: "Samsung", aciklama: "Dondurucu bölme evaporatör fan motorunun dönmemesi veya buz tutması.", kontroller: ["Dolabın arka panelinde buzlanma sesi veya tıkırtı var mı dinleyin.", "Cihazı kapatıp içindeki gıdaları alarak 24 saat kapağı açık dinlendirin.", "Gider borusunun tıkalı olup olmadığını kontrol edin."] },
  { slug: "termosifon-salter", baslik: "Termosifon Şalter Attırıyor Sorunu", marka: "Termosifon", aciklama: "Rezistans gövdesinin delinmesi ve suya faz kaçağı yapması.", kontroller: ["Güvenliğiniz için sigortayı kesinlikle zorla kaldırmayın.", "Cihazın elektrik kablosunda yanık veya erime olup olmadığına bakın.", "Rezistans delinmiş olabileceğinden doğrudan teknik servise başvurun."] },
  { slug: "termosifon-damlatma", baslik: "Termosifon Emniyet Ventili Damlatması", marka: "Termosifon", aciklama: "Kazan basıncının 8-9 bar üstüne çıkmasıyla emniyet ventilinin açılması.", kontroller: ["Damlatmanın aşırı ısınma sırasında normal olduğunu bilin.", "Daire su basıncı çok yüksekse regülatör taktırın.", "Ventilin altına tahliye hortumu takıp gidere yönlendirin."] },
  { slug: "ch05-e1", baslik: "Klima CH05 / E1 İletişim Hatası", marka: "İnverter Klima", aciklama: "İç ünite ile dış ünite arasındaki veri haberleşme kablosunun kopması.", kontroller: ["Klimanın sigortasını kapatıp 5 dakika bekledikten sonra açın.", "Dış üniteye giden ara bağlantı kablosunda ezilme var mı bakın.", "Klimanın kumandasından kapatıp tekrar açmayı deneyin."] },
  { slug: "arcelik-ch02", baslik: "Arçelik Klima CH02 İç Oda Sensör Hatası", marka: "Arçelik", aciklama: "İç ünitedeki oda sıcaklık termistörünün doğru değer okuyamaması.", kontroller: ["Ön filtreleri çıkarıp tozdan arındırın ve yıkayıp kurutun.", "Sensör ucunun filtreye temas etmediğini gözlemleyin.", "Cihazı resetleyin."] },
  { slug: "lg-ch01", baslik: "LG Klima CH01 İç Ünite Hava Sensörü", marka: "LG", aciklama: "İç ünite hava emiş sıcaklık sensörünün açık veya kısa devre olması.", kontroller: ["İç kapağı açıp toz filtrelerini temizleyin.", "Klimayı kumandadan kapatıp ana şalteri indirip kaldırın.", "Sorun geçmezse sensör soketi kontrol edilmelidir."] },
  { slug: "u4-a6", baslik: "Daikin Klima U4 Haberleşme / A6 Fan Motoru", marka: "Daikin", aciklama: "Dış ünite PCB kartı haberleşme hatası veya fan motor kilitlenmesi.", kontroller: ["Dış ünitenin önünde hava akışını kesen engel olmadığından emin olun.", "Klimayı sigortasından kapatıp 10 dakika bekleyin.", "Kart arızası ihtimaline karşı yetkili servisi bilgilendirin."] },
  { slug: "mitsubishi-e6", baslik: "Mitsubishi Klima E6 İç/Dış Haberleşme", marka: "Mitsubishi", aciklama: "Sinyal kablolarındaki voltaj dalgalanması veya dış ünite kart arızası.", kontroller: ["Daire ana voltajında dengesizlik olup olmadığını teyit edin.", "Klimayı kumandadan resetleyin.", "Dış ünite sigortasını kontrol edin."] }
];

const sablon = (ariza) => `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${ariza.baslik} - Çözümü ve Tamir Rehberi</title>
  <meta name="description" content="${ariza.aciklama} Servis çağırmadan önce yapılması gereken kontroller ve tahmini maliyet analizi.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://ariza-rehberi.vercel.app/ariza/${ariza.slug}">
  
  <!-- Yapısal Veri (HowTo Schema) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "${ariza.baslik}",
    "description": "${ariza.aciklama}",
    "step": [
      ${ariza.kontroller.map((k, i) => `{
        "@type": "HowToStep",
        "position": ${i + 1},
        "name": "Adım ${i + 1}",
        "text": "${k}"
      }`).join(',\n      ')}
    ]
  }
  </script>

  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 2rem 1rem; }
    .card { max-width: 760px; margin: 0 auto; background: #1e293b; padding: 2.2rem; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.4); border: 1px solid #334155; }
    .badge { display: inline-block; background: #2563eb; color: #fff; padding: 0.3rem 0.8rem; border-radius: 999px; font-size: 0.8rem; font-weight: 600; margin-bottom: 1rem; }
    h1 { font-size: 1.6rem; color: #60a5fa; margin-top: 0; line-height: 1.3; }
    p.desc { color: #94a3b8; font-size: 0.95rem; margin-bottom: 1.8rem; }
    .steps-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
    .step-item { background: #0f172a; padding: 1rem 1.2rem; border-radius: 10px; margin-bottom: 0.8rem; border-left: 4px solid #38bdf8; display: flex; gap: 1rem; align-items: flex-start; }
    .step-num { background: #2563eb; color: #fff; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: bold; flex-shrink: 0; }
    .step-text { font-size: 0.95rem; color: #e2e8f0; line-height: 1.5; }
    
    /* AdSense İçerik Zenginleştirme Bölümü */
    .article-section { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #334155; }
    .article-section h2 { font-size: 1.15rem; color: #38bdf8; margin-bottom: 0.6rem; }
    .article-section p { font-size: 0.92rem; color: #cbd5e1; line-height: 1.6; margin-bottom: 1rem; }
    
    .btn-group { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 2rem; }
    .btn { display: block; text-align: center; padding: 0.9rem; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 0.95rem; transition: 0.2s; }
    .btn-primary { background: #2563eb; color: #fff; }
    .btn-primary:hover { background: #1d4ed8; }
    .btn-secondary { background: #334155; color: #cbd5e1; }
    .btn-secondary:hover { background: #475569; }
    
    /* Yasal Footer */
    footer { max-width: 760px; margin: 2.5rem auto 0; text-align: center; font-size: 0.85rem; color: #64748b; border-top: 1px solid #1e293b; padding-top: 1.2rem; }
    footer a { color: #94a3b8; text-decoration: none; margin: 0 0.5rem; }
    footer a:hover { color: #38bdf8; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">${ariza.marka}</span>
    <h1>${ariza.baslik}</h1>
    <p class="desc">${ariza.aciklama}</p>

    <div class="steps-title">🛠️ Servis Çağırmadan Önce Yapılacak Kontroller:</div>
    ${ariza.kontroller.map((k, i) => `
    <div class="step-item">
      <div class="step-num">${i + 1}</div>
      <div class="step-text">${k}</div>
    </div>`).join('')}

    <!-- AdSense İçerik Alanı -->
    <div class="article-section">
      <h2>Olası Arıza Sebepleri ve Parça İncelemesi</h2>
      <p>Cihazınızın ekranda <strong>${ariza.baslik}</strong> uyarısı vermesi, genellikle güvenlik sensörlerinin veya mekanik parçaların çalışma limitleri dışına çıktığını gösterir. Kullanıcı olarak yukarıda belirtilen ilk müdahale adımlarını denemenize rağmen sorun düzelmiyorsa; sistem kontrol kartı, debimetre, sensör veya tahliye mekanizmalarında aşınma meydana gelmiş olabilir.</p>

      <h2>Teknik Servis Çağırmadan Önce Bilmeniz Gerekenler</h2>
      <p>Modern elektronik cihazlar kendilerini korumak için hata moduna geçer. Kendi başınıza cihaz gövdesini açarak elektrik veya gaz bağlantılarına müdahale etmeniz ciddi güvenlik riskleri doğurabilir. Eğer resetleme ve temel vana/filtre kontrolleri sonuca ulaştırmadıysa, cihazı enerji hattından kapatarak marka yetkili servisine arıza kodunu bildirmeniz en sağlıklı yoldur.</p>
    </div>

    <div class="btn-group">
      <a href="/?ariza=${encodeURIComponent(ariza.baslik)}" class="btn btn-primary">🤖 Yapay Zeka Usta ile Detaylı Çöz / Bütçe Hesapla</a>
      <a href="/" class="btn btn-secondary">← Tüm Arıza Kodları Listesine Dön</a>
    </div>
  </div>

  <footer>
    <p>© 2026 Arıza Rehberi - Tüm Hakları Saklıdır.</p>
    <p>
      <a href="/gizlilik-kosullar.html">Gizlilik Politikası</a> • 
      <a href="/gizlilik-kosullar.html">Kullanım Koşulları</a> • 
      <a href="/gizlilik-kosullar.html">İletişim</a>
    </p>
  </footer>
</body>
</html>`;

// Klasörü oluştur ve sayfaları bas
const hedefKlasor = path.join(__dirname, 'ariza');
if (!fs.existsSync(hedefKlasor)) {
  fs.mkdirSync(hedefKlasor, { recursive: true });
}

arizalar.forEach(ariza => {
  const dosyaAdi = path.join(hedefKlasor, `${ariza.slug}.html`);
  fs.writeFileSync(dosyaAdi, sablon(ariza), 'utf8');
});

console.log(`✅ AdSense uyumlu ${arizalar.length} sayfa başarıyla güncellendi!`);