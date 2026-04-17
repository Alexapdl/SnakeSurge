"use client";

import { useEffect, useRef } from "react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export default function HeroSection() {
  const { setVisible } = useWalletModal();

  useEffect(() => {
    // Animate counters
    const stats = [
      { id: "statPlayers", end: 2847 },
      { id: "statGames", end: 12493 },
    ];
    stats.forEach(({ id, end }) => {
      const el = document.getElementById(id);
      if (!el) return;
      let current = 0;
      const duration = 2000;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
          current = end;
          clearInterval(timer);
        }
        el.textContent = Math.floor(current).toLocaleString();
      }, 16);
    });
  }, []);

  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <div className="hero-badge">🎮 Web3 Gaming on Solana</div>
        <h1 className="hero-title">
          Mainkan <span className="gradient-text">Ular Tangga</span>
          <br />
          Menangkan <span className="gradient-text-alt">SOL Rewards</span>
        </h1>
        <p className="hero-subtitle">
          Permainan klasik ular tangga yang dipadukan dengan teknologi
          blockchain Solana. Lempar dadu, hindari ular, naiki tangga, dan raih
          kemenangan dari prize pool!
        </p>
        <div className="hero-actions">
          <a href="#game" className="btn-primary" id="btnPlayNow">
            <span>🎲 Main Sekarang</span>
          </a>
          <a href="#how-to-play" className="btn-secondary" id="btnLearnMore">
            <span>📖 Cara Bermain</span>
          </a>
        </div>
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-value" id="statPlayers">
              2,847
            </span>
            <span className="stat-label">Active Players</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" id="statGames">
              12,493
            </span>
            <span className="stat-label">Games Played</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" id="statPrize">
              156.8 SOL
            </span>
            <span className="stat-label">Prize Distributed</span>
          </div>
        </div>
      </div>
      <div className="hero-visual">
        <div className="floating-elements">
          <div className="float-dice">🎲</div>
          <div className="float-snake">🐍</div>
          <div className="float-ladder">🪜</div>
          <div className="float-coin">◎</div>
          <div className="float-star">⭐</div>
        </div>
      </div>
    </section>
  );
}
