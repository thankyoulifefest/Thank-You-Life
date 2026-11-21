import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  LogIn,
  LogOut,
  Menu,
  Music,
  Plus,
  Search,
  Shield,
  Trash2,
  UserCheck,
  X,
} from 'lucide-react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ASSETS,
  FESTIVAL_INFO,
  OFFICIAL_BANK,
  VIETNAMESE_BANKS,
  type Language,
  type RegRole,
} from '../data/festivalData';
import {
  PRIMARY_ADMIN_EMAIL,
  auth,
  googleProvider,
} from '../firebase';
import {
  addCoAdmin,
  checkIsCoAdmin,
  deleteRegistrationFromFirestore,
  removeCoAdmin,
  saveCampaignSettings,
  saveRegistrationToFirestore,
  subscribeCampaignSettings,
  subscribeCoAdmins,
  subscribeRegistrations,
  syncPublicStatsFromAdmin,
  updateRegistrationInFirestore,
  type AdminUserRecord,
  type CampaignSettings,
  type CheckInStatus,
  type PaymentStatus,
  type RegistrationRecord,
} from '../utils/registrationsDb';
import { parseOnlineMusicUrl } from '../utils/musicPlayer';

type AdminTab = 'registrations' | 'fundraising' | 'access';

interface AdminDashboardProps {
  lang: Language;
  onChangeLang: (lang: Language) => void;
  onExitAdmin: () => void;
}

