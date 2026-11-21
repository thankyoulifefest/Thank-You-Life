import { useEffect, useMemo, useState } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { BeeFairies } from './components/BeeFairies';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FaqSection } from './components/FaqSection';
import { FestivalHighlightsSection } from './components/FestivalHighlightsSection';
import { Footer } from './components/Footer';
import { ForestMusicPlayer } from './components/ForestMusicPlayer';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { InvitationStudio } from './components/InvitationStudio';
import { PersonalizedQrSection } from './components/PersonalizedQrSection';
import {
  RegistrationForm,
  type SyncedRegistrationResult,
} from './components/RegistrationForm';
import { UrgentMissionSection } from './components/UrgentMissionSection';
import {
  FESTIVAL_INFO,
  TONE_PRESETS,
  type InvitationTone,
  type Language,
  type LetterLanguage,
  type RegRole,
} from './data/festivalData';
import {
  subscribeCampaignSettings,
  subscribePublicStats,
  type PublicStats,
} from './utils/registrationsDb';
import { composeInvitationLetter } from './utils/vietqr';

function generateInitialRefCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 4; i += 1) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `TYLF26-${suffix}`;
}

function isAdminLocation(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.location.pathname === '/admin' ||
    window.location.pathname.startsWith('/admin/') ||
    window.location.hash === '#admin'
  );
}

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => isAdminLocation());
  const [lang, setLang] = useState<Language>('vi');
  const [role, setRole] = useState<RegRole>('attendee');
  const [tone, setTone] = useState<InvitationTone>('family');
  const [letterLang, setLetterLang] = useState<LetterLanguage>('vi');
  const [senderName, setSenderName] = useState('');
  const [recipient, setRecipient] = useState(TONE_PRESETS[0].defaultRecipientVi);
  const [blessing, setBlessing] = useState(TONE_PRESETS[0].defaultBlessingVi);
  const [selectedAmount, setSelectedAmount] = useState<number>(555555);
  const [selectedBankId, setSelectedBankId] = useState<string>('mb');
  const [refCode] = useState<string>(() => generateInitialRefCode());
  const [syncResult, setSyncResult] = useState<SyncedRegistrationResult | null>(null);
  const [publicStats, setPublicStats] = useState<PublicStats>({
    goalVnd: FESTIVAL_INFO.fundraisingGoalVnd,
    verifiedVnd: 0,
    pledgedVnd: 0,
    totalRegistrations: 0,
    totalParticipants: 0,
    updatedAtMs: Date.now(),
  });
  const [campaignMusic, setCampaignMusic] = useState<{ url: string; title: string }>({
    url: '',
    title: '',
  });

  useEffect(() => {
    const syncRoute = () => setIsAdminRoute(isAdminLocation());
    window.addEventListener('popstate', syncRoute);
    window.addEventListener('hashchange', syncRoute);
    return () => {
      window.removeEventListener('popstate', syncRoute);
      window.removeEventListener('hashchange', syncRoute);
    };
  }, []);

  useEffect(() => {
    const unsubStats = subscribePublicStats((stats) => {
      setPublicStats(stats);
    });
    const unsubSettings = subscribeCampaignSettings((settings) => {
      setCampaignMusic({
        url: settings.musicUrl || '',
        title: settings.musicTitle || '',
      });
    });
    return () => {
      unsubStats();
      unsubSettings();
    };
  }, []);

  const openAdmin = () => {
    window.history.pushState({}, '', '/admin');
    setIsAdminRoute(true);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const exitAdmin = () => {
    window.history.pushState({}, '', '/');
    setIsAdminRoute(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const applyPreset = (nextTone: InvitationTone, targetLetterLang: LetterLanguage) => {
    const preset = TONE_PRESETS.find((p) => p.id === nextTone) || TONE_PRESETS[0];
    const useEn = targetLetterLang === 'en';
    setRecipient(useEn ? preset.defaultRecipientEn : preset.defaultRecipientVi);
    setBlessing(useEn ? preset.defaultBlessingEn : preset.defaultBlessingVi);
  };

  const handleLanguageChange = (nextLang: Language) => {
    setLang(nextLang);
    const nextLetterLang: LetterLanguage = nextLang === 'en' ? 'en' : 'vi';
    setLetterLang(nextLetterLang);
    applyPreset(tone, nextLetterLang);
  };

  const handleToneChange = (nextTone: InvitationTone) => {
    setTone(nextTone);
    applyPreset(nextTone, letterLang);
  };

  const handleLetterLangChange = (nextLetterLang: LetterLanguage) => {
    setLetterLang(nextLetterLang);
    applyPreset(tone, nextLetterLang);
  };

  const handleSelectAmount = (amount: number) => {
    setSelectedAmount(amount);
  };

  const handleJumpToCoCreate = () => {
    const el = document.getElementById('highlights');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSelectRoleForSignup = (nextRole: RegRole) => {
    setRole(nextRole);
    if (nextRole === 'artist' || nextRole === 'volunteer') {
      setTone('cocreate');
      applyPreset('cocreate', letterLang);
    }
    const el = document.getElementById('signup-sync');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const activeRefCode = syncResult?.refCode || refCode;

  const composedLetter = useMemo(
    () =>
      composeInvitationLetter({
        senderName,
        recipient,
        blessing,
        amount: selectedAmount,
        letterLang,
        refCode: activeRefCode,
      }),
    [senderName, recipient, blessing, selectedAmount, letterLang, activeRefCode]
  );

  return (
    <ErrorBoundary>
      {isAdminRoute ? (
        <AdminDashboard
          lang={lang}
          onChangeLang={handleLanguageChange}
          onExitAdmin={exitAdmin}
        />
      ) : (
        <div className="relative min-h-screen bg-[#FAF7F0] text-[#24302A]">
          <BeeFairies />
          <Header lang={lang} onChangeLang={handleLanguageChange} />

          <main className="relative z-10">
            <HeroSection
              lang={lang}
              publicStats={publicStats}
              onJumpToCoCreate={handleJumpToCoCreate}
            />

            <UrgentMissionSection
              lang={lang}
              selectedAmount={selectedAmount}
              onSelectAmount={handleSelectAmount}
              publicStats={publicStats}
            />

            <FestivalHighlightsSection
              lang={lang}
              onSelectRoleForSignup={handleSelectRoleForSignup}
            />

            <InvitationStudio
              lang={lang}
              tone={tone}
              letterLang={letterLang}
              senderName={senderName}
              recipient={recipient}
              blessing={blessing}
              composedLetter={composedLetter}
              onChangeTone={handleToneChange}
              onChangeLetterLang={handleLetterLangChange}
              onChangeSenderName={setSenderName}
              onChangeRecipient={setRecipient}
              onChangeBlessing={setBlessing}
              onResetPreset={() => applyPreset(tone, letterLang)}
            />

            <RegistrationForm
              lang={lang}
              role={role}
              onChangeRole={setRole}
              senderName={senderName}
              onChangeSenderName={setSenderName}
              selectedAmount={selectedAmount}
              onSelectAmount={handleSelectAmount}
              selectedBankId={selectedBankId}
              onSelectBankId={setSelectedBankId}
              composedLetter={composedLetter}
              refCode={refCode}
              onComplete={(res) => setSyncResult(res)}
            />

            <PersonalizedQrSection
              lang={lang}
              senderName={senderName}
              recipient={recipient}
              composedLetter={composedLetter}
              selectedAmount={selectedAmount}
              selectedBankId={selectedBankId}
              onSelectBankId={setSelectedBankId}
              refCode={refCode}
              syncResult={syncResult}
            />

            <FaqSection lang={lang} />
          </main>

          <Footer lang={lang} onOpenAdmin={openAdmin} />
          <ForestMusicPlayer
            lang={lang}
            officialMusicUrl={campaignMusic.url}
            officialMusicTitle={campaignMusic.title}
          />
        </div>
      )}
    </ErrorBoundary>
  );
}
