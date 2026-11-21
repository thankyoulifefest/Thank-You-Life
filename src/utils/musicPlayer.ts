export type MusicSourceKind =
  | 'ambient'
  | 'youtube'
  | 'soundcloud'
  | 'spotify'
  | 'gdrive'
  | 'audio';

export interface MusicTrack {
  id: string;
  titleVi: string;
  titleEn: string;
  url: string;
  sourceLabel: string;
  isBuiltin?: boolean;
  isOfficial?: boolean;
}

export interface ParsedMusicSource {
  valid: boolean;
  kind: MusicSourceKind;
  normalizedUrl: string;
  embedUrl?: string;
  detectedLabel: string;
  errorVi?: string;
  errorEn?: string;
}

export const BUILTIN_MAGIC_TRACKS: MusicTrack[] = [
  {
    id: 'builtin-ilya-harp',
    titleVi: 'Suối Rừng Phép Màu ILYA (Harp & Chuông Gió)',
    titleEn: 'ILYA Magic Forest (Harp & Wind Chimes)',
    url: 'builtin://ilya-forest-harp',
    sourceLabel: 'Magic Forest Synth',
    isBuiltin: true,
  },
  {
    id: 'builtin-golden-bee',
    titleVi: 'Giai Điệu Vườn Ong Vàng (Thiên Nhiên An Lành)',
    titleEn: 'Golden Bee Meadow (Calm Chimes & Breeze)',
    url: 'builtin://golden-bee-lullaby',
    sourceLabel: 'Garden Synth',
    isBuiltin: true,
  },
];

export function parseOnlineMusicUrl(rawInput: string): ParsedMusicSource {
  const trimmed = String(rawInput || '').trim();
  if (!trimmed) {
    return {
      valid: false,
      kind: 'audio',
      normalizedUrl: '',
      detectedLabel: '',
      errorVi: 'Vui lòng dán đường link nhạc online (bắt đầu bằng https://).',
      errorEn: 'Please paste an online music URL starting with https://.',
    };
  }

  if (trimmed === 'builtin://ilya-forest-harp' || trimmed === 'builtin://golden-bee-lullaby') {
    return {
      valid: true,
      kind: 'ambient',
      normalizedUrl: trimmed,
      detectedLabel: 'Magic Forest Synth',
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      valid: false,
      kind: 'audio',
      normalizedUrl: trimmed,
      detectedLabel: '',
      errorVi: 'Đường dẫn chưa hợp lệ. Hãy nhập đầy đủ link bắt đầu bằng https://',
      errorEn: 'Invalid URL format. Please enter a full link starting with https://',
    };
  }

  if (parsed.protocol !== 'https:') {
    return {
      valid: false,
      kind: 'audio',
      normalizedUrl: trimmed,
      detectedLabel: '',
      errorVi: 'Chỉ hỗ trợ liên kết an toàn https:// để đảm bảo bảo mật.',
      errorEn: 'Only secure https:// music links are supported.',
    };
  }

  const host = parsed.hostname.toLowerCase();

  // 1. YouTube & YouTube Music
  if (
    host === 'youtu.be' ||
    host === 'youtube.com' ||
    host.endsWith('.youtube.com')
  ) {
    let videoId = '';
    const listId = parsed.searchParams.get('list') || '';

    if (host === 'youtu.be') {
      videoId = parsed.pathname.split('/').filter(Boolean)[0] || '';
    } else if (parsed.pathname.startsWith('/watch')) {
      videoId = parsed.searchParams.get('v') || '';
    } else if (
      parsed.pathname.startsWith('/shorts/') ||
      parsed.pathname.startsWith('/live/') ||
      parsed.pathname.startsWith('/embed/')
    ) {
      videoId = parsed.pathname.split('/').filter(Boolean)[1] || '';
    }

    const cleanVideoId = videoId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 24);
    const cleanListId = listId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);

    if (cleanVideoId) {
      return {
        valid: true,
        kind: 'youtube',
        normalizedUrl: trimmed,
        embedUrl: `https://www.youtube-nocookie.com/embed/${cleanVideoId}?autoplay=1&loop=1&playlist=${cleanVideoId}&enablejsapi=1&rel=0`,
        detectedLabel: 'YouTube',
      };
    }

    if (cleanListId) {
      return {
        valid: true,
        kind: 'youtube',
        normalizedUrl: trimmed,
        embedUrl: `https://www.youtube-nocookie.com/embed/videoseries?list=${cleanListId}&autoplay=1&enablejsapi=1&rel=0`,
        detectedLabel: 'YouTube Playlist',
      };
    }

    return {
      valid: false,
      kind: 'youtube',
      normalizedUrl: trimmed,
      detectedLabel: 'YouTube',
      errorVi: 'Không tìm thấy mã video/playlist trong link YouTube này.',
      errorEn: 'Could not find a video or playlist ID in this YouTube link.',
    };
  }

  // 2. SoundCloud
  if (host === 'soundcloud.com' || host.endsWith('.soundcloud.com')) {
    return {
      valid: true,
      kind: 'soundcloud',
      normalizedUrl: trimmed,
      embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(
        trimmed
      )}&color=%232D4F3E&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`,
      detectedLabel: 'SoundCloud',
    };
  }

  // 3. Spotify
  if (host === 'open.spotify.com') {
    const parts = parsed.pathname.split('/').filter(Boolean);
    const maybeLocale = parts[0]?.startsWith('intl-') ? parts.slice(1) : parts;
    const kind = maybeLocale[0];
    const itemId = maybeLocale[1]?.replace(/[^a-zA-Z0-9]/g, '');
    if (
      itemId &&
      (kind === 'track' || kind === 'album' || kind === 'playlist' || kind === 'episode')
    ) {
      return {
        valid: true,
        kind: 'spotify',
        normalizedUrl: trimmed,
        embedUrl: `https://open.spotify.com/embed/${kind}/${itemId}?utm_source=generator`,
        detectedLabel: 'Spotify',
      };
    }
  }

  // 4. Google Drive Audio File
  if (host === 'drive.google.com') {
    const fileMatch = parsed.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    const idParam = parsed.searchParams.get('id')?.replace(/[^a-zA-Z0-9_-]/g, '');
    const fileId = fileMatch?.[1] || idParam;
    if (fileId) {
      return {
        valid: true,
        kind: 'gdrive',
        normalizedUrl: trimmed,
        embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
        detectedLabel: 'Google Drive',
      };
    }
  }

  // 5. Direct Audio URL (.mp3, .wav, .ogg, .m4a, .aac, .flac, stream URL)
  return {
    valid: true,
    kind: 'audio',
    normalizedUrl: trimmed,
    detectedLabel: 'Audio Stream',
  };
}

