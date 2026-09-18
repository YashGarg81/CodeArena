import React, { useRef, useState, useEffect, useCallback } from "react";
import YouTube, { type YouTubeProps } from "react-youtube";
import {
  Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX,
  Maximize, Minimize, Settings, ChevronLeft, ChevronRight,
  Sparkles, CheckCircle2, Paperclip, BookOpen, Code2,
  FileText, Zap, ArrowLeft, Tv, Monitor, X, Keyboard
} from "lucide-react";
import "./VideoPlayer.css";

// ─── Types ────────────────────────────────────────────────────────────────────
export type VideoSource =
  | { type: "youtube"; videoId: string }
  | { type: "local"; src: string; poster?: string; sources?: { src: string; type: string }[] };

export interface LessonAttachment {
  id: string;
  title: string;
  type: "code" | "note" | "doc" | "exercise";
  description?: string;
  content?: string;
  url?: string;
}

interface Props {
  source: VideoSource;
  title?: string;
  courseTitle?: string;
  lessonNumber?: number;
  xpReward?: number;
  theaterMode?: boolean;
  autoplay?: boolean;
  attachments?: LessonAttachment[];
  onNavigate?: (direction: "prev" | "next") => void;
  onComplete?: () => void;
  onBackToCourse?: () => void;
  onToggleTheater?: (isTheater: boolean) => void;
  onCaptionsToggle?: (enabled: boolean) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const SEEK_OFFSET = 10;
const CONTROLS_HIDE_DELAY = 2800;
const FEEDBACK_DURATION = 600;
const RESUME_DELAY_FRAMES = 2; // RAF cycles before resuming after theater toggle

const YT_PLAYER_VARS = {
  autoplay: 0,
  controls: 0,         // Hide YouTube native UI completely
  rel: 0,              // No related videos
  modestbranding: 1,   // No YouTube logo
  iv_load_policy: 3,   // No annotations / playlist popups
  cc_load_policy: 0,   // Disable closed captions
  disablekb: 1,        // Disable native keyboard (we handle it)
  fs: 0,               // Disable native fullscreen button
  playsinline: 1,
  enablejsapi: 1,
  origin: typeof window !== "undefined" ? window.location.origin : "",
} as const;

const FALLBACK_ATTACHMENTS: LessonAttachment[] = [
  {
    id: "a1", type: "note", title: "Lecture Notes & Key Takeaways",
    description: "Quick revision points, time complexities, and interview pitfalls from this lecture.",
  },
  {
    id: "a2", type: "code", title: "Source Code & Solution Templates",
    description: "Production-ready Java, C++, Python, and JavaScript implementations.",
  },
  {
    id: "a3", type: "exercise", title: "Practice Exercises",
    description: "Hand-picked follow-up problems from the CodeArena DSA catalog.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(secs: number): string {
  if (!secs || isNaN(secs) || secs < 0) return "0:00";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function rafN(n: number, cb: () => void) {
  if (n <= 0) { cb(); return; }
  requestAnimationFrame(() => rafN(n - 1, cb));
}

// ─── Component ────────────────────────────────────────────────────────────────
export const VideoPlayer: React.FC<Props> = ({
  source, title, courseTitle, lessonNumber, xpReward = 50,
  theaterMode: propTheaterMode, autoplay = false, attachments = [],
  onNavigate, onComplete, onBackToCourse, onToggleTheater,
  onCaptionsToggle,
}) => {
  const containerRef  = useRef<HTMLDivElement>(null);
  const videoRef      = useRef<HTMLVideoElement>(null);
  const ytRef         = useRef<any>(null);
  const hideTimer     = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const scrubberRef   = useRef<HTMLDivElement>(null);

  // ── Playback state ──
  const [isPlaying,     setIsPlaying]     = useState(false);
  const [hasStarted,    setHasStarted]    = useState(false);
  const [currentTime,   setCurrentTime]   = useState(0);
  const [duration,      setDuration]      = useState(0);
  const [buffered,      setBuffered]      = useState(0);
  const [volume,        setVolume]        = useState(1);
  const [isMuted,       setIsMuted]       = useState(false);
  const [speed,         setSpeed]         = useState(1);
  const [isFullscreen,  setIsFullscreen]  = useState(false);

  // ── UI state ──
  const [theaterMode,     setTheaterMode]     = useState(propTheaterMode ?? false);
  const [ambientGlow,     setAmbientGlow]     = useState(true);
  const [showControls,    setShowControls]    = useState(true);
  const [showSpeed,       setShowSpeed]       = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [activeTab,       setActiveTab]       = useState<"notes" | "code" | "shortcuts">("notes");
  const [tapFeedback,     setTapFeedback]     = useState<"left" | "right" | "play" | "pause" | null>(null);
  const [isScrubbing,     setIsScrubbing]     = useState(false);
  const [captionsOn,      setCaptionsOn]      = useState(false);

  const displayAttachments = attachments.length > 0 ? attachments : FALLBACK_ATTACHMENTS;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // ── Sync propTheaterMode ──
  useEffect(() => {
    if (propTheaterMode !== undefined) setTheaterMode(propTheaterMode);
  }, [propTheaterMode]);

  // ── Reset on source change ──
  useEffect(() => {
    setHasStarted(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setBuffered(0);
  }, [source]);

  // ── Fullscreen change listener ──
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // ── YouTube progress ticker ──
  useEffect(() => {
    if (source.type !== "youtube") return;
    const id = setInterval(() => {
      if (!ytRef.current) return;
      try {
        const curr = ytRef.current.getCurrentTime?.() ?? 0;
        const dur  = ytRef.current.getDuration?.()    ?? 0;
        const buf  = ytRef.current.getVideoLoadedFraction?.() ?? 0;
        setCurrentTime(curr);
        if (dur > 0) setDuration(dur);
        setBuffered(buf * 100);
      } catch {}
    }, 250);
    return () => clearInterval(id);
  }, [source]);

  // ── Controls auto-hide ──
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!isScrubbing) setShowControls(false);
    }, CONTROLS_HIDE_DELAY);
  }, [isScrubbing]);

  const showControlsPermanently = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  // ── CC / captions killer ──
  const killCaptions = useCallback((player: any) => {
    if (!player) return;
    try {
      player.unloadModule?.("captions");
      player.unloadModule?.("cc");
      player.setOption?.("captions", "track", {});
      player.setOption?.("cc", "track", {});
      player.setOption?.("captions", "fontSize", 0);
    } catch {}
  }, []);

  // ── Captions toggle (YouTube only) ──
  const toggleCaptions = useCallback(() => {
    const next = !captionsOn;
    setCaptionsOn(next);
    onCaptionsToggle?.(next);
    const player = ytRef.current;
    if (source.type === "youtube" && player) {
      try {
        if (next) player.loadModule?.("captions");
        else killCaptions(player);
      } catch {}
    }
  }, [captionsOn, onCaptionsToggle, source.type, killCaptions]);

  // ── YouTube ready / state change ──
  const onYTReady: YouTubeProps["onReady"] = useCallback((e: any) => {
    ytRef.current = e.target;
    setDuration(e.target.getDuration() ?? 0);
    e.target.setVolume(volume * 100);
    killCaptions(e.target);
  }, [volume, killCaptions]);

  const onYTStateChange: YouTubeProps["onStateChange"] = useCallback((e: any) => {
    killCaptions(e.target);
    if (e.data === 1) { setIsPlaying(true);  setHasStarted(true); }
    else if (e.data === 2) setIsPlaying(false);
    else if (e.data === 0) { setIsPlaying(false); onComplete?.(); }
  }, [killCaptions, onComplete]);

  // ── Playback controls ──
  const play = useCallback(() => {
    if (source.type === "youtube") ytRef.current?.playVideo();
    else videoRef.current?.play();
  }, [source.type]);

  const pause = useCallback(() => {
    if (source.type === "youtube") ytRef.current?.pauseVideo();
    else videoRef.current?.pause();
  }, [source.type]);

  const togglePlay = useCallback(() => {
    if (!hasStarted) setHasStarted(true);
    if (isPlaying) { pause(); setTapFeedback("pause"); }
    else           { play();  setTapFeedback("play"); }
    setTimeout(() => setTapFeedback(null), FEEDBACK_DURATION);
  }, [isPlaying, hasStarted, play, pause]);

  const seekTo = useCallback((time: number) => {
    const t = Math.max(0, Math.min(time, duration));
    setCurrentTime(t);
    if (source.type === "youtube") ytRef.current?.seekTo(t, true);
    else if (videoRef.current) videoRef.current.currentTime = t;
  }, [duration, source.type]);

  const skipWithFeedback = useCallback((offset: number) => {
    setTapFeedback(offset < 0 ? "left" : "right");
    seekTo(currentTime + offset);
    setTimeout(() => setTapFeedback(null), FEEDBACK_DURATION);
  }, [currentTime, seekTo]);

  const setVolumeAndSync = useCallback((v: number) => {
    setVolume(v);
    setIsMuted(v === 0);
    if (source.type === "youtube" && ytRef.current) {
      ytRef.current.setVolume(v * 100);
      v === 0 ? ytRef.current.mute() : ytRef.current.unMute();
    } else if (videoRef.current) {
      videoRef.current.volume = v;
      videoRef.current.muted  = v === 0;
    }
  }, [source.type]);

  const toggleMute = useCallback(() => {
    if (isMuted) setVolumeAndSync(volume > 0 ? volume : 0.85);
    else {
      if (source.type === "youtube") ytRef.current?.mute();
      else if (videoRef.current) videoRef.current.muted = true;
      setIsMuted(true);
    }
  }, [isMuted, volume, source.type, setVolumeAndSync]);

  const setPlaybackSpeed = useCallback((r: number) => {
    setSpeed(r);
    setShowSpeed(false);
    if (source.type === "youtube") ytRef.current?.setPlaybackRate(r);
    else if (videoRef.current) videoRef.current.playbackRate = r;
  }, [source.type]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) containerRef.current.requestFullscreen().catch(() => {});
    else document.exitFullscreen().catch(() => {});
  }, []);

  // ── Theater mode (with playback preservation) ──
  const handleTheaterToggle = useCallback(() => {
    const wasPlaying = isPlaying;
    const savedTime  = currentTime;
    const next = !theaterMode;
    setTheaterMode(next);
    onToggleTheater?.(next);

    // Restore playback after DOM settles
    if (wasPlaying && source.type === "youtube") {
      rafN(RESUME_DELAY_FRAMES, () => {
        try {
          ytRef.current?.seekTo(savedTime, true);
          ytRef.current?.playVideo();
          setIsPlaying(true);
        } catch {}
      });
    }
  }, [isPlaying, currentTime, theaterMode, source.type, onToggleTheater]);

  // ── Scrubber mouse interaction ──
  const handleScrubClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubberRef.current) return;
    const rect  = scrubberRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seekTo(ratio * duration);
  }, [duration, seekTo]);

  // ── HTML5 video event handlers ──
  const onVideoTimeUpdate  = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    if (videoRef.current.buffered.length > 0 && videoRef.current.duration > 0) {
      const end = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBuffered((end / videoRef.current.duration) * 100);
    }
  };
  const onVideoMetadata = () => { if (videoRef.current) setDuration(videoRef.current.duration); };

  // ── Cinema cover start ──
  const handleCoverClick = useCallback(() => {
    setHasStarted(true);
    play();
    setIsPlaying(true);
  }, [play]);

  // ── Keyboard shortcuts ──
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const t = e.target as HTMLElement;
    if (["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) || t.isContentEditable) return;
    switch (e.code) {
      case "Space": case "KeyK": e.preventDefault(); togglePlay(); break;
      case "ArrowRight": case "KeyL": e.preventDefault(); skipWithFeedback(SEEK_OFFSET); break;
      case "ArrowLeft":  case "KeyJ": e.preventDefault(); skipWithFeedback(-SEEK_OFFSET); break;
      case "KeyF": e.preventDefault(); toggleFullscreen(); break;
      case "KeyM": e.preventDefault(); toggleMute(); break;
      case "KeyT": e.preventDefault(); handleTheaterToggle(); break;
    }
  }, [togglePlay, skipWithFeedback, toggleFullscreen, toggleMute, handleTheaterToggle]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className={[
        "vp-container",
        theaterMode  ? "vp-theater"  : "vp-normal",
        ambientGlow  ? "vp-glow"     : "",
        isFullscreen ? "vp-fullscreen" : "",
      ].filter(Boolean).join(" ")}
      onMouseMove={resetHideTimer}
      onMouseEnter={resetHideTimer}
      onMouseLeave={showControlsPermanently}
    >
      {/* ── TOP META BAR ─────────────────────────────────────────────────── */}
      <div className="vp-topbar">
        <div className="vp-topbar-left">
          {onBackToCourse && (
            <button className="vp-back-btn" onClick={onBackToCourse} title="Back to Course">
              <ArrowLeft size={14} />
              <span>Course Hub</span>
            </button>
          )}
          <span className="vp-brand">
            <span className="vp-brand-dot" />
            CodeArena Studio
          </span>
          {title && (
            <span className="vp-title" title={title}>{title}</span>
          )}
          {lessonNumber !== undefined && (
            <span className="vp-badge vp-badge-blue">Lec #{lessonNumber}</span>
          )}
          {xpReward > 0 && (
            <span className="vp-badge vp-badge-amber">
              <Zap size={11} fill="currentColor" /> +{xpReward} XP
            </span>
          )}
        </div>

        <div className="vp-topbar-right">
          <button
            className={`vp-pill${ambientGlow ? " vp-pill-active" : ""}`}
            onClick={() => setAmbientGlow(g => !g)}
            title="Ambient Studio Glow"
          >
            <Sparkles size={13} />
            <span>Glow</span>
          </button>

          <button
            className={`vp-pill${theaterMode ? " vp-pill-active" : ""}`}
            onClick={handleTheaterToggle}
            title="Theater Mode (T)"
          >
            {theaterMode ? <Monitor size={13} /> : <Tv size={13} />}
            <span>{theaterMode ? "Normal" : "Theater"}</span>
          </button>

          <button
            className={`vp-pill vp-pill-rose${showAttachments ? " vp-pill-active" : ""}`}
            onClick={() => setShowAttachments(s => !s)}
            title="Study Resources"
          >
            <Paperclip size={13} />
            <span>Resources</span>
            <span className="vp-pill-count">{displayAttachments.length}</span>
          </button>
        </div>
      </div>

      {/* ── PLAYER CANVAS ────────────────────────────────────────────────── */}
      <div className="vp-canvas-wrap">
        {/* Ambient glow backlight */}
        {ambientGlow && (
          <div className="vp-glow-layer" aria-hidden="true">
            <div
              className="vp-glow-mesh"
              style={{
                opacity: isPlaying ? 1 : 0.35,
                transform: isPlaying ? "scale(1.08)" : "scale(1)",
              }}
            />
          </div>
        )}

        {/* 16:9 aspect ratio box */}
        <div className="vp-canvas">
          {/* YouTube iframe */}
          {source.type === "youtube" && (
            <div className="vp-yt-host">
              <YouTube
                key={source.videoId}
                videoId={source.videoId}
                opts={{ playerVars: { ...YT_PLAYER_VARS, autoplay: autoplay ? 1 : 0 } }}
                onReady={onYTReady}
                onStateChange={onYTStateChange}
                className="vp-yt-div"
                iframeClassName="vp-yt-iframe"
              />
            </div>
          )}

          {/* HTML5 local video */}
          {source.type === "local" && (
            <video
              ref={videoRef}
              src={source.sources ? undefined : source.src}
              poster={source.poster}
              className="vp-local-video"
              playsInline
              preload="metadata"
              onTimeUpdate={onVideoTimeUpdate}
              onLoadedMetadata={onVideoMetadata}
              onPlay={() => { setIsPlaying(true); setHasStarted(true); }}
              onPause={() => setIsPlaying(false)}
              onEnded={() => { setIsPlaying(false); onComplete?.(); }}
            >
              {source.sources?.map((s) => (
                <source key={s.src} src={s.src} type={s.type} />
              ))}
            </video>
          )}

          {/* Cinema cover (hides YouTube thumbnail before first play) */}
          {!hasStarted && (
            <div
              className="vp-cover"
              onClick={handleCoverClick}
              role="button"
              tabIndex={0}
              aria-label="Start lecture"
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleCoverClick(); } }}
            >
              <div className="vp-cover-bg" />
              <div className="vp-cover-center">
                <div className="vp-cover-ring">
                  <button className="vp-cover-play" aria-label="Start lecture">
                    <Play size={36} fill="white" style={{ marginLeft: 4 }} />
                  </button>
                </div>
                <div className="vp-cover-meta">
                  <div className="vp-cover-tags">
                    <span className="vp-badge vp-badge-indigo">STUDIO HD</span>
                    {lessonNumber !== undefined && (
                      <span className="vp-badge vp-badge-blue">Lecture #{lessonNumber}</span>
                    )}
                  </div>
                  <h2 className="vp-cover-title">{title || "Interactive Lecture"}</h2>
                  <p className="vp-cover-hint">
                    Click to start &nbsp;·&nbsp; ⚡ +{xpReward} XP on completion
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Click zones: single click = play/pause, double click = seek */}
          <div
            className="vp-zone vp-zone-left"
            onClick={togglePlay}
            onDoubleClick={() => skipWithFeedback(-SEEK_OFFSET)}
          />
          <div
            className="vp-zone vp-zone-right"
            onClick={togglePlay}
            onDoubleClick={() => skipWithFeedback(SEEK_OFFSET)}
          />

          {/* Tap feedback overlays */}
          {tapFeedback === "left"  && <div className="vp-feedback vp-feedback-left"><RotateCcw size={22} /><span>-10s</span></div>}
          {tapFeedback === "right" && <div className="vp-feedback vp-feedback-right"><RotateCw  size={22} /><span>+10s</span></div>}
          {tapFeedback === "play"  && <div className="vp-feedback vp-feedback-center"><Play  size={28} fill="white" /></div>}
          {tapFeedback === "pause" && <div className="vp-feedback vp-feedback-center"><Pause size={28} fill="white" /></div>}

          {/* ── CONTROLS HUD ──────────────────────────────────────────── */}
          <div className={`vp-hud${showControls || !isPlaying ? " vp-hud-visible" : ""}`}>
            {/* Scrubber */}
            <div
              ref={scrubberRef}
              className="vp-scrubber"
              onClick={handleScrubClick}
              onMouseDown={() => setIsScrubbing(true)}
              onMouseUp={() => setIsScrubbing(false)}
            >
              <div className="vp-track">
                <div className="vp-track-buf"  style={{ width: `${buffered}%` }} />
                <div className="vp-track-fill" style={{ width: `${progress}%` }}>
                  <div className="vp-track-thumb" />
                </div>
              </div>
            </div>

            {/* Controls row */}
            <div className="vp-controls">
              {/* LEFT cluster */}
              <div className="vp-ctrl-left">
                {onNavigate && (
                  <button className="vp-ctrl-btn" onClick={() => onNavigate("prev")} title="Prev Lesson">
                    <ChevronLeft size={16} />
                  </button>
                )}

                <button className="vp-ctrl-btn vp-play-btn" onClick={togglePlay} title={isPlaying ? "Pause (K)" : "Play (K)"}>
                  {isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
                </button>

                {onNavigate && (
                  <button className="vp-ctrl-btn" onClick={() => onNavigate("next")} title="Next Lesson">
                    <ChevronRight size={16} />
                  </button>
                )}

                <button className="vp-ctrl-btn" onClick={() => skipWithFeedback(-SEEK_OFFSET)} title="Rewind 10s (J)">
                  <RotateCcw size={15} />
                </button>
                <button className="vp-ctrl-btn" onClick={() => skipWithFeedback(SEEK_OFFSET)} title="Forward 10s (L)">
                  <RotateCw  size={15} />
                </button>

                {/* Volume */}
                <div className="vp-vol-group">
                  <button className="vp-ctrl-btn" onClick={toggleMute} title="Mute (M)">
                    {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                  <input
                    className="vp-vol-slider"
                    type="range" min={0} max={1} step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={e => setVolumeAndSync(Number(e.target.value))}
                    title="Volume"
                  />
                </div>

                {/* Time */}
                <span className="vp-time">
                  <span className="vp-time-current">{formatTime(currentTime)}</span>
                  <span className="vp-time-sep"> / </span>
                  <span className="vp-time-total">{formatTime(duration)}</span>
                </span>
              </div>

              {/* RIGHT cluster */}
              <div className="vp-ctrl-right">
                {/* Speed */}
                <div className="vp-speed-wrap">
                  <button
                    className={`vp-ctrl-btn${showSpeed ? " vp-ctrl-active" : ""}`}
                    onClick={() => setShowSpeed(s => !s)}
                    title="Playback Speed"
                  >
                    <Settings size={15} />
                    <span className="vp-speed-label">{speed}×</span>
                  </button>
                  {showSpeed && (
                    <div className="vp-speed-menu">
                      <div className="vp-speed-title">Speed</div>
                      {SPEEDS.map(r => (
                        <button
                          key={r}
                          className={`vp-speed-opt${speed === r ? " vp-speed-active" : ""}`}
                          onClick={() => setPlaybackSpeed(r)}
                        >
                          <span>{r === 1 ? "Normal (1×)" : `${r}×`}</span>
                          {speed === r && <CheckCircle2 size={12} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Resources / Attachments */}
                <button
                  className={`vp-ctrl-btn${showAttachments ? " vp-ctrl-active" : ""}`}
                  onClick={() => setShowAttachments(s => !s)}
                  title="Study Resources"
                >
                  <Paperclip size={16} />
                </button>

                {/* Captions (YouTube only) */}
                {source.type === "youtube" && (
                  <button
                    className={`vp-ctrl-btn${captionsOn ? " vp-ctrl-active" : ""}`}
                    onClick={toggleCaptions}
                    title="Captions"
                    aria-label="Toggle captions"
                    aria-pressed={captionsOn}
                  >
                    <span className="vp-cc-label">CC</span>
                  </button>
                )}

                {/* Theater */}
                <button
                  className={`vp-ctrl-btn${theaterMode ? " vp-ctrl-active" : ""}`}
                  onClick={handleTheaterToggle}
                  title="Theater Mode (T)"
                  aria-pressed={theaterMode}
                >
                  {theaterMode ? <Monitor size={16} /> : <Tv size={16} />}
                </button>

                {/* Fullscreen */}
                <button className="vp-ctrl-btn" onClick={toggleFullscreen} title="Fullscreen (F)">
                  {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* ── ATTACHMENTS OVERLAY ───────────────────────────────────── */}
          {showAttachments && (
            <aside
              className="vp-drawer"
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
            >
              <div className="vp-drawer-head">
                <div className="vp-drawer-title">
                  <Paperclip size={16} />
                  <span>Study Resources</span>
                </div>
                <button className="vp-drawer-close" onClick={() => setShowAttachments(false)} title="Close">
                  <X size={16} />
                </button>
              </div>

              <div className="vp-drawer-tabs">
                {(["notes", "code", "shortcuts"] as const).map(tab => (
                  <button
                    key={tab}
                    className={`vp-tab${activeTab === tab ? " vp-tab-active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === "notes"     && <BookOpen  size={13} />}
                    {tab === "code"      && <Code2     size={13} />}
                    {tab === "shortcuts" && <Keyboard  size={13} />}
                    <span>{tab === "notes" ? "Notes" : tab === "code" ? "Code" : "Keys"}</span>
                  </button>
                ))}
              </div>

              <div className="vp-drawer-body">
                {activeTab === "notes" && (
                  <div className="vp-attachment-list">
                    {displayAttachments.map((item, i) => (
                      <div
                        key={item.id ?? i}
                        className="vp-attachment-item"
                        onClick={() => {
                          if (item.url) window.open(item.url, "_blank");
                          else if (item.type === "code") setActiveTab("code");
                        }}
                      >
                        <div className="vp-att-icon">
                          {item.type === "code" ? <Code2 size={16} /> : <FileText size={16} />}
                        </div>
                        <div className="vp-att-text">
                          <div className="vp-att-title">{item.title}</div>
                          {item.description && <div className="vp-att-desc">{item.description}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "code" && (
                  <div className="vp-code-pane">
                    {displayAttachments.filter((a) => a.type === "code" && a.content).length > 0 ? (
                      displayAttachments.filter((a) => a.type === "code" && a.content).map((item, i) => (
                        <div key={item.id ?? i} className="vp-code-block-wrap">
                          <div className="vp-code-header">
                            <span className="vp-badge vp-badge-purple">{item.title}</span>
                          </div>
                          <pre className="vp-code-block"><code>{item.content}</code></pre>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="vp-code-header">
                          <span className="vp-badge vp-badge-purple">Starter Template</span>
                        </div>
                        <pre className="vp-code-block"><code>{`// Solution scaffold — this lecture\npublic class Solution {\n  public static void main(String[] args) {\n    // Your code here\n    System.out.println("CodeArena");\n  }\n}`}</code></pre>
                      </>
                    )}
                  </div>
                )}

                {activeTab === "shortcuts" && (
                  <div className="vp-shortcuts">
                    {[
                      ["Space / K", "Play / Pause"],
                      ["← / J",     "Rewind 10s"],
                      ["→ / L",     "Forward 10s"],
                      ["M",         "Mute / Unmute"],
                      ["T",         "Theater Mode"],
                      ["F",         "Fullscreen"],
                    ].map(([key, label]) => (
                      <div key={key} className="vp-shortcut-row">
                        <kbd>{key}</kbd>
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};
