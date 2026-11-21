import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Link2,
  Music,
  Pause,
  Play,
  Plus,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import type { Language } from '../data/festivalData';
import {
  BUILTIN_MAGIC_TRACKS,
  MagicForestAmbientSynth,
  inferTrackTitleFromUrl,
  parseOnlineMusicUrl,
  type MusicTrack,
} from '../utils/musicPlayer';

interface ForestMusicPlayerProps {
  lang: Language;
  officialMusicUrl?: string;
  officialMusicTitle?: string;
}

const CUSTOM_TRACKS_STORAGE_KEY = 'tylf26_custom_music_tracks_v1';
const ACTIVE_TRACK_ID_KEY = 'tylf26_active_music_id_v1';

function loadSavedCustomTracks(): MusicTrack[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_TRACKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (t) =>
          t &&
          typeof t.id === 'string' &&
          typeof t.url === 'string' &&
          t.url.startsWith('https://')
      )
      .slice(0, 8);
  } catch {
    return [];
  }
}

export function ForestMusicPlayer({
  lang,
  officialMusicUrl = '',
  officialMusicTitle = '',
}: ForestMusicPlayerProps) {
  const isVi = lang === 'vi';

  const [expanded, setExpanded] = useState(false);
  const [customTracks, setCustomTracks] = useState<MusicTrack[]>(() => loadSavedCustomTracks());
  const [selectedTrackId, setSelectedTrackId] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem(ACTIVE_TRACK_ID_KEY) || '';
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.55);
  const [muted, setMuted] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  // Add online link inputs
  const [linkInput, setLinkInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);

  const synthRef = useRef<MagicForestAmbientSynth | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Combine official track (if set in Firestore) + built-in synth + user custom tracks
  const tracks = useMemo<MusicTrack[]>(() => {
    const list: MusicTrack[] = [];
    const cleanOfficialUrl = officialMusicUrl.trim();
    if (cleanOfficialUrl.startsWith('https://')) {
      const parsed = parseOnlineMusicUrl(cleanOfficialUrl);
      if (parsed.valid) {
        list.push({
          id: 'official-festival-track',
          titleVi:
            officialMusicTitle.trim() || 'Nhạc Nền Chính Thức Lễ Hội (Online)',
          titleEn:
            officialMusicTitle.trim() || 'Official Festival Soundtrack (Online)',
          url: cleanOfficialUrl,
          sourceLabel: parsed.detectedLabel || 'Official Online',
          isOfficial: true,
        });
      }
    }
    return [...list, ...BUILTIN_MAGIC_TRACKS, ...customTracks];
  }, [officialMusicUrl, officialMusicTitle, customTracks]);

  const activeTrack = useMemo(
    () => (selectedTrackId ? tracks.find((t) => t.id === selectedTrackId) : undefined) || tracks[0],
    [tracks, selectedTrackId]
  );

  const parsedSource = useMemo(
    () => parseOnlineMusicUrl(activeTrack.url),
    [activeTrack.url]
  );

  // Save custom tracks cleanly
  useEffect(() => {
    try {
      window.localStorage.setItem(CUSTOM_TRACKS_STORAGE_KEY, JSON.stringify(customTracks));
    } catch {
      // ignore storage quota
    }
  }, [customTracks]);

  // Cleanup synth & audio on unmount
  useEffect(() => {
    return () => {
      synthRef.current?.stop();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Sync volume for Web Audio synth and HTML5 <audio>
  useEffect(() => {
    const effectiveVol = muted ? 0 : volume;
    synthRef.current?.setVolume(effectiveVol);
    if (audioRef.current) {
      audioRef.current.volume = effectiveVol;
    }
  }, [volume, muted]);

  // Orchestrate playback whenever isPlaying or activeTrack changes
  useEffect(() => {
    setPlaybackError(null);

    if (!isPlaying) {
      synthRef.current?.stop();
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (parsedSource.kind === 'youtube' && iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }),
          '*'
        );
      }
      return;
    }

    if (parsedSource.kind === 'ambient') {
      if (audioRef.current) audioRef.current.pause();
      if (!synthRef.current) {
        synthRef.current = new MagicForestAmbientSynth();
      }
      synthRef.current.setVolume(muted ? 0 : volume);
      synthRef.current.start(parsedSource.normalizedUrl);
      return;
    }

    if (parsedSource.kind === 'audio') {
      synthRef.current?.stop();
      const audioEl = audioRef.current;
      if (audioEl) {
        if (audioEl.src !== parsedSource.normalizedUrl) {
          audioEl.src = parsedSource.normalizedUrl;
        }
        audioEl.volume = muted ? 0 : volume;
        void audioEl.play().catch(() => {
          setPlaybackError(
            isVi
              ? 'Trình duyệt hoặc nguồn link chưa cho phép tự phát trực tiếp. Hãy kiểm tra link .mp3/.ogg hợp lệ hoặc dùng YouTube/SoundCloud.'
              : 'Unable to play direct audio stream. Ensure it is a CORS-enabled .mp3/.ogg URL or use a YouTube/SoundCloud link.'
          );
          setIsPlaying(false);
        });
      }
      return;
    }

    // Embedded player sources (YouTube / SoundCloud / Spotify / Google Drive)
    synthRef.current?.stop();
    if (audioRef.current) audioRef.current.pause();
    if (parsedSource.kind === 'youtube' && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'playVideo', args: '' }),
        '*'
      );
    }
  }, [isPlaying, parsedSource, isVi]);

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleSelectTrack = (track: MusicTrack) => {
    setSelectedTrackId(track.id);
    try {
      if (track.isOfficial) {
        window.localStorage.removeItem(ACTIVE_TRACK_ID_KEY);
      } else {
        window.localStorage.setItem(ACTIVE_TRACK_ID_KEY, track.id);
      }
    } catch {
      // ignore
    }
    setPlaybackError(null);
    setIsPlaying(true);
  };

  const handleAddOnlineLink = (e: FormEvent) => {
    e.preventDefault();
    setLinkError(null);
    const parsed = parseOnlineMusicUrl(linkInput);
    if (!parsed.valid) {
      setLinkError(
        (isVi ? parsed.errorVi : parsed.errorEn) ||
          (isVi ? 'Link nhạc chưa hợp lệ.' : 'Invalid music link.')
      );
      return;
    }

    const customTitle = titleInput.trim();
    const fallbackTitle = inferTrackTitleFromUrl(parsed.normalizedUrl, isVi);
    const newTrack: MusicTrack = {
      id: `custom-${Date.now().toString(36)}`,
      titleVi: customTitle || fallbackTitle,
      titleEn: customTitle || fallbackTitle,
      url: parsed.normalizedUrl,
      sourceLabel: parsed.detectedLabel,
    };

    setCustomTracks((prev) => [newTrack, ...prev].slice(0, 8));
    setSelectedTrackId(newTrack.id);
    try {
      window.localStorage.setItem(ACTIVE_TRACK_ID_KEY, newTrack.id);
    } catch {
      // ignore
    }
    setLinkInput('');
    setTitleInput('');
    setPlaybackError(null);
    setIsPlaying(true);
  };

  const handleRemoveCustomTrack = (id: string) => {
    setCustomTracks((prev) => prev.filter((t) => t.id !== id));
    if (selectedTrackId === id) {
      setSelectedTrackId('');
      try {
        window.localStorage.removeItem(ACTIVE_TRACK_ID_KEY);
      } catch {
        // ignore
      }
      setIsPlaying(false);
    }
  };

  const isEmbedSource =
    parsedSource.kind === 'youtube' ||
    parsedSource.kind === 'soundcloud' ||
    parsedSource.kind === 'spotify' ||
    parsedSource.kind === 'gdrive';

  const activeTitle = isVi ? activeTrack.titleVi : activeTrack.titleEn;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2.5">
      {/* Hidden HTML5 Audio Element for Direct Online Audio Streams */}
      <audio
        ref={audioRef}
        loop
        preload="none"
        onError={() => {
          if (isPlaying && parsedSource.kind === 'audio') {
            setPlaybackError(
              isVi
                ? 'Không tải được luồng âm thanh từ link này. Vui lòng thử link .mp3 trực tiếp hoặc dán link YouTube / SoundCloud.'
                : 'Could not load audio from this link. Try a direct .mp3 link or paste a YouTube / SoundCloud URL.'
            );
            setIsPlaying(false);
          }
        }}
      />

      {/* Expanded Enchanted Forest Music Chooser Drawer (kept mounted silently while playing embed links) */}
      {(expanded || (isPlaying && isEmbedSource)) && (
        <section
          aria-label={isVi ? 'Trình phát nhạc Khu Rừng Phép Màu' : 'Magic Forest Music Player'}
          aria-hidden={!expanded}
          className={
            expanded
              ? 'w-[calc(100vw-2rem)] sm:w-[375px] overflow-hidden rounded-2xl border-2 border-[#E89F3C]/55 bg-[#FAF7F0] text-[#24302A] shadow-xl'
              : 'pointer-events-none fixed bottom-0 right-0 h-px w-px overflow-hidden opacity-0'
          }
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between gap-2 bg-[#183528] px-4 py-3 text-[#FAF7F0]">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="h-4 w-4 text-[#F4BE6A] shrink-0" />
              <div className="min-w-0">
                <p className="font-display text-sm font-bold truncate">
                  {isVi ? 'Âm Thanh Khu Rừng Phép Màu' : 'Magic Forest Soundscape'}
                </p>
                <p className="text-[11px] text-[#F4BE6A] truncate">
                  {activeTrack.sourceLabel} · {isPlaying ? (isVi ? 'Đang phát' : 'Playing') : (isVi ? 'Tạm dừng' : 'Paused')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              aria-label={isVi ? 'Thu gọn trình phát nhạc' : 'Minimize music player'}
              className="rounded-lg p-1.5 text-[#FAF7F0]/80 hover:bg-white/10 hover:text-white min-h-[34px] min-w-[34px] flex items-center justify-center"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto p-4 space-y-4">
            {/* Embedded Platform Player View (YouTube / SoundCloud / Spotify / Drive) */}
            {isEmbedSource && parsedSource.embedUrl && (isPlaying || expanded) && (
              <div className="overflow-hidden rounded-xl border border-[#2D4F3E]/15 bg-[#183528]">
                <iframe
                  ref={iframeRef}
                  key={activeTrack.id}
                  src={parsedSource.embedUrl}
                  title={activeTitle}
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  className={
                    parsedSource.kind === 'spotify'
                      ? 'h-[80px] w-full border-0'
                      : 'h-[168px] w-full border-0'
                  }
                />
                <div className="flex items-center justify-between gap-2 px-3 py-1.5 text-[11px] text-[#FAF7F0]/80">
                  <span className="truncate">{parsedSource.detectedLabel}</span>
                  <a
                    href={activeTrack.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#F4BE6A] hover:underline shrink-0"
                  >
                    <span>{isVi ? 'Mở link gốc' : 'Open link'}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            )}

            {/* Playback Controls & Volume for Synth / Direct Audio */}
            {!isEmbedSource && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-[#2D4F3E]/15 bg-white px-3.5 py-2.5">
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#2D4F3E] px-3.5 py-2 text-xs font-bold text-[#FAF7F0] hover:bg-[#1C3D2E] shrink-0 min-h-[38px]"
                >
                  {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  <span>{isPlaying ? (isVi ? 'Tạm dừng' : 'Pause') : (isVi ? 'Phát nhạc' : 'Play')}</span>
                </button>

                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => setMuted((m) => !m)}
                    aria-label={muted ? 'Unmute' : 'Mute'}
                    className="p-1 text-[#2D4F3E] hover:text-[#C86D51]"
                  >
                    {muted || volume === 0 ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={muted ? 0 : Math.round(volume * 100)}
                    onChange={(e) => {
                      setMuted(false);
                      setVolume(Number(e.target.value) / 100);
                    }}
                    aria-label={isVi ? 'Âm lượng' : 'Volume'}
                    className="w-full accent-[#E89F3C] cursor-pointer"
                  />
                </div>
              </div>
            )}

            {playbackError && (
              <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                {playbackError}
              </p>
            )}

            {/* Playlist Picker */}
            <div>
              <p className="text-xs font-bold text-[#2D4F3E] mb-2">
                {isVi ? 'Chọn giai điệu đồng hành:' : 'Choose a festival soundtrack:'}
              </p>
              <div className="space-y-1.5">
                {tracks.map((track) => {
                  const active = track.id === activeTrack.id;
                  return (
                    <div
                      key={track.id}
                      className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs transition-colors ${
                        active
                          ? 'border-[#E89F3C] bg-[#FEF7EC] text-[#24302A]'
                          : 'border-[#2D4F3E]/12 bg-white text-[#4B5E53] hover:border-[#2D4F3E]/30'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectTrack(track)}
                        className="flex items-center gap-2.5 text-left min-w-0 flex-1"
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                            active
                              ? 'bg-[#E89F3C] text-[#24302A]'
                              : 'bg-[#EFF4EE] text-[#2D4F3E]'
                          }`}
                        >
                          {active && isPlaying ? (
                            <Pause className="h-3.5 w-3.5" />
                          ) : (
                            <Play className="h-3.5 w-3.5" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-bold text-[#24302A] truncate">
                            {isVi ? track.titleVi : track.titleEn}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#C86D51]">
                            <span>{track.sourceLabel}</span>
                            {track.isOfficial && (
                              <span className="rounded bg-[#2D4F3E] px-1.5 py-0.5 text-[9px] text-[#F4BE6A]">
                                {isVi ? 'Chính thức' : 'Official'}
                              </span>
                            )}
                          </span>
                        </span>
                      </button>

                      {!track.isBuiltin && !track.isOfficial && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomTrack(track.id)}
                          aria-label={isVi ? 'Xóa link nhạc này' : 'Remove custom link'}
                          className="p-1.5 text-[#4B5E53] hover:text-red-600 shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Paste & Play Custom Online Music Link */}
            <form
              onSubmit={handleAddOnlineLink}
              className="rounded-xl border border-[#2D4F3E]/15 bg-white p-3 space-y-2.5"
            >
              <p className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2D4F3E]">
                <Link2 className="h-3.5 w-3.5 text-[#E89F3C]" />
                <span>
                  {isVi ? 'Phát từ Link Nhạc Online' : 'Play from Online Music Link'}
                </span>
              </p>
              <p className="text-[11px] leading-relaxed text-[#4B5E53]">
                {isVi
                  ? 'Hỗ trợ YouTube, SoundCloud, Spotify, Google Drive hoặc link âm thanh .mp3 / .ogg (https://)'
                  : 'Supports YouTube, SoundCloud, Spotify, Google Drive, or direct .mp3 / .ogg links (https://)'}
              </p>

              <input
                type="url"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full rounded-lg border border-[#2D4F3E]/20 bg-[#FAF7F0] px-3 py-2 text-xs text-[#24302A] focus:border-[#2D4F3E] focus:bg-white focus:outline-none min-h-[38px]"
              />

              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={80}
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder={isVi ? 'Tên bài nhạc (tuỳ chọn)' : 'Track title (optional)'}
                  className="flex-1 min-w-0 rounded-lg border border-[#2D4F3E]/20 bg-[#FAF7F0] px-3 py-2 text-xs text-[#24302A] focus:border-[#2D4F3E] focus:bg-white focus:outline-none min-h-[38px]"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1 rounded-lg bg-[#E89F3C] px-3 py-2 text-xs font-bold text-[#24302A] hover:bg-[#C27B16] hover:text-white transition-colors shrink-0 min-h-[38px]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{isVi ? 'Phát ngay' : 'Play'}</span>
                </button>
              </div>

              {linkError && (
                <p className="text-[11px] font-medium text-red-700">{linkError}</p>
              )}
            </form>
          </div>
        </section>
      )}

      {/* Floating Compact Enchanted Music Pill */}
      <div className="flex items-center gap-2 rounded-full border-2 border-[#E89F3C]/70 bg-[#183528]/95 p-1.5 pr-3 text-[#FAF7F0] shadow-lg backdrop-blur-md">
        <button
          type="button"
          onClick={handleTogglePlay}
          aria-label={
            isPlaying
              ? isVi
                ? 'Tạm dừng nhạc nền'
                : 'Pause background music'
              : isVi
                ? 'Phát nhạc nền Khu Rừng Phép Màu'
                : 'Play Magic Forest music'
          }
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E89F3C] text-[#24302A] hover:bg-[#F4BE6A] transition-colors"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
        </button>

        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="flex items-center gap-2 text-left min-w-0 max-w-[170px] sm:max-w-[215px]"
        >
          <div className="min-w-0">
            <p className="flex items-center gap-1 text-[11px] font-bold text-[#F4BE6A] leading-tight">
              <Music className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {isPlaying
                  ? isVi
                    ? 'Đang phát nhạc'
                    : 'Music Playing'
                  : isVi
                    ? 'Nhạc Khu Rừng'
                    : 'Forest Music'}
              </span>
            </p>
            <p className="truncate text-xs font-medium text-[#FAF7F0]">
              {activeTitle}
            </p>
          </div>
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-[#F4BE6A] shrink-0" />
          ) : (
            <ChevronUp className="h-4 w-4 text-[#F4BE6A] shrink-0" />
          )}
        </button>
      </div>
    </div>
  );
}
