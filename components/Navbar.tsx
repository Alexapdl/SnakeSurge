"use client";

import { useEffect, useState } from "react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

function shortenAddress(addr: string) {
  return addr.slice(0, 4) + "..." + addr.slice(-4);
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { setVisible } = useWalletModal();
  const { connected, publicKey } = useWallet();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleWalletClick = () => {
    setVisible(true);
  };

  return (
    <nav className={`navbar${scrolled ? " scrolled" : ""}`} id="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <span className="logo-icon">🐍</span>
          <span className="logo-text">
            Snake<span className="accent">Surge</span>
          </span>
        </div>
        <ul className={`nav-links${mobileOpen ? " active" : ""}`}>
          {["home", "game", "prize-pool", "how-to-play", "features"].map(
            (id) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={() => setMobileOpen(false)}
                  className={id === "game" ? "nav-play" : undefined}
                >
                  {id === "prize-pool"
                    ? "Prize Pool"
                    : id === "how-to-play"
                      ? "How to Play"
                      : id.charAt(0).toUpperCase() + id.slice(1)}
                </a>
              </li>
            ),
          )}
        </ul>
        <button
          className={`btn-connect-wallet${connected ? " connected" : ""}`}
          onClick={handleWalletClick}
        >
          <img
            src="https://phantom.app/img/phantom-icon-purple.svg"
            alt="Phantom"
            className="phantom-icon"
            onError={(e) =>
              ((e.target as HTMLImageElement).style.display = "none")
            }
          />
          <span>
            {connected && publicKey
              ? shortenAddress(publicKey.toBase58())
              : "Connect Wallet"}
          </span>
        </button>
        <button
          className="nav-toggle"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}
