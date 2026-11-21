import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_GOOGLE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbx3oir-awvMa08fvv4G4D-JTaJwuoGvO9srHXtE7ABbtGBtyPYNolK2goPDsTQcQkUF/exec';

interface RegisterPayload {
  role: 'attendee' | 'artist' | 'volunteer';
  name: string;
  phone: string;
  email: string;
  guests?: string;
  attendanceType?: string;
  meals?: string;
  notes?: string;
  contributionTier?: string;
  contributionAmount?: number;
  category?: string;
  description?: string;
  team?: string;
  reason?: string;
  bankApp?: string;
  invitationLetter?: string;
  refCode?: string;
}

async function createServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'tylf2026-landing' });
  });

  app.post('/api/register', async (req, res) => {
    const body = (req.body || {}) as Partial<RegisterPayload>;
    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const email = String(body.email || '').trim();
    const role = body.role || 'attendee';

    if (!name || !phone || !email) {
      res.status(400).json({
        ok: false,
        error: 'Please complete your full name, phone/Zalo, and email address.',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        ok: false,
        error: 'Please enter a valid email address.',
      });
      return;
    }

    const refCode =
      String(body.refCode || '').trim() ||
      `TYLF26-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const syncUrl = process.env.GOOGLE_FORM_SYNC_URL || DEFAULT_GOOGLE_SCRIPT_URL;
    const params = new URLSearchParams();

    if (role === 'artist') {
      params.set('tab', 'Nghe_Si');
      params.set('name', name);
      params.set('contact', `${phone} | ${email}`);
      params.set('category', String(body.category || 'Âm nhạc Acoustic / Sound Healing'));
      params.set(
        'description',
        `[Ref: ${refCode}] ${String(body.description || '')}${
          body.invitationLetter ? `\n\n[Co-Created Invite]\n${body.invitationLetter}` : ''
        }`
      );
    } else if (role === 'volunteer') {
      params.set('tab', 'Tinh_Nguyen_Vien');
      params.set('name', name);
      params.set('contact', `${phone} - ${email}`);
      params.set(
        'team',
        String(body.team || 'Ban Hỗ trợ Trạm Cứu Hộ Động Vật & Hoạt động Trồng cây')
      );
      params.set(
        'reason',
        `[Ref: ${refCode}] ${String(body.reason || '')}${
          body.invitationLetter ? `\n\n[Co-Created Invite]\n${body.invitationLetter}` : ''
        }`
      );
    } else {
      params.set('tab', 'Tham_Du');
      params.set('name', name);
      params.set('phone', phone);
      params.set('email', email);
      params.set('guests', String(body.guests || '1 người lớn'));
      params.set('attendanceType', String(body.attendanceType || 'Tham gia trong ngày (Picnic)'));
      params.set('meals', String(body.meals || 'Tự chuẩn bị suất ăn / Vegan Potluck'));
      params.set('contributionTier', String(body.contributionTier || '555.555đ'));
      const combinedNotes = [
        `[Ref: ${refCode}]`,
        body.bankApp ? `[Bank: ${body.bankApp}]` : '',
        body.notes ? body.notes : '',
        body.invitationLetter ? `[Co-Created Invite]: ${body.invitationLetter.slice(0, 400)}` : '',
      ]
        .filter(Boolean)
        .join(' ');
      params.set('notes', combinedNotes);
    }

    let syncedToGoogle = false;
    let googleStatus = 0;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);
      const googleRes = await fetch(syncUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: params.toString(),
        redirect: 'follow',
        signal: controller.signal,
      });
      clearTimeout(timeout);
      googleStatus = googleRes.status;
      syncedToGoogle = googleRes.ok || googleRes.status === 302 || googleRes.status === 200;
    } catch {
      syncedToGoogle = false;
    }

    res.json({
      ok: true,
      syncedToGoogle,
      googleStatus,
      refCode,
      role,
      timestamp: new Date().toISOString(),
    });
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexPath = path.join(distDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`TYLF2026 server listening on http://0.0.0.0:${port}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
