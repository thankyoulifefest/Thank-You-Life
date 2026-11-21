import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { FESTIVAL_FAQS, FESTIVAL_INFO, type Language } from '../data/festivalData';

interface FaqSectionProps {
  lang: Language;
}

export function FaqSection({ lang }: FaqSectionProps) {
  const isVi = lang === 'vi';
  const [openId, setOpenId] = useState<string>(FESTIVAL_FAQS[0].id);

  return (
    <>
      <section
        id="faq"
        className="border-b border-[#2D4F3E]/12 watercolor-sunlit py-14 sm:py-20"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C86D51]">
              <HelpCircle className="h-4 w-4 text-[#E89F3C]" />
              <span>{isVi ? 'GIẢI ĐÁP THẮC MẮC · FAQ' : 'FREQUENTLY ASKED QUESTIONS · FAQ'}</span>
            </p>
            <h2
              className="mt-2 font-display text-2xl font-bold tracking-tight text-[#24302A] sm:text-4xl"
              style={{ textWrap: 'balance' }}
            >
              {isVi
                ? 'Câu Hỏi Thường Gặp Trước Khi Bước Vào Rừng ILYA'
                : 'Questions Before Stepping Into ILYA Forest'}
            </h2>
          </div>

          <div className="mt-10 space-y-3.5">
            {FESTIVAL_FAQS.map((item) => {
              const isOpen = openId === item.id;
              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-[#2D4F3E]/15 bg-white transition-colors"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenId(isOpen ? '' : item.id)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5 text-left hover:bg-[#FEF7EC]/60 transition-colors min-h-[56px]"
                  >
                    <span className="font-display text-base sm:text-lg font-bold text-[#24302A]">
                      {isVi ? item.qVi : item.qEn}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-[#2D4F3E] transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="border-t border-[#2D4F3E]/10 bg-[#FAF7F0]/60 px-5 py-4 sm:px-6 sm:py-5 text-sm sm:text-base leading-relaxed text-[#4B5E53]">
                      {isVi ? item.aVi : item.aEn}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pre-Footer Mantra Banner */}
      <section
        aria-label="Festival mantra"
        className="border-b border-[#F4BE6A]/30 bg-gradient-to-r from-[#2D4F3E] via-[#1F4E32] to-[#2D4F3E] py-10 sm:py-12 text-center text-[#FAF7F0]"
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-2.5">
          <div className="inline-flex items-center justify-center gap-2 text-xs font-bold tracking-wider uppercase text-[#F4BE6A]">
            <Sparkles className="h-4 w-4" />
            <span>Khu Rừng Phép Màu ILYA · Namaste</span>
            <Sparkles className="h-4 w-4" />
          </div>
          <p className="font-display text-xl sm:text-3xl font-bold tracking-tight text-white">
            “{FESTIVAL_INFO.mantra}”
          </p>
        </div>
      </section>
    </>
  );
}
