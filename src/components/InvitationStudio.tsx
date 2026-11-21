import { ArrowDown, Check, Copy, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import {
  FESTIVAL_INFO,
  TONE_PRESETS,
  type InvitationTone,
  type Language,
  type LetterLanguage,
} from '../data/festivalData';

interface InvitationStudioProps {
  lang: Language;
  tone: InvitationTone;
  letterLang: LetterLanguage;
  senderName: string;
  recipient: string;
  blessing: string;
  composedLetter: string;
  onChangeTone: (tone: InvitationTone) => void;
  onChangeLetterLang: (ll: LetterLanguage) => void;
  onChangeSenderName: (val: string) => void;
  onChangeRecipient: (val: string) => void;
  onChangeBlessing: (val: string) => void;
  onResetPreset: () => void;
}

export function InvitationStudio({
  lang,
  tone,
  letterLang,
  senderName,
  recipient,
  blessing,
  composedLetter,
  onChangeTone,
  onChangeLetterLang,
  onChangeSenderName,
  onChangeRecipient,
  onChangeBlessing,
  onResetPreset,
}: InvitationStudioProps) {
  const [copied, setCopied] = useState(false);
  const isVi = lang === 'vi';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(composedLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section
      id="cocreate-letter"
      className="border-b border-[#2D4F3E]/12 watercolor-sunlit py-14 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold text-[#C86D51]">
            {isVi ? 'Bước 01 · Đồng Kiến Tạo Thư Mời' : 'Step 01 · Brief Invitation Co-Creation'}
          </p>
          <h2
            className="mt-2 font-display text-2xl font-bold tracking-tight text-[#1E1C18] sm:text-4xl"
            style={{ textWrap: 'balance' }}
          >
            {isVi
              ? 'Soạn Nhanh Thư Mời Phép Màu Của Riêng Bạn'
              : 'Co-Create Your Brief Invitation Letter'}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-[#4B5D4F]">
            {isVi
              ? 'Cá nhân hóa bức thư mời ngắn gọn để lan tỏa tới bạn bè, người thân hoặc cộng đồng. Bức thư sẽ được gắn trực tiếp cùng mã VietQR ngân hàng Việt Nam ngay sau khi bạn đăng ký.'
              : 'Craft a concise, heartfelt invitation letter to share with friends, family, or fellow supporters. Your letter will pair directly with a personalized Vietnamese bank VietQR card upon sign-up.'}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          {/* Left Column: Controls */}
          <div className="space-y-6 rounded-2xl border border-[#1F4E32]/14 bg-white p-5 sm:p-7 lg:col-span-6">
            {/* Tone Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#1F4E32]">
                {isVi ? '1. Chọn sắc thái thư mời' : '1. Invitation tone & audience'}
              </label>
              <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {TONE_PRESETS.map((preset) => {
                  const active = tone === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => onChangeTone(preset.id)}
                      className={`rounded-lg border px-3 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap truncate min-h-[44px] ${
                        active
                          ? 'border-[#1F4E32] bg-[#1F4E32] text-[#FAF8F3]'
                          : 'border-[#1F4E32]/15 bg-[#FAF8F3] text-[#1E1C18] hover:border-[#E09A1B]'
                      }`}
                    >
                      {isVi ? preset.labelVi : preset.labelEn}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Letter Language */}
            <div>
              <label className="block text-xs font-semibold text-[#1F4E32]">
                {isVi ? '2. Ngôn ngữ hiển thị trên thư' : '2. Letter language'}
              </label>
              <div className="mt-2.5 inline-flex flex-wrap gap-1 rounded-lg border border-[#1F4E32]/15 bg-[#EEF3EB] p-1">
                {(
                  [
                    { id: 'vi', label: 'Tiếng Việt' },
                    { id: 'en', label: 'English' },
                    { id: 'bilingual', label: 'Song ngữ VI–EN' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChangeLetterLang(opt.id)}
                    className={`rounded-md px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[38px] ${
                      letterLang === opt.id
                        ? 'bg-[#1F4E32] text-[#FAF8F3]'
                        : 'text-[#4B5D4F] hover:text-[#1F4E32]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sender & Recipient */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="invite-sender" className="block text-xs font-semibold text-[#1F4E32]">
                  {isVi ? 'Tên của bạn (Người gửi)' : 'Your Name (Sender)'}
                </label>
                <input
                  id="invite-sender"
                  type="text"
                  value={senderName}
                  onChange={(e) => onChangeSenderName(e.target.value)}
                  placeholder={isVi ? 'VD: Nguyễn Minh An' : 'e.g. Minh An'}
                  className="mt-1.5 w-full rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3.5 py-2.5 text-sm text-[#1E1C18] focus:border-[#1F4E32] focus:bg-white focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label
                  htmlFor="invite-recipient"
                  className="block text-xs font-semibold text-[#1F4E32]"
                >
                  {isVi ? 'Gửi tới (Người nhận)' : 'Recipient Greeting'}
                </label>
                <input
                  id="invite-recipient"
                  type="text"
                  value={recipient}
                  onChange={(e) => onChangeRecipient(e.target.value)}
                  placeholder={isVi ? 'VD: Gia đình nhỏ thân thương' : 'e.g. Dear friends'}
                  className="mt-1.5 w-full rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3.5 py-2.5 text-sm text-[#1E1C18] focus:border-[#1F4E32] focus:bg-white focus:outline-none min-h-[44px]"
                />
              </div>
            </div>

            {/* Blessing Textarea */}
            <div>
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="invite-blessing"
                  className="block text-xs font-semibold text-[#1F4E32]"
                >
                  {isVi ? 'Lời nhắn mời gọi ngắn gọn' : 'Brief personal message'}
                </label>
                <button
                  type="button"
                  onClick={onResetPreset}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#4B5D4F] hover:text-[#1F4E32] py-1"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>{isVi ? 'Khôi phục mẫu' : 'Reset template'}</span>
                </button>
              </div>
              <textarea
                id="invite-blessing"
                rows={4}
                value={blessing}
                onChange={(e) => onChangeBlessing(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3.5 py-2.5 text-sm leading-relaxed text-[#1E1C18] focus:border-[#1F4E32] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="pt-1">
              <a
                href="#signup-sync"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#E09A1B] px-5 py-3 text-sm font-bold text-[#1E1C18] hover:bg-[#C2800E] hover:text-white transition-colors min-h-[48px]"
              >
                <span>
                  {isVi
                    ? 'Tiếp tục Bước 2: Đăng Ký Đồng Bộ Google Form'
                    : 'Continue to Step 2: Google Form Sign-Up'}
                </span>
                <ArrowDown className="h-4 w-4 shrink-0" />
              </a>
            </div>
          </div>

          {/* Right Column: Live Botanical Stationery Preview */}
          <div className="rounded-2xl border border-[#1F4E32]/18 bg-white p-6 sm:p-8 lg:col-span-6">
            <div className="flex items-center justify-between gap-4 border-b border-[#1F4E32]/12 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full overflow-hidden drop-shadow-sm">
                  <img
                    src="/tylf-logo-badge.png"
                    alt="TYLF 2026 — Bee Fairy & Honeycomb Oneness Magic Forest Seal"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div>
                  <p className="font-display text-base font-bold text-[#2D4F3E]">
                    {FESTIVAL_INFO.name}
                  </p>
                  <p className="text-xs text-[#4B5E53]">
                    {FESTIVAL_INFO.dates} · Vườn Ong Vàng, Hà Nội
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3 py-2 text-xs font-semibold text-[#1F4E32] hover:bg-[#EEF3EB] transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>{isVi ? 'Đã sao chép' : 'Copied'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>{isVi ? 'Sao chép thư' : 'Copy letter'}</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-5 whitespace-pre-line font-sans text-sm leading-relaxed text-[#1E1C18] sm:text-[15px]">
              {composedLetter}
            </div>

            <div className="mt-6 border-t border-[#1F4E32]/10 pt-4 text-xs text-[#4B5D4F]">
              {isVi
                ? 'Bản xem trước tự động đồng bộ cùng biểu mẫu đăng ký và thẻ VietQR cá nhân hóa bên dưới.'
                : 'Live stationery preview automatically links with your sign-up record and personalized VietQR template below.'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
