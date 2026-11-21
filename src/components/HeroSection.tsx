import {
  ArrowDownRight,
  Clock,
  HeartHandshake,
  MapPin,
  Sparkles,
  Users,
  Wand2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { ASSETS, FESTIVAL_INFO, type Language } from '../data/festivalData';
import type { PublicStats } from '../utils/registrationsDb';

interface HeroSectionProps {
  lang: Language;
  publicStats: PublicStats;
  onJumpToCoCreate: () => void;
}

interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  ended: boolean;
}

function getCountdownRemaining(): CountdownState {
  const targetMs = new Date(FESTIVAL_INFO.targetStartIso).getTime();
  const diff = targetMs - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, ended: false };
}

export function HeroSection({
  lang,
  publicStats,
  onJumpToCoCreate,
}: HeroSectionProps) {
  const [bannerError, setBannerError] = useState(false);
  const [countdown, setCountdown] = useState<CountdownState>(() => getCountdownRemaining());

  const isVi = lang === 'vi';

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getCountdownRemaining());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const goalVnd = publicStats.goalVnd || FESTIVAL_INFO.fundraisingGoalVnd;
  const activeFundVnd =
    publicStats.verifiedVnd > 0 ? publicStats.verifiedVnd : publicStats.pledgedVnd;
  const progressPercent = Math.min(100, Math.round((activeFundVnd / Math.max(1, goalVnd)) * 100));

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      id="top"
      className="border-b border-[#2D4F3E]/12 watercolor-sunlit pt-4 pb-12 sm:pt-6 sm:pb-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Enchanted Welcome Line */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-[#4B5E53]">
          <div className="flex flex-wrap items-center gap-2">
            <Wand2 className="h-4 w-4 text-[#E89F3C] shrink-0" />
            <span className="font-bold text-[#2D4F3E]">Thank You Life Network × Vườn Ong Vàng</span>
            <span aria-hidden="true">·</span>
            <strong className="font-bold text-[#C86D51]">{FESTIVAL_INFO.dates}</strong>
          </div>

          <button
            type="button"
            onClick={() => scrollToSection('highlights')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2D4F3E] hover:text-[#C86D51] transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#E89F3C]" />
            <span>
              {isVi
                ? 'Khám phá bí mật Khu Rừng ILYA →'
                : 'Discover the secret of ILYA Forest →'}
            </span>
          </button>
        </div>

        {/* MAXIMIZED FULL-WIDTH OFFICIAL BANNER */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-[#E89F3C]/50 bg-[#EFF4EE] shadow-md">
          {!bannerError ? (
            <img
              src={ASSETS.banner}
              alt="Thank You Life Fest 2026 — Khu rừng phép màu ILYA, We Are One official watercolor banner"
              referrerPolicy="no-referrer"
              onError={() => setBannerError(true)}
              className="w-full h-auto aspect-[16/9] object-cover object-center block"
            />
          ) : (
            <div className="flex aspect-[16/9] w-full flex-col items-center justify-center bg-[#2D4F3E] p-8 text-center text-[#FAF7F0]">
              <p className="font-display text-3xl font-bold">Thank You Life Fest 2026</p>
              <p className="mt-2 text-base text-[#F4BE6A]">{FESTIVAL_INFO.themeVi}</p>
            </div>
          )}
        </div>

        {/* STORY HOOK, COUNTDOWN & LIVE IMPACT */}
        <div className="mt-8 sm:mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          {/* Left 7 Columns: Headline, Emphasized Numbers & Actions */}
          <div className="lg:col-span-7">
            <p className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#C86D51]">
              <Sparkles className="h-4 w-4 shrink-0 text-[#E89F3C]" />
              <span>
                {isVi
                  ? 'Lễ Hội Dã Ngoại & Cắm Trại Gia Đình · Đồng Kiến Tạo & Gây Quỹ Cộng Đồng'
                  : 'Family Picnic & Camping Festival · Open Co-Creation & Crowdfunding'}
              </span>
            </p>

            <h1
              className="mt-2 font-display font-bold tracking-tight text-[#24302A] leading-[1.15]"
              style={{ fontSize: 'clamp(1.95rem, 3.4vw, 3.05rem)', textWrap: 'balance' }}
            >
              {isVi ? (
                <>
                  Khi Chúng Ta Là Một – Cùng Bước Vào{' '}
                  <span className="text-[#2D4F3E] underline decoration-[#E89F3C] decoration-4 underline-offset-4">
                    Khu Rừng Của Phép Màu
                  </span>
                  <span className="mt-2 block text-[0.66em] font-bold text-[#C86D51]">
                    Rừng Bí Mật ILYA · Chung Tay Gây Quỹ 150 Triệu Đồng
                  </span>
                </>
              ) : (
                <>
                  When We Are One – Step Into{' '}
                  <span className="text-[#2D4F3E] underline decoration-[#E89F3C] decoration-4 underline-offset-4">
                    The Forest of Magic
                  </span>
                  <span className="mt-2 block text-[0.66em] font-bold text-[#C86D51]">
                    Secret Forest ILYA · Fund Our 150M VNĐ Mission
                  </span>
                </>
              )}
            </h1>

            <p className="mt-4 max-w-2xl text-[15px] sm:text-base leading-relaxed text-[#4B5E53]">
              {isVi ? (
                <>
                  <span className="block">
                    Được khởi xướng bởi{' '}
                    <strong className="font-bold text-[#2D4F3E]">Thank You Life Network</strong>{' '}
                    cùng sự đồng kiến tạo của{' '}
                    <strong className="font-bold text-[#2D4F3E]">Vườn Ong Vàng</strong> (Phú Xuyên, Hà Nội ·{' '}
                    <strong className="font-bold text-[#24302A]">19–20/12/2026</strong>),{' '}
                    <strong className="font-bold text-[#2D4F3E]">Thank You Life Fest 2026</strong> là một lễ hội{' '}
                    <strong className="font-bold text-[#2D4F3E] bg-[#FEF7EC] px-1.5 py-0.5 rounded">
                      phi lợi nhuận & 100% Miễn Phí
                    </strong>
                    , một không gian sống động dành cho các gia đình, trẻ em, nghệ sĩ và những tâm hồn yêu thiên nhiên cùng trở về với sự giản dị, chân phương và chữa lành — đồng thời chung tay gây quỹ{' '}
                    <strong className="font-bold text-[#24302A]">150.000.000 VNĐ</strong> với{' '}
                    <strong className="font-bold text-[#B44A50]">
                      30% tổng ngân sách (tương đương 45.000.000 VNĐ) được ủng hộ trực tiếp cho các Trạm Cứu Hộ Động Vật để chăm sóc y tế & cung cấp nhu yếu phẩm hàng ngày cho các bé chó mèo cơ nhỡ
                    </strong>
                    .
                  </span>
                  <span className="mt-3 block">
                    <strong className="font-bold text-[#2D4F3E]">
                      Lấy cảm hứng từ tinh thần giáo dục tự nhiên Waldorf–Steiner
                    </strong>{' '}
                    hòa quyện cùng nét mộc mạc bình yên của làng quê Bắc Bộ, toàn bộ khuôn viên Vườn Ong Vàng sẽ hóa thân thành{' '}
                    <strong className="font-bold text-[#2D4F3E]">
                      “Khu Rừng của Phép Màu” (The Forest of Magic)
                    </strong>{' '}
                    mang mật mã <strong className="font-bold text-[#C86D51]">ILYA</strong> — nơi những nàng tiên ong đón chào bạn và bí mật khu rừng sẽ dần bật mí đúng lúc.
                  </span>
                  <span className="mt-3.5 block rounded-xl border-l-4 border-[#E89F3C] bg-[#FEF7EC]/90 px-4 py-3 text-sm sm:text-[15px] leading-relaxed text-[#2D4F3E] italic">
                    “Với câu thần chú{' '}
                    <strong className="font-bold not-italic text-[#C86D51]">
                      ‘Thank You Life – I love you All’ – ‘Cảm ơn cuộc sống – yêu thương cho tất cả’
                    </strong>
                    , bất kỳ ai tham gia – từ ông bà, cha mẹ đến các em nhỏ – đều được khuyến khích hóa trang tự do để trở thành một nhân vật kỳ diệu mà trái tim mình khao khát. Từ đó, mỗi bước chân khám phá lễ hội sẽ trở thành một hành trình trải nghiệm đáng nhớ và đầy cảm hứng.”
                  </span>
                </>
              ) : (
                <>
                  <span className="block">
                    Initiated by{' '}
                    <strong className="font-bold text-[#2D4F3E]">Thank You Life Network</strong>{' '}
                    in co-creation with{' '}
                    <strong className="font-bold text-[#2D4F3E]">Golden Bee Garden</strong> (Phu Xuyen, Hanoi ·{' '}
                    <strong className="font-bold text-[#24302A]">Dec 19–20, 2026</strong>),{' '}
                    <strong className="font-bold text-[#2D4F3E]">Thank You Life Fest 2026</strong> is a{' '}
                    <strong className="font-bold text-[#2D4F3E] bg-[#FEF7EC] px-1.5 py-0.5 rounded">
                      non-profit & 100% Free Admission
                    </strong>{' '}
                    living sanctuary for families, children, artists, and nature-loving souls to return to simplicity, authenticity, and healing—while raising{' '}
                    <strong className="font-bold text-[#24302A]">150,000,000 VNĐ</strong> with{' '}
                    <strong className="font-bold text-[#B44A50]">
                      30% of the total budget (45,000,000 VNĐ) donated directly to Animal Rescue Centers to fund medical care and daily essentials for rescued dogs and cats
                    </strong>
                    .
                  </span>
                  <span className="mt-3 block">
                    <strong className="font-bold text-[#2D4F3E]">
                      Inspired by the natural educational spirit of Waldorf–Steiner
                    </strong>{' '}
                    blended with the rustic serenity of Northern Vietnam’s countryside, all of Golden Bee Garden transforms into{' '}
                    <strong className="font-bold text-[#2D4F3E]">
                      “The Forest of Magic” (Khu Rừng của Phép Màu)
                    </strong>{' '}
                    carrying the secret code <strong className="font-bold text-[#C86D51]">ILYA</strong>—where honeybee fairies greet you as its mystery unfolds along your path.
                  </span>
                  <span className="mt-3.5 block rounded-xl border-l-4 border-[#E89F3C] bg-[#FEF7EC]/90 px-4 py-3 text-sm sm:text-[15px] leading-relaxed text-[#2D4F3E] italic">
                    “With the mantra{' '}
                    <strong className="font-bold not-italic text-[#C86D51]">
                      ‘Thank You Life – I love you All’ – ‘Cảm ơn cuộc sống – yêu thương cho tất cả’
                    </strong>
                    , everyone joining—from grandparents and parents to little ones—is warmly encouraged to dress up freely as the magical character their heart longs to become. Every step into the festival thus becomes an unforgettable and deeply inspiring journey.”
                  </span>
                </>
              )}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={() => scrollToSection('signup-sync')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E89F3C] px-6 py-3.5 text-sm font-bold text-[#24302A] hover:bg-[#C27B16] hover:text-white transition-colors whitespace-nowrap shrink-0 min-h-[48px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2D4F3E]"
              >
                <HeartHandshake className="h-4 w-4 shrink-0" />
                <span>
                  {isVi ? 'Tham Gia & Nhận Mã VietQR' : 'Join & Get Personalized VietQR'}
                </span>
              </button>

              <button
                type="button"
                onClick={onJumpToCoCreate}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#2D4F3E]/25 bg-white px-5 py-3.5 text-sm font-bold text-[#2D4F3E] hover:bg-[#EFF4EE] transition-colors whitespace-nowrap shrink-0 min-h-[48px]"
              >
                <Sparkles className="h-4 w-4 shrink-0 text-[#C86D51]" />
                <span>
                  {isVi ? 'Khám Phá 6 Trạm Phép Màu' : 'Explore 6 Magic Zones'}
                </span>
              </button>

              <a
                href={FESTIVAL_INFO.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 py-2 text-sm font-semibold text-[#2D4F3E] underline decoration-[#E89F3C] decoration-2 underline-offset-4 hover:text-[#1A3327] whitespace-nowrap shrink-0 min-h-[44px]"
              >
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{isVi ? 'Bản đồ Vườn Ong Vàng' : 'Golden Bee Garden Map'}</span>
                <ArrowDownRight className="h-3.5 w-3.5 shrink-0" />
              </a>
            </div>
          </div>

          {/* Right 5 Columns: Live Countdown + Real-Time Impact & Participants Widget */}
          <div className="lg:col-span-5 space-y-4">
            {/* Live Event Countdown Clock */}
            <div className="rounded-2xl border border-[#E89F3C]/45 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2 text-xs font-bold text-[#C86D51]">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4 shrink-0 text-[#E89F3C]" />
                  <span>
                    {isVi
                      ? 'Đếm Ngược Tới Ngày Mở Cửa Rừng ILYA'
                      : 'Countdown to Opening Gate of ILYA Forest'}
                  </span>
                </span>
                <span className="font-mono text-[#2D4F3E]">{FESTIVAL_INFO.dates}</span>
              </div>

              {countdown.ended ? (
                <p className="mt-3 font-display text-lg font-bold text-[#2D4F3E]">
                  {isVi
                    ? 'Khu Rừng Phép Màu ILYA Đang Diễn Ra!'
                    : 'ILYA Forest of Magic is Happening Now!'}
                </p>
              ) : (
                <div className="mt-3 grid grid-cols-4 gap-2.5 text-center">
                  {(
                    [
                      { value: countdown.days, vi: 'Ngày', en: 'Days' },
                      { value: countdown.hours, vi: 'Giờ', en: 'Hours' },
                      { value: countdown.minutes, vi: 'Phút', en: 'Mins' },
                      { value: countdown.seconds, vi: 'Giây', en: 'Secs' },
                    ] as const
                  ).map((unit) => (
                    <div
                      key={unit.en}
                      className="rounded-xl border border-[#2D4F3E]/12 bg-[#FEF7EC] py-2.5 px-1"
                    >
                      <p className="font-mono text-xl sm:text-2xl font-bold text-[#2D4F3E] tabular-nums">
                        {String(unit.value).padStart(2, '0')}
                      </p>
                      <p className="text-[11px] font-semibold text-[#4B5E53]">
                        {isVi ? unit.vi : unit.en}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live Real-Time Crowdfunding & Participant Tally */}
            <div className="rounded-2xl border border-[#2D4F3E]/20 bg-[#2D4F3E] p-5 text-[#FAF7F0] shadow-sm">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 font-bold text-[#F4BE6A]">
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {isVi
                      ? 'Tiến Độ Cộng Đồng Thời Gian Thực'
                      : 'Real-Time Community Impact'}
                  </span>
                </span>
                <span className="font-mono font-bold text-[#F7D27A] tabular-nums">
                  {progressPercent}%
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] text-[#FAF7F0]/75">
                    {publicStats.verifiedVnd > 0
                      ? isVi
                        ? 'Quỹ đã đối soát'
                        : 'Verified Contributions'
                      : isVi
                        ? 'Tổng cam kết đồng hành'
                        : 'Total Pledged Funds'}
                  </p>
                  <p className="mt-0.5 font-mono text-lg sm:text-xl font-bold text-[#F4BE6A] tabular-nums">
                    {new Intl.NumberFormat('vi-VN').format(activeFundVnd)} VNĐ
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#FAF7F0]/70 tabular-nums">
                    / {FESTIVAL_INFO.fundraisingGoalFormatted}
                  </p>
                </div>

                <div className="border-l border-[#FAF7F0]/15 pl-4">
                  <p className="text-[11px] text-[#FAF7F0]/75 inline-flex items-center gap-1">
                    <Users className="h-3 w-3 text-[#F4BE6A]" />
                    <span>{isVi ? 'Người tham gia & ủng hộ' : 'Participants Joined'}</span>
                  </p>
                  <p className="mt-0.5 font-mono text-lg sm:text-xl font-bold text-white tabular-nums">
                    {publicStats.totalParticipants}{' '}
                    <span className="text-xs font-normal text-[#FAF7F0]/80">
                      {isVi ? 'người' : 'guests'}
                    </span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#FAF7F0]/70 tabular-nums">
                    {publicStats.totalRegistrations}{' '}
                    {isVi ? 'lượt đăng ký' : 'registrations'}
                  </p>
                </div>
              </div>

              <div className="mt-3.5 h-2.5 w-full overflow-hidden rounded-full bg-[#FAF7F0]/15">
                <div
                  style={{ width: `${Math.max(4, progressPercent)}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-[#E89F3C] via-[#F4BE6A] to-[#E5989B] transition-all duration-500"
                />
              </div>

              {publicStats.pledgedVnd > publicStats.verifiedVnd && publicStats.verifiedVnd > 0 && (
                <p className="mt-2 text-[11px] text-[#FAF7F0]/75 tabular-nums">
                  {isVi
                    ? `Bao gồm ${new Intl.NumberFormat('vi-VN').format(publicStats.pledgedVnd)} VNĐ cam kết đang chờ đối soát sao kê.`
                    : `Includes ${new Intl.NumberFormat('vi-VN').format(publicStats.pledgedVnd)} VNĐ total pledged transfers.`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Colorful Waldorf-Inspired Key Facts Strip */}
        <div className="mt-10 grid grid-cols-2 gap-4 border-t border-[#2D4F3E]/12 pt-8 lg:grid-cols-4 lg:gap-5">
          <div className="rounded-2xl border border-[#E89F3C]/40 bg-[#FEF7EC] p-4 sm:p-5">
            <p className="text-xs font-bold text-[#C27B16]">
              {isVi ? 'Thời gian lễ hội' : 'Festival Dates'}
            </p>
            <p className="mt-1.5 font-display text-lg sm:text-xl font-bold text-[#24302A] tabular-nums">
              {FESTIVAL_INFO.dates}
            </p>
            <p className="mt-1 text-xs font-medium text-[#4B5E53]">
              {isVi ? FESTIVAL_INFO.durationVi : FESTIVAL_INFO.durationEn}
            </p>
          </div>

          <div className="rounded-2xl border border-[#7BA7BC]/45 bg-[#EFF6FA] p-4 sm:p-5">
            <p className="text-xs font-bold text-[#3C6E87]">
              {isVi ? 'Khu Rừng ILYA' : 'ILYA Sanctuary'}
            </p>
            <p className="mt-1.5 font-display text-lg sm:text-xl font-bold text-[#24302A]">
              {isVi ? 'Vườn Ong Vàng' : 'Golden Bee Garden'}
            </p>
            <p className="mt-1 text-xs font-medium text-[#4B5E53]">
              {isVi ? 'Phú Xuyên, Hà Nội (~45 phút)' : 'Phu Xuyen, Hanoi (~45 min)'}
            </p>
          </div>

          <div className="rounded-2xl border border-[#2D4F3E]/30 bg-[#EFF6F1] p-4 sm:p-5">
            <p className="text-xs font-bold text-[#2D4F3E]">
              {isVi ? 'Vé tham dự' : 'Community Admission'}
            </p>
            <p className="mt-1.5 font-display text-lg sm:text-xl font-bold text-[#2D4F3E]">
              {isVi ? '100% Miễn Phí' : '100% Free Entry'}
            </p>
            <p className="mt-1 text-xs font-medium text-[#4B5E53]">
              {isVi ? 'Mở rộng vòng tay cho mọi gia đình' : 'Open welcome for every family'}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E5989B]/60 bg-[#FDF2F3] p-4 sm:p-5">
            <p className="text-xs font-bold text-[#B44A50]">
              {isVi ? 'Mục tiêu gây quỹ' : 'Crowdfunding Target'}
            </p>
            <p className="mt-1.5 font-display text-lg sm:text-xl font-bold text-[#24302A] tabular-nums">
              {FESTIVAL_INFO.fundraisingGoalFormatted}
            </p>
            <p className="mt-1 text-xs font-semibold text-[#B44A50]">
              {isVi ? '30% trao Trung Tâm Cứu Hộ Động Vật' : '30% for Animal Rescue Centers'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