function formatVndNumber(val: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(Math.round(val || 0))} VNĐ`;
}

function formatDateTime(ms: number): string {
  if (!ms) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ms));
}

function escapeCsvCell(value: unknown): string {
  const str = String(value ?? '').replace(/\r?\n/g, ' ');
  if (/[",]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function AdminDashboard({
  lang,
  onChangeLang,
  onExitAdmin,
}: AdminDashboardProps) {
  const isVi = lang === 'vi';

  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('registrations');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [records, setRecords] = useState<RegistrationRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const [settings, setSettings] = useState<CampaignSettings>({
    goalVnd: FESTIVAL_INFO.fundraisingGoalVnd,
    offlineVerifiedVnd: 0,
    offlineDonorCount: 0,
    musicUrl: '',
    musicTitle: '',
    updatedBy: '',
    updatedAtMs: 0,
  });

  const [coAdmins, setCoAdmins] = useState<AdminUserRecord[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | RegRole>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | PaymentStatus>('all');
  const [checkInFilter, setCheckInFilter] = useState<'all' | CheckInStatus>('all');

  // Inspector drawer
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editPaymentStatus, setEditPaymentStatus] = useState<PaymentStatus>('pending');
  const [editCheckInStatus, setEditCheckInStatus] = useState<CheckInStatus>('registered');
  const [editAmount, setEditAmount] = useState<string>('0');
  const [editAdminNotes, setEditAdminNotes] = useState<string>('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Manual entry modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [manualRole, setManualRole] = useState<RegRole>('attendee');
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualGuests, setManualGuests] = useState('1 người lớn');
  const [manualAmount, setManualAmount] = useState('555555');
  const [manualBankId, setManualBankId] = useState('mb');
  const [manualPaymentStatus, setManualPaymentStatus] = useState<PaymentStatus>('verified');
  const [manualNotes, setManualNotes] = useState('');
  const [submittingManual, setSubmittingManual] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  // Campaign settings form
  const [goalInput, setGoalInput] = useState(String(FESTIVAL_INFO.fundraisingGoalVnd));
  const [offlineVndInput, setOfflineVndInput] = useState('0');
  const [offlineCountInput, setOfflineCountInput] = useState('0');
  const [musicUrlInput, setMusicUrlInput] = useState('');
  const [musicTitleInput, setMusicTitleInput] = useState('');
  const [settingsErrorMsg, setSettingsErrorMsg] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState<string | null>(null);

  // Co-admin form
  const [coUid, setCoUid] = useState('');
  const [coEmail, setCoEmail] = useState('');
  const [coName, setCoName] = useState('');
  const [addingCoAdmin, setAddingCoAdmin] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setAuthError(null);
      if (!nextUser) {
        setIsAuthorized(false);
        setAuthReady(true);
        return;
      }

      const emailMatch =
        nextUser.emailVerified &&
        nextUser.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();
      if (emailMatch) {
        setIsAuthorized(true);
        setAuthReady(true);
        return;
      }

      if (nextUser.emailVerified) {
        const coAdminOk = await checkIsCoAdmin(nextUser.uid);
        setIsAuthorized(coAdminOk);
      } else {
        setIsAuthorized(false);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authReady || !isAuthorized) {
      setLoadingRecords(false);
      return;
    }

    setLoadingRecords(true);
    setDataError(null);

    const unsubRegs = subscribeRegistrations(
      (rows) => {
        setRecords(rows);
        setLoadingRecords(false);
      },
      (err) => {
        setDataError(err.message);
        setLoadingRecords(false);
      }
    );

    const unsubSettings = subscribeCampaignSettings((nextSettings) => {
      setSettings(nextSettings);
      setGoalInput(String(nextSettings.goalVnd));
      setOfflineVndInput(String(nextSettings.offlineVerifiedVnd));
      setOfflineCountInput(String(nextSettings.offlineDonorCount));
      setMusicUrlInput(nextSettings.musicUrl || '');
      setMusicTitleInput(nextSettings.musicTitle || '');
    });

    let unsubAdmins: (() => void) | undefined;
    if (user?.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
      unsubAdmins = subscribeCoAdmins(
        (list) => setCoAdmins(list),
        () => {}
      );
    }

    return () => {
      unsubRegs();
      unsubSettings();
      if (unsubAdmins) unsubAdmins();
    };
  }, [authReady, isAuthorized, user?.email]);

  useEffect(() => {
    if (!authReady || !isAuthorized || loadingRecords) return;
    void syncPublicStatsFromAdmin(records, settings);
  }, [authReady, isAuthorized, loadingRecords, records, settings]);

  const selectedRecord = useMemo(
    () => records.find((r) => r.id === selectedId) || null,
    [records, selectedId]
  );

  useEffect(() => {
    if (!selectedRecord) return;
    setEditPaymentStatus(selectedRecord.paymentStatus);
    setEditCheckInStatus(selectedRecord.checkInStatus);
    setEditAmount(String(selectedRecord.contributionAmount));
    setEditAdminNotes(selectedRecord.adminNotes);
    setConfirmDelete(false);
  }, [selectedRecord]);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Sign-in was cancelled or failed.');
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setRecords([]);
    setSelectedId(null);
  };

  const metrics = useMemo(() => {
    let verifiedOnlineVnd = 0;
    let verifiedOnlineCount = 0;
    let pendingVnd = 0;
    let pendingCount = 0;
    let attendeeCount = 0;
    let artistCount = 0;
    let volunteerCount = 0;
    let checkedInCount = 0;

    for (const r of records) {
      if (r.role === 'attendee') attendeeCount += 1;
      if (r.role === 'artist') artistCount += 1;
      if (r.role === 'volunteer') volunteerCount += 1;
      if (r.checkInStatus === 'checked_in') checkedInCount += 1;

      if (r.paymentStatus === 'verified') {
        verifiedOnlineVnd += r.contributionAmount;
        if (r.contributionAmount > 0) verifiedOnlineCount += 1;
      } else if (r.paymentStatus === 'pending' && r.contributionAmount > 0) {
        pendingVnd += r.contributionAmount;
        pendingCount += 1;
      }
    }

    const totalVerifiedVnd = verifiedOnlineVnd + settings.offlineVerifiedVnd;
    const goalVnd = Math.max(1, settings.goalVnd || FESTIVAL_INFO.fundraisingGoalVnd);
    const goalPercent = Math.min(100, Math.round((totalVerifiedVnd / goalVnd) * 100));

    return {
      verifiedOnlineVnd,
      verifiedOnlineCount,
      totalVerifiedVnd,
      pendingVnd,
      pendingCount,
      attendeeCount,
      artistCount,
      volunteerCount,
      checkedInCount,
      goalPercent,
    };
  }, [records, settings]);

  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return records.filter((r) => {
      if (roleFilter !== 'all' && r.role !== roleFilter) return false;
      if (paymentFilter !== 'all' && r.paymentStatus !== paymentFilter) return false;
      if (checkInFilter !== 'all' && r.checkInStatus !== checkInFilter) return false;
      if (!q) return true;
      return (
        r.refCode.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.notes.toLowerCase().includes(q) ||
        r.adminNotes.toLowerCase().includes(q)
      );
    });
  }, [records, searchQuery, roleFilter, paymentFilter, checkInFilter]);

  const bankBreakdown = useMemo(() => {
    const map = new Map<string, { label: string; count: number; verifiedVnd: number }>();
    for (const r of records) {
      const label = r.bankApp || 'Other';
      const entry = map.get(label) || { label, count: 0, verifiedVnd: 0 };
      entry.count += 1;
      if (r.paymentStatus === 'verified') {
        entry.verifiedVnd += r.contributionAmount;
      }
      map.set(label, entry);
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [records]);

  const handleQuickVerify = async (rec: RegistrationRecord) => {
    const nextStatus: PaymentStatus =
      rec.paymentStatus === 'verified' ? 'pending' : 'verified';
    await updateRegistrationInFirestore(rec.id, {
      paymentStatus: nextStatus,
      verifiedBy: nextStatus === 'verified' ? user?.email || PRIMARY_ADMIN_EMAIL : '',
    });
    setActionNotice(
      nextStatus === 'verified'
        ? `${rec.refCode} marked verified.`
        : `${rec.refCode} reverted to pending.`
    );
    setTimeout(() => setActionNotice(null), 2400);
  };

  const handleQuickCheckIn = async (rec: RegistrationRecord) => {
    const nextStatus: CheckInStatus =
      rec.checkInStatus === 'checked_in' ? 'registered' : 'checked_in';
    await updateRegistrationInFirestore(rec.id, {
      checkInStatus: nextStatus,
    });
  };

  const handleSaveInspector = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;
    setSavingEdit(true);
    try {
      const parsedAmount = Math.max(0, Math.round(Number(editAmount.replace(/\D/g, '')) || 0));
      await updateRegistrationInFirestore(selectedRecord.id, {
        paymentStatus: editPaymentStatus,
        checkInStatus: editCheckInStatus,
        contributionAmount: parsedAmount,
        contributionTier:
          parsedAmount > 0
            ? `${new Intl.NumberFormat('vi-VN').format(parsedAmount)}đ`
            : 'Tùy hỷ tại lễ hội',
        adminNotes: editAdminNotes,
        verifiedBy:
          editPaymentStatus === 'verified'
            ? user?.email || PRIMARY_ADMIN_EMAIL
            : '',
      });
      setActionNotice(
        isVi
          ? `Đã cập nhật hồ sơ ${selectedRecord.refCode}`
          : `Updated ${selectedRecord.refCode}`
      );
      setTimeout(() => setActionNotice(null), 2400);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteRecord = async () => {
    if (!selectedRecord) return;
    setSavingEdit(true);
    try {
      await deleteRegistrationFromFirestore(selectedRecord.id);
      setSelectedId(null);
      setConfirmDelete(false);
      setActionNotice(isVi ? 'Đã xóa hồ sơ.' : 'Registration deleted.');
      setTimeout(() => setActionNotice(null), 2400);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleManualCreate = async (e: FormEvent) => {
    e.preventDefault();
    setManualError(null);
    if (!manualName.trim() || !manualPhone.trim() || !manualEmail.trim()) {
      setManualError(
        isVi
          ? 'Vui lòng nhập Họ tên, SĐT/Zalo và Email.'
          : 'Please enter Full Name, Phone/Zalo, and Email.'
      );
      return;
    }

    setSubmittingManual(true);
    try {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let suffix = '';
      for (let i = 0; i < 4; i += 1) {
        suffix += chars[Math.floor(Math.random() * chars.length)];
      }
      const refCode = `TYLF26-${suffix}`;
      const amountNum = Math.max(0, Math.round(Number(manualAmount.replace(/\D/g, '')) || 0));
      const bankObj = VIETNAMESE_BANKS.find((b) => b.id === manualBankId);

      await saveRegistrationToFirestore({
        refCode,
        role: manualRole,
        name: manualName.trim(),
        phone: manualPhone.trim(),
        email: manualEmail.trim(),
        guests: manualGuests.trim(),
        attendanceType: 'Đăng ký trực tiếp qua Ban Tổ Chức',
        meals: 'Tự chuẩn bị suất ăn / Vegan Potluck',
        notes: manualNotes.trim(),
        contributionAmount: amountNum,
        contributionTier:
          amountNum > 0
            ? `${new Intl.NumberFormat('vi-VN').format(amountNum)}đ`
            : 'Tùy hỷ tại lễ hội',
        bankId: manualBankId,
        bankApp: bankObj?.name || 'MB Bank',
        category: '',
        description: '',
        team: '',
        reason: '',
        invitationLetter: '',
        syncedToGoogle: false,
        paymentStatus: amountNum === 0 ? 'not_applicable' : manualPaymentStatus,
        checkInStatus: 'registered',
        adminNotes: 'Added manually via Organizer Console',
        verifiedBy:
          manualPaymentStatus === 'verified'
            ? user?.email || PRIMARY_ADMIN_EMAIL
            : '',
      });

      setShowAddModal(false);
      setManualName('');
      setManualPhone('');
      setManualEmail('');
      setManualNotes('');
      setActionNotice(
        isVi ? `Đã thêm ${refCode}` : `Added ${refCode}`
      );
      setTimeout(() => setActionNotice(null), 2400);
    } catch (err) {
      setManualError(err instanceof Error ? err.message : 'Unable to save registration.');
    } finally {
      setSubmittingManual(false);
    }
  };

  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    setSettingsErrorMsg(null);
    setSettingsSavedMsg(null);

    const trimmedMusicUrl = musicUrlInput.trim();
    if (trimmedMusicUrl) {
      const parsedMusic = parseOnlineMusicUrl(trimmedMusicUrl);
      if (!parsedMusic.valid || !trimmedMusicUrl.startsWith('https://')) {
        setSettingsErrorMsg(
          (isVi ? parsedMusic.errorVi : parsedMusic.errorEn) ||
            (isVi
              ? 'Link nhạc phải bắt đầu bằng https:// hợp lệ.'
              : 'Music URL must be a valid https:// link.')
        );
        return;
      }
    }

    setSavingSettings(true);
    try {
      await saveCampaignSettings({
        goalVnd: Math.max(0, Math.round(Number(goalInput.replace(/\D/g, '')) || 0)),
        offlineVerifiedVnd: Math.max(
          0,
          Math.round(Number(offlineVndInput.replace(/\D/g, '')) || 0)
        ),
        offlineDonorCount: Math.max(
          0,
          Math.round(Number(offlineCountInput.replace(/\D/g, '')) || 0)
        ),
        musicUrl: trimmedMusicUrl,
        musicTitle: musicTitleInput.trim(),
      });
      setSettingsSavedMsg(
        isVi
          ? 'Đã lưu cấu hình quỹ & nhạc nền thành công.'
          : 'Fundraising & music settings saved.'
      );
      setTimeout(() => setSettingsSavedMsg(null), 2600);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddCoAdmin = async (e: FormEvent) => {
    e.preventDefault();
    if (!coUid.trim() || !coEmail.trim() || !coName.trim()) return;
    setAddingCoAdmin(true);
    try {
      await addCoAdmin({
        uid: coUid,
        email: coEmail,
        displayName: coName,
      });
      setCoUid('');
      setCoEmail('');
      setCoName('');
    } finally {
      setAddingCoAdmin(false);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'Ref Code',
      'Created At',
      'Role',
      'Name',
      'Phone',
      'Email',
      'Guests',
      'Attendance Format',
      'Vegan Meals',
      'Amount (VND)',
      'Bank',
      'Payment Status',
      'Check-In Status',
      'Google Sheet Sync',
      'Participant Notes',
      'Organizer Notes',
      'Verified By',
    ];
    const rows = filteredRecords.map((r) => [
      r.refCode,
      formatDateTime(r.createdAtMs),
      r.role,
      r.name,
      r.phone,
      r.email,
      r.guests,
      r.attendanceType,
      r.meals,
      r.contributionAmount,
      r.bankApp,
      r.paymentStatus,
      r.checkInStatus,
      r.syncedToGoogle ? 'Yes' : 'No',
      r.notes,
      r.adminNotes,
      r.verifiedBy,
    ]);

    const csvContent =
      '\uFEFF' +
      [headers, ...rows].map((row) => row.map(escapeCsvCell).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tylf2026-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center px-4">
        <div className="text-sm text-[#4B5D4F]">
          {isVi ? 'Đang kiểm tra phiên đăng nhập...' : 'Verifying organizer session...'}
        </div>
      </div>
    );
  }

  // Unauthenticated or unauthorized gate
  if (!user || !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] text-[#1E1C18] flex flex-col justify-between px-4 py-10">
        <div className="mx-auto w-full max-w-md">
          <button
            type="button"
            onClick={onExitAdmin}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#4B5D4F] hover:text-[#1F4E32] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{isVi ? 'Quay lại trang lễ hội' : 'Back to festival landing page'}</span>
          </button>

          <div className="mt-8 rounded-xl border border-[#1F4E32]/15 bg-white p-8">
            <div className="flex items-center gap-3">
              <img
                src={ASSETS.logo}
                alt="Thank You Life Fest 2026 — Bee Fairy Oneness Magic Forest Badge"
                className="h-12 w-12 rounded-full object-contain shrink-0 drop-shadow-sm"
              />
              <div>
                <h1 className="font-display text-xl font-bold text-[#1F4E32]">
                  {isVi ? 'Cổng Quản Lý Ban Tổ Chức' : 'Organizer Admin Console'}
                </h1>
                <p className="text-xs text-[#4B5D4F]">
                  Thank You Life Fest 2026 · {FESTIVAL_INFO.dates}
                </p>
              </div>
            </div>

            {!user ? (
              <div className="mt-6 space-y-4">
                <p className="text-sm leading-relaxed text-[#4B5D4F]">
                  {isVi
                    ? `Đăng nhập bằng tài khoản Google của Ban Tổ Chức (${PRIMARY_ADMIN_EMAIL}) để xem danh sách đăng ký, đối soát sao kê MB Bank và xuất CSV.`
                    : `Sign in with the official organizer Google account (${PRIMARY_ADMIN_EMAIL}) to manage registrations, reconcile MB Bank transfers, and export CSVs.`}
                </p>

                {authError && (
                  <div className="rounded-lg border border-red-300 bg-red-50 px-3.5 py-2.5 text-xs text-red-900">
                    {authError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={signingIn}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#1F4E32] px-4 py-3 text-sm font-semibold text-[#FAF8F3] hover:bg-[#163924] disabled:opacity-60 transition-colors min-h-[44px]"
                >
                  <LogIn className="h-4 w-4" />
                  <span>
                    {signingIn
                      ? isVi
                        ? 'Đang mở Google...'
                        : 'Opening Google Sign-In...'
                      : isVi
                        ? 'Đăng nhập bằng Google'
                        : 'Sign in with Google'}
                  </span>
                </button>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="rounded-lg border border-[#D97706]/30 bg-[#FEF7E6] p-4 text-xs text-[#1E1C18] space-y-1.5">
                  <p className="font-semibold text-[#92400E]">
                    {isVi ? 'Tài khoản chưa được cấp quyền quản trị' : 'Account not authorized'}
                  </p>
                  <p className="text-[#4B5D4F]">
                    {isVi ? 'Đang đăng nhập: ' : 'Signed in as: '}
                    <span className="font-mono font-semibold text-[#1E1C18]">{user.email}</span>
                  </p>
                  <p className="text-[#4B5D4F]">
                    UID: <span className="font-mono select-all">{user.uid}</span>
                  </p>
                </div>

                <p className="text-xs leading-relaxed text-[#4B5D4F]">
                  {isVi
                    ? `Vui lòng chuyển sang ${PRIMARY_ADMIN_EMAIL} hoặc nhờ quản trị viên chính thêm UID của bạn vào mục Phân quyền.`
                    : `Please switch to ${PRIMARY_ADMIN_EMAIL} or ask the primary organizer to add your UID under Organizer Access.`}
                </p>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-4 py-2.5 text-sm font-semibold text-[#1F4E32] hover:bg-[#EEF3EB] min-h-[44px]"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{isVi ? 'Đăng xuất & đổi tài khoản' : 'Sign out & switch account'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-[#4B5D4F]">
          {OFFICIAL_BANK.bankName} · {OFFICIAL_BANK.accountNumber} · {OFFICIAL_BANK.accountHolder}
        </p>
      </div>
    );
  }

  const navItems: { id: AdminTab; labelVi: string; labelEn: string }[] = [
    {
      id: 'registrations',
      labelVi: 'Đăng ký & Đối soát',
      labelEn: 'Registrations & Ledger',
    },
    {
      id: 'fundraising',
      labelVi: 'Quỹ 150 Triệu & Ngân hàng',
      labelEn: 'Fundraising & Banks',
    },
    {
      id: 'access',
      labelVi: 'Phân quyền BTC',
      labelEn: 'Organizer Access',
    },
  ];

  const isPrimaryAdmin =
    user.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#1E1C18] flex flex-col lg:flex-row">
      {/* Desktop Sidebar (240px) */}
      <aside className="hidden lg:flex lg:w-60 lg:shrink-0 lg:flex-col lg:justify-between border-r border-[#1F4E32]/14 bg-[#EEF3EB]/55 p-5">
        <div>
          <div className="flex items-center gap-2.5 pb-5 border-b border-[#1F4E32]/12">
            <img
              src={ASSETS.logo}
              alt="TYLF 2026 — Bee Fairy Oneness Magic Forest Badge"
              className="h-10 w-10 rounded-full object-contain shrink-0 drop-shadow-sm"
            />
            <div className="min-w-0">
              <p className="font-display text-sm font-bold text-[#1F4E32] truncate">
                TYLF 2026 Admin
              </p>
              <p className="text-[11px] text-[#4B5D4F] truncate">{user.email}</p>
            </div>
          </div>

          <nav aria-label="Admin sections" className="mt-5 space-y-1">
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap truncate min-h-[42px] ${
                    active
                      ? 'bg-[#1F4E32] text-[#FAF8F3]'
                      : 'text-[#4B5D4F] hover:bg-white hover:text-[#1F4E32]'
                  }`}
                >
                  {isVi ? item.labelVi : item.labelEn}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-2 pt-5 border-t border-[#1F4E32]/12">
          <div className="flex items-center rounded-lg border border-[#1F4E32]/15 bg-white p-1">
            <button
              type="button"
              onClick={() => onChangeLang('vi')}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors ${
                lang === 'vi' ? 'bg-[#1F4E32] text-[#FAF8F3]' : 'text-[#4B5D4F]'
              }`}
            >
              Tiếng Việt
            </button>
            <button
              type="button"
              onClick={() => onChangeLang('en')}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors ${
                lang === 'en' ? 'bg-[#1F4E32] text-[#FAF8F3]' : 'text-[#4B5D4F]'
              }`}
            >
              English
            </button>
          </div>

          <button
            type="button"
            onClick={onExitAdmin}
            className="w-full inline-flex items-center gap-2 rounded-lg border border-[#1F4E32]/15 bg-white px-3 py-2 text-xs font-semibold text-[#1F4E32] hover:bg-[#FAF8F3] min-h-[40px]"
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
            <span>{isVi ? 'Xem trang công khai' : 'Public Landing Page'}</span>
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[#4B5D4F] hover:bg-white hover:text-[#1E1C18] min-h-[40px]"
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            <span>{isVi ? 'Đăng xuất' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Workspace Header */}
        <header className="sticky top-0 z-30 border-b border-[#1F4E32]/12 bg-[#FAF8F3]/95 backdrop-blur-sm px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileNavOpen((p) => !p)}
                aria-label="Toggle admin menu"
                className="lg:hidden inline-flex items-center justify-center rounded-lg border border-[#1F4E32]/20 bg-white p-2 text-[#1F4E32] min-h-[40px] min-w-[40px]"
              >
                {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <div className="min-w-0">
                <p className="text-xs text-[#4B5D4F] truncate">
                  TYLF 2026 /{' '}
                  <span className="font-semibold text-[#1F4E32]">
                    {isVi
                      ? navItems.find((i) => i.id === activeTab)?.labelVi
                      : navItems.find((i) => i.id === activeTab)?.labelEn}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {actionNotice && (
                <span className="hidden md:inline text-xs font-medium text-[#16A34A]">
                  {actionNotice}
                </span>
              )}

              <button
                type="button"
                onClick={handleExportCsv}
                disabled={filteredRecords.length === 0}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#1F4E32]/20 bg-white px-3.5 py-2 text-xs font-semibold text-[#1F4E32] hover:bg-[#EEF3EB] disabled:opacity-50 whitespace-nowrap shrink-0 min-h-[40px]"
              >
                <Download className="h-3.5 w-3.5 shrink-0" />
                <span>{isVi ? 'Xuất CSV' : 'Export CSV'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#1F4E32] px-3.5 py-2 text-xs font-semibold text-[#FAF8F3] hover:bg-[#163924] whitespace-nowrap shrink-0 min-h-[40px]"
              >
                <Plus className="h-3.5 w-3.5 shrink-0" />
                <span>{isVi ? 'Thêm hồ sơ' : 'Add Entry'}</span>
              </button>
            </div>
          </div>

          {mobileNavOpen && (
            <div className="lg:hidden mt-3 pt-3 border-t border-[#1F4E32]/12 space-y-1.5">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileNavOpen(false);
                  }}
                  className={`block w-full text-left rounded-lg px-3 py-2.5 text-sm font-medium min-h-[44px] ${
                    activeTab === item.id
                      ? 'bg-[#1F4E32] text-[#FAF8F3]'
                      : 'text-[#1E1C18] bg-white'
                  }`}
                >
                  {isVi ? item.labelVi : item.labelEn}
                </button>
              ))}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => onChangeLang(lang === 'vi' ? 'en' : 'vi')}
                  className="flex-1 rounded-lg border border-[#1F4E32]/20 bg-white px-3 py-2 text-xs font-semibold text-[#1F4E32] min-h-[40px]"
                >
                  {lang === 'vi' ? 'Switch to English' : 'Chuyển Tiếng Việt'}
                </button>
                <button
                  type="button"
                  onClick={onExitAdmin}
                  className="flex-1 rounded-lg border border-[#1F4E32]/20 bg-white px-3 py-2 text-xs font-semibold text-[#1F4E32] min-h-[40px]"
                >
                  {isVi ? 'Trang lễ hội' : 'Public Site'}
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-lg border border-[#1F4E32]/20 bg-white px-3 py-2 text-xs font-medium text-[#4B5D4F] min-h-[40px]"
                >
                  {isVi ? 'Đăng xuất' : 'Sign Out'}
                </button>
              </div>
            </div>
          )}
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1360px] w-full">
          {/* 4-Column KPI Summary Strip */}
          <section
            aria-label="Key metrics"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            <div className="rounded-xl border border-[#1F4E32]/15 bg-white p-4">
              <p className="text-xs font-medium text-[#4B5D4F]">
                {isVi ? 'Quỹ đã đối soát' : 'Verified Funds'}
              </p>
              <p className="mt-1.5 font-mono text-2xl font-bold text-[#1F4E32] tabular-nums">
                {formatVndNumber(metrics.totalVerifiedVnd)}
              </p>
              <p className="mt-1 text-xs text-[#4B5D4F] tabular-nums">
                {metrics.goalPercent}% {isVi ? 'mục tiêu' : 'of'}{' '}
                {formatVndNumber(settings.goalVnd)}
              </p>
            </div>

            <div className="rounded-xl border border-[#1F4E32]/15 bg-white p-4">
              <p className="text-xs font-medium text-[#4B5D4F]">
                {isVi ? 'Chờ đối soát chuyển khoản' : 'Pending Verification'}
              </p>
              <p className="mt-1.5 font-mono text-2xl font-bold text-[#C2800E] tabular-nums">
                {formatVndNumber(metrics.pendingVnd)}
              </p>
              <p className="mt-1 text-xs text-[#4B5D4F] tabular-nums">
                {metrics.pendingCount}{' '}
                {isVi ? 'giao dịch cần kiểm tra' : 'transfers awaiting check'}
              </p>
            </div>

            <div className="rounded-xl border border-[#1F4E32]/15 bg-white p-4">
              <p className="text-xs font-medium text-[#4B5D4F]">
                {isVi ? 'Tổng hồ sơ đăng ký' : 'Total Registrations'}
              </p>
              <p className="mt-1.5 font-mono text-2xl font-bold text-[#1E1C18] tabular-nums">
                {records.length}
              </p>
              <p className="mt-1 text-xs text-[#4B5D4F] tabular-nums">
                {metrics.attendeeCount} {isVi ? 'Tham dự' : 'Attendee'} · {metrics.artistCount}{' '}
                {isVi ? 'Nghệ sĩ' : 'Artist'} · {metrics.volunteerCount}{' '}
                {isVi ? 'TNV' : 'Volunteer'}
              </p>
            </div>

            <div className="rounded-xl border border-[#1F4E32]/15 bg-white p-4">
              <p className="text-xs font-medium text-[#4B5D4F]">
                {isVi ? 'Check-in tại Vườn Ong Vàng' : 'Venue Check-Ins'}
              </p>
              <p className="mt-1.5 font-mono text-2xl font-bold text-[#1E1C18] tabular-nums">
                {metrics.checkedInCount} / {records.length}
              </p>
              <p className="mt-1 text-xs text-[#4B5D4F]">
                {FESTIVAL_INFO.dates} · Phú Xuyên
              </p>
            </div>
          </section>

          {dataError && (
            <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-xs text-red-900">
              {dataError}
            </div>
          )}

          {/* TAB 1: REGISTRATIONS TABLE */}
          {activeTab === 'registrations' && (
            <section className="rounded-xl border border-[#1F4E32]/15 bg-white">
              {/* Filter Bar */}
              <div className="flex flex-col gap-3 border-b border-[#1F4E32]/12 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4B5D4F]" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      isVi
                        ? 'Tìm mã TYLF26-..., tên, SĐT, email...'
                        : 'Search ref code, name, phone, email...'
                    }
                    className="w-full rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] pl-9 pr-3.5 py-2 text-sm text-[#1E1C18] focus:border-[#1F4E32] focus:bg-white focus:outline-none min-h-[40px]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 rounded-lg bg-[#EEF3EB] p-1">
                    {(
                      [
                        { id: 'all', vi: 'Tất cả', en: 'All' },
                        { id: 'attendee', vi: 'Tham dự', en: 'Attendee' },
                        { id: 'artist', vi: 'Nghệ sĩ', en: 'Artist' },
                        { id: 'volunteer', vi: 'TNV', en: 'Volunteer' },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setRoleFilter(tab.id)}
                        className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                          roleFilter === tab.id
                            ? 'bg-white text-[#1F4E32]'
                            : 'text-[#4B5D4F] hover:text-[#1E1C18]'
                        }`}
                      >
                        {isVi ? tab.vi : tab.en}
                      </button>
                    ))}
                  </div>

                  <select
                    aria-label="Filter by payment status"
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value as 'all' | PaymentStatus)}
                    className="rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3 py-2 text-xs font-medium text-[#1E1C18] min-h-[38px]"
                  >
                    <option value="all">{isVi ? 'Mọi thanh toán' : 'All payments'}</option>
                    <option value="pending">{isVi ? 'Chờ đối soát' : 'Pending'}</option>
                    <option value="verified">{isVi ? 'Đã xác nhận' : 'Verified'}</option>
                    <option value="not_applicable">{isVi ? 'Không kèm QR' : 'No pledge'}</option>
                  </select>

                  <select
                    aria-label="Filter by check-in status"
                    value={checkInFilter}
                    onChange={(e) => setCheckInFilter(e.target.value as 'all' | CheckInStatus)}
                    className="rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3 py-2 text-xs font-medium text-[#1E1C18] min-h-[38px]"
                  >
                    <option value="all">{isVi ? 'Mọi check-in' : 'All check-ins'}</option>
                    <option value="registered">{isVi ? 'Đã đăng ký' : 'Registered'}</option>
                    <option value="checked_in">{isVi ? 'Đã check-in' : 'Checked in'}</option>
                    <option value="cancelled">{isVi ? 'Đã hủy' : 'Cancelled'}</option>
                  </select>
                </div>
              </div>

              {/* Table Body */}
              {loadingRecords ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3, 4].map((idx) => (
                    <div
                      key={idx}
                      className="h-11 rounded-lg bg-[#EEF3EB]/60 animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="font-display text-lg font-bold text-[#1E1C18]">
                    {records.length === 0
                      ? isVi
                        ? 'Chưa có hồ sơ đăng ký nào trong cơ sở dữ liệu'
                        : 'No registrations recorded yet'
                      : isVi
                        ? 'Không tìm thấy hồ sơ khớp bộ lọc'
                        : 'No matching registrations found'}
                  </p>
                  <p className="mt-1.5 text-sm text-[#4B5D4F]">
                    {records.length === 0
                      ? isVi
                        ? 'Mỗi lượt gửi biểu mẫu từ trang chủ sẽ tự động lưu tại đây để bạn đối soát.'
                        : 'Submissions from the festival sign-up form will appear here automatically in real time.'
                      : isVi
                        ? 'Thử xóa từ khóa tìm kiếm hoặc đặt lại bộ lọc.'
                        : 'Try clearing your search term or resetting the filters.'}
                  </p>
                  <div className="mt-5 flex justify-center gap-3">
                    {records.length === 0 ? (
                      <button
                        type="button"
                        onClick={() => setShowAddModal(true)}
                        className="rounded-lg bg-[#1F4E32] px-4 py-2 text-xs font-semibold text-[#FAF8F3]"
                      >
                        {isVi ? 'Thêm hồ sơ đầu tiên' : 'Log First Entry'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setRoleFilter('all');
                          setPaymentFilter('all');
                          setCheckInFilter('all');
                        }}
                        className="rounded-lg border border-[#1F4E32]/20 bg-white px-4 py-2 text-xs font-semibold text-[#1F4E32]"
                      >
                        {isVi ? 'Xóa bộ lọc' : 'Reset Filters'}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#1F4E32]/12 bg-[#FAF8F3] text-[11px] font-semibold text-[#4B5D4F]">
                        <th className="py-3 pl-4 pr-3 whitespace-nowrap">
                          {isVi ? 'Mã tham chiếu' : 'Ref Code'}
                        </th>
                        <th className="py-3 px-3 whitespace-nowrap">
                          {isVi ? 'Người đăng ký' : 'Registrant'}
                        </th>
                        <th className="py-3 px-3 whitespace-nowrap">
                          {isVi ? 'Vai trò' : 'Role'}
                        </th>
                        <th className="py-3 px-3 text-right whitespace-nowrap">
                          {isVi ? 'Cam kết (VNĐ)' : 'Pledged'}
                        </th>
                        <th className="py-3 px-3 whitespace-nowrap">
                          {isVi ? 'Đối soát QR' : 'Payment'}
                        </th>
                        <th className="py-3 px-3 whitespace-nowrap">
                          {isVi ? 'Check-in' : 'Check-in'}
                        </th>
                        <th className="py-3 pl-3 pr-4 text-right whitespace-nowrap">
                          {isVi ? 'Thao tác' : 'Actions'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F4E32]/10 text-sm">
                      {filteredRecords.map((rec) => {
                        const isSelected = rec.id === selectedId;
                        return (
                          <tr
                            key={rec.id}
                            onClick={() => setSelectedId(rec.id)}
                            className={`cursor-pointer transition-colors ${
                              isSelected ? 'bg-[#EEF3EB]/80' : 'hover:bg-[#FAF8F3]'
                            }`}
                          >
                            <td className="py-2.5 pl-4 pr-3 align-middle whitespace-nowrap">
                              <span className="font-mono text-xs font-semibold text-[#1F4E32] tabular-nums">
                                {rec.refCode}
                              </span>
                              <div className="font-mono text-[11px] text-[#4B5D4F] tabular-nums">
                                {formatDateTime(rec.createdAtMs)}
                              </div>
                            </td>

                            <td className="py-2.5 px-3 align-middle min-w-[200px]">
                              <div className="font-semibold text-[#1E1C18] truncate max-w-[240px]">
                                {rec.name}
                              </div>
                              <div className="text-xs text-[#4B5D4F] truncate max-w-[260px]">
                                <span className="font-mono">{rec.phone}</span> · {rec.email}
                              </div>
                            </td>

                            <td className="py-2.5 px-3 align-middle whitespace-nowrap text-xs text-[#1E1C18]">
                              {rec.role === 'attendee'
                                ? isVi
                                  ? 'Tham dự'
                                  : 'Attendee'
                                : rec.role === 'artist'
                                  ? isVi
                                    ? 'Nghệ sĩ'
                                    : 'Artist'
                                  : isVi
                                    ? 'Tình nguyện'
                                    : 'Volunteer'}
                            </td>

                            <td className="py-2.5 px-3 align-middle text-right whitespace-nowrap">
                              <span className="font-mono text-xs font-semibold text-[#1E1C18] tabular-nums">
                                {rec.contributionAmount > 0
                                  ? formatVndNumber(rec.contributionAmount)
                                  : '—'}
                              </span>
                              {rec.bankApp && rec.contributionAmount > 0 && (
                                <div className="text-[11px] text-[#4B5D4F]">
                                  {rec.bankApp}
                                </div>
                              )}
                            </td>

                            <td className="py-2.5 px-3 align-middle whitespace-nowrap text-xs">
                              {rec.paymentStatus === 'verified' ? (
                                <span className="inline-flex items-center gap-1 font-semibold text-[#16A34A]">
                                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                  <span>{isVi ? 'Đã nhận' : 'Verified'}</span>
                                </span>
                              ) : rec.paymentStatus === 'pending' ? (
                                <span className="inline-flex items-center gap-1 font-semibold text-[#D97706]">
                                  <Clock className="h-3.5 w-3.5 shrink-0" />
                                  <span>{isVi ? 'Chờ đối soát' : 'Pending'}</span>
                                </span>
                              ) : (
                                <span className="text-[#4B5D4F]">
                                  {isVi ? 'Tùy hỷ' : 'Open'}
                                </span>
                              )}
                            </td>

                            <td className="py-2.5 px-3 align-middle whitespace-nowrap text-xs">
                              {rec.checkInStatus === 'checked_in' ? (
                                <span className="inline-flex items-center gap-1 font-semibold text-[#1F4E32]">
                                  <UserCheck className="h-3.5 w-3.5 shrink-0" />
                                  <span>{isVi ? 'Đã vào vườn' : 'Checked in'}</span>
                                </span>
                              ) : rec.checkInStatus === 'cancelled' ? (
                                <span className="text-[#DC2626]">
                                  {isVi ? 'Đã hủy' : 'Cancelled'}
                                </span>
                              ) : (
                                <span className="text-[#4B5D4F]">
                                  {isVi ? 'Đã đăng ký' : 'Registered'}
                                </span>
                              )}
                            </td>

                            <td
                              className="py-2.5 pl-3 pr-4 align-middle text-right whitespace-nowrap"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="inline-flex items-center gap-1.5">
                                {rec.contributionAmount > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => void handleQuickVerify(rec)}
                                    className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap min-h-[32px] ${
                                      rec.paymentStatus === 'verified'
                                        ? 'border-[#1F4E32]/20 bg-white text-[#4B5D4F] hover:bg-[#FAF8F3]'
                                        : 'border-[#1F4E32] bg-[#1F4E32] text-[#FAF8F3] hover:bg-[#163924]'
                                    }`}
                                  >
                                    {rec.paymentStatus === 'verified'
                                      ? isVi
                                        ? 'Hoàn tác'
                                        : 'Unverify'
                                      : isVi
                                        ? 'Xác nhận CK'
                                        : 'Verify'}
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => void handleQuickCheckIn(rec)}
                                  className="rounded-md border border-[#1F4E32]/20 bg-white px-2.5 py-1 text-xs font-semibold text-[#1F4E32] hover:bg-[#EEF3EB] whitespace-nowrap min-h-[32px]"
                                >
                                  {rec.checkInStatus === 'checked_in'
                                    ? isVi
                                      ? 'Bỏ check-in'
                                      : 'Undo'
                                    : 'Check-in'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* TAB 2: FUNDRAISING & BANKS */}
          {activeTab === 'fundraising' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-7 space-y-6">
                <section className="rounded-xl border border-[#1F4E32]/15 bg-white p-6">
                  <h2 className="font-display text-xl font-bold text-[#1F4E32]">
                    {isVi
                      ? 'Tiến độ Quỹ Bảo Trợ Động Vật'
                      : 'Animal Rescue Fund Progress'}
                  </h2>
                  <p className="mt-1 text-xs text-[#4B5D4F]">
                    {OFFICIAL_BANK.bankFullName} · STK {OFFICIAL_BANK.accountNumber} ·{' '}
                    {OFFICIAL_BANK.accountHolder}
                  </p>

                  <div className="mt-5">
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-mono font-bold text-[#1F4E32] tabular-nums">
                        {formatVndNumber(metrics.totalVerifiedVnd)}
                      </span>
                      <span className="font-mono text-xs text-[#4B5D4F] tabular-nums">
                        {metrics.goalPercent}% / {formatVndNumber(settings.goalVnd)}
                      </span>
                    </div>
                    <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-[#EEF3EB]">
                      <div
                        className="h-full bg-[#1F4E32] transition-all"
                        style={{ width: `${metrics.goalPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-6 divide-y divide-[#1F4E32]/10 border-t border-[#1F4E32]/10 text-sm">
                    <div className="flex items-center justify-between py-3">
                      <span className="text-[#4B5D4F]">
                        {isVi
                          ? `Qua thẻ VietQR đã xác nhận (${metrics.verifiedOnlineCount} lượt)`
                          : `Verified online VietQR (${metrics.verifiedOnlineCount})`}
                      </span>
                      <span className="font-mono font-semibold text-[#1E1C18] tabular-nums">
                        {formatVndNumber(metrics.verifiedOnlineVnd)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-[#4B5D4F]">
                        {isVi
                          ? `Đóng góp trực tiếp / ngoại tuyến (${settings.offlineDonorCount} lượt)`
                          : `Offline / direct bank ledger (${settings.offlineDonorCount})`}
                      </span>
                      <span className="font-mono font-semibold text-[#1E1C18] tabular-nums">
                        {formatVndNumber(settings.offlineVerifiedVnd)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-[#D97706]">
                        {isVi
                          ? `Đang chờ đối soát sao kê (${metrics.pendingCount} lượt)`
                          : `Pending statement check (${metrics.pendingCount})`}
                      </span>
                      <span className="font-mono font-semibold text-[#D97706] tabular-nums">
                        {formatVndNumber(metrics.pendingVnd)}
                      </span>
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-[#1F4E32]/15 bg-white p-6">
                  <h3 className="font-display text-lg font-bold text-[#1E1C18]">
                    {isVi
                      ? 'Thống kê theo Ngân hàng Việt Nam'
                      : 'Registrations by Vietnamese Bank App'}
                  </h3>
                  {bankBreakdown.length === 0 ? (
                    <p className="mt-3 text-sm text-[#4B5D4F]">
                      {isVi ? 'Chưa có dữ liệu ngân hàng.' : 'No bank data recorded yet.'}
                    </p>
                  ) : (
                    <div className="mt-4 divide-y divide-[#1F4E32]/10 text-sm">
                      {bankBreakdown.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between py-2.5"
                        >
                          <span className="font-medium text-[#1E1C18]">{item.label}</span>
                          <span className="font-mono text-xs text-[#4B5D4F] tabular-nums">
                            {item.count} {isVi ? 'lượt' : 'entries'} ·{' '}
                            <strong className="text-[#1F4E32]">
                              {formatVndNumber(item.verifiedVnd)}
                            </strong>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              <div className="lg:col-span-5">
                <section className="rounded-xl border border-[#1F4E32]/15 bg-white p-6">
                  <h3 className="font-display text-lg font-bold text-[#1F4E32]">
                    {isVi
                      ? 'Cập nhật Quỹ Ngoại Tuyến & Mục Tiêu'
                      : 'Offline Tally & Campaign Goal'}
                  </h3>
                  <p className="mt-1 text-xs text-[#4B5D4F]">
                    {isVi
                      ? 'Cộng thêm các khoản chuyển khoản trực tiếp hoặc tiền mặt tại lễ hội không đi qua biểu mẫu web.'
                      : 'Record direct bank transfers or cash donations received outside the web registration form.'}
                  </p>

                  <form onSubmit={handleSaveSettings} className="mt-5 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1F4E32]">
                        {isVi ? 'Mục tiêu gây quỹ (VNĐ)' : 'Campaign Goal (VNĐ)'}
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={goalInput}
                        onChange={(e) => setGoalInput(e.target.value.replace(/\D/g, ''))}
                        className="mt-1.5 w-full rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3.5 py-2.5 font-mono text-sm tabular-nums focus:border-[#1F4E32] focus:bg-white focus:outline-none min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1F4E32]">
                        {isVi
                          ? 'Tổng tiền nhận trực tiếp / ngoại tuyến (VNĐ)'
                          : 'Verified Offline / Direct Funds (VNĐ)'}
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={offlineVndInput}
                        onChange={(e) => setOfflineVndInput(e.target.value.replace(/\D/g, ''))}
                        className="mt-1.5 w-full rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3.5 py-2.5 font-mono text-sm tabular-nums focus:border-[#1F4E32] focus:bg-white focus:outline-none min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1F4E32]">
                        {isVi ? 'Số lượt ủng hộ ngoại tuyến' : 'Offline Donor Count'}
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={offlineCountInput}
                        onChange={(e) => setOfflineCountInput(e.target.value.replace(/\D/g, ''))}
                        className="mt-1.5 w-full rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3.5 py-2.5 font-mono text-sm tabular-nums focus:border-[#1F4E32] focus:bg-white focus:outline-none min-h-[44px]"
                      />
                    </div>

                    <div className="border-t border-[#1F4E32]/12 pt-4 space-y-3">
                      <p className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F4E32]">
                        <Music className="h-3.5 w-3.5 text-[#E89F3C]" />
                        <span>
                          {isVi
                            ? 'Nhạc Nền Website Chính Thức (Link Online)'
                            : 'Official Website Background Music (Online Link)'}
                        </span>
                      </p>
                      <p className="text-[11px] leading-relaxed text-[#4B5D4F]">
                        {isVi
                          ? 'Dán link YouTube, SoundCloud, Spotify, Google Drive hoặc link .mp3 (https://). Để trống nếu dùng giai điệu Harp Khu Rừng mặc định.'
                          : 'Paste a YouTube, SoundCloud, Spotify, Google Drive, or .mp3 URL (https://). Leave blank for the default Magic Forest Harp synth.'}
                      </p>

                      <div>
                        <label className="block text-xs font-semibold text-[#1F4E32]">
                          {isVi ? 'Link nhạc online (https://...)' : 'Online Music Link (https://...)'}
                        </label>
                        <input
                          type="url"
                          maxLength={500}
                          value={musicUrlInput}
                          onChange={(e) => setMusicUrlInput(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="mt-1.5 w-full rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3.5 py-2.5 text-sm focus:border-[#1F4E32] focus:bg-white focus:outline-none min-h-[44px]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1F4E32]">
                          {isVi ? 'Tên bài nhạc hiển thị' : 'Track Display Title'}
                        </label>
                        <input
                          type="text"
                          maxLength={140}
                          value={musicTitleInput}
                          onChange={(e) => setMusicTitleInput(e.target.value)}
                          placeholder={
                            isVi
                              ? 'VD: Nhạc Khu Rừng Phép Màu ILYA'
                              : 'e.g. ILYA Forest Healing Melody'
                          }
                          className="mt-1.5 w-full rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3.5 py-2.5 text-sm focus:border-[#1F4E32] focus:bg-white focus:outline-none min-h-[44px]"
                        />
                      </div>
                    </div>

                    {settingsErrorMsg && (
                      <p className="text-xs font-semibold text-red-700">
                        {settingsErrorMsg}
                      </p>
                    )}

                    {settingsSavedMsg && (
                      <p className="text-xs font-semibold text-[#16A34A]">
                        {settingsSavedMsg}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="w-full rounded-lg bg-[#1F4E32] px-4 py-2.5 text-sm font-semibold text-[#FAF8F3] hover:bg-[#163924] disabled:opacity-60 min-h-[44px]"
                    >
                      {savingSettings
                        ? isVi
                          ? 'Đang lưu...'
                          : 'Saving...'
                        : isVi
                          ? 'Lưu cấu hình quỹ & nhạc nền'
                          : 'Save Settings'}
                    </button>
                  </form>
                </section>
              </div>
            </div>
          )}

          {/* TAB 3: ORGANIZER ACCESS */}
          {activeTab === 'access' && (
            <section className="rounded-xl border border-[#1F4E32]/15 bg-white p-6 max-w-3xl space-y-6">
              <div>
                <div className="flex items-center gap-2 text-[#1F4E32]">
                  <Shield className="h-5 w-5" />
                  <h2 className="font-display text-xl font-bold">
                    {isVi ? 'Phân quyền Ban Tổ Chức' : 'Organizer Access Control'}
                  </h2>
                </div>
                <p className="mt-1 text-sm text-[#4B5D4F]">
                  {isVi
                    ? `Tài khoản chính (${PRIMARY_ADMIN_EMAIL}) luôn có toàn quyền truy cập và thêm cộng sự.`
                    : `The primary organizer (${PRIMARY_ADMIN_EMAIL}) always has full access and can authorize co-organizers.`}
                </p>
              </div>

              <div className="rounded-lg border border-[#1F4E32]/12 bg-[#FAF8F3] p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#1E1C18]">
                    {PRIMARY_ADMIN_EMAIL}
                  </p>
                  <p className="text-xs text-[#4B5D4F]">
                    {isVi ? 'Quản trị viên chính (Mặc định)' : 'Primary Organizer (Bootstrapped)'}
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#16A34A]">
                  {isVi ? 'Hoạt động' : 'Active'}
                </span>
              </div>

              {isPrimaryAdmin ? (
                <>
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-[#1E1C18]">
                      {isVi ? 'Cộng sự được cấp quyền' : 'Authorized Co-Organizers'}
                    </h3>
                    {coAdmins.length === 0 ? (
                      <p className="text-xs text-[#4B5D4F]">
                        {isVi
                          ? 'Chưa thêm cộng sự nào. Khi một cộng sự đăng nhập vào trang /admin, họ sẽ thấy mã UID để bạn thêm tại đây.'
                          : 'No co-organizers added yet. When a teammate signs into /admin, they will see their UID to share with you.'}
                      </p>
                    ) : (
                      <div className="divide-y divide-[#1F4E32]/10 border border-[#1F4E32]/12 rounded-lg">
                        {coAdmins.map((admin) => (
                          <div
                            key={admin.uid}
                            className="flex items-center justify-between gap-4 p-3.5 text-sm"
                          >
                            <div className="min-w-0">
                              <p className="font-semibold text-[#1E1C18] truncate">
                                {admin.displayName} ·{' '}
                                <span className="font-normal text-[#4B5D4F]">{admin.email}</span>
                              </p>
                              <p className="font-mono text-xs text-[#4B5D4F] truncate">
                                UID: {admin.uid}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => void removeCoAdmin(admin.uid)}
                              className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 shrink-0"
                            >
                              {isVi ? 'Thu hồi' : 'Remove'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <form
                    onSubmit={handleAddCoAdmin}
                    className="pt-4 border-t border-[#1F4E32]/12 space-y-3"
                  >
                    <h3 className="text-sm font-bold text-[#1E1C18]">
                      {isVi ? 'Thêm cộng sự mới' : 'Add Co-Organizer'}
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <input
                        type="text"
                        required
                        value={coName}
                        onChange={(e) => setCoName(e.target.value)}
                        placeholder={isVi ? 'Tên cộng sự (VD: Eddie)' : 'Name (e.g. Eddie)'}
                        className="rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3 py-2 text-sm min-h-[42px]"
                      />
                      <input
                        type="email"
                        required
                        value={coEmail}
                        onChange={(e) => setCoEmail(e.target.value)}
                        placeholder="email@gmail.com"
                        className="rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3 py-2 text-sm min-h-[42px]"
                      />
                      <input
                        type="text"
                        required
                        value={coUid}
                        onChange={(e) => setCoUid(e.target.value)}
                        placeholder="Firebase Auth UID"
                        className="rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3 py-2 font-mono text-xs min-h-[42px]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={addingCoAdmin}
                      className="rounded-lg bg-[#1F4E32] px-4 py-2 text-xs font-semibold text-[#FAF8F3] hover:bg-[#163924] min-h-[40px]"
                    >
                      {addingCoAdmin
                        ? isVi
                          ? 'Đang thêm...'
                          : 'Adding...'
                        : isVi
                          ? 'Cấp quyền quản lý'
                          : 'Grant Access'}
                    </button>
                  </form>
                </>
              ) : (
                <p className="text-xs text-[#4B5D4F]">
                  {isVi
                    ? `Chỉ tài khoản chính (${PRIMARY_ADMIN_EMAIL}) mới có thể thêm hoặc thu hồi quyền cộng sự.`
                    : `Only ${PRIMARY_ADMIN_EMAIL} can add or remove co-organizers.`}
                </p>
              )}
            </section>
          )}
        </main>
      </div>

      {/* Registration Detail & Reconciliation Drawer */}
      {selectedRecord && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Registration details"
          className="fixed inset-0 z-50 flex justify-end bg-black/35"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="h-full w-full max-w-lg overflow-y-auto bg-white border-l border-[#1F4E32]/15 p-6 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-start justify-between gap-4 border-b border-[#1F4E32]/12 pb-4">
                <div>
                  <p className="font-mono text-xs font-semibold text-[#C2800E]">
                    {selectedRecord.refCode} · {selectedRecord.role.toUpperCase()}
                  </p>
                  <h2 className="mt-1 font-display text-xl font-bold text-[#1E1C18]">
                    {selectedRecord.name}
                  </h2>
                  <p className="text-xs text-[#4B5D4F]">
                    {selectedRecord.phone} · {selectedRecord.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  aria-label="Close details"
                  className="rounded-lg border border-[#1F4E32]/15 p-2 text-[#4B5D4F] hover:text-[#1E1C18]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 border-b border-[#1F4E32]/10 pb-3">
                  <div>
                    <span className="text-[#4B5D4F]">{isVi ? 'Thời gian gửi' : 'Submitted'}</span>
                    <p className="mt-0.5 font-mono font-medium text-[#1E1C18]">
                      {formatDateTime(selectedRecord.createdAtMs)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#4B5D4F]">
                      {isVi ? 'Đồng bộ Google Sheet' : 'Google Sheet Sync'}
                    </span>
                    <p className="mt-0.5 font-medium text-[#1E1C18]">
                      {selectedRecord.syncedToGoogle
                        ? isVi
                          ? 'Đã đồng bộ'
                          : 'Synced'
                        : isVi
                          ? 'Lưu trên Firestore'
                          : 'Firestore only'}
                    </p>
                  </div>
                </div>

                {selectedRecord.role === 'attendee' && (
                  <div className="space-y-2 border-b border-[#1F4E32]/10 pb-3">
                    <p>
                      <span className="text-[#4B5D4F]">{isVi ? 'Thành viên: ' : 'Guests: '}</span>
                      <span className="font-medium text-[#1E1C18]">{selectedRecord.guests || '—'}</span>
                    </p>
                    <p>
                      <span className="text-[#4B5D4F]">
                        {isVi ? 'Hình thức: ' : 'Attendance: '}
                      </span>
                      <span className="font-medium text-[#1E1C18]">
                        {selectedRecord.attendanceType || '—'}
                      </span>
                    </p>
                    <p>
                      <span className="text-[#4B5D4F]">{isVi ? 'Suất ăn: ' : 'Meals: '}</span>
                      <span className="font-medium text-[#1E1C18]">{selectedRecord.meals || '—'}</span>
                    </p>
                  </div>
                )}

                {selectedRecord.role === 'artist' && (
                  <div className="space-y-2 border-b border-[#1F4E32]/10 pb-3">
                    <p>
                      <span className="text-[#4B5D4F]">{isVi ? 'Lĩnh vực: ' : 'Category: '}</span>
                      <span className="font-medium text-[#1E1C18]">{selectedRecord.category}</span>
                    </p>
                    <p className="whitespace-pre-line text-[#1E1C18]">
                      {selectedRecord.description || '—'}
                    </p>
                  </div>
                )}

                {selectedRecord.role === 'volunteer' && (
                  <div className="space-y-2 border-b border-[#1F4E32]/10 pb-3">
                    <p>
                      <span className="text-[#4B5D4F]">{isVi ? 'Ban phụng sự: ' : 'Team: '}</span>
                      <span className="font-medium text-[#1E1C18]">{selectedRecord.team}</span>
                    </p>
                    <p className="whitespace-pre-line text-[#1E1C18]">
                      {selectedRecord.reason || '—'}
                    </p>
                  </div>
                )}

                {selectedRecord.notes && (
                  <div className="border-b border-[#1F4E32]/10 pb-3">
                    <span className="text-[#4B5D4F]">{isVi ? 'Ghi chú người gửi:' : 'Notes:'}</span>
                    <p className="mt-1 text-[#1E1C18]">{selectedRecord.notes}</p>
                  </div>
                )}

                {selectedRecord.invitationLetter && (
                  <details className="border-b border-[#1F4E32]/10 pb-3">
                    <summary className="cursor-pointer font-semibold text-[#1F4E32]">
                      {isVi ? 'Xem thư mời đã đồng sáng tác' : 'View co-created invitation letter'}
                    </summary>
                    <p className="mt-2 whitespace-pre-line rounded-lg bg-[#FAF8F3] p-3 text-xs leading-relaxed text-[#1E1C18]">
                      {selectedRecord.invitationLetter}
                    </p>
                  </details>
                )}
              </div>

              <form onSubmit={handleSaveInspector} className="mt-5 space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#1F4E32]">
                      {isVi ? 'Trạng thái chuyển khoản' : 'Payment Status'}
                    </label>
                    <select
                      value={editPaymentStatus}
                      onChange={(e) => setEditPaymentStatus(e.target.value as PaymentStatus)}
                      className="mt-1 w-full rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3 py-2 text-sm min-h-[42px]"
                    >
                      <option value="pending">{isVi ? 'Chờ đối soát' : 'Pending'}</option>
                      <option value="verified">{isVi ? 'Đã xác nhận nhận tiền' : 'Verified'}</option>
                      <option value="not_applicable">{isVi ? 'Không kèm QR' : 'Not applicable'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1F4E32]">
                      {isVi ? 'Trạng thái tham dự' : 'Check-In Status'}
                    </label>
                    <select
                      value={editCheckInStatus}
                      onChange={(e) => setEditCheckInStatus(e.target.value as CheckInStatus)}
                      className="mt-1 w-full rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3 py-2 text-sm min-h-[42px]"
                    >
                      <option value="registered">{isVi ? 'Đã đăng ký' : 'Registered'}</option>
                      <option value="checked_in">{isVi ? 'Đã check-in tại vườn' : 'Checked in'}</option>
                      <option value="cancelled">{isVi ? 'Đã hủy' : 'Cancelled'}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F4E32]">
                    {isVi ? 'Số tiền thực nhận / cam kết (VNĐ)' : 'Contribution Amount (VNĐ)'}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value.replace(/\D/g, ''))}
                    className="mt-1 w-full rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3 py-2 font-mono text-sm tabular-nums min-h-[42px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F4E32]">
                    {isVi
                      ? 'Ghi chú nội bộ BTC (VD: Mã giao dịch MB Bank, số lều...)'
                      : 'Internal Organizer Notes (e.g. MB Bank ref, tent assignment)'}
                  </label>
                  <textarea
                    rows={3}
                    value={editAdminNotes}
                    onChange={(e) => setEditAdminNotes(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  {!confirmDelete ? (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 min-h-[40px]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>{isVi ? 'Xóa' : 'Delete'}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void handleDeleteRecord()}
                        disabled={savingEdit}
                        className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 min-h-[40px]"
                      >
                        {isVi ? 'Xác nhận xóa' : 'Confirm Delete'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="rounded-lg border border-[#1F4E32]/20 px-2.5 py-2 text-xs font-medium text-[#4B5D4F] min-h-[40px]"
                      >
                        {isVi ? 'Hủy' : 'Cancel'}
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="rounded-lg bg-[#1F4E32] px-5 py-2.5 text-sm font-semibold text-[#FAF8F3] hover:bg-[#163924] disabled:opacity-60 min-h-[42px]"
                  >
                    {savingEdit
                      ? isVi
                        ? 'Đang lưu...'
                        : 'Saving...'
                      : isVi
                        ? 'Lưu thay đổi'
                        : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Manual Registration Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Add manual registration"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-[#1F4E32]/15 bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1F4E32]/12 pb-3">
              <h2 className="font-display text-lg font-bold text-[#1F4E32]">
                {isVi ? 'Thêm hồ sơ thủ công' : 'Add Manual Registration'}
              </h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                aria-label="Close modal"
                className="rounded-lg p-1.5 text-[#4B5D4F] hover:bg-[#EEF3EB]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleManualCreate} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#1F4E32]">
                    {isVi ? 'Vai trò' : 'Role'}
                  </label>
                  <select
                    value={manualRole}
                    onChange={(e) => setManualRole(e.target.value as RegRole)}
                    className="mt-1 w-full rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3 py-2 text-sm min-h-[42px]"
                  >
                    <option value="attendee">{isVi ? 'Tham dự / Ủng hộ' : 'Attendee / Donor'}</option>
                    <option value="artist">{isVi ? 'Nghệ sĩ / Workshop' : 'Artist'}</option>
                    <option value="volunteer">{isVi ? 'Tình nguyện viên' : 'Volunteer'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F4E32]">
                    {isVi ? 'Họ và tên *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3 py-2 text-sm min-h-[42px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#1F4E32]">
                    {isVi ? 'Số điện thoại / Zalo *' : 'Phone / Zalo *'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3 py-2 text-sm min-h-[42px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1F4E32]">Email *</label>
                  <input
                    type="email"
                    required
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3 py-2 text-sm min-h-[42px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1F4E32]">
                    {isVi ? 'Số tiền (VNĐ)' : 'Amount (VNĐ)'}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value.replace(/\D/g, ''))}
                    className="mt-1 w-full rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3 py-2 font-mono text-sm tabular-nums min-h-[42px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F4E32]">
                    {isVi ? 'Ngân hàng' : 'Bank'}
                  </label>
                  <select
                    value={manualBankId}
                    onChange={(e) => setManualBankId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3 py-2 text-sm min-h-[42px]"
                  >
                    {VIETNAMESE_BANKS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.shortName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F4E32]">
                    {isVi ? 'Trạng thái CK' : 'Payment'}
                  </label>
                  <select
                    value={manualPaymentStatus}
                    onChange={(e) => setManualPaymentStatus(e.target.value as PaymentStatus)}
                    className="mt-1 w-full rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3 py-2 text-sm min-h-[42px]"
                  >
                    <option value="verified">{isVi ? 'Đã nhận' : 'Verified'}</option>
                    <option value="pending">{isVi ? 'Chờ đối soát' : 'Pending'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#1F4E32]">
                    {isVi ? 'Số người tham dự' : 'Group size'}
                  </label>
                  <input
                    type="text"
                    value={manualGuests}
                    onChange={(e) => setManualGuests(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3 py-2 text-sm min-h-[42px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1F4E32]">
                    {isVi ? 'Ghi chú' : 'Notes'}
                  </label>
                  <input
                    type="text"
                    value={manualNotes}
                    onChange={(e) => setManualNotes(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#1F4E32]/20 bg-[#FAF8F3] px-3 py-2 text-sm min-h-[42px]"
                  />
                </div>
              </div>

              {manualError && (
                <p className="text-xs font-medium text-red-700">{manualError}</p>
              )}

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-[#1F4E32]/20 px-4 py-2 text-xs font-semibold text-[#4B5D4F] min-h-[40px]"
                >
                  {isVi ? 'Hủy' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submittingManual}
                  className="rounded-lg bg-[#1F4E32] px-5 py-2 text-xs font-semibold text-[#FAF8F3] hover:bg-[#163924] disabled:opacity-60 min-h-[40px]"
                >
                  {submittingManual
                    ? isVi
                      ? 'Đang lưu...'
                      : 'Saving...'
                    : isVi
                      ? 'Lưu hồ sơ'
                      : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
