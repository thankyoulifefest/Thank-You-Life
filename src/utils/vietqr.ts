import QRCode from 'qrcode';
import { ASSETS, FESTIVAL_INFO, OFFICIAL_BANK, type LetterLanguage } from '../data/festivalData';

export function removeVietnameseDiacritics(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tlv(tag: string, value: string): string {
  const len = String(value.length).padStart(2, '0');
  return `${tag}${len}${value}`;
}

export function crc16CcittFalse(input: string): string {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i += 1) {
    crc ^= input.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j += 1) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function formatTransferMemo(donorName: string, refCode: string): string {
  const cleanName = removeVietnameseDiacritics(donorName).toUpperCase();
  const shortName = cleanName ? cleanName.slice(0, 22).trim() : 'BAN DONG HANH';
  const cleanRef = removeVietnameseDiacritics(refCode).toUpperCase();
  const memo = `TYLF2026 ${shortName} ${cleanRef}`.trim();
  return memo.slice(0, 50);
}

export function buildVietQrPayload(options: {
  amount?: number;
  memo?: string;
}): string {
  const amount = options.amount && options.amount > 0 ? Math.round(options.amount) : 0;
  const memo = options.memo ? removeVietnameseDiacritics(options.memo).slice(0, 50) : '';

  const beneficiaryOrg = tlv('00', OFFICIAL_BANK.bankBin) + tlv('01', OFFICIAL_BANK.accountNumber);
  const merchantAccountInfo =
    tlv('00', 'A000000727') +
    tlv('01', beneficiaryOrg) +
    tlv('02', 'QRIBFTTA');

  let payload = '';
  payload += tlv('00', '01');
  payload += tlv('01', amount > 0 ? '12' : '11');
  payload += tlv('38', merchantAccountInfo);
  payload += tlv('53', '704');
  if (amount > 0) {
    payload += tlv('54', String(amount));
  }
  payload += tlv('58', 'VN');

  if (memo) {
    const additionalData = tlv('08', memo);
    payload += tlv('62', additionalData);
  }

  payload += '6304';
  const crc = crc16CcittFalse(payload);
  return payload + crc;
}

export function formatVnd(amount: number): string {
  if (!amount || amount <= 0) return 'Tùy hỷ từ trái tim';
  return `${new Intl.NumberFormat('vi-VN').format(Math.round(amount))} VNĐ`;
}

export function composeInvitationLetter(params: {
  senderName: string;
  recipient: string;
  blessing: string;
  amount: number;
  letterLang: LetterLanguage;
  refCode: string;
}): string {
  const sender = params.senderName.trim() || 'Người bạn từ Khu Rừng Phép Màu';
  const recipient = params.recipient.trim() || 'Những người bạn thương mến';
  const blessing = params.blessing.trim();
  const amountText = params.amount > 0 ? formatVnd(params.amount) : 'Tùy hỷ từ trái tim';

  if (params.letterLang === 'en') {
    return [
      `${recipient},`,
      '',
      blessing,
      '',
      `Event: ${FESTIVAL_INFO.name} — "${FESTIVAL_INFO.themeEn}"`,
      `Dates: December 19–20, 2026 (2 Days · 1 Starry Night)`,
      `Venue: Golden Bee Garden (Vườn Ong Vàng), Phu Xuyen, Hanoi`,
      `Admission: 100% Free · Co-Creation & Animal Rescue Goal: 150,000,000 VNĐ`,
      params.amount > 0
        ? `Suggested Angel Contribution: ${amountText} (Ref: ${params.refCode})`
        : `Ref Code: ${params.refCode}`,
      '',
      `With gratitude & smiles,`,
      `${sender}`,
    ].join('\n');
  }

  if (params.letterLang === 'bilingual') {
    return [
      `Thân gửi ${recipient}, / Dear ${recipient},`,
      '',
      blessing,
      '',
      `• Sự kiện / Event: ${FESTIVAL_INFO.name} — ${FESTIVAL_INFO.themeVi} (${FESTIVAL_INFO.themeEn})`,
      `• Thời gian / Dates: 19–20/12/2026 · ${FESTIVAL_INFO.venueVi}`,
      `• Vé vào cửa / Admission: 100% Miễn phí · Quỹ Đồng Kiến Tạo & Cứu Trợ Động Vật: 150.000.000 VNĐ`,
      `• Mã đồng hành / Ref: ${params.refCode}${params.amount > 0 ? ` · ${amountText}` : ''}`,
      '',
      `Thank You Life – I love you All,`,
      `${sender}`,
    ].join('\n');
  }

  return [
    `Thân gửi ${recipient},`,
    '',
    blessing,
    '',
    `Sự kiện: ${FESTIVAL_INFO.name} — "${FESTIVAL_INFO.themeVi}"`,
    `Thời gian: 19–20/12/2026 (2 Ngày 1 Đêm Dưới Bầu Trời Sao)`,
    `Địa điểm: Vườn Ong Vàng, Phú Xuyên, Hà Nội`,
    `Vé vào cửa: 100% Miễn Phí · Quỹ Đồng Kiến Tạo & Cứu Trợ Động Vật: 150.000.000 VNĐ`,
    params.amount > 0
      ? `Hạt mầm đồng hành gợi ý: ${amountText} (Mã: ${params.refCode})`
      : `Mã kết nối: ${params.refCode}`,
    '',
    `Cảm ơn cuộc sống – Yêu thương cho tất cả,`,
    `${sender}`,
  ].join('\n');
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const paragraphs = text.split('\n');
  const lines: string[] = [];

  for (const para of paragraphs) {
    if (!para.trim()) {
      lines.push('');
      continue;
    }
    const words = para.split(' ');
    let currentLine = '';
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
  }
  return lines;
}

function loadImageSafe(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function renderPersonalizedCardPng(params: {
  senderName: string;
  recipient: string;
  letterBody: string;
  amount: number;
  memo: string;
  refCode: string;
  vietQrPayload: string;
}): Promise<string> {
  const width = 1200;
  const height = 1520;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  // Background Ivory Parchment
  ctx.fillStyle = '#FAF8F3';
  ctx.fillRect(0, 0, width, height);

  // Subtle Outer Botanical Border
  ctx.strokeStyle = '#1F4E32';
  ctx.lineWidth = 3;
  ctx.strokeRect(32, 32, width - 64, height - 64);

  ctx.strokeStyle = 'rgba(224, 154, 27, 0.55)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(44, 44, width - 88, height - 88);

  // Top Banner Image Strip
  const [bannerImg, logoImg] = await Promise.all([
    loadImageSafe(ASSETS.banner),
    loadImageSafe(ASSETS.logo),
  ]);

  if (bannerImg) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(56, 56, width - 112, 320);
    ctx.clip();
    const scale = Math.max((width - 112) / bannerImg.width, 320 / bannerImg.height);
    const drawW = bannerImg.width * scale;
    const drawH = bannerImg.height * scale;
    const drawX = 56 + (width - 112 - drawW) / 2;
    const drawY = 56 + (320 - drawH) / 2;
    ctx.drawImage(bannerImg, drawX, drawY, drawW, drawH);

    // Warm dark bottom scrim for crisp title contrast
    const grad = ctx.createLinearGradient(0, 220, 0, 376);
    grad.addColorStop(0, 'rgba(22, 57, 36, 0)');
    grad.addColorStop(1, 'rgba(22, 57, 36, 0.88)');
    ctx.fillStyle = grad;
    ctx.fillRect(56, 220, width - 112, 156);
    ctx.restore();
  } else {
    ctx.fillStyle = '#1F4E32';
    ctx.fillRect(56, 56, width - 112, 320);
  }

  // Logo badge in header
  if (logoImg) {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 3;
    ctx.drawImage(logoImg, 84, 246, 108, 108);
    ctx.restore();
  }

  // Banner overlay title
  ctx.fillStyle = '#FAF8F3';
  ctx.font = 'bold 34px Georgia, serif';
  ctx.fillText('THANK YOU LIFE FEST 2026 · KHU RỪNG CỦA PHÉP MÀU', 216, 306);
  ctx.fillStyle = '#F7D27A';
  ctx.font = '500 20px sans-serif';
  ctx.fillText('19–20/12/2026  ·  Vườn Ong Vàng, Phú Xuyên, Hà Nội  ·  100% Free Admission', 216, 342);

  // Co-created Invitation Letter Container
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(72, 412, width - 144, 520);
  ctx.strokeStyle = 'rgba(31, 78, 50, 0.16)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(72, 412, width - 144, 520);

  ctx.fillStyle = '#1F4E32';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('THƯ MỜI ĐỒNG KIẾN TẠO  ·  PERSONALIZED INVITATION LETTER', 112, 460);

  ctx.strokeStyle = 'rgba(224, 154, 27, 0.45)';
  ctx.beginPath();
  ctx.moveTo(112, 476);
  ctx.lineTo(width - 112, 476);
  ctx.stroke();

  ctx.fillStyle = '#1E1C18';
  ctx.font = '22px sans-serif';
  const letterLines = wrapTextLines(ctx, params.letterBody, width - 224).slice(0, 13);
  let y = 520;
  for (const line of letterLines) {
    if (line === '') {
      y += 14;
    } else {
      ctx.fillText(line, 112, y);
      y += 32;
    }
  }

  // Direct Vietnamese Bank VietQR Panel
  ctx.fillStyle = '#EEF3EB';
  ctx.fillRect(72, 964, width - 144, 464);
  ctx.strokeStyle = 'rgba(31, 78, 50, 0.2)';
  ctx.strokeRect(72, 964, width - 144, 464);

  // Render QR onto offscreen canvas
  const qrCanvas = document.createElement('canvas');
  await QRCode.toCanvas(qrCanvas, params.vietQrPayload, {
    width: 340,
    margin: 2,
    color: {
      dark: '#163924',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'M',
  });

  // White QR holder box
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(108, 1004, 368, 384);
  ctx.strokeStyle = 'rgba(31, 78, 50, 0.18)';
  ctx.strokeRect(108, 1004, 368, 384);
  ctx.drawImage(qrCanvas, 122, 1018, 340, 340);

  ctx.fillStyle = '#1F4E32';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('VIETQR · NAPAS 24/7 VERIFIED', 168, 1375);

  // Right column bank verification details
  const rightX = 516;
  ctx.fillStyle = '#2D4F3E';
  ctx.font = 'bold 28px Georgia, serif';
  ctx.fillText('Quỹ TYLF 2026 & Cứu Trợ · 150.000.000 VNĐ', rightX, 1044);

  ctx.fillStyle = '#4B5D4F';
  ctx.font = '19px sans-serif';
  ctx.fillText('Quét bằng bất kỳ ứng dụng Ngân hàng Việt Nam nào (VietQR):', rightX, 1084);

  const infoRows: Array<[string, string]> = [
    ['Ngân hàng / Bank:', OFFICIAL_BANK.bankName],
    ['Số tài khoản / Account:', OFFICIAL_BANK.accountNumber],
    ['Chủ tài khoản / Holder:', OFFICIAL_BANK.accountHolder],
    ['Số tiền / Amount:', params.amount > 0 ? formatVnd(params.amount) : 'Tùy hỷ từ trái tim'],
    ['Nội dung / Memo:', params.memo],
    ['Mã xác nhận / Ref:', params.refCode],
  ];

  let infoY = 1140;
  for (const [label, val] of infoRows) {
    ctx.fillStyle = '#4B5D4F';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(label, rightX, infoY);
    ctx.fillStyle = '#1E1C18';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(val, rightX + 238, infoY);
    infoY += 42;
  }

  ctx.fillStyle = '#1F4E32';
  ctx.font = 'italic 17px sans-serif';
  ctx.fillText('100% minh bạch · Verified official Thank You Life Network account (thankyoulife.net)', rightX, 1396);

  // Footer strip
  ctx.fillStyle = '#4B5D4F';
  ctx.font = '16px sans-serif';
  ctx.fillText(
    `Thank You Life Network · thankyoulifefest@gmail.com · ${FESTIVAL_INFO.officialSite}`,
    72,
    1464
  );

  return canvas.toDataURL('image/png');
}
