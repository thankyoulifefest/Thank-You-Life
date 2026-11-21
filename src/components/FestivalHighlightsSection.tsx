import {
  ArrowDown,
  ArrowUpRight,
  Calendar,
  Heart,
  Leaf,
  MapPin,
  Music,
  Palette,
  PawPrint,
  Sparkles,
  Trees,
  Users,
  Utensils,
  Wand2,
} from 'lucide-react';
import { useState } from 'react';
import {
  ASSETS,
  FESTIVAL_INFO,
  FESTIVAL_ZONES,
  SCHEDULE_DAY_1,
  SCHEDULE_DAY_2,
  type Language,
  type RegRole,
} from '../data/festivalData';

interface FestivalHighlightsSectionProps {
  lang: Language;
  onSelectRoleForSignup: (role: RegRole) => void;
}

type HighlightTab = 'zones' | 'schedule' | 'cocreate';

const ZONE_ICONS = [Palette, Music, Wand2, Trees, Utensils, PawPrint];

export function FestivalHighlightsSection({
  lang,
  onSelectRoleForSignup,
}: FestivalHighlightsSectionProps) {
  const isVi = lang === 'vi';
  const [activeTab, setActiveTab] = useState<HighlightTab>('zones');
  const [scheduleDay, setScheduleDay] = useState<1 | 2>(1);
  const [secretRevealed, setSecretRevealed] = useState(false);

  const scheduleSlots = scheduleDay === 1 ? SCHEDULE_DAY_1 : SCHEDULE_DAY_2;

  return (
    <section
      id="highlights"
      className="border-b border-[#2D4F3E]/12 watercolor-meadow py-14 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        {/* PART A: OUR VISION & STORY + SUBTLE ILYA SECRET REVEAL + ILLUSTRATION */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-3xl border-2 border-[#E89F3C]/45 bg-white p-2 shadow-sm">
              <img
                src={ASSETS.sanctuaryImg}
                alt="Golden Bee Garden ILYA Magic Forest watercolor illustration"
                referrerPolicy="no-referrer"
                className="w-full h-auto aspect-[4/3] rounded-2xl object-cover"
              />
              <div className="mt-2.5 flex items-center justify-between gap-2 px-2 pb-1 text-xs font-semibold text-[#2D4F3E]">
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#E89F3C]" />
                  <span>Vườn Ong Vàng · Phú Xuyên</span>
                </span>
                <span className="text-[#C86D51] font-bold">Mật mã: ILYA</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5">
            <div>
              <p className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C86D51]">
                <Leaf className="h-4 w-4 text-[#2D4F3E]" />
                <span>
                  {isVi
                    ? 'Tầm Nhìn & Câu Chuyện · Khu Rừng Phép Màu ILYA'
                    : 'Our Vision & Story · ILYA Forest of Magic'}
                </span>
              </p>
              <h2
                className="mt-2 font-display text-2xl font-bold tracking-tight text-[#24302A] sm:text-4xl leading-tight"
                style={{ textWrap: 'balance' }}
              >
                {isVi
                  ? 'Khi Chúng Ta Là Một – Cùng Bước Vào Khu Rừng Phép Màu ILYA'
                  : 'When We Are One – Stepping Into ILYA Forest of Magic'}
              </h2>
            </div>

            <div className="space-y-3.5 text-base leading-relaxed text-[#4B5E53]">
              <p>
                {isVi ? (
                  <>
                    Được khởi xướng bởi{' '}
                    <strong className="font-bold text-[#2D4F3E]">Thank You Life Network</strong> cùng sự đồng kiến tạo của{' '}
                    <strong className="font-bold text-[#2D4F3E]">Vườn Ong Vàng</strong>, Thank You Life Fest 2026 là một{' '}
                    <strong className="font-bold text-[#24302A]">lễ hội phi lợi nhuận</strong>—một không gian sống động dành cho các gia đình, trẻ em, nghệ sĩ và những tâm hồn yêu thiên nhiên trở về với sự{' '}
                    <strong className="font-bold text-[#2D4F3E]">giản dị, chân phương và chữa lành</strong>.
                  </>
                ) : (
                  <>
                    Initiated by{' '}
                    <strong className="font-bold text-[#2D4F3E]">Thank You Life Network</strong> in joyful co-creation with{' '}
                    <strong className="font-bold text-[#2D4F3E]">Golden Bee Garden</strong>, Thank You Life Fest 2026 is a{' '}
                    <strong className="font-bold text-[#24302A]">non-profit festival sanctuary</strong> where families, children, artists, and nature lovers return to{' '}
                    <strong className="font-bold text-[#2D4F3E]">simplicity, authenticity, and gentle healing</strong>.
                  </>
                )}
              </p>
              <p>
                {isVi ? (
                  <>
                    <strong className="font-bold text-[#2D4F3E]">
                      Lấy cảm hứng từ tinh thần và thẩm mỹ tự nhiên Waldorf–Steiner
                    </strong>{' '}
                    (hoàn toàn tự do, không gò bó hay bắt buộc phải tuân theo hay sao chép khuôn mẫu), hòa quyện cùng nét mộc mạc bình yên của làng quê Bắc Bộ, toàn bộ Vườn Ong Vàng hóa thân thành{' '}
                    <strong className="font-bold text-[#C86D51]">
                      Khu Rừng Phép Màu ILYA
                    </strong>
                    —nơi ông bà, cha mẹ và các em nhỏ cùng nhau gác lại màn hình công nghệ để chạm tay vào cỏ cây, sẻ chia tiếng cười bên ánh lửa hồng và ngân vang câu thần chú bình an cho muôn loài.
                  </>
                ) : (
                  <>
                    <strong className="font-bold text-[#2D4F3E]">
                      Inspired by the spirit and aesthetic of Waldorf–Steiner
                    </strong>{' '}
                    (completely free-spirited, without requiring anyone to strictly follow or replicate a rigid method), blended with the serene rustic warmth of Northern Vietnam, Golden Bee Garden transforms into{' '}
                    <strong className="font-bold text-[#C86D51]">
                      ILYA Forest of Magic
                    </strong>
                    —a living playground where grandparents, parents, and children set screens aside to paint outdoors, dance around campfire light, and nourish gratitude for all living beings.
                  </>
                )}
              </p>
            </div>

            {/* Subtle Interactive Secret Reveal Box for ILYA */}
            <div className="rounded-2xl border border-[#E89F3C]/50 bg-[#FEF7EC] p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#2D4F3E]">
                  <Wand2 className="h-4 w-4 text-[#C86D51] shrink-0" />
                  <span>
                    {secretRevealed
                      ? isVi
                        ? 'Bí mật đã được bật mí đúng lúc:'
                        : 'The forest secret has unfolded:'
                      : isVi
                        ? 'Khu Rừng mang tên bí mật ILYA…'
                        : 'Why is the forest secretly named ILYA?'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSecretRevealed((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#2D4F3E] px-3.5 py-2 text-xs font-bold text-[#FAF7F0] hover:bg-[#1A3327] transition-colors whitespace-nowrap shrink-0 min-h-[38px]"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#F4BE6A]" />
                  <span>
                    {secretRevealed
                      ? isVi
                        ? 'Cất lại điều bí mật'
                        : 'Tuck Secret Away'
                      : isVi
                        ? 'Bật mí ý nghĩa ILYA'
                        : 'Reveal ILYA Meaning'}
                  </span>
                </button>
              </div>

              {secretRevealed ? (
                <p className="mt-2.5 text-sm leading-relaxed text-[#24302A]">
                  {isVi ? (
                    <>
                      <strong className="font-bold text-[#C86D51]">ILYA = “I Love You All”</strong> — Yêu thương cho tất cả! Cái tên bí mật này nhắc nhớ mỗi trái tim bước qua cổng Rừng Phép Màu rằng mọi bí mật dịu dàng nhất của cuộc sống sẽ luôn được bật mí đúng lúc khi ta mở lòng kết nối.
                    </>
                  ) : (
                    <>
                      <strong className="font-bold text-[#C86D51]">ILYA = “I Love You All”</strong> — a quiet promise from the honeybee fairies that life’s gentlest miracles always reveal themselves at the exact right moment.
                    </>
                  )}
                </p>
              ) : (
                <p className="mt-2 text-xs text-[#4B5E53]">
                  {isVi
                    ? 'Những nàng tiên ong thì thầm mật mã 4 chữ cái này tới từng gia đình… chạm để bật mí khi bạn sẵn sàng.'
                    : 'The honeybee fairies whisper these four letters at the garden gate… tap to unveil its gentle secret.'}
                </p>
              )}
            </div>

            {/* 3 Organic Philosophy Pillars */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-1">
              <div className="rounded-2xl border border-[#2D4F3E]/15 bg-white p-4">
                <Leaf className="h-4 w-4 text-[#2D4F3E] mb-1.5" />
                <h3 className="font-display text-sm font-bold text-[#24302A]">
                  {isVi ? 'Tự Nhiên & Phi Nỗ Lực' : 'Organic & Effortless'}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#4B5E53]">
                  {isVi
                    ? 'Không kịch bản cứng nhắc, mọi khoảnh khắc tuôn chảy từ sự hiện diện trọn vẹn.'
                    : 'Zero rigid scripts; every activity flows from joyful presence.'}
                </p>
              </div>
              <div className="rounded-2xl border border-[#E89F3C]/35 bg-[#FEF7EC] p-4">
                <Heart className="h-4 w-4 text-[#C27B16] mb-1.5" />
                <h3 className="font-display text-sm font-bold text-[#24302A]">
                  {isVi ? 'Gia Đình & Trẻ Thơ' : 'Family & Childhood'}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#4B5E53]">
                  {isVi
                    ? 'Không gian an toàn để trẻ chạm tay vào đất, cỏ cây, âm nhạc và sắc màu tự nhiên.'
                    : 'Safe sanctuary for children to touch earth, grass, music, and pigments.'}
                </p>
              </div>
              <div className="rounded-2xl border border-[#D96B70]/35 bg-[#FDF2F3] p-4">
                <PawPrint className="h-4 w-4 text-[#B44A50] mb-1.5" />
                <h3 className="font-display text-sm font-bold text-[#24302A]">
                  Live and Let Live
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#4B5E53]">
                  {isVi
                    ? 'Tiếp nối dòng chảy Diviners Fest 2026, trao 30% quỹ tới Trung Tâm Cứu Hộ Động Vật.'
                    : 'Continuing Diviners Fest 2026 compassion with 30% direct animal rescue aid.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PART B: INTERACTIVE 3-TAB SHOWCASE (6 STATIONS, 48H SCHEDULE, CO-CREATION) */}
        <div className="border-t border-[#2D4F3E]/12 pt-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold text-[#C86D51]">
                {isVi
                  ? 'Trải Nghiệm Đồng Kiến Tạo Trong 48 Giờ'
                  : '48 Hours of Wonder, Art & Co-Creation'}
              </p>
              <h2
                className="mt-2 font-display text-2xl font-bold tracking-tight text-[#24302A] sm:text-4xl"
                style={{ textWrap: 'balance' }}
              >
                {isVi
                  ? '6 Trạm Sáng Tạo & Phép Màu Tại Vườn Ong Vàng'
                  : '6 Creative Stations & Zones of Wonder'}
              </h2>
            </div>

            <div
              role="tablist"
              aria-label="Festival highlight sections"
              className="inline-flex flex-wrap gap-1.5 rounded-xl border border-[#2D4F3E]/15 bg-white/95 p-1.5 self-start lg:self-auto"
            >
              {(
                [
                  {
                    id: 'zones',
                    vi: '6 Trạm Phép Màu',
                    en: '6 Creative Stations',
                  },
                  {
                    id: 'schedule',
                    vi: 'Lịch Trình 2 Ngày',
                    en: '48-Hour Schedule',
                  },
                  {
                    id: 'cocreate',
                    vi: 'Đồng Kiến Tạo & Địa Điểm',
                    en: 'Co-Create & Venue',
                  },
                ] as const
              ).map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-lg px-4 py-2.5 text-xs sm:text-sm font-bold transition-colors whitespace-nowrap shrink-0 min-h-[42px] ${
                      active
                        ? 'bg-[#2D4F3E] text-[#FAF7F0]'
                        : 'text-[#4B5E53] hover:text-[#2D4F3E] hover:bg-[#EFF4EE]'
                    }`}
                  >
                    {isVi ? tab.vi : tab.en}
                  </button>
                );
              })}
            </div>
          </div>

          {/* TAB 1: ALL 6 ZONES WITH BANNER-TONED STORYBOOK WATERCOLOR ILLUSTRATIONS */}
          {activeTab === 'zones' && (
            <div className="mt-10 space-y-10">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {FESTIVAL_ZONES.map((zone, idx) => {
                  const Icon = ZONE_ICONS[idx % ZONE_ICONS.length];
                  return (
                    <article
                      key={zone.number}
                      style={{
                        backgroundColor: zone.softBg,
                        borderColor: `${zone.accentHex}50`,
                      }}
                      className="overflow-hidden rounded-3xl border flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5 shadow-sm"
                    >
                      <div>
                        {zone.image && (
                          <div className="aspect-[16/9] w-full overflow-hidden border-b border-[#2D4F3E]/10 bg-white">
                            <img
                              src={zone.image}
                              alt={isVi ? zone.titleVi : zone.titleEn}
                              referrerPolicy="no-referrer"
                              className="h-full w-full object-cover object-center"
                            />
                          </div>
                        )}
                        <div className="p-6">
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span
                              className="inline-flex items-center gap-1.5 font-mono font-bold tabular-nums"
                              style={{ color: zone.accentHex }}
                            >
                              <Icon className="h-4 w-4 shrink-0" />
                              <span>TRẠM {zone.number}</span>
                            </span>
                            <span className="font-semibold text-[#4B5E53] text-right">
                              {isVi ? zone.tagVi : zone.tagEn}
                            </span>
                          </div>

                          <h3 className="mt-3 font-display text-xl font-bold text-[#24302A] leading-snug">
                            {isVi ? zone.titleVi : zone.titleEn}
                          </h3>

                          <p className="mt-2.5 text-sm leading-relaxed text-[#4B5E53]">
                            {isVi ? zone.bodyVi : zone.bodyEn}
                          </p>
                        </div>
                      </div>

                      <div
                        className="mx-6 mb-5 pt-3 border-t text-xs font-bold flex items-center gap-1.5"
                        style={{
                          borderColor: `${zone.accentHex}30`,
                          color: zone.accentHex,
                        }}
                      >
                        <Sparkles className="h-3.5 w-3.5 shrink-0" />
                        <span>{isVi ? zone.highlightVi : zone.highlightEn}</span>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Community Art Troupe Milestone Showcase */}
              <div className="overflow-hidden rounded-3xl border-2 border-[#E89F3C]/50 bg-[#2D4F3E] text-[#FAF7F0] grid grid-cols-1 lg:grid-cols-12 shadow-md">
                <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-6">
                  <div className="space-y-3">
                    <p className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F4BE6A]">
                      <Sparkles className="h-4 w-4 shrink-0" />
                      <span>
                        {isVi
                          ? 'DẤU ẤN LỊCH SỬ · NGÀY 19/12/2026'
                          : 'SPECIAL MILESTONE · DEC 19, 2026'}
                      </span>
                    </p>
                    <h3 className="font-display text-2xl sm:text-3xl font-bold leading-snug">
                      {isVi
                        ? 'Ra Mắt Đoàn Nghệ Thuật Cộng Đồng Thank You Life'
                        : 'Launching the Thank You Life Community Art Troupe'}
                    </h3>
                    <p className="text-sm sm:text-base leading-relaxed text-[#FAF7F0]/90">
                      {isVi ? (
                        <>
                          Thank You Life Fest 2026 đánh dấu cột mốc thiêng liêng: lần đầu tiên chính thức ra mắt{' '}
                          <strong className="font-bold text-[#F4BE6A]">
                            Đoàn Nghệ Thuật Cộng đồng Thank You Life
                          </strong>{' '}
                          quy tụ các nghệ sĩ thiện nguyện, người thực hành nghệ thuật chữa lành và tình nguyện viên từ khắp nơi. Sau 2 ngày tại Vườn Ong Vàng, Đoàn sẽ tiếp tục hành trình xuyên suốt Việt Nam: mang âm nhạc, kể chuyện cổ tích, kịch ứng tác và năng lượng của{' '}
                          <strong className="font-bold text-white">Lòng Biết Ơn</strong> đến các trường học và mái ấm nuôi dưỡng trẻ em.
                        </>
                      ) : (
                        <>
                          TYLF 2026 marks a historic launch:{' '}
                          <strong className="font-bold text-[#F4BE6A]">
                            The Thank You Life Community Art Troupe
                          </strong>{' '}
                          uniting volunteer musicians, storytellers, and healing arts practitioners to tour schools, nature-learning spaces, and children’s shelters across Vietnam spreading gratitude and joy.
                        </>
                      )}
                    </p>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => onSelectRoleForSignup('artist')}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E89F3C] px-6 py-3.5 text-sm font-bold text-[#24302A] hover:bg-[#F4BE6A] transition-colors whitespace-nowrap shrink-0 min-h-[48px]"
                    >
                      <Music className="h-4 w-4 shrink-0" />
                      <span>
                        {isVi ? 'Đăng Ký Gia Nhập Đoàn Nghệ Thuật' : 'Join as Artist / Facilitator'}
                      </span>
                      <ArrowDown className="h-4 w-4 shrink-0" />
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 relative min-h-[240px] bg-[#1A3327]">
                  <img
                    src={ASSETS.campfireImg}
                    alt="Unity Campfire & Community Art Troupe watercolor illustration"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover object-center"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 48-HOUR FESTIVAL FLOW */}
          {activeTab === 'schedule' && (
            <div className="mt-10 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="inline-flex items-center gap-2 rounded-xl border border-[#2D4F3E]/15 bg-white p-1.5">
                  <button
                    type="button"
                    onClick={() => setScheduleDay(1)}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs sm:text-sm font-bold transition-colors whitespace-nowrap min-h-[42px] ${
                      scheduleDay === 1
                        ? 'bg-[#2D4F3E] text-[#FAF7F0]'
                        : 'text-[#4B5E53] hover:text-[#2D4F3E]'
                    }`}
                  >
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>
                      {isVi ? 'Ngày 1 · Thứ Bảy 19/12' : 'Day 1 · Sat Dec 19'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleDay(2)}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs sm:text-sm font-bold transition-colors whitespace-nowrap min-h-[42px] ${
                      scheduleDay === 2
                        ? 'bg-[#2D4F3E] text-[#FAF7F0]'
                        : 'text-[#4B5E53] hover:text-[#2D4F3E]'
                    }`}
                  >
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>
                      {isVi ? 'Ngày 2 · Chủ Nhật 20/12' : 'Day 2 · Sun Dec 20'}
                    </span>
                  </button>
                </div>

                <p className="text-xs italic text-[#4B5E53]">
                  {isVi
                    ? 'Lịch trình gợi mở theo tinh thần tự nhiên & phi nỗ lực.'
                    : 'Organic flow adaptable to weather, children’s rhythm, and community energy.'}
                </p>
              </div>

              <div className="divide-y divide-[#2D4F3E]/12 overflow-hidden rounded-2xl border border-[#2D4F3E]/15 bg-white">
                {scheduleSlots.map((slot) => (
                  <div
                    key={slot.time}
                    className={`flex flex-col gap-2 p-5 sm:flex-row sm:items-start sm:gap-6 ${
                      slot.highlight ? 'bg-[#FEF7EC]' : 'bg-white'
                    }`}
                  >
                    <div className="sm:w-36 shrink-0">
                      <span
                        className={`font-mono text-xs sm:text-sm font-bold tabular-nums ${
                          slot.highlight ? 'text-[#C27B16]' : 'text-[#2D4F3E]'
                        }`}
                      >
                        {slot.time}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-lg font-bold text-[#24302A]">
                        {isVi ? slot.titleVi : slot.titleEn}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-[#4B5E53]">
                        {isVi ? slot.descVi : slot.descEn}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: OPEN CALL FOR CO-CREATION & GOLDEN BEE GARDEN */}
          {activeTab === 'cocreate' && (
            <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-4 rounded-2xl border border-[#E89F3C]/45 bg-[#FEF7EC] p-6 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-[#C27B16]">
                    {isVi ? 'Lời Mời Nghệ Sĩ & Workshop' : 'Artists & Facilitators'}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-bold text-[#24302A]">
                    {isVi
                      ? 'Mang Âm Nhạc & Sáng Tạo Tới Rừng ILYA'
                      : 'Share Music, Art & Family Workshops'}
                  </h3>
                  <ul className="mt-4 space-y-2 text-sm text-[#4B5E53] leading-relaxed">
                    <li>
                      ·{' '}
                      {isVi
                        ? 'Acoustic, nhạc cụ dân tộc, handpan, sound healing, nhảy múa tự do & kể chuyện cổ tích.'
                        : 'Acoustic sets, handpan, sound healing, storytelling, and children’s natural crafts.'}
                    </li>
                    <li>
                      ·{' '}
                      <strong className="font-bold text-[#24302A]">
                        {isVi
                          ? '10% quỹ cộng đồng (15.000.000 VNĐ) dành tri ân & hỗ trợ họa cụ/âm thanh cho nghệ sĩ, đối tác.'
                          : '10% of our 150M fund (15M VNĐ) supports artist & workshop partners.'}
                      </strong>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectRoleForSignup('artist')}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#2D4F3E] px-4 py-3 text-sm font-bold text-[#FAF7F0] hover:bg-[#1A3327] transition-colors min-h-[46px]"
                >
                  <Sparkles className="h-4 w-4 shrink-0" />
                  <span>{isVi ? 'Đăng Ký Nghệ Sĩ / Workshop' : 'Apply as Artist / Workshop'}</span>
                </button>
              </div>

              <div className="lg:col-span-4 rounded-2xl border border-[#7BA7BC]/45 bg-[#EFF6FA] p-6 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-[#3C6E87]">
                    {isVi ? 'Tình Nguyện Viên Phụng Sự' : 'Core Service Volunteers'}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-bold text-[#24302A]">
                    {isVi
                      ? 'Chung Tay Dệt Nên Khu Rừng Phép Màu'
                      : 'Co-Build & Nurture the Festival'}
                  </h3>
                  <ul className="mt-4 space-y-2 text-sm text-[#4B5E53] leading-relaxed">
                    <li>
                      ·{' '}
                      {isVi
                        ? 'Các ban: Trang trí tự nhiên, Sân khấu mở, Hỗ trợ Trạm Cứu Hộ Động Vật, Bếp Thuần Chay & Truyền thông.'
                        : 'Teams: Natural Decor, Stage Support, Animal Rescue & Tree Planting, Vegan Kitchen & Media.'}
                    </li>
                    <li>
                      ·{' '}
                      <strong className="font-bold text-[#24302A]">
                        {isVi
                          ? '20% quỹ (30.000.000 VNĐ) chăm lo trọn vẹn bữa ăn thuần chay và cắm trại cho đội ngũ TNV.'
                          : '20% of our 150M fund (30M VNĐ) cares for volunteer meals & camping logistics.'}
                      </strong>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectRoleForSignup('volunteer')}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#E89F3C] px-4 py-3 text-sm font-bold text-[#24302A] hover:bg-[#C27B16] hover:text-white transition-colors min-h-[46px]"
                >
                  <Users className="h-4 w-4 shrink-0" />
                  <span>{isVi ? 'Đăng Ký Tình Nguyện Viên' : 'Join Volunteer Team'}</span>
                </button>
              </div>

              <div className="lg:col-span-4 rounded-2xl border border-[#2D4F3E]/20 bg-white p-6 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-[#2D4F3E]">
                    {isVi ? 'Địa Điểm Đồng Kiến Tạo' : 'Co-Creation Venue Partner'}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-bold text-[#24302A]">
                    {isVi ? 'Vườn Ong Vàng, Phú Xuyên' : 'Golden Bee Garden, Hanoi'}
                  </h3>
                  <ul className="mt-4 space-y-2 text-sm text-[#4B5E53] leading-relaxed">
                    <li>
                      ·{' '}
                      <strong className="font-bold text-[#24302A]">
                        {isVi
                          ? 'Cách trung tâm Hà Nội 45–60 phút'
                          : '45–60 mins south of central Hanoi'}
                      </strong>
                      {isVi
                        ? ', thảm cỏ rộng an toàn cho trẻ em chạy nhảy và dựng lều.'
                        : ' with lush flat lawns ideal for kids and overnight tents.'}
                    </li>
                    <li>
                      ·{' '}
                      <strong className="font-bold text-[#2D4F3E]">
                        {isVi
                          ? '100% Thuần Chay & Leave No Trace'
                          : '100% Plant-Based & Leave No Trace'}
                      </strong>
                      {isVi
                        ? ', không rác thải nhựa dùng một lần.'
                        : '—zero single-use plastics.'}
                    </li>
                  </ul>
                </div>

                <a
                  href={FESTIVAL_INFO.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#2D4F3E]/25 bg-[#EFF4EE] px-4 py-3 text-sm font-bold text-[#2D4F3E] hover:bg-[#E0EAD9] transition-colors min-h-[46px]"
                >
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{isVi ? 'Mở Chỉ Đường Google Maps' : 'Open Google Maps'}</span>
                  <ArrowUpRight className="h-4 w-4 shrink-0" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
