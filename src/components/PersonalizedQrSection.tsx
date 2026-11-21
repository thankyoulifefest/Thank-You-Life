import { Check, Copy, Download, ExternalLink, Printer, ShieldCheck } from 'lucide-react';
import QRCode from 'qrcode';
import { useEffect, useMemo, useState } from 'react';
import {
  ASSETS,
  FESTIVAL_INFO,
  OFFICIAL_BANK,
  VIETNAMESE_BANKS,
  type Language,
} from '../data/festivalData';
import {
  buildVietQrPayload,
  formatTransferMemo,
  formatVnd,
  renderPersonalizedCardPng,
} from '../utils/vietqr';
import type { SyncedRegistrationResult } from './RegistrationForm';

interface PersonalizedQrSectionProps {
  lang: Language;
  senderName: string;
  recipient: string;
  composedLetter: string;
  selectedAmount: number;
  selectedBankId: string;
  onSelectBankId: (id: string) => void;
  refCode: string;
  syncResult: SyncedRegistrationResult | null;
}

export function PersonalizedQrSection({
  lang,
  senderName,
  recipient,
  composedLetter,
  selectedAmount,
  selectedBankId,
  onSelectBankId,
  refCode,
  syncResult,
}: PersonalizedQrSectionProps) {
  const isVi = lang === 'vi';
  const [qrSvgMarkup, setQrSvgMarkup] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const activeName = syncResult?.name || senderName || 'Bạn Đồng Hành';
  const activeRef = syncResult?.refCode || refCode;
  const activeBank =
    VIETNAMESE_BANKS.find((b) => b.id === selectedBankId) || VIETNAMESE_BANKS[0];

  const transferMemo = useMemo(
    () => formatTransferMemo(activeName, activeRef),
    [activeName, activeRef]
  );

  const vietQrPayload = useMemo(
    () =>
      buildVietQrPayload({
        amount: selectedAmount,
        memo: transferMemo,
      }),
    [selectedAmount, transferMemo]
  );

  useEffect(() => {
    let cancelled = false;
    QRCode.toString(vietQrPayload, {
      type: 'svg',
      margin: 2,
      width: 260,
      color: {
        dark: '#163924',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
      .then((svg) => {
        if (!cancelled) setQrSvgMarkup(svg);
      })
      .catch(() => {
        if (!cancelled) setQrSvgMarkup('');
      });
    return () => {
      cancelled = true;
    };
  }, [vietQrPayload]);

  const copyValue = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(key);
      setTimeout(() => setCopiedField(null), 1800);
    } catch {
      setCopiedField(null);
    }
  };

  const handleDownloadPng = async () => {
    setDownloading(true);
    try {
      const dataUrl = await renderPersonalizedCardPng({
        senderName: activeName,
        recipient,
        letterBody: composedLetter,
        amount: selectedAmount,
        memo: transferMemo,
        refCode: activeRef,
        vietQrPayload,
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `TYLF2026-Invite-VietQR-${activeRef}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setDownloading(false);
    }
  };

  const fullShareText = `${composedLetter}\n\n---\n${
    isVi ? 'Ủng hộ Quỹ Bảo Trợ Động Vật TYLF 2026 qua VietQR:' : 'Support TYLF 2026 Animal Rescue Fund via VietQR:'
  }\n• ${OFFICIAL_BANK.bankName} · STK: ${OFFICIAL_BANK.accountNumber} · ${OFFICIAL_BANK.accountHolder}\n• ${
    isVi ? 'Số tiền:' : 'Amount:'
  } ${formatVnd(selectedAmount)}\n• ${isVi ? 'Nội dung CK:' : 'Transfer Memo:'} ${transferMemo}`;

  return (
    <section
      id="vietqr-template"
      className="border-b border-[#2D4F3E]/12 watercolor-blossom py-14 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold text-[#C86D51]">
              {isVi
                ? 'Bước 03 · Mẫu Thư Cá Nhân Hóa & Mã VietQR Chính Thức'
                : 'Step 03 · Personalized Template & Official VietQR Card'}
            </p>
            <h2
              className="mt-2 font-display text-2xl font-bold tracking-tight text-[#1E1C18] sm:text-4xl"
              style={{ textWrap: 'balance' }}
            >
              {isVi
                ? 'Thẻ Thư Mời & Chuyển Khoản VietQR Bảo Mật'
                : 'Your Personalized Invitation & Secure VietQR Card'}
            </h2>
            <p className="mt-3 text-base text-[#4B5D4F]">
              {syncResult
                ? isVi
                  ? `Hồ sơ của ${syncResult.name} (${syncResult.refCode}) đã được gắn vào thẻ dưới đây. Bạn có thể quét mã ngay bằng ứng dụng ngân hàng Việt Nam hoặc tải thẻ PNG để gửi mời bạn bè.`
                  : `Registered for ${syncResult.name} (${syncResult.refCode}). Scan directly with any Vietnamese bank app or download the high-res PNG card to invite friends.`
                : isVi
                  ? 'Xem trước thẻ thư mời & mã VietQR chuẩn NAPAS 24/7. Đăng ký ở Bước 02 để lưu hồ sơ đồng bộ Google Form cùng mã tham chiếu cá nhân.'
                  : 'Live NAPAS 24/7 VietQR preview. Complete Step 02 above to sync your personal reference code with the official Google Form ledger.'}
            </p>
          </div>

          <div className="no-print flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={downloading}
              className="inline-flex items-center gap-2 rounded-lg bg-[#E09A1B] px-4 py-2.5 text-xs sm:text-sm font-bold text-[#1E1C18] hover:bg-[#C2800E] hover:text-white transition-colors whitespace-nowrap shrink-0 min-h-[44px]"
            >
              <Download className="h-4 w-4 shrink-0" />
              <span>
                {downloading
                  ? isVi
                    ? 'Đang xuất ảnh PNG...'
                    : 'Rendering PNG...'
                  : isVi
                    ? 'Tải Thẻ PNG (Thư + QR)'
                    : 'Download Card (PNG)'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => copyValue('share', fullShareText)}
              className="inline-flex items-center gap-2 rounded-lg border border-[#1F4E32]/20 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#1F4E32] hover:bg-[#EEF3EB] transition-colors whitespace-nowrap shrink-0 min-h-[44px]"
            >
              {copiedField === 'share' ? (
                <Check className="h-4 w-4 shrink-0" />
              ) : (
                <Copy className="h-4 w-4 shrink-0" />
              )}
              <span>
                {copiedField === 'share'
                  ? isVi
                    ? 'Đã sao chép trọn bộ'
                    : 'Copied package'
                  : isVi
                    ? 'Sao chép Thư & STK'
                    : 'Copy Letter & Bank'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg border border-[#1F4E32]/20 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#4B5D4F] hover:text-[#1F4E32] hover:bg-[#EEF3EB] transition-colors whitespace-nowrap shrink-0 min-h-[44px]"
            >
              <Printer className="h-4 w-4 shrink-0" />
              <span>{isVi ? 'In / Lưu PDF' : 'Print / PDF'}</span>
            </button>
          </div>
        </div>

        {/* Complete Personalized Card Surface */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-[#1F4E32]/20 bg-white">
          {/* Top Banner Visual Strip */}
          <div className="relative h-44 sm:h-56 overflow-hidden bg-[#2D4F3E]">
            <img
              src={ASSETS.pigeonBanner}
              alt="Thank You Life Fest 2026 — Magical messenger pigeons delivering invitation letters across the enchanted garden"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-center opacity-95"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A3327]/90 via-[#1A3327]/40 to-transparent" />
            <div className="absolute inset-x-5 bottom-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full overflow-hidden drop-shadow-md">
                  <img
                    src={ASSETS.logo}
                    alt="TYLF 2026 — Bee Fairy & Honeycomb Oneness Magic Forest Badge"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="text-[#FAF7F0]">
                  <p className="font-display text-lg sm:text-xl font-bold leading-tight">
                    Thank You Life Fest 2026 · {FESTIVAL_INFO.themeVi}
                  </p>
                  <p className="text-xs text-[#F4BE6A]">
                    {FESTIVAL_INFO.dates} · Vườn Ong Vàng, Phú Xuyên, Hà Nội ·{' '}
                    <span className="font-mono">{activeRef}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 2-Column Body: Personalized Letter + VietQR Donation Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left: Co-created Letter + Security Verification */}
            <div className="flex flex-col justify-between border-b border-[#1F4E32]/12 p-6 sm:p-8 lg:col-span-6 lg:border-b-0 lg:border-r">
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-[#1F4E32]/10 pb-3">
                  <h3 className="font-display text-lg font-bold text-[#1F4E32]">
                    {isVi ? 'Thư Mời Cá Nhân Hóa' : 'Personalized Invitation Letter'}
                  </h3>
                  <span className="font-mono text-xs text-[#4B5D4F] tabular-nums">
                    {activeRef}
                  </span>
                </div>

                <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-[#1E1C18]">
                  {composedLetter}
                </div>
              </div>

              {/* Security & Anti-Spoofing Verification Box */}
              <div className="mt-8 rounded-xl border border-[#1F4E32]/15 bg-[#EEF3EB] p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1F4E32]">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>
                    {isVi
                      ? 'Xác Thực Bảo Mật Giao Dịch Ngân Hàng (Chống Giả Mạo QR)'
                      : 'Donor Security & Official Account Verification'}
                  </span>
                </div>
                <ul className="mt-2.5 space-y-1.5 text-xs leading-relaxed text-[#4B5D4F]">
                  <li>
                    1.{' '}
                    {isVi
                      ? 'Kiểm tra app ngân hàng hiển thị đúng Ngân hàng nhận: '
                      : 'Confirm your banking app displays Beneficiary Bank: '}
                    <strong className="text-[#1E1C18]">{OFFICIAL_BANK.bankName}</strong>
                  </li>
                  <li>
                    2.{' '}
                    {isVi ? 'Đúng số tài khoản & chủ tài khoản duy nhất: ' : 'Verify exact account: '}
                    <strong className="font-mono text-[#1E1C18]">
                      {OFFICIAL_BANK.accountNumber} · {OFFICIAL_BANK.accountHolder}
                    </strong>
                  </li>
                  <li>
                    3.{' '}
                    {isVi
                      ? 'Giữ nguyên mã tham chiếu trong nội dung chuyển khoản để đối soát sao kê công khai sau lễ hội.'
                      : 'Keep the pre-filled reference memo for transparent post-festival reconciliation.'}
                  </li>
                </ul>
              </div>
            </div>

            {/* Right: Vietnamese Bank Selector + Crisp EMVCo VietQR Code */}
            <div className="bg-[#FAF8F3]/60 p-6 sm:p-8 lg:col-span-6">
              {/* Bank App Selector */}
              <div className="no-print mb-5">
                <label
                  htmlFor="qr-bank-selector"
                  className="block text-xs font-semibold text-[#1F4E32]"
                >
                  {isVi
                    ? 'Chọn ngân hàng Việt Nam bạn đang dùng để xem hướng dẫn quét'
                    : 'Select your Vietnamese bank app for tailored scan instructions'}
                </label>
                <select
                  id="qr-bank-selector"
                  value={selectedBankId}
                  onChange={(e) => onSelectBankId(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[#1F4E32]/20 bg-white px-3.5 py-2.5 text-sm font-medium text-[#1E1C18] focus:border-[#1F4E32] focus:outline-none min-h-[44px]"
                >
                  {VIETNAMESE_BANKS.map((bank) => (
                    <option key={bank.id} value={bank.id}>
                      {bank.name} ({bank.appName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                {/* Scannable QR Box */}
                <div className="shrink-0 rounded-xl border border-[#1F4E32]/20 bg-white p-3.5 text-center">
                  {qrSvgMarkup ? (
                    <div
                      className="h-52 w-52 sm:h-56 sm:w-56 [&>svg]:h-full [&>svg]:w-full"
                      aria-label={`VietQR code for ${OFFICIAL_BANK.bankName} account ${OFFICIAL_BANK.accountNumber}`}
                      dangerouslySetInnerHTML={{ __html: qrSvgMarkup }}
                    />
                  ) : (
                    <div className="flex h-52 w-52 items-center justify-center bg-[#EEF3EB] text-xs text-[#4B5D4F]">
                      Generating VietQR...
                    </div>
                  )}
                  <p className="mt-2 font-mono text-[11px] font-semibold text-[#1F4E32]">
                    VIETQR · NAPAS 24/7
                  </p>
                </div>

                {/* Copyable Bank Fields */}
                <div className="w-full flex-1 space-y-3">
                  <div className="rounded-lg border border-[#1F4E32]/14 bg-white p-3">
                    <p className="text-[11px] font-medium text-[#4B5D4F]">
                      {isVi ? 'Ngân hàng thụ hưởng chính thức' : 'Verified Beneficiary Bank'}
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-[#1E1C18]">
                      {OFFICIAL_BANK.bankFullName}
                    </p>
                    <p className="text-xs font-semibold text-[#1F4E32]">
                      {OFFICIAL_BANK.accountHolder} ({OFFICIAL_BANK.accountHolderDisplay})
                    </p>
                  </div>

                  {/* Account Number */}
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-[#1F4E32]/14 bg-white p-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-[#4B5D4F]">
                        {isVi ? 'Số tài khoản (STK)' : 'Account Number'}
                      </p>
                      <p className="font-mono text-base font-bold text-[#1E1C18] tabular-nums">
                        {OFFICIAL_BANK.accountNumber}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyValue('stk', OFFICIAL_BANK.accountNumber)}
                      className="inline-flex items-center gap-1 rounded-md border border-[#1F4E32]/20 bg-[#FAF8F3] px-2.5 py-1.5 text-xs font-semibold text-[#1F4E32] hover:bg-[#EEF3EB] whitespace-nowrap shrink-0 min-h-[36px]"
                    >
                      {copiedField === 'stk' ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      <span>{copiedField === 'stk' ? (isVi ? 'Đã chép' : 'Copied') : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-[#1F4E32]/14 bg-white p-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-[#4B5D4F]">
                        {isVi ? 'Số tiền đóng góp' : 'Donation Amount'}
                      </p>
                      <p className="font-mono text-sm font-bold text-[#C2800E] tabular-nums">
                        {formatVnd(selectedAmount)}
                      </p>
                    </div>
                    {selectedAmount > 0 && (
                      <button
                        type="button"
                        onClick={() => copyValue('amt', String(selectedAmount))}
                        className="inline-flex items-center gap-1 rounded-md border border-[#1F4E32]/20 bg-[#FAF8F3] px-2.5 py-1.5 text-xs font-semibold text-[#1F4E32] hover:bg-[#EEF3EB] whitespace-nowrap shrink-0 min-h-[36px]"
                      >
                        {copiedField === 'amt' ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        <span>{copiedField === 'amt' ? (isVi ? 'Đã chép' : 'Copied') : 'Copy'}</span>
                      </button>
                    )}
                  </div>

                  {/* Transfer Memo */}
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-[#1F4E32]/14 bg-white p-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-[#4B5D4F]">
                        {isVi ? 'Nội dung chuyển khoản' : 'Transfer Memo'}
                      </p>
                      <p className="truncate font-mono text-xs font-semibold text-[#1E1C18]">
                        {transferMemo}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyValue('memo', transferMemo)}
                      className="inline-flex items-center gap-1 rounded-md border border-[#1F4E32]/20 bg-[#FAF8F3] px-2.5 py-1.5 text-xs font-semibold text-[#1F4E32] hover:bg-[#EEF3EB] whitespace-nowrap shrink-0 min-h-[36px]"
                    >
                      {copiedField === 'memo' ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      <span>{copiedField === 'memo' ? (isVi ? 'Đã chép' : 'Copied') : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tailored Bank Instructions & International Fallback */}
              <div className="mt-5 rounded-xl border border-[#1F4E32]/12 bg-white p-4 text-xs leading-relaxed text-[#4B5D4F]">
                <p>
                  <strong className="text-[#1E1C18]">
                    {isVi
                      ? `Hướng dẫn nhanh trên ${activeBank.appName}: `
                      : `Quick guide on ${activeBank.appName}: `}
                  </strong>
                  {isVi
                    ? `Mở ${activeBank.appName} → chọn Quét mã QR (VietQR) → hướng camera vào mã bên trên → kiểm tra tên người nhận HOANG THU HIEN (MB Bank) và xác nhận chuyển khoản.`
                    : `Open ${activeBank.appName} → tap Scan QR (VietQR) → point at the code above → verify recipient HOANG THU HIEN (MB Bank) and confirm transfer.`}
                </p>
                <p className="mt-2 pt-2 border-t border-[#1F4E32]/10">
                  {isVi ? 'Đóng góp từ nước ngoài (PayPal): ' : 'International donors (PayPal): '}
                  <a
                    href={FESTIVAL_INFO.paypalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-[#1F4E32] underline decoration-[#E09A1B] underline-offset-2"
                  >
                    <span>paypal.me/hoangthuhien0211</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
