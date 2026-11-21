import { Menu, Sparkles, X } from 'lucide-react';
import { useState, type MouseEvent } from 'react';
import { FESTIVAL_INFO, type Language } from '../data/festivalData';

interface HeaderProps {
  lang: Language;
  onChangeLang: (lang: Language) => void;
}

export function Header({ lang, onChangeLang }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isVi = lang === 'vi';

  const navLinks = isVi
    ? [
        { href: '#highlights', label: 'Điểm Nhấn & 6 Trạm' },
        { href: '#mission', label: 'Quỹ 150 Triệu' },
        { href: '#cocreate-letter', label: 'Viết Thư Mời' },
        { href: '#vietqr-template', label: 'Thẻ VietQR' },
        { href: '#faq', label: 'Hỏi Đáp' },
      ]
    : [
        { href: '#highlights', label: 'Highlights & Zones' },
        { href: '#mission', label: '150M Fund' },
        { href: '#cocreate-letter', label: 'Invite Letter' },
        { href: '#vietqr-template', label: 'VietQR Card' },
        { href: '#faq', label: 'FAQ' },
      ];

  const joinLabel = isVi ? 'Tham gia' : 'Join';

  const handleSmoothScroll = (e: MouseEvent<HTMLAnchorElement>, targetId: string) => {
    const id = targetId.replace(/^#/, '');
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#2D4F3E]/12 bg-[#FAF7F0]/95 backdrop-blur-md">
      {/* Very Top Utility Bar with Language Toggle */}
      <div className="bg-[#2D4F3E] text-[#FAF7F0]">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 text-xs">
          <p className="truncate font-medium text-[#FAF7F0]/90">
            <span className="font-bold text-[#F4BE6A]">{FESTIVAL_INFO.dates}</span>
            <span className="mx-1.5 opacity-60">·</span>
            <span>{isVi ? FESTIVAL_INFO.venueVi : FESTIVAL_INFO.venueEn}</span>
            <span className="hidden sm:inline">
              <span className="mx-1.5 opacity-60">·</span>
              <strong className="font-bold text-[#F4BE6A]">
                {isVi ? '100% Miễn Phí' : '100% Free Admission'}
              </strong>
            </span>
          </p>

          <div
            role="group"
            aria-label="Language switcher"
            className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#1A3327] p-0.5 border border-[#FAF7F0]/15"
          >
            <button
              type="button"
              onClick={() => onChangeLang('vi')}
              className={`rounded px-2.5 py-0.5 text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 ${
                isVi
                  ? 'bg-[#E89F3C] text-[#24302A]'
                  : 'text-[#FAF7F0]/80 hover:text-white'
              }`}
            >
              Tiếng Việt
            </button>
            <button
              type="button"
              onClick={() => onChangeLang('en')}
              className={`rounded px-2.5 py-0.5 text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 ${
                !isVi
                  ? 'bg-[#E89F3C] text-[#24302A]'
                  : 'text-[#FAF7F0]/80 hover:text-white'
              }`}
            >
              English
            </button>
          </div>
        </div>
      </div>

      {/* Extended Main Header Row with Larger Prominent Logo */}
      <div className="mx-auto flex h-20 sm:h-24 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a
          href="#top"
          onClick={(e) => handleSmoothScroll(e, '#top')}
          className="flex shrink-0 items-center gap-3.5 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2D4F3E]"
        >
          <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-full overflow-hidden drop-shadow-sm">
            <img
              src="/tylf-logo-badge.png"
              alt="Thank You Life Fest 2026 — Bee Fairy & Honeycomb Oneness Magic Forest Badge"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <span className="block font-display text-lg sm:text-2xl font-bold tracking-tight text-[#2D4F3E] whitespace-nowrap">
              Thank You Life Fest 2026
            </span>
            <span className="hidden sm:block text-xs font-semibold text-[#C86D51] whitespace-nowrap">
              We are One - Chúng ta là Một
            </span>
          </div>
        </a>

        {/* Single-Line Navigation Links */}
        <nav
          aria-label="Primary"
          className="hidden lg:flex items-center gap-6 text-sm font-semibold text-[#4B5E53]"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleSmoothScroll(e, link.href)}
              className="whitespace-nowrap shrink-0 py-1.5 border-b-2 border-transparent hover:border-[#E89F3C] hover:text-[#2D4F3E] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2D4F3E]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Smooth-Scroll Tham gia (Join) CTA + Mobile Menu Button */}
        <div className="flex shrink-0 items-center gap-2.5">
          <a
            href="#signup-sync"
            onClick={(e) => handleSmoothScroll(e, '#signup-sync')}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#E89F3C] px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-[#24302A] hover:bg-[#C27B16] hover:text-white transition-colors whitespace-nowrap shrink-0 min-h-[42px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2D4F3E]"
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>{joinLabel}</span>
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex lg:hidden items-center justify-center rounded-lg border border-[#2D4F3E]/20 bg-white p-2.5 text-[#2D4F3E] hover:bg-[#EFF4EE] min-h-[44px] min-w-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2D4F3E]"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#2D4F3E]/12 bg-[#FAF7F0] px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleSmoothScroll(e, link.href)}
              className="block rounded-lg px-3 py-3 text-sm font-semibold text-[#24302A] hover:bg-[#EFF4EE] min-h-[44px]"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
