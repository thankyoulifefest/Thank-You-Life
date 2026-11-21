import { CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import {
  CONTRIBUTION_TIERS,
  VIETNAMESE_BANKS,
  type Language,
  type RegRole,
} from '../data/festivalData';
import { saveRegistrationToFirestore } from '../utils/registrationsDb';

export interface SyncedRegistrationResult {
  refCode: string;
  syncedToGoogle: boolean;
  timestamp: string;
  role: RegRole;
  name: string;
  email: string;
  phone: string;
  amount: number;
  bankId: string;
}

interface RegistrationFormProps {
  lang: Language;
  role: RegRole;
  onChangeRole: (role: RegRole) => void;
  senderName: string;
  onChangeSenderName: (val: string) => void;
  selectedAmount: number;
  onSelectAmount: (amount: number) => void;
  selectedBankId: string;
  onSelectBankId: (bankId: string) => void;
  composedLetter: string;
  refCode: string;
  onComplete: (result: SyncedRegistrationResult) => void;
}

export function RegistrationForm({
  lang,
  role,
  onChangeRole,
  senderName,
  onChangeSenderName,
  selectedAmount,
  onSelectAmount,
  selectedBankId,
  onSelectBankId,
  composedLetter,
  refCode,
  onComplete,
}: RegistrationFormProps) {
  const isVi = lang === 'vi';

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [guests, setGuests] = useState('2 người lớn');
  const [attendanceType, setAttendanceType] = useState('Tham gia trong ngày (Picnic)');
  const [selectedMeals, setSelectedMeals] = useState<string[]>([
    'Tự chuẩn bị suất ăn / Vegan Potluck',
  ]);
  const [notes, setNotes] = useState('');
  const [artistCategory, setArtistCategory] = useState(
    'Âm nhạc Acoustic / Nhạc cụ dân tộc / Handpan / Sound Healing'
  );
  const [artistDescription, setArtistDescription] = useState('');
  const [volunteerTeam, setVolunteerTeam] = useState(
    'Ban Hỗ trợ Trạm Cứu Hộ Động Vật & Hoạt động Trồng cây'
  );
  const [volunteerReason, setVolunteerReason] = useState('');
  const [customAmountInput, setCustomAmountInput] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<SyncedRegistrationResult | null>(null);

  const toggleMeal = (meal: string) => {
    setSelectedMeals((prev) =>
      prev.includes(meal) ? prev.filter((item) => item !== meal) : [...prev, meal]
    );
  };

  const handleCustomAmountChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    setCustomAmountInput(digits);
    const num = Number(digits);
    if (!Number.isNaN(num) && num >= 0) {
      onSelectAmount(num);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = senderName.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedPhone || !trimmedEmail) {
      setErrorMsg(
        isVi
          ? 'Vui lòng điền đầy đủ Họ tên, Số điện thoại/Zalo và Email để nhận mẫu VietQR cá nhân hóa.'
          : 'Please complete your Full Name, Phone/Zalo, and Email to receive your personalized VietQR template.'
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMsg(
        isVi
          ? 'Địa chỉ Email chưa đúng định dạng. Vui lòng kiểm tra lại.'
          : 'Please enter a valid email address.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const bankObj = VIETNAMESE_BANKS.find((b) => b.id === selectedBankId);
      const tierLabel =
        selectedAmount > 0
          ? `${new Intl.NumberFormat('vi-VN').format(selectedAmount)}đ`
          : 'Tùy hỷ tại lễ hội';
      const mealsText =
        selectedMeals.length > 0
          ? selectedMeals.join(', ')
          : 'Tự chuẩn bị suất ăn / Vegan Potluck';

      let syncedToGoogle = false;
      let resolvedRefCode = refCode;
      let timestamp = new Date().toISOString();

      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role,
            name: trimmedName,
            phone: trimmedPhone,
            email: trimmedEmail,
            guests,
            attendanceType,
            meals: mealsText,
            notes,
            contributionTier: tierLabel,
            contributionAmount: selectedAmount,
            category: artistCategory,
            description: artistDescription,
            team: volunteerTeam,
            reason: volunteerReason,
            bankApp: bankObj?.name || 'MB Bank',
            invitationLetter: composedLetter,
            refCode,
          }),
        });

        const data = await res.json();
        if (res.ok && data.ok) {
          syncedToGoogle = Boolean(data.syncedToGoogle);
          resolvedRefCode = data.refCode || refCode;
          timestamp = data.timestamp || timestamp;
        }
      } catch {
        syncedToGoogle = false;
      }

      await saveRegistrationToFirestore({
        refCode: resolvedRefCode,
        role,
        name: trimmedName,
        phone: trimmedPhone,
        email: trimmedEmail,
        guests: role === 'attendee' ? guests : '',
        attendanceType: role === 'attendee' ? attendanceType : '',
        meals: role === 'attendee' ? mealsText : '',
        notes,
        contributionAmount: selectedAmount,
        contributionTier: tierLabel,
        bankId: selectedBankId,
        bankApp: bankObj?.name || 'MB Bank',
        category: role === 'artist' ? artistCategory : '',
        description: role === 'artist' ? artistDescription : '',
        team: role === 'volunteer' ? volunteerTeam : '',
        reason: role === 'volunteer' ? volunteerReason : '',
        invitationLetter: composedLetter,
        syncedToGoogle,
      });

      const result: SyncedRegistrationResult = {
        refCode: resolvedRefCode,
        syncedToGoogle,
        timestamp,
        role,
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        amount: selectedAmount,
        bankId: selectedBankId,
      };

      setSyncResult(result);
      onComplete(result);

      setTimeout(() => {
        const el = document.getElementById('vietqr-template');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : isVi
            ? 'Không thể kết nối máy chủ đồng bộ. Vui lòng thử lại.'
            : 'Unable to sync right now. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="signup-sync"
      className="border-b border-[#2D4F3E]/12 watercolor-meadow py-14 sm:py-20"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold text-[#C86D51]">
            {isVi
              ? 'Bước 02 · Biểu Mẫu Đồng Bộ Google Form / Google Sheets & Cổng Quản Trị'
              : 'Step 02 · Google Form Sync & Organizer Sign-Up'}
          </p>
          <h2
            className="mt-2 font-display text-2xl font-bold tracking-tight text-[#24302A] sm:text-4xl"
            style={{ textWrap: 'balance' }}
          >
            {isVi
              ? 'Đăng Ký Đồng Hành & Nhận Thẻ VietQR Cá Nhân Hóa'
              : 'Sign Up & Generate Your Personalized VietQR Card'}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-[#4B5E53]">
            {isVi
              ? 'Thông tin của bạn được đồng bộ trực tiếp về hệ thống Google Sheets và Cổng Quản Trị chính thức của Thank You Life Fest 2026 để giữ chỗ miễn phí và đối soát quyên góp.'
              : 'Your registration syncs directly to Thank You Life Fest 2026’s official ledger, securing free festival entry and pairing a verified reference code with your VietQR card.'}
          </p>
        </div>

        {/* Role Tabs */}
        <div className="mt-8 rounded-2xl border border-[#2D4F3E]/15 bg-white p-5 sm:p-8">
          <div
            role="tablist"
            aria-label="Registration role"
            className="grid grid-cols-1 gap-1.5 rounded-xl bg-[#EFF4EE] p-1.5 sm:grid-cols-3"
          >
            {(
              [
                {
                  id: 'attendee',
                  vi: 'Gia Đình & Người Ủng Hộ',
                  en: 'Attendee & Donor',
                },
                {
                  id: 'artist',
                  vi: 'Nghệ Sĩ & Workshop',
                  en: 'Artist & Facilitator',
                },
                {
                  id: 'volunteer',
                  vi: 'Tình Nguyện Viên',
                  en: 'Service Volunteer',
                },
              ] as const
            ).map((tab) => {
              const active = role === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onChangeRole(tab.id)}
                  className={`rounded-lg px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap truncate min-h-[44px] ${
                    active
                      ? 'bg-[#2D4F3E] text-[#FAF7F0]'
                      : 'text-[#4B5E53] hover:text-[#2D4F3E]'
                  }`}
                >
                  {isVi ? tab.vi : tab.en}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
            {/* Core Donor/Attendee Identity */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="reg-name" className="block text-xs font-semibold text-[#1F4E32]">
                  {isVi ? 'Họ và Tên *' : 'Full Name *'}
                </label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => onChangeSenderName(e.target.value)}
                  placeholder={isVi ? 'Nguyễn Minh An' : 'Nguyen Minh An'}
                  className="mt-1.5 w-full rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3.5 py-2.5 text-sm text-[#1E1C18] focus:border-[#1F4E32] focus:bg-white focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label htmlFor="reg-phone" className="block text-xs font-semibold text-[#1F4E32]">
                  {isVi ? 'Số điện thoại / Zalo *' : 'Phone / Zalo *'}
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912 345 678"
                  className="mt-1.5 w-full rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3.5 py-2.5 text-sm text-[#1E1C18] focus:border-[#1F4E32] focus:bg-white focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label htmlFor="reg-email" className="block text-xs font-semibold text-[#1F4E32]">
                  {isVi ? 'Email nhận mẫu & QR *' : 'Email for Template *'}
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ban@example.com"
                  className="mt-1.5 w-full rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3.5 py-2.5 text-sm text-[#1E1C18] focus:border-[#1F4E32] focus:bg-white focus:outline-none min-h-[44px]"
                />
              </div>
            </div>

            {/* Role-Specific Fields */}
            {role === 'attendee' && (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="reg-guests"
                      className="block text-xs font-semibold text-[#1F4E32]"
                    >
                      {isVi
                        ? 'Số lượng thành viên (Người lớn & Trẻ em)'
                        : 'Group Size (Adults & Children)'}
                    </label>
                    <input
                      id="reg-guests"
                      type="text"
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      placeholder={
                        isVi ? 'VD: 2 người lớn, 1 trẻ em (hoặc Gửi ủng hộ từ xa)' : 'e.g. 2 adults, 1 child'
                      }
                      className="mt-1.5 w-full rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3.5 py-2.5 text-sm text-[#1E1C18] focus:border-[#1F4E32] focus:bg-white focus:outline-none min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="reg-attendance"
                      className="block text-xs font-semibold text-[#1F4E32]"
                    >
                      {isVi ? 'Hình thức tham dự' : 'Attendance Format'}
                    </label>
                    <select
                      id="reg-attendance"
                      value={attendanceType}
                      onChange={(e) => setAttendanceType(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3.5 py-2.5 text-sm text-[#1E1C18] focus:border-[#1F4E32] focus:bg-white focus:outline-none min-h-[44px]"
                    >
                      <option value="Tham gia trong ngày (Picnic)">
                        {isVi ? 'Tham gia trong ngày (Picnic)' : 'Day Picnic Participation'}
                      </option>
                      <option value="Cắm trại qua đêm (Camping)">
                        {isVi
                          ? 'Cắm trại qua đêm (Tự mang / Thuê lều)'
                          : 'Overnight Camping (Bring / Rent Tent)'}
                      </option>
                      <option value="Ủng hộ từ xa & Gửi Thư Mời">
                        {isVi
                          ? 'Ủng hộ từ xa & Lan tỏa Thư Mời'
                          : 'Remote Donor & Invitation Ambassador'}
                      </option>
                    </select>
                  </div>
                </div>

                {/* Vegan Meals */}
                <div className="rounded-xl border border-[#1F4E32]/12 bg-[#FAF8F3] p-4">
                  <p className="text-xs font-semibold text-[#1F4E32]">
                    {isVi
                      ? 'Suất ăn 100% Thuần Chay tại Vườn Ong Vàng (Tùy chọn)'
                      : '100% Plant-Based Vegan Meals (Optional)'}
                  </p>
                  <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {[
                      'Bữa Sáng (Chủ Nhật 20/12)',
                      'Bữa Trưa (19/12 & 20/12)',
                      'Bữa Tối (Thứ Bảy 19/12)',
                      'Tự chuẩn bị suất ăn / Vegan Potluck',
                    ].map((meal) => (
                      <label
                        key={meal}
                        className="flex items-center gap-2.5 rounded-lg border border-[#1F4E32]/12 bg-white px-3 py-2.5 text-xs sm:text-sm text-[#1E1C18] cursor-pointer hover:border-[#E09A1B] min-h-[44px]"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMeals.includes(meal)}
                          onChange={() => toggleMeal(meal)}
                          className="h-4 w-4 accent-[#1F4E32]"
                        />
                        <span>{meal}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {role === 'artist' && (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="artist-category"
                    className="block text-xs font-semibold text-[#1F4E32]"
                  >
                    {isVi ? 'Lĩnh vực đóng góp nghệ thuật' : 'Artistic & Workshop Discipline'}
                  </label>
                  <select
                    id="artist-category"
                    value={artistCategory}
                    onChange={(e) => setArtistCategory(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3.5 py-2.5 text-sm text-[#1E1C18] focus:border-[#1F4E32] focus:bg-white focus:outline-none min-h-[44px]"
                  >
                    <option value="Âm nhạc Acoustic / Nhạc cụ dân tộc / Handpan / Sound Healing">
                      Âm nhạc Acoustic / Handpan / Sound Healing
                    </option>
                    <option value="Nhảy múa tự do / Kịch ứng tác / Kể chuyện cổ tích">
                      Nhảy múa tự do / Kịch ứng tác / Kể chuyện cổ tích
                    </option>
                    <option value="Workshop thủ công lấy cảm hứng Waldorf-Steiner / Vẽ / Nặn đất sét">
                      {isVi
                        ? 'Workshop thủ công lấy cảm hứng Waldorf–Steiner / Vẽ / Nặn đất sét'
                        : 'Waldorf–Steiner inspired craft workshop / Watercolor / Clay'}
                    </option>
                    <option value="Yoga / Khí công / Thiền chánh niệm cho gia đình">
                      Yoga / Khí công / Thiền chánh niệm cho gia đình
                    </option>
                  </select>
                </div>
                <div>
                  <label htmlFor="artist-desc" className="block text-xs font-semibold text-[#1F4E32]">
                    {isVi
                      ? 'Mô tả tiết mục hoặc workshop bạn muốn đồng kiến tạo'
                      : 'Describe your performance or workshop idea'}
                  </label>
                  <textarea
                    id="artist-desc"
                    rows={3}
                    value={artistDescription}
                    onChange={(e) => setArtistDescription(e.target.value)}
                    placeholder={
                      isVi
                        ? 'Chia sẻ thời lượng, link portfolio hoặc nhu cầu âm thanh...'
                        : 'Share duration, portfolio link, or audio setup notes...'
                    }
                    className="mt-1.5 w-full rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3.5 py-2.5 text-sm text-[#1E1C18] focus:border-[#1F4E32] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            )}

            {role === 'volunteer' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="vol-team" className="block text-xs font-semibold text-[#1F4E32]">
                    {isVi ? 'Ban phụng sự bạn muốn tham gia' : 'Core Service Team'}
                  </label>
                  <select
                    id="vol-team"
                    value={volunteerTeam}
                    onChange={(e) => setVolunteerTeam(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3.5 py-2.5 text-sm text-[#1E1C18] focus:border-[#1F4E32] focus:bg-white focus:outline-none min-h-[44px]"
                  >
                    <option value="Ban Hỗ trợ Trạm Cứu Hộ Động Vật & Hoạt động Trồng cây">
                      Ban Hỗ trợ Trạm Cứu Hộ Động Vật & Trồng cây
                    </option>
                    <option value="Ban Trang trí & Kiến tạo Khu rừng phép màu bằng vật liệu tự nhiên">
                      Ban Trang trí & Kiến tạo Khu rừng phép màu
                    </option>
                    <option value="Ban Điều phối Sân khấu Mở & Âm thanh ánh sáng">
                      Ban Điều phối Sân khấu Mở & Âm thanh
                    </option>
                    <option value="Ban Bếp Thuần Chay Sẻ Chia & Đón tiếp">
                      Ban Bếp Thuần Chay Sẻ Chia & Đón tiếp
                    </option>
                    <option value="Ban Truyền thông, Nhiếp ảnh & Ghi lại khoảnh khắc">
                      Ban Truyền thông, Nhiếp ảnh & Ghi lại khoảnh khắc
                    </option>
                  </select>
                </div>
                <div>
                  <label htmlFor="vol-reason" className="block text-xs font-semibold text-[#1F4E32]">
                    {isVi
                      ? 'Điều gì chạm đến trái tim bạn ở Thank You Life Fest 2026?'
                      : 'What inspires you to volunteer with TYLF 2026?'}
                  </label>
                  <textarea
                    id="vol-reason"
                    rows={3}
                    value={volunteerReason}
                    onChange={(e) => setVolunteerReason(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3.5 py-2.5 text-sm text-[#1E1C18] focus:border-[#1F4E32] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Vietnamese Bank & Donation Tier Binding */}
            <div className="rounded-xl border border-[#E09A1B]/45 bg-[#FAF8F3] p-4 sm:p-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="reg-bank"
                    className="block text-xs font-semibold text-[#1F4E32]"
                  >
                    {isVi
                      ? 'Ngân hàng Việt Nam bạn sử dụng để quét VietQR'
                      : 'Your Vietnamese Bank App for VietQR'}
                  </label>
                  <select
                    id="reg-bank"
                    value={selectedBankId}
                    onChange={(e) => onSelectBankId(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[#1F4E32]/20 bg-white px-3.5 py-2.5 text-sm text-[#1E1C18] focus:border-[#1F4E32] focus:outline-none min-h-[44px]"
                  >
                    {VIETNAMESE_BANKS.map((bank) => (
                      <option key={bank.id} value={bank.id}>
                        {bank.name} — {bank.appName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="reg-custom-amount"
                    className="block text-xs font-semibold text-[#1F4E32]"
                  >
                    {isVi
                      ? 'Mức đóng góp tùy hỷ cho mã VietQR (VNĐ)'
                      : 'Contribution Amount for VietQR (VNĐ)'}
                  </label>
                  <input
                    id="reg-custom-amount"
                    type="text"
                    inputMode="numeric"
                    value={
                      customAmountInput !== ''
                        ? customAmountInput
                        : selectedAmount > 0
                          ? String(selectedAmount)
                          : ''
                    }
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    placeholder={isVi ? 'VD: 555555 (hoặc để trống)' : 'e.g. 555555'}
                    className="mt-1.5 w-full rounded-lg border border-[#1F4E32]/20 bg-white px-3.5 py-2.5 font-mono text-sm text-[#1E1C18] tabular-nums focus:border-[#1F4E32] focus:outline-none min-h-[44px]"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {CONTRIBUTION_TIERS.map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => {
                      setCustomAmountInput('');
                      onSelectAmount(tier.amount);
                    }}
                    className={`rounded-lg border px-3 py-2 font-mono text-xs font-semibold tabular-nums transition-colors whitespace-nowrap shrink-0 min-h-[40px] ${
                      selectedAmount === tier.amount
                        ? 'border-[#1F4E32] bg-[#1F4E32] text-[#FAF8F3]'
                        : 'border-[#1F4E32]/20 bg-white text-[#1E1C18] hover:border-[#E09A1B]'
                    }`}
                  >
                    {tier.labelFormatted}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setCustomAmountInput('');
                    onSelectAmount(0);
                  }}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[40px] ${
                    selectedAmount === 0
                      ? 'border-[#1F4E32] bg-[#1F4E32] text-[#FAF8F3]'
                      : 'border-[#1F4E32]/20 bg-white text-[#1E1C18] hover:border-[#E09A1B]'
                  }`}
                >
                  {isVi ? 'Tùy tâm khi quét QR' : 'Open QR Amount'}
                </button>
              </div>
            </div>

            {/* Optional Note */}
            <div>
              <label htmlFor="reg-notes" className="block text-xs font-semibold text-[#1F4E32]">
                {isVi
                  ? 'Ghi chú thêm (Món chay Potluck, hóa trang hoặc lời chúc)'
                  : 'Additional Notes (Vegan Potluck, Costume, or Blessing)'}
              </label>
              <input
                id="reg-notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  isVi
                    ? 'VD: Nhà mình mang bánh chuối yến mạch thuần chay...'
                    : 'e.g. Bringing homemade vegan banana bread...'
                }
                className="mt-1.5 w-full rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3.5 py-2.5 text-sm text-[#1E1C18] focus:border-[#1F4E32] focus:bg-white focus:outline-none min-h-[44px]"
              />
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900"
              >
                {errorMsg}
              </div>
            )}

            {syncResult && (
              <div className="rounded-lg border border-[#1F4E32]/30 bg-[#EEF3EB] px-4 py-3 text-sm text-[#1F4E32]">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#1F4E32]" />
                  <div>
                    <p className="font-semibold">
                      {isVi
                        ? `Đã đồng bộ thành công · Mã tham chiếu: ${syncResult.refCode}`
                        : `Registration synced · Reference Code: ${syncResult.refCode}`}
                    </p>
                    <p className="mt-0.5 text-xs text-[#4B5D4F]">
                      {syncResult.syncedToGoogle
                        ? isVi
                          ? 'Dữ liệu đã được ghi nhận trực tiếp trên Google Sheets chính thức của TYLF 2026. Mẫu thư mời và mã VietQR cá nhân hóa của bạn đã sẵn sàng ngay bên dưới.'
                          : 'Your submission was recorded in the official TYLF 2026 Google Sheets ledger. Your personalized template & VietQR card are ready below.'
                        : isVi
                          ? 'Đã tạo hồ sơ & mã VietQR cá nhân hóa bên dưới. Vui lòng giữ mã tham chiếu khi chuyển khoản.'
                          : 'Your personalized template & VietQR card are ready below. Keep your reference code when transferring.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-[#4B5D4F]">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#1F4E32]" />
                <span>
                  {isVi
                    ? 'Kết nối bảo mật tới Google Apps Script của Thank You Life Network'
                    : 'Secured sync to Thank You Life Network Google Ledger'}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1F4E32] px-6 py-3.5 text-sm font-bold text-[#FAF8F3] hover:bg-[#163924] disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 min-h-[48px]"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>
                  {isSubmitting
                    ? isVi
                      ? 'Đang đồng bộ Google Form...'
                      : 'Syncing to Google Form...'
                    : isVi
                      ? 'Đồng Bộ & Tạo Mẫu VietQR Ngay'
                      : 'Sync & Generate VietQR Card'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
