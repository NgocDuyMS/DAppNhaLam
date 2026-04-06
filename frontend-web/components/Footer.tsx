import Link from "next/link";

export default function Footer() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .footer-root {
          font-family: 'DM Sans', sans-serif;
          background: #f8fafc;
          border-top: 1px solid rgba(255,255,255,0.06);
          position: relative;
          overflow: hidden;
        }

        /* top glow line */
        .footer-root::before {
          content: '';
          position: absolute;
          top: 0; left: 50%; transform: translateX(-50%);
          width: 60%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent);
        }

        .footer-logo {
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          font-size: 1.2rem;
          background: linear-gradient(135deg, #fff 30%, #93c5fd 70%, #c4b5fd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          transition: opacity 0.2s;
        }
        .footer-logo:hover { opacity: 0.8; }

        .footer-nav-link {
          font-size: 0.82rem;
          font-weight: 500;
          color: #475569;
          transition: color 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .footer-nav-link:hover { color: #a5b4fc; }

        .network-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.35rem 0.9rem;
          border-radius: 999px;
          background: rgba(99,102,241,0.08);
          border: 1px solid rgba(99,102,241,0.2);
          font-size: 0.78rem;
          font-weight: 700;
          font-family: 'Outfit', sans-serif;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          background-image: linear-gradient(135deg, #60a5fa, #818cf8, #c084fc);
          position: relative;
        }
        /* re-apply border without clip issue */
        .network-badge-wrap {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.35rem 0.9rem;
          border-radius: 999px;
          background: rgba(99,102,241,0.06);
          border: 1px solid rgba(99,102,241,0.2);
        }
        .network-badge-text {
          font-size: 0.78rem;
          font-weight: 700;
          font-family: 'Outfit', sans-serif;
          background: linear-gradient(135deg, #60a5fa, #818cf8, #c084fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .dot-live {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 6px rgba(52,211,153,0.8);
          animation: livePulse 2s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes livePulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.5; transform:scale(0.75); }
        }

        .divider-footer {
          border: none; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
          margin: 1.25rem 0;
        }

        .icon-link {
          width: 34px; height: 34px;
          border-radius: 10px;
          border: 1px solid rgba(0,0,0,0.08);
          background: rgba(255,255,255,0.03);
          display: flex; align-items: center; justify-content: center;
          color: #475569;
          transition: border-color 0.2s, color 0.2s, background 0.2s, transform 0.15s;
        }
        .icon-link:hover {
          border-color: rgba(99,102,241,0.35);
          background: rgba(99,102,241,0.08);
          color: #a5b4fc;
          transform: translateY(-2px);
        }
      `}</style>

      <footer className="footer-root w-full mt-auto py-8 px-6">
        <div className="max-w-6xl mx-auto">

          {/* ── Main row ───────────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">

            {/* Logo + tagline */}
            <div className="flex flex-col gap-3">
  <Link
    href="/"
    className="group inline-flex items-center gap-1.5 text-cyan-400 font-bold text-lg tracking-tight hover:text-cyan-300 transition-colors duration-200"
  >
    <span className="w-2 h-2 rounded-full bg-cyan-400 group-hover:bg-cyan-300 transition-colors duration-200" />
    dAppNhaLam
  </Link>
  <p className="text-xs text-slate-400 leading-relaxed max-w-[200px] border-l-2 border-cyan-800 pl-3">
    Nền tảng bỏ phiếu phi tập trung, bảo mật bởi công nghệ TEE thế hệ mới.
  </p>
</div>

            {/* Nav links */}
            <div className="flex flex-col gap-2.5">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-600 mb-1">Điều hướng</p>
              <Link href="/" className="footer-nav-link">
                <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="m3 9 9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
                Trang chủ
              </Link>
              <Link href="/elections" className="footer-nav-link">
                <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                Danh sách Bầu cử
              </Link>
              <Link href="/elections/create" className="footer-nav-link">
                <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                Tạo Bầu cử mới
              </Link>
            </div>

            {/* Network + social */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-600 mb-1">Mạng lưới</p>
              <div className="network-badge-wrap">
                <span className="dot-live" />
                <span className="network-badge-text">Oasis Sapphire Testnet</span>
              </div>
              <p className="text-xs text-slate-600">Chain ID: 23295</p>

              {/* Social icons */}
              <div className="flex gap-2 mt-1">
                {/* GitHub */}
                <a href="#" className="icon-link" title="GitHub">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                </a>
                {/* Docs / Report */}
                <a href="#" className="icon-link" title="Báo cáo">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </a>
                {/* Twitter/X */}
                <a href="#" className="icon-link" title="Twitter">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>

          </div>

          <hr className="divider-footer" />

          {/* ── Bottom bar ──────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-700">
              © 2026 <span className="text-slate-500 font-semibold">dAppNhaLam</span> · Hệ thống quản trị phi tập trung.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-700">
              <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
              </svg>
              Secured by TEE · End-to-end encrypted
            </div>
          </div>

        </div>
      </footer>
    </>
  );
}