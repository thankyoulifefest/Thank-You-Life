import { Check, Sparkles } from 'lucide-react';
import {
  CONTRIBUTION_TIERS,
  FESTIVAL_INFO,
  FUNDRAISING_ALLOCATION,
  type Language,
} from '../data/festivalData';
import type { PublicStats } from '../utils/registrationsDb';

interface UrgentMissionSectionProps {
  lang: Language;
  selectedAmount: number;
  onSelectAmount: (amount: number) => void;
  publicStats: PublicStats;
}

export function UrgentMissionSection({
  lang,
  selectedAmount,
  onSelectAmount,
  publicStats,
}: UrgentMissionSectionProps) {
  const isVi = lang === 'vi';
  const goalVnd = publicStats.goalVnd || FESTIVAL_INFO.fundraisingGoalVnd;
  const displayVnd =
    publicStats.verifiedVnd > 0 ? publicStats.verifiedVnd : publicStats.pledgedVnd;
  const progressPercent = Math.min(100, Math.round((displayVnd / Math.max(1, goalVnd)) * 100));

  return (
    <section
      id="mission"
      className="border-b border-[#2D4F3E]/12 watercolor-blossom py-14 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C86D51]">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#E89F3C]" />
            <span>
              {isVi
                ? 'Sứ Mệnh Gây Quỹ Cộng Đồng 150.000.000 VNĐ · Minh Bạch 100%'
                : '150,000,000 VNĐ Community Crowdfunding · 100% Transparent'}
            </span>
          </p>
          <h2
            className="mt-2 font-display text-2xl font-bold tracking-tight text-[#24302A] sm:text-4xl"
            style={{ textWrap: 'balance' }}
          >
            {isVi
              ? 'Ngân Sách Đồng Kiến Tạo & Quỹ Bảo Trợ Động Vật'
              : 'Transparent 150M VNĐ Allocation & Crowdfunding Impact'}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#4B5E53]">
            {isVi ? (
              <>
                Vì Thank You Life Fest 2026 mở cửa{' '}
                <strong className="font-bold text-[#2D4F3E]">hoàn toàn miễn phí</strong> cho mọi gia đình, toàn bộ{' '}
                <strong className="font-bold text-[#24302A]">150.000.000 VNĐ</strong> gây quỹ được phân bổ công khai thành{' '}
                <strong className="font-bold text-[#2D4F3E]">5 hạng mục minh bạch</strong>—với{' '}
                <strong className="font-bold text-[#B44A50] bg-[#FDF1F2] px-1.5 py-0.5 rounded">
                  30% (45.000.000 VNĐ) trao thẳng tới các Trung Tâm Cứu Hộ Động Vật
                </strong>
                .
              </>
            ) : (
              <>
                Because admission is{' '}
                <strong className="font-bold text-[#2D4F3E]">100% free</strong> for every family, our{' '}
                <strong className="font-bold text-[#24302A]">150,000,000 VNĐ</strong> community goal is transparently divided across{' '}
                <strong className="font-bold text-[#2D4F3E]">5 essentials</strong>—with{' '}
                <strong className="font-bold text-[#B44A50] bg-[#FDF1F2] px-1.5 py-0.5 rounded">
                  30% (45,000,000 VNĐ) going directly to Animal Rescue Centers
                </strong>
                .
              </>
            )}
          </p>
        </div>

        {/* Colorful Allocation Breakdown */}
        <div className="mt-8 rounded-2xl border border-[#2D4F3E]/15 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-[#4B5E53]">
                {isVi ? 'Mục tiêu đồng kiến tạo & cứu trợ' : 'Total Crowdfunding Target'}
              </p>
              <p className="mt-1 font-display text-2xl sm:text-3xl font-bold text-[#2D4F3E] tabular-nums">
                {FESTIVAL_INFO.fundraisingGoalFormatted}
              </p>
            </div>

            <div className="flex flex-wrap gap-6 text-left sm:text-right">
              <div>
                <p className="text-xs font-bold text-[#4B5E53]">
                  {publicStats.verifiedVnd > 0
                    ? isVi
                      ? 'Đã ghi nhận đối soát'
                      : 'Verified to date'
                    : isVi
                      ? 'Cam kết theo thời gian thực'
                      : 'Real-time pledged'}
                </p>
                <p className="mt-1 font-mono text-lg font-bold text-[#C27B16] tabular-nums">
                  {new Intl.NumberFormat('vi-VN').format(displayVnd)} VNĐ ({progressPercent}%)
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-[#4B5E53]">
                  {isVi ? 'Số người đồng hành' : 'Participants'}
                </p>
                <p className="mt-1 font-mono text-lg font-bold text-[#2D4F3E] tabular-nums">
                  {publicStats.totalParticipants} {isVi ? 'người' : 'guests'}
                </p>
              </div>
            </div>
          </div>

          {/* 5-Color Spectrum Bar */}
          <div
            aria-label="150,000,000 VND fund allocation bar"
            className="mt-5 flex h-4 w-full overflow-hidden rounded-full bg-[#EFF4EE]"
          >
            {FUNDRAISING_ALLOCATION.map((item) => (
              <div
                key={item.id}
                style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                title={`${isVi ? item.titleVi : item.titleEn}: ${item.percent}% (${item.amountFormatted})`}
                className="h-full border-r border-white/60 last:border-r-0"
              />
            ))}
          </div>

          {/* 5 Allocation Items Grid */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {FUNDRAISING_ALLOCATION.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: item.softBg,
                  borderColor: `${item.color}45`,
                }}
                className="rounded-xl border p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <span
                      className="font-mono text-2xl font-bold tabular-nums"
                      style={{ color: item.color }}
                    >
                      {item.percent}%
                    </span>
                    <span className="font-mono text-xs font-bold text-[#24302A] tabular-nums">
                      {item.amountFormatted}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-base font-bold text-[#24302A] leading-snug">
                    {isVi ? item.titleVi : item.titleEn}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#4B5E53]">
                    {isVi ? item.detailVi : item.detailEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Angel Number Crowdfunding Tier Selector */}
        <div className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h3 className="font-display text-xl font-bold text-[#24302A] sm:text-2xl">
                {isVi
                  ? 'Chọn Hạt Mầm Đồng Hành Quỹ 150.000.000 VNĐ'
                  : 'Choose Your Seed of Support for the 150M VNĐ Goal'}
              </h3>
              <p className="mt-1 text-sm text-[#4B5E53]">
                {isVi
                  ? 'Mức đóng góp bạn chọn tự động đồng bộ vào Thư Mời, Biểu Mẫu Đăng Ký và Mã VietQR bên dưới.'
                  : 'Your chosen tier syncs automatically into your Invitation Letter, Sign-Up Form, and VietQR Code below.'}
              </p>
            </div>
            <a
              href="#cocreate-letter"
              className="text-sm font-bold text-[#2D4F3E] underline decoration-[#E89F3C] decoration-2 underline-offset-4 hover:text-[#1A3327]"
            >
              {isVi ? 'Tiếp tục viết Thư Mời →' : 'Continue to Invitation Studio →'}
            </a>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            {CONTRIBUTION_TIERS.map((tier) => {
              const isSelected = selectedAmount === tier.amount;
              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => onSelectAmount(tier.amount)}
                  className={`flex flex-col justify-between rounded-2xl border p-6 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2D4F3E] ${
                    isSelected
                      ? 'border-[#2D4F3E] bg-[#2D4F3E] text-[#FAF7F0] shadow-md'
                      : 'border-[#2D4F3E]/15 bg-white text-[#24302A] hover:border-[#E89F3C]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="text-xs font-bold"
                        style={{ color: isSelected ? '#F4BE6A' : tier.accentHex }}
                      >
                        {isVi ? tier.badgeVi : tier.badgeEn}
                      </span>
                      {isSelected && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#F4BE6A]">
                          <Check className="h-4 w-4" />
                          <span>{isVi ? 'Đã chọn' : 'Selected'}</span>
                        </span>
                      )}
                    </div>

                    <p className="mt-3 font-display text-2xl sm:text-3xl font-bold tabular-nums">
                      {tier.labelFormatted}
                    </p>
                    <p
                      className={`mt-1 text-sm font-bold ${
                        isSelected ? 'text-[#FAF7F0]' : 'text-[#2D4F3E]'
                      }`}
                    >
                      {isVi ? tier.nameVi : tier.nameEn}
                    </p>

                    <p
                      className={`mt-3 text-sm leading-relaxed ${
                        isSelected ? 'text-[#FAF7F0]/85' : 'text-[#4B5E53]'
                      }`}
                    >
                      {isVi ? tier.impactVi : tier.impactEn}
                    </p>
                  </div>

                  <div
                    className={`mt-5 border-t pt-4 text-xs ${
                      isSelected
                        ? 'border-[#FAF7F0]/20 text-[#F4BE6A]'
                        : 'border-[#2D4F3E]/10 text-[#4B5E53]'
                    }`}
                  >
                    <span className="font-bold">
                      {isVi ? 'Tri ân: ' : 'Gratitude gift: '}
                    </span>
                    {isVi ? tier.giftVi : tier.giftEn}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
