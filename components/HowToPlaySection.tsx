"use client";

export default function HowToPlaySection() {
  const steps = [
    {
      icon: "👻",
      title: "Connect Phantom Wallet",
      desc: "Hubungkan Phantom Wallet Anda dan dapatkan saldo awal 2 SOL untuk bermain.",
    },
    {
      icon: "👥",
      title: "Pilih Jumlah Pemain",
      desc: "Pilih 2, 3, atau 4 pemain. Pemain 2-4 adalah AI Bot yang bermain otomatis melawan Anda!",
    },
    {
      icon: "🎲",
      title: "Lempar Dadu",
      desc: "Klik dadu untuk mengocok dan mendapatkan angka 1-6. Setiap lemparan memotong 0.01 SOL ke prize pool!",
    },
    {
      icon: "💰",
      title: "Prize Pool Bertambah",
      desc: "Setiap pemain yang melempar dadu berkontribusi 0.01 SOL. Semakin lama bermain, prize pool semakin besar!",
    },
    {
      icon: "🐍",
      title: "Hindari Ular & Naiki Tangga",
      desc: "Mendarat di kepala ular? Turun! Mendarat di bawah tangga? Naik! Strategi dan keberuntungan!",
    },
    {
      icon: "🏆",
      title: "Raih Kemenangan",
      desc: "Pemain pertama yang sampai ke kotak 100 memenangkan 100% prize pool langsung ke wallet!",
    },
  ];

  return (
    <section className="how-to-play" id="how-to-play">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">📖 Tutorial</span>
          <h2 className="section-title">
            Cara <span className="gradient-text">Bermain</span>
          </h2>
          <p className="section-desc">
            Ikuti langkah-langkah sederhana ini untuk mulai bermain dan menang!
          </p>
        </div>
        <div className="steps-grid">
          {steps.map((step, i) => (
            <div
              className="step-card reveal visible"
              key={step.title}
              data-step={i + 1}
            >
              <div className="step-number">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="step-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
