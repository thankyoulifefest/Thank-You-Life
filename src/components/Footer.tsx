import { ExternalLink, Mail, MapPin, Phone } from 'lucide-react';
import {
  ASSETS,
  FESTIVAL_INFO,
  ORGANIZER_CONTACTS,
  type Language,
} from '../data/festivalData';

interface FooterProps {
  lang: Language;
  onOpenAdmin: () => void;
}

export function Footer({ lang, onOpenAdmin }: FooterProps) {
  const isVi = lang === 'vi';

  return (
    <footer className="bg-[#1A3327] text-[#FAF7F0] py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 border-b border-[#FAF7F0]/15 pb-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3.5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full overflow-hidden drop-shadow-sm">
                <img
                  src={ASSETS.logo}
                  alt="Thank You Life Fest 2026 — Bee Fairy & Honeycomb Oneness Magic Forest Badge"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <p className="font-display text-lg font-bold text-[#FAF8F3]">
                  {FESTIVAL_INFO.name}
                </p>
                <p className="text-xs font-semibold text-[#F7D27A]">
                  {FESTIVAL_INFO.motto} · ILYA
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[#FAF8F3]/80">
              {isVi
                ? 'Tổ chức bởi Thank You Life Network đồng kiến tạo cùng Vườn Ong Vàng. Tiếp nối dòng chảy “Live and Let Live” từ Diviners Fest 2026.'
                : 'Organized by Thank You Life Network in co-creation with Golden Bee Garden. Continuing the “Live and Let Live” spirit from Diviners Fest 2026.'}
            </p>
          </div>

          <div className="md:col-span-3 space-y-2.5 text-sm text-[#FAF8F3]/85">
            <p className="font-display font-bold text-[#F7D27A]">
              {isVi ? 'Liên Kết Nhanh' : 'Navigation'}
            </p>
            <ul className="space-y-2">
              <li>
                <a href="#highlights" className="hover:text-[#F4BE6A] transition-colors">
                  {isVi ? '6 Trạm Phép Màu & Lịch Trình' : 'Highlights & Schedule'}
                </a>
              </li>
              <li>
                <a href="#mission" className="hover:text-[#F4BE6A] transition-colors">
                  {isVi ? 'Quỹ 150 Triệu VNĐ (Minh Bạch)' : '150M VNĐ Allocation'}
                </a>
              </li>
              <li>
                <a href="#cocreate-letter" className="hover:text-[#F4BE6A] transition-colors">
                  {isVi ? 'Soạn Thư Mời' : 'Co-Create Letter'}
                </a>
              </li>
              <li>
                <a href="#signup-sync" className="hover:text-[#F7D27A] transition-colors">
                  {isVi ? 'Đăng Ký Tham Gia' : 'Join & Sign Up'}
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#F7D27A] transition-colors">
                  {isVi ? 'Câu Hỏi Thường Gặp (FAQ)' : 'Frequently Asked Questions'}
                </a>
              </li>
              <li>
                <a
                  href="/admin"
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenAdmin();
                  }}
                  className="hover:text-[#F7D27A] transition-colors"
                >
                  {isVi ? 'Quản Lý Ban Tổ Chức' : 'Organizer Admin'}
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-2.5 text-sm text-[#FAF8F3]/85">
            <p className="font-display font-bold text-[#F7D27A]">
              {isVi ? 'Kết Nối Ban Tổ Chức' : 'Organizer Contact'}
            </p>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#F7D27A]" />
                <a
                  href={FESTIVAL_INFO.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#F7D27A] underline decoration-[#FAF8F3]/30 underline-offset-2"
                >
                  {isVi ? FESTIVAL_INFO.venueVi : FESTIVAL_INFO.venueEn}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-[#F7D27A]" />
                <a
                  href={`mailto:${FESTIVAL_INFO.email}`}
                  className="hover:text-[#F7D27A] underline decoration-[#FAF8F3]/30 underline-offset-2"
                >
                  {FESTIVAL_INFO.email}
                </a>
              </li>
              {ORGANIZER_CONTACTS.map((contact) => (
                <li key={contact.phoneHref} className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-[#F7D27A]" />
                  <span>
                    <strong className="font-bold text-white">
                      {contact.name} ({contact.nickname})
                    </strong>{' '}
                    ·{' '}
                    <a
                      href={contact.phoneHref}
                      className="font-mono hover:text-[#F7D27A] underline decoration-[#FAF8F3]/30 underline-offset-2"
                    >
                      {contact.phoneDisplay}
                    </a>
                  </span>
                </li>
              ))}
              <li className="pt-1">
                <a
                  href={FESTIVAL_INFO.officialSite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#F7D27A] hover:underline"
                >
                  <span>tylf.thankyoulife.net</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col gap-2 text-xs text-[#FAF8F3]/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Thank You Life Network. Namaste 🙏</p>
          <p>{isVi ? 'Phi lợi nhuận · Minh bạch 100%' : 'Non-profit · 100% Transparent'}</p>
        </div>
      </div>
    </footer>
  );
}