export function inferTrackTitleFromUrl(url: string, isVi: boolean): string {
  const parsed = parseOnlineMusicUrl(url);
  if (parsed.kind === 'youtube') return isVi ? 'Nhạc YouTube Khu Rừng' : 'YouTube Forest Track';
  if (parsed.kind === 'soundcloud') return isVi ? 'Nhạc SoundCloud Online' : 'SoundCloud Stream';
  if (parsed.kind === 'spotify') return isVi ? 'Giai Điệu Spotify' : 'Spotify Selection';
  if (parsed.kind === 'gdrive') return isVi ? 'Audio từ Google Drive' : 'Google Drive Audio';
  try {
    const u = new URL(url);
    const lastSeg = decodeURIComponent(u.pathname.split('/').filter(Boolean).pop() || '')
      .replace(/\.(mp3|wav|ogg|m4a|aac|flac|webm)$/i, '')
      .replace(/[-_]+/g, ' ')
      .trim();
    if (lastSeg.length >= 2) return lastSeg.slice(0, 80);
  } catch {
    // ignore
  }
  return isVi ? 'Nhạc Online Khu Rừng' : 'Online Forest Music';
}

/**
 * Pure Web Audio API generative Waldorf Magic Forest soundscape engine.
 * Plays warm pentatonic harp/marimba chimes + soft meadow wind with zero external network dependency.
 */
export class MagicForestAmbientSynth {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private breezeGain: GainNode | null = null;
  private breezeSource: AudioBufferSourceNode | null = null;
  private stepTimer: number | null = null;
  private volume = 0.55;
  private stepIndex = 0;

  public start(presetUrl: string): void {
    this.stop();

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.001, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(Math.max(0.02, this.volume * 0.45), ctx.currentTime + 1.2);
    master.connect(ctx.destination);

    // Gentle filtered meadow breeze noise bed
    const bufferSize = ctx.sampleRate * 3;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i += 1) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 1.8;
    }

    const breeze = ctx.createBufferSource();
    breeze.buffer = noiseBuffer;
    breeze.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = presetUrl === 'builtin://golden-bee-lullaby' ? 320 : 420;

    const breezeGain = ctx.createGain();
    breezeGain.gain.value = 0.14;

    breeze.connect(filter);
    filter.connect(breezeGain);
    breezeGain.connect(master);
    breeze.start();

    this.ctx = ctx;
    this.masterGain = master;
    this.breezeGain = breezeGain;
    this.breezeSource = breeze;
    this.stepIndex = 0;

    // Pentatonic gentle frequencies
    const scaleHarp = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
    const scaleLullaby = [220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25];
    const palette = presetUrl === 'builtin://golden-bee-lullaby' ? scaleLullaby : scaleHarp;
    const intervalMs = presetUrl === 'builtin://golden-bee-lullaby' ? 1650 : 1250;

    const playChimeNote = () => {
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const pattern = [0, 2, 4, 5, 3, 4, 6, 2, 1, 4, 5, 7];
      const noteIdx = pattern[this.stepIndex % pattern.length] % palette.length;
      const freq = palette[noteIdx];
      this.stepIndex += 1;

      const osc = this.ctx.createOscillator();
      const overtone = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      overtone.type = 'triangle';
      overtone.frequency.setValueAtTime(freq * 2, now);

      const overtoneGain = this.ctx.createGain();
      overtoneGain.gain.setValueAtTime(0.08, now);

      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.linearRampToValueAtTime(0.24, now + 0.04);
      noteGain.gain.exponentialRampToValueAtTime(0.0008, now + 2.8);

      osc.connect(noteGain);
      overtone.connect(overtoneGain);
      overtoneGain.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc.start(now);
      overtone.start(now);
      osc.stop(now + 2.9);
      overtone.stop(now + 2.9);
    };

    playChimeNote();
    this.stepTimer = window.setInterval(playChimeNote, intervalMs);
  }

  public setVolume(nextVol: number): void {
    this.volume = Math.max(0, Math.min(1, nextVol));
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        Math.max(0.001, this.volume * 0.45),
        this.ctx.currentTime,
        0.08
      );
    }
  }

  public stop(): void {
    if (this.stepTimer !== null) {
      window.clearInterval(this.stepTimer);
      this.stepTimer = null;
    }
    if (this.breezeSource) {
      try {
        this.breezeSource.stop();
        this.breezeSource.disconnect();
      } catch {
        // ignore
      }
      this.breezeSource = null;
    }
    if (this.breezeGain) {
      this.breezeGain.disconnect();
      this.breezeGain = null;
    }
    if (this.masterGain) {
      this.masterGain.disconnect();
      this.masterGain = null;
    }
    if (this.ctx) {
      void this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}
