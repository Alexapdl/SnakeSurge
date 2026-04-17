export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="nav-logo">
              <span className="logo-icon">🐍</span>
              <span className="logo-text">
                Snake<span className="accent">Surge</span>
              </span>
            </div>
            <p>
              Permainan ular tangga Web3 pertama di blockchain Solana. Main,
              menang, dapat SOL!
            </p>
          </div>
          <div className="footer-links">
            <h4>Links</h4>
            <a href="#home">Home</a>
            <a href="#game">Play Game</a>
            <a href="#prize-pool">Prize Pool</a>
            <a href="#how-to-play">Tutorial</a>
          </div>
          <div className="footer-links">
            <h4>Community</h4>
            <a href="#">Discord</a>
            <a href="#">Twitter / X</a>
            <a href="#">Telegram</a>
            <a href="#">GitHub</a>
          </div>
          <div className="footer-links">
            <h4>Legal</h4>
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Smart Contract</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Snake Surge. Built on Solana. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
