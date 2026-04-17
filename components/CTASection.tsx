"use client";

import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export default function CTASection() {
  const { setVisible } = useWalletModal();

  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-card reveal visible">
          <div className="cta-glow" />
          <h2>Siap Bermain &amp; Menang? 🎲</h2>
          <p>
            Hubungkan wallet Anda sekarang dan mulai bermain ular tangga untuk
            memenangkan SOL!
          </p>
          <div className="cta-actions">
            <button
              className="btn-primary btn-lg"
              onClick={() => setVisible(true)}
              id="btnCtaConnect"
            >
              <span>👻 Connect Phantom Wallet</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
