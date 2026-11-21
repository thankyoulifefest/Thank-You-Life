import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import type { RegRole } from '../data/festivalData';
import {
  OperationType,
  auth,
  db,
  handleFirestoreError,
} from '../firebase';

export type PaymentStatus = 'pending' | 'verified' | 'not_applicable';
export type CheckInStatus = 'registered' | 'checked_in' | 'cancelled';

export interface RegistrationInput {
  refCode: string;
  role: RegRole;
  name: string;
  phone: string;
  email: string;
  guests: string;
  attendanceType: string;
  meals: string;
  notes: string;
  contributionAmount: number;
  contributionTier: string;
  bankId: string;
  bankApp: string;
  category: string;
  description: string;
  team: string;
  reason: string;
  invitationLetter: string;
  syncedToGoogle: boolean;
  paymentStatus?: PaymentStatus;
  checkInStatus?: CheckInStatus;
  adminNotes?: string;
  verifiedBy?: string;
}

export interface RegistrationRecord {
  id: string;
  refCode: string;
  role: RegRole;
  name: string;
  phone: string;
  email: string;
  guests: string;
  attendanceType: string;
  meals: string;
  notes: string;
  contributionAmount: number;
  contributionTier: string;
  bankId: string;
  bankApp: string;
  category: string;
  description: string;
  team: string;
  reason: string;
  invitationLetter: string;
  paymentStatus: PaymentStatus;
  checkInStatus: CheckInStatus;
  syncedToGoogle: boolean;
  adminNotes: string;
  verifiedBy: string;
  createdAtMs: number;
  updatedAtMs: number;
}

export interface CampaignSettings {
  goalVnd: number;
  offlineVerifiedVnd: number;
  offlineDonorCount: number;
  musicUrl: string;
  musicTitle: string;
  updatedBy: string;
  updatedAtMs: number;
}

export interface PublicStats {
  goalVnd: number;
  verifiedVnd: number;
  pledgedVnd: number;
  totalRegistrations: number;
  totalParticipants: number;
  updatedAtMs: number;
}

export interface AdminUserRecord {
  uid: string;
  email: string;
  displayName: string;
  addedBy: string;
  createdAtMs: number;
}

function clampStr(val: string | undefined, maxLen: number): string {
  return String(val || '').trim().slice(0, maxLen);
}

