"use client";

export default function FeaturesSection() {
  const features = [
    {
      icon: "⛓️",
      title: "On-Chain Verified",
      desc: "Setiap hasil permainan terverifikasi di blockchain Solana. Tidak ada kecurangan.",
    },
    {
      icon: "🎰",
      title: "Provably Fair",
      desc: "Random number generation menggunakan VRF (Verifiable Random Function) on-chain.",
    },
    {
      icon: "💸",
      title: "Low Fees",
      desc: "Biaya transaksi sangat rendah berkat Solana. Hanya ~$0.00025 per transaksi.",
    },
    {
      icon: "🌐",
      title: "Play Anywhere",
      desc: "Mainkan dari browser manapun. Tidak perlu download aplikasi tambahan.",
    },
    {
      icon: "👥",
      title: "Up to 4 Players",
      desc: "Bermain hingga 4 pemain secara bergiliran. Siapa yang paling cepat sampai 100?",
    },
    {
      icon: "🏅",
      title: "Leaderboard",
      desc: "Peringkat global untuk pemain terbaik. Buktikan skillmu di papan peringkat!",
    },
  ];

  return (
    <section className="features-section" id="features">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">✨ Features</span>
          <h2 className="section-title">
            Mengapa <span className="gradient-text">Snake Surge</span>?
          </h2>
          <p className="section-desc">
            Teknologi Web3 terbaik untuk pengalaman gaming yang adil dan
            transparan
          </p>
        </div>
        <div className="features-grid">
          {features.map(({ icon, title, desc }) => (
            <div className="feature-card reveal visible" key={title}>
              <div className="feature-icon">{icon}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
