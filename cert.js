/* ISO/IEC 27001:2022 İç Denetçi Eğitimi – sertifika motoru
   Kayıtlar data.js içinde AES-GCM ile şifrelidir. Ad, yalnızca katılımcının kişisel koduyla çözülür. */
(function () {
  const SITE = 'https://ctaner.github.io/iso27001-ic-denetci-sertifika/';
  const COURSE = 'ISO/IEC 27001:2022 İç Denetçi Eğitimi';
  const ISSUER = 'Cemal Taner';
  const DATES = '14.11.2026 – 15.11.2026';
  const ISSUED = '23.11.2026';
  const enc = new TextEncoder();

  const TYPES = {
    K: {
      key: 'K', title: 'KATILIM SERTİFİKASI', short: 'Katılım Sertifikası',
      body: n => `${ISSUER} tarafından ${DATES} tarihlerinde düzenlenen 2 gün (12 saat canlı çevrim içi) süreli eğitime katıldığını belgelemek üzere verilmiştir.`,
      accent: '#1F3864'
    },
    B: {
      key: 'B', title: 'BAŞARI SERTİFİKASI', short: 'Başarı Sertifikası',
      body: n => `${ISSUER} tarafından ${DATES} tarihlerinde düzenlenen 2 gün (12 saat canlı çevrim içi) süreli eğitimi başarıyla tamamlayan ve eğitimin başarı ölçütlerini sağlayan katılımcıya verilmiştir.`,
      accent: '#9C7A2B'
    }
  };

  function normCode(v) {
    v = (v || '').toUpperCase().replace(/\s+/g, '');
    const m = v.match(/CT-IDE-2026-[KB]-([A-Z0-9]{8})/);
    if (m) return m[1];
    v = v.replace(/[^A-Z0-9]/g, '');
    return v.length >= 8 ? v.slice(-8) : v;
  }
  function typeFromNo(v) {
    const m = (v || '').toUpperCase().match(/CT-IDE-2026-([KB])-/);
    return m ? m[1] : null;
  }
  const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const hex = buf => Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('');

  async function lookup(code) {
    if (!/^[A-Z0-9]{8}$/.test(code)) return null;
    const h = hex(await crypto.subtle.digest('SHA-256', enc.encode('id:' + code)));
    const rec = (window.CERTS || []).find(r => r.h === h);
    if (!rec) return null;
    const km = await crypto.subtle.importKey('raw', enc.encode(code), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: enc.encode('CT-IDE-2026'), iterations: 150000, hash: 'SHA-256' },
      km, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(rec.iv) }, key, b64(rec.ct));
    const d = JSON.parse(new TextDecoder().decode(pt));
    return { name: d.n, code };
  }

  const certNo = (t, code) => `CT-IDE-2026-${t}-${code}`;
  const verifyUrl = (t, code) => `${SITE}dogrula.html?no=${certNo(t, code)}`;

  function wrap(ctx, text, x, y, maxW, lh) {
    const words = text.split(' ');
    let line = '', lines = [];
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
    }
    if (line) lines.push(line);
    lines.forEach((l, i) => ctx.fillText(l, x, y + i * lh));
    return y + lines.length * lh;
  }

  async function fontsReady() {
    try {
      await Promise.all([
        document.fonts.load('italic 600 120px "Playfair Display"'),
        document.fonts.load('700 80px "Playfair Display"'),
        document.fonts.load('400 40px "Source Sans 3"'),
        document.fonts.load('600 40px "Source Sans 3"')
      ]);
    } catch (e) { /* yedek yazı tipleriyle devam */ }
  }

  // A4 yatay, 2339 x 1654 px (~200 dpi)
  async function draw(canvas, t, person) {
    await fontsReady();
    const T = TYPES[t], W = 2339, H = 1654;
    canvas.width = W; canvas.height = H;
    const c = canvas.getContext('2d');
    const navy = '#1F3864', gold = '#B8963E', ink = '#1E2430', muted = '#5B6475';
    const SANS = '"Source Sans 3", "Segoe UI", Arial, sans-serif';
    const SERIF = '"Playfair Display", Georgia, "Times New Roman", serif';

    c.fillStyle = '#FFFDF8'; c.fillRect(0, 0, W, H);
    // hafif filigran deseni
    c.save(); c.globalAlpha = 0.035; c.strokeStyle = navy; c.lineWidth = 2;
    for (let r = 140; r < 1400; r += 70) { c.beginPath(); c.arc(W / 2, H / 2 + 60, r, 0, Math.PI * 2); c.stroke(); }
    c.restore();
    // çerçeveler
    c.fillStyle = navy; c.fillRect(0, 0, W, 28); c.fillRect(0, H - 28, W, 28); c.fillRect(0, 0, 28, H); c.fillRect(W - 28, 0, 28, H);
    c.strokeStyle = gold; c.lineWidth = 5; c.strokeRect(62, 62, W - 124, H - 124);
    c.lineWidth = 1.5; c.strokeRect(80, 80, W - 160, H - 160);
    // köşe süsleri
    c.fillStyle = gold;
    [[80, 80], [W - 80, 80], [80, H - 80], [W - 80, H - 80]].forEach(([x, y]) => {
      c.save(); c.translate(x, y); c.rotate(Math.PI / 4); c.fillRect(-14, -14, 28, 28); c.restore();
    });

    c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    // monogram
    c.beginPath(); c.arc(W / 2, 205, 62, 0, Math.PI * 2); c.fillStyle = navy; c.fill();
    c.lineWidth = 4; c.strokeStyle = gold; c.beginPath(); c.arc(W / 2, 205, 72, 0, Math.PI * 2); c.stroke();
    c.fillStyle = '#fff'; c.font = `700 62px ${SERIF}`; c.fillText('CT', W / 2, 227);
    c.fillStyle = muted; c.font = `600 34px ${SANS}`;
    c.fillText('C E M A L   T A N E R   •   E Ğ İ T İ M', W / 2, 330);

    c.fillStyle = T.accent; c.font = `700 104px ${SERIF}`; c.fillText(T.title, W / 2, 470);
    c.fillStyle = gold; c.fillRect(W / 2 - 160, 502, 320, 5);
    c.fillStyle = navy; c.font = `600 52px ${SANS}`; c.fillText(COURSE, W / 2, 590);

    c.fillStyle = muted; c.font = `400 38px ${SANS}`; c.fillText('Bu sertifika', W / 2, 680);
    // ad
    let size = 128; c.font = `italic 600 ${size}px ${SERIF}`;
    while (c.measureText(person.name).width > 1500 && size > 70) { size -= 4; c.font = `italic 600 ${size}px ${SERIF}`; }
    c.fillStyle = ink; c.fillText(person.name, W / 2, 815);
    c.strokeStyle = gold; c.lineWidth = 2.5; c.beginPath(); c.moveTo(W / 2 - 620, 850); c.lineTo(W / 2 + 620, 850); c.stroke();

    c.fillStyle = ink; c.font = `400 42px ${SANS}`;
    let y = wrap(c, T.body(person.name), W / 2, 935, 1640, 60);
    c.fillStyle = muted; c.font = `400 31px ${SANS}`;
    wrap(c, 'Eğitim içeriği: ISO/IEC 27001:2022 şartları ve Ek-A kontrolleri • ISO 19011:2026 denetim prensipleri • İç denetimin planlanması, yürütülmesi ve raporlanması • Bulgu yazma ve düzeltici faaliyet takibi', W / 2, y + 30, 1700, 46);

    // alt bölüm
    const by = 1325;
    // sol: bilgiler
    c.textAlign = 'left'; c.fillStyle = muted; c.font = `600 30px ${SANS}`;
    c.fillText('Sertifika No', 210, by - 60); c.fillText('Düzenlenme Tarihi', 210, by + 40);
    c.fillStyle = ink; c.font = `600 36px ${SANS}`;
    c.fillText(certNo(t, person.code), 210, by - 15); c.fillText(ISSUED, 210, by + 85);
    // orta: mühür
    const sx = W / 2, sy = by + 5;
    c.textAlign = 'center';
    c.beginPath(); c.arc(sx, sy, 112, 0, Math.PI * 2); c.fillStyle = T.accent; c.fill();
    c.lineWidth = 4; c.strokeStyle = '#fff'; c.beginPath(); c.arc(sx, sy, 96, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 3; c.strokeStyle = gold; c.beginPath(); c.arc(sx, sy, 124, 0, Math.PI * 2); c.stroke();
    c.fillStyle = '#fff'; c.font = `700 30px ${SANS}`; c.fillText('ISO/IEC', sx, sy - 34);
    c.font = `700 52px ${SERIF}`; c.fillText('27001', sx, sy + 18);
    c.font = `600 24px ${SANS}`; c.fillText(t === 'B' ? 'BAŞARI' : 'KATILIM', sx, sy + 56);
    // sağ: imza
    const rx = W - 520;
    c.strokeStyle = ink; c.lineWidth = 2; c.beginPath(); c.moveTo(rx - 250, by + 2); c.lineTo(rx + 250, by + 2); c.stroke();
    c.fillStyle = navy; c.font = `italic 600 60px ${SERIF}`; c.fillText('Cemal Taner', rx, by - 20);
    c.fillStyle = ink; c.font = `600 34px ${SANS}`; c.fillText('Cemal Taner', rx, by + 50);
    c.fillStyle = muted; c.font = `400 27px ${SANS}`;
    c.fillText('Eğitmen • Bilgi Güvenliği Danışmanı', rx, by + 90);
    c.fillText('ISO/IEC 27001 Denetçisi', rx, by + 124);

    // altbilgi
    c.fillStyle = muted; c.font = `400 24px ${SANS}`;
    c.fillText('Doğrulama: ' + verifyUrl(t, person.code).replace('https://', '') + '   •   www.cemaltaner.com.tr', W / 2, H - 104);
    return canvas;
  }

  function fileBase(t, person) {
    const tr = { 'ı': 'i', 'İ': 'I', 'ş': 's', 'Ş': 'S', 'ğ': 'g', 'Ğ': 'G', 'ü': 'u', 'Ü': 'U', 'ö': 'o', 'Ö': 'O', 'ç': 'c', 'Ç': 'C' };
    const n = person.name.replace(/[ıİşŞğĞüÜöÖçÇ]/g, ch => tr[ch]).replace(/[^A-Za-z0-9]+/g, '_');
    return `ISO27001_Ic_Denetci_${t === 'B' ? 'Basari' : 'Katilim'}_Sertifikasi_${n}`;
  }
  function downloadPng(canvas, t, person) {
    canvas.toBlob(b => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(b); a.download = fileBase(t, person) + '.png';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }, 'image/png');
  }
  function downloadPdf(canvas, t, person) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    pdf.setProperties({ title: `${TYPES[t].short} – ${person.name}`, subject: COURSE, author: ISSUER, creator: 'cemaltaner.com.tr' });
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 297, 210);
    pdf.link(0, 195, 297, 15, { url: verifyUrl(t, person.code) });
    pdf.save(fileBase(t, person) + '.pdf');
  }
  function linkedinAdd(t, person) {
    const p = new URLSearchParams({
      startTask: 'CERTIFICATION_NAME',
      name: `${COURSE} – ${TYPES[t].short}`,
      organizationName: 'Cemal Taner',
      issueYear: '2026', issueMonth: '11',
      certUrl: verifyUrl(t, person.code),
      certId: certNo(t, person.code)
    });
    return 'https://www.linkedin.com/profile/add?' + p.toString();
  }
  function linkedinShare(t, person) {
    return 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(verifyUrl(t, person.code));
  }
  function postText(t, person) {
    return `${COURSE} programını tamamlayarak ${TYPES[t].short.toLowerCase()} almaya hak kazandım. 🎓\n\n` +
      `14–15 Kasım 2026 tarihlerinde Cemal Taner ile ISO/IEC 27001:2022 şartlarını, Ek-A kontrollerini ve ISO 19011:2026'ya göre iç denetimin planlanması, yürütülmesi ve raporlanmasını uygulamalı olarak çalıştık.\n\n` +
      `Sertifika doğrulama: ${verifyUrl(t, person.code)}\n\n#ISO27001 #BilgiGüvenliği #İçDenetim #BGYS #ISO19011`;
  }

  window.CT = { TYPES, normCode, typeFromNo, lookup, draw, downloadPng, downloadPdf, linkedinAdd, linkedinShare, postText, certNo, verifyUrl, COURSE };
})();