function sanitizeRefCode(raw: string): string {
  const upper = String(raw || '')
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '');
  if (/^TYLF26-[A-Z0-9]+$/.test(upper) && upper.length <= 24) {
    return upper;
  }
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TYLF26-${suffix}`.slice(0, 24);
}

function clampInt(raw: number | undefined, max = 1000000000): number {
  const num = Math.round(Number(raw) || 0);
  if (Number.isNaN(num) || num < 0) return 0;
  return Math.min(num, max);
}

export function estimateParticipantCount(guestsStr: string, role: RegRole): number {
  if (role !== 'attendee') return 1;
  const matches = String(guestsStr || '').match(/\d+/g);
  if (!matches || matches.length === 0) return 1;
  const total = matches.reduce((sum, token) => sum + Number(token), 0);
  if (!Number.isFinite(total) || total < 1) return 1;
  return Math.min(50, total);
}

function toMillis(ts: unknown): number {
  if (ts instanceof Timestamp) return ts.toMillis();
  if (ts && typeof ts === 'object' && 'toMillis' in ts && typeof (ts as { toMillis: () => number }).toMillis === 'function') {
    return (ts as { toMillis: () => number }).toMillis();
  }
  return Date.now();
}

export async function saveRegistrationToFirestore(
  input: RegistrationInput
): Promise<string> {
  const safeRef = sanitizeRefCode(input.refCode);
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  const docId = `${safeRef}-${Date.now()}-${rand}`.replace(/[^a-zA-Z0-9_-]/g, '');
  const path = `registrations/${docId}`;

  const amount = clampInt(input.contributionAmount);
  const defaultPaymentStatus: PaymentStatus = amount > 0 ? 'pending' : 'not_applicable';

  const payload = {
    refCode: safeRef,
    role: input.role,
    name: clampStr(input.name, 120) || 'Ban Dong Hanh',
    phone: clampStr(input.phone, 40).padEnd(5, '0'),
    email: clampStr(input.email, 160),
    guests: clampStr(input.guests, 100),
    attendanceType: clampStr(input.attendanceType, 120),
    meals: clampStr(input.meals, 300),
    notes: clampStr(input.notes, 1000),
    contributionAmount: amount,
    contributionTier: clampStr(input.contributionTier, 80),
    bankId: clampStr(input.bankId, 20),
    bankApp: clampStr(input.bankApp, 80),
    category: clampStr(input.category, 150),
    description: clampStr(input.description, 2000),
    team: clampStr(input.team, 150),
    reason: clampStr(input.reason, 2000),
    invitationLetter: clampStr(input.invitationLetter, 3000),
    paymentStatus: input.paymentStatus || defaultPaymentStatus,
    checkInStatus: input.checkInStatus || 'registered',
    syncedToGoogle: Boolean(input.syncedToGoogle),
    adminNotes: clampStr(input.adminNotes, 1000),
    verifiedBy: clampStr(input.verifiedBy, 160),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'registrations', docId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }

  // Atomically update live public aggregate counter (strictly non-PII)
  const pledgedIncrement = Math.min(100000000, amount);
  const headcountIncrement = estimateParticipantCount(payload.guests, payload.role);
  const statsRef = doc(db, 'publicStats', 'tylf2026');
  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(statsRef);
      if (!snap.exists()) {
        tx.set(statsRef, {
          goalVnd: 150000000,
          verifiedVnd: 0,
          pledgedVnd: pledgedIncrement,
          totalRegistrations: 1,
          totalParticipants: headcountIncrement,
          updatedAt: serverTimestamp(),
        });
      } else {
        const cur = snap.data();
        tx.update(statsRef, {
          pledgedVnd: Number(cur.pledgedVnd || 0) + pledgedIncrement,
          totalRegistrations: Number(cur.totalRegistrations || 0) + 1,
          totalParticipants: Number(cur.totalParticipants || 0) + headcountIncrement,
          updatedAt: serverTimestamp(),
        });
      }
    });
  } catch {
    // Non-blocking fallback: Admin reconciliation auto-heals aggregate totals
  }

  return docId;
}

export async function updateRegistrationInFirestore(
  docId: string,
  patch: Partial<{
    paymentStatus: PaymentStatus;
    checkInStatus: CheckInStatus;
    adminNotes: string;
    verifiedBy: string;
    contributionAmount: number;
    contributionTier: string;
    notes: string;
    guests: string;
    attendanceType: string;
    meals: string;
    syncedToGoogle: boolean;
  }>
): Promise<void> {
  const path = `registrations/${docId}`;
  const cleanPatch: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (patch.paymentStatus !== undefined) cleanPatch.paymentStatus = patch.paymentStatus;
  if (patch.checkInStatus !== undefined) cleanPatch.checkInStatus = patch.checkInStatus;
  if (patch.adminNotes !== undefined) cleanPatch.adminNotes = clampStr(patch.adminNotes, 1000);
  if (patch.verifiedBy !== undefined) cleanPatch.verifiedBy = clampStr(patch.verifiedBy, 160);
  if (patch.contributionAmount !== undefined) {
    cleanPatch.contributionAmount = clampInt(patch.contributionAmount);
  }
  if (patch.contributionTier !== undefined) {
    cleanPatch.contributionTier = clampStr(patch.contributionTier, 80);
  }
  if (patch.notes !== undefined) cleanPatch.notes = clampStr(patch.notes, 1000);
  if (patch.guests !== undefined) cleanPatch.guests = clampStr(patch.guests, 100);
  if (patch.attendanceType !== undefined) {
    cleanPatch.attendanceType = clampStr(patch.attendanceType, 120);
  }
  if (patch.meals !== undefined) cleanPatch.meals = clampStr(patch.meals, 300);
  if (patch.syncedToGoogle !== undefined) {
    cleanPatch.syncedToGoogle = Boolean(patch.syncedToGoogle);
  }

  try {
    await updateDoc(doc(db, 'registrations', docId), cleanPatch);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteRegistrationFromFirestore(docId: string): Promise<void> {
  const path = `registrations/${docId}`;
  try {
    await deleteDoc(doc(db, 'registrations', docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeRegistrations(
  onData: (records: RegistrationRecord[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const q = query(collection(db, 'registrations'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const rows: RegistrationRecord[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          refCode: String(data.refCode || ''),
          role: (data.role as RegRole) || 'attendee',
          name: String(data.name || ''),
          phone: String(data.phone || ''),
          email: String(data.email || ''),
          guests: String(data.guests || ''),
          attendanceType: String(data.attendanceType || ''),
          meals: String(data.meals || ''),
          notes: String(data.notes || ''),
          contributionAmount: Number(data.contributionAmount || 0),
          contributionTier: String(data.contributionTier || ''),
          bankId: String(data.bankId || ''),
          bankApp: String(data.bankApp || ''),
          category: String(data.category || ''),
          description: String(data.description || ''),
          team: String(data.team || ''),
          reason: String(data.reason || ''),
          invitationLetter: String(data.invitationLetter || ''),
          paymentStatus: (data.paymentStatus as PaymentStatus) || 'pending',
          checkInStatus: (data.checkInStatus as CheckInStatus) || 'registered',
          syncedToGoogle: Boolean(data.syncedToGoogle),
          adminNotes: String(data.adminNotes || ''),
          verifiedBy: String(data.verifiedBy || ''),
          createdAtMs: toMillis(data.createdAt),
          updatedAtMs: toMillis(data.updatedAt),
        };
      });
      onData(rows);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'registrations');
      } catch (wrapped) {
        onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}

export function subscribeCampaignSettings(
  onData: (settings: CampaignSettings) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'campaignSettings/tylf2026';
  return onSnapshot(
    doc(db, 'campaignSettings', 'tylf2026'),
    (snap) => {
      if (!snap.exists()) {
        onData({
          goalVnd: 150000000,
          offlineVerifiedVnd: 0,
          offlineDonorCount: 0,
          musicUrl: '',
          musicTitle: '',
          updatedBy: '',
          updatedAtMs: Date.now(),
        });
        return;
      }
      const data = snap.data();
      onData({
        goalVnd: Number(data.goalVnd ?? 150000000),
        offlineVerifiedVnd: Number(data.offlineVerifiedVnd ?? 0),
        offlineDonorCount: Number(data.offlineDonorCount ?? 0),
        musicUrl: String(data.musicUrl || ''),
        musicTitle: String(data.musicTitle || ''),
        updatedBy: String(data.updatedBy || ''),
        updatedAtMs: toMillis(data.updatedAt),
      });
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch (wrapped) {
        if (onError) onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}

export async function saveCampaignSettings(input: {
  goalVnd: number;
  offlineVerifiedVnd: number;
  offlineDonorCount: number;
  musicUrl?: string;
  musicTitle?: string;
}): Promise<void> {
  const path = 'campaignSettings/tylf2026';
  const email = clampStr(auth.currentUser?.email || 'thankyoulifefest@gmail.com', 160);
  const rawMusicUrl = clampStr(input.musicUrl, 500);
  const safeMusicUrl = rawMusicUrl.startsWith('https://') ? rawMusicUrl : '';
  const safeMusicTitle = clampStr(input.musicTitle, 140);
  try {
    await setDoc(doc(db, 'campaignSettings', 'tylf2026'), {
      goalVnd: clampInt(input.goalVnd, 10000000000),
      offlineVerifiedVnd: clampInt(input.offlineVerifiedVnd, 10000000000),
      offlineDonorCount: clampInt(input.offlineDonorCount, 1000000),
      musicUrl: safeMusicUrl,
      musicTitle: safeMusicTitle,
      updatedBy: email,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function checkIsCoAdmin(uid: string): Promise<boolean> {
  const path = `admins/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'admins', uid));
    return snap.exists();
  } catch {
    return false;
  }
}

