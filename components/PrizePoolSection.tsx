"use client";

export default function PrizePoolSection({ prizePool }: { prizePool: number }) {
  const usd = (prizePool * 150).toFixed(2);

  return (
    <section className="prize-pool-section" id="prize-pool">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">💰 Rewards</span>
          <h2 className="section-title">
            Prize <span className="gradient-text">Pool</span>
          </h2>
          <p className="section-desc">
            Setiap permainan berkontribusi ke prize pool. Pemain pemenang
            mendapatkan hadiah SOL langsung ke wallet!
          </p>
        </div>
        <div className="prize-pool-card reveal visible">
          <div className="prize-pool-glow" />
          <div className="prize-pool-content">
            <div className="prize-label">Current Prize Pool</div>
            <div className="prize-amount">
              <span className="sol-icon">◎</span>
              <span className="prize-value">{prizePool.toFixed(3)}</span>
              <span className="prize-currency">SOL</span>
            </div>
            <div className="prize-usd">≈ ${usd} USD</div>
            <div className="prize-distribution">
              <div className="dist-item">
                <span className="dist-icon">🏆</span>
                <span className="dist-label">Pemenang</span>
                <span className="dist-value">100%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="prize-features">
          {[
            {
              icon: "⚡",
              title: "Instant Payout",
              desc: "Hadiah langsung dikirim ke Phantom Wallet Anda setelah game selesai",
            },
            {
              icon: "🔒",
              title: "Smart Contract",
              desc: "Prize pool diamankan oleh smart contract di blockchain Solana",
            },
            {
              icon: "📊",
              title: "Transparent",
              desc: "Semua transaksi tercatat on-chain dan dapat diverifikasi publik",
            },
          ].map(({ icon, title, desc }) => (
            <div className="pf-card reveal visible" key={title}>
              <div className="pf-icon">{icon}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
