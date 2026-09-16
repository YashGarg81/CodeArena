import React, { useRef, useState } from "react";
import "./VideoPlayer.css";

export type VideoSource =
  | { type: "youtube"; videoId: string }
  | { type: "local"; src: string };

interface Props {
  source: VideoSource;
  title?: string;
  /** Called when "next" or "prev" is clicked */
  onNavigate?: (direction: "prev" | "next") => void;
}

export const VideoPlayer: React.FC<Props> = ({ source, title, onNavigate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  // ---- HTML5 handlers ----
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
  };
  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };
  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value);
    if (videoRef.current) videoRef.current.currentTime = t;
    setCurrentTime(t);
  };
  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    if (videoRef.current) videoRef.current.volume = v;
    setVolume(v);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  return (
    <div className="vp-container">
      {title && <h2 className="vp-title">{title}</h2>}
      <div className="vp-player-wrapper">
        {source.type === "local" ? (
          <video
            ref={videoRef}
            className="vp-video"
            src={source.src}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            controls={false}
          />
        ) : (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${source.videoId}?rel=0&modestbranding=1&autoplay=0`}
            title={title ?? "YouTube video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="vp-video"
          />
        )}
      </div>

      {source.type === "local" ? (
        <div className="vp-controls">
          <button className="vp-control-btn" onClick={togglePlay}>
            {isPlaying ? "⏸︎" : "▶︎"}
          </button>
          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="vp-seek-bar"
          />
          <span className="vp-time">{formatTime(currentTime)} / {formatTime(duration)}</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={handleVolume}
            className="vp-volume-bar"
          />
          {onNavigate && (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="vp-nav-btn" onClick={() => onNavigate("prev")}>◀︎ Prev</button>
              <button className="vp-nav-btn" onClick={() => onNavigate("next")}>Next ▶︎</button>
            </div>
          )}
        </div>
      ) : (
        onNavigate && (
          <div className="vp-controls" style={{ justifyContent: "flex-end" }}>
            <button className="vp-nav-btn" onClick={() => onNavigate("prev")}>◀︎ Prev Lesson</button>
            <button className="vp-nav-btn" onClick={() => onNavigate("next")}>Next Lesson ▶︎</button>
          </div>
        )
      )}
    </div>
  );
};