export function subscribeCoAdmins(
  onData: (admins: AdminUserRecord[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'admins'),
    (snap) => {
      const list: AdminUserRecord[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          uid: String(data.uid || d.id),
          email: String(data.email || ''),
          displayName: String(data.displayName || ''),
          addedBy: String(data.addedBy || ''),
          createdAtMs: toMillis(data.createdAt),
        };
      });
      onData(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'admins');
      } catch (wrapped) {
        onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}

export async function addCoAdmin(input: {
  uid: string;
  email: string;
  displayName: string;
}): Promise<void> {
  const cleanUid = input.uid.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128);
  const path = `admins/${cleanUid}`;
  const addedBy = clampStr(auth.currentUser?.email || 'thankyoulifefest@gmail.com', 160);
  try {
    await setDoc(doc(db, 'admins', cleanUid), {
      uid: cleanUid,
      email: clampStr(input.email, 160),
      displayName: clampStr(input.displayName, 120),
      addedBy,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function removeCoAdmin(uid: string): Promise<void> {
  const path = `admins/${uid}`;
  try {
    await deleteDoc(doc(db, 'admins', uid));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribePublicStats(
  onData: (stats: PublicStats) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'publicStats/tylf2026';
  return onSnapshot(
    doc(db, 'publicStats', 'tylf2026'),
    (snap) => {
      if (!snap.exists()) {
        onData({
          goalVnd: 150000000,
          verifiedVnd: 0,
          pledgedVnd: 0,
          totalRegistrations: 0,
          totalParticipants: 0,
          updatedAtMs: Date.now(),
        });
        return;
      }
      const data = snap.data();
      onData({
        goalVnd: Number(data.goalVnd ?? 150000000),
        verifiedVnd: Number(data.verifiedVnd ?? 0),
        pledgedVnd: Number(data.pledgedVnd ?? 0),
        totalRegistrations: Number(data.totalRegistrations ?? 0),
        totalParticipants: Number(data.totalParticipants ?? 0),
        updatedAtMs: toMillis(data.updatedAt),
      });
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch (wrapped) {
        if (onError) onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}

export async function syncPublicStatsFromAdmin(
  records: RegistrationRecord[],
  settings: CampaignSettings
): Promise<void> {
  let verifiedOnlineVnd = 0;
  let pledgedOnlineVnd = 0;
  let activeRegistrations = 0;
  let totalOnlineParticipants = 0;

  for (const r of records) {
    if (r.checkInStatus !== 'cancelled') {
      activeRegistrations += 1;
      totalOnlineParticipants += estimateParticipantCount(r.guests, r.role);
    }
    if (r.paymentStatus === 'verified') {
      verifiedOnlineVnd += r.contributionAmount;
      pledgedOnlineVnd += r.contributionAmount;
    } else if (r.paymentStatus === 'pending') {
      pledgedOnlineVnd += r.contributionAmount;
    }
  }

  const offlineCount = Math.max(0, settings.offlineDonorCount || 0);
  const offlineVnd = Math.max(0, settings.offlineVerifiedVnd || 0);
  const goalVnd = clampInt(settings.goalVnd || 150000000, 10000000000);

  try {
    await setDoc(doc(db, 'publicStats', 'tylf2026'), {
      goalVnd,
      verifiedVnd: clampInt(verifiedOnlineVnd + offlineVnd, 10000000000),
      pledgedVnd: clampInt(pledgedOnlineVnd + offlineVnd, 10000000000),
      totalRegistrations: clampInt(activeRegistrations + offlineCount, 1000000),
      totalParticipants: clampInt(totalOnlineParticipants + offlineCount, 5000000),
      updatedAt: serverTimestamp(),
    });
  } catch {
    // Non-blocking in case session is read-only or transitioning
  }
}
