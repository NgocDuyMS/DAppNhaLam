"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// ─── Particle canvas (tone sáng) ────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let animId: number;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    type P = { x: number; y: number; vx: number; vy: number; r: number; alpha: number };
    const particles: P[] = Array.from({ length: 55 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 0.4,
      alpha: Math.random() * 0.2 + 0.04,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(59,130,246,${0.07 * (1 - d / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59,130,246,${p.alpha})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

// ─── Animated counter ────────────────────────────────────────────────────────
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let s = 0; const step = target / 60;
      const tick = () => { s = Math.min(s + step, target); setVal(Math.floor(s)); if (s < target) requestAnimationFrame(tick); };
      tick();
    }, { threshold: 0.5 });
    obs.observe(ref.current!);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ─── Feature card ────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, delay }: { icon: string; title: string; desc: string; delay: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(ref.current!);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: delay,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(22px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
      className="feat-card group bg-white rounded-2xl p-6 border border-slate-100 cursor-default"
    >
      <div className="feat-icon mb-4">{icon}</div>
      <h3 className="text-base font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');

        * { font-family: 'Be Vietnam Pro', sans-serif; }

        .home-root { background: #f8fafc; min-height: 100vh; color: #1e293b; overflow-x: hidden; }

        /* Hero */
        .hero-wrap {
          background: #fff;
          border-bottom: 1px solid #f1f5f9;
          padding: 5rem 1.5rem 4rem;
          text-align: center;
          position: relative; z-index: 10;
        }

        .hero-badge {
          display: inline-flex; align-items: center; gap: 0.45rem;
          padding: 0.35rem 0.9rem; border-radius: 999px;
          background: #eff6ff; border: 1px solid #bfdbfe;
          font-size: 0.75rem; font-weight: 700; color: #2563eb;
          letter-spacing: 0.04em; margin-bottom: 1.75rem;
        }
        .badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #3b82f6; box-shadow: 0 0 6px rgba(59,130,246,0.6);
          animation: bdot 2s ease-in-out infinite;
        }
        @keyframes bdot { 0%,100%{opacity:1} 50%{opacity:0.4} }

        .hero-title {
          font-size: clamp(2.2rem, 5vw, 3.5rem);
          font-weight: 800; line-height: 1.1;
          letter-spacing: -0.025em; color: #0f172a; margin-bottom: 1.25rem;
        }
        .hero-accent { color: #2563eb; }

        .hero-sub {
          max-width: 540px; margin: 0 auto 2.5rem;
          color: #64748b; font-size: 1rem; line-height: 1.7;
        }

        /* Buttons */
        .btn-primary {
          display: inline-flex; align-items: center; gap: 0.45rem;
          padding: 0.75rem 1.6rem; border-radius: 10px;
          background: #2563eb; color: #fff;
          font-size: 0.9rem; font-weight: 700;
          transition: background 0.15s, box-shadow 0.15s, transform 0.15s;
        }
        .btn-primary:hover { background:#1d4ed8; box-shadow:0 4px 16px rgba(37,99,235,0.3); transform:translateY(-1px); }

        .btn-secondary {
          display: inline-flex; align-items: center; gap: 0.45rem;
          padding: 0.75rem 1.6rem; border-radius: 10px;
          background: #fff; border: 1px solid #e2e8f0;
          color: #475569; font-size: 0.9rem; font-weight: 600;
          transition: border-color 0.15s, color 0.15s, box-shadow 0.15s, transform 0.15s;
        }
        .btn-secondary:hover { border-color:#93c5fd; color:#2563eb; box-shadow:0 4px 12px rgba(59,130,246,0.1); transform:translateY(-1px); }

        /* Slide-up */
        @keyframes slideUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .su { animation: slideUp 0.7s cubic-bezier(.22,1,.36,1) both; }
        .d1{animation-delay:.05s} .d2{animation-delay:.15s} .d3{animation-delay:.25s}
        .d4{animation-delay:.38s} .d5{animation-delay:.52s}

        /* Stats strip */
        .stats-strip {
          display: grid; grid-template-columns: repeat(3,1fr);
          background: #f1f5f9; border-bottom: 1px solid #f1f5f9;
          position: relative; z-index: 10;
        }
        .stat-cell {
          background: #fff; padding: 1.5rem 1rem; text-align: center;
          transition: background 0.15s;
        }
        .stat-cell + .stat-cell { border-left: 1px solid #f1f5f9; }
        .stat-cell:hover { background: #f8fafc; }
        .stat-num { display:block; font-size:1.75rem; font-weight:800; color:#2563eb; letter-spacing:-0.02em; }
        .stat-lbl { display:block; font-size:0.68rem; font-weight:700; text-transform:uppercase; letter-spacing:0.12em; color:#94a3b8; margin-top:0.2rem; }

        /* Features */
        .features-wrap { padding: 4rem 1.5rem; max-width: 1100px; margin: 0 auto; }
        .eyebrow { font-size:0.68rem; font-weight:700; text-transform:uppercase; letter-spacing:0.18em; color:#2563eb; margin-bottom:0.4rem; }
        .sec-title { font-size:clamp(1.5rem,3vw,2rem); font-weight:800; color:#0f172a; letter-spacing:-0.02em; margin-bottom:2rem; }

        .feat-card { transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s; }
        .feat-card:hover { box-shadow:0 8px 24px rgba(15,23,42,0.07); transform:translateY(-2px); border-color:#dbeafe; }
        .feat-icon {
          width:42px; height:42px; border-radius:11px;
          background:#eff6ff; border:1px solid #dbeafe;
          display:flex; align-items:center; justify-content:center;
          font-size:1.25rem; transition:background 0.2s;
        }
        .feat-card:hover .feat-icon { background:#dbeafe; }

        /* Divider */
        .hr { border:none; height:1px; background:#f1f5f9; }

        /* CTA bottom */
        .cta-wrap { background:#fff; border-top:1px solid #f1f5f9; padding:4rem 1.5rem; text-align:center; }
        .cta-box {
          max-width:520px; margin:0 auto; padding:2.5rem;
          border-radius:20px; background:#f8fafc; border:1px solid #e2e8f0;
        }
        .cta-title { font-size:1.5rem; font-weight:800; color:#0f172a; letter-spacing:-0.02em; margin-bottom:0.5rem; }
        .cta-sub { color:#64748b; font-size:0.9rem; margin-bottom:1.75rem; line-height:1.6; }

        .trust-row {
          display:flex; align-items:center; justify-content:center;
          gap:0.5rem; margin-top:1.25rem;
          font-size:0.72rem; color:#94a3b8; font-weight:500;
        }
        .trust-sep { width:3px; height:3px; border-radius:50%; background:#d1d5db; }
      `}</style>

      <div className="home-root">
        <ParticleCanvas />

        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className="hero-wrap">
          <div className="max-w-3xl mx-auto">
            {mounted && <div className="su d1 hero-badge"><span className="badge-dot" />Powered by Oasis Sapphire</div>}

            {mounted && (
              <h1 className="su d2 hero-title">
                Nền tảng Quản trị<br />
                <span className="hero-accent">Bảo Mật & Phi Tập Trung</span>
              </h1>
            )}

            {mounted && (
              <p className="su d3 hero-sub">
                Dự án <strong className="text-slate-700">Private Voting dApp</strong> do đội ngũ{" "}
                <strong className="text-slate-700">dAppNhaLam</strong> kiến tạo.
                Giải quyết triệt để "áp lực đồng lứa" và sự thao túng kết quả trong các tổ chức DAO nhờ công nghệ bảo mật thế hệ mới.
              </p>
            )}

            {mounted && (
              <div className="su d4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/elections" className="btn-primary">
                  Khám phá Bầu cử ngay
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <Link href="/elections/create" className="btn-secondary">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Tạo cuộc bầu cử mới
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ── STATS ────────────────────────────────────────────── */}
        {mounted && (
          <div className="su d5 stats-strip">
            {[
              { label: "Cuộc bầu cử", target: 1240, suffix: "+" },
              { label: "Cử tri",       target: 48500, suffix: "+" },
              { label: "Uptime",       target: 99,    suffix: "%" },
            ].map((s) => (
              <div key={s.label} className="stat-cell">
                <span className="stat-num"><Counter target={s.target} suffix={s.suffix} /></span>
                <span className="stat-lbl">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        <hr className="hr" />

        {/* ── FEATURES ─────────────────────────────────────────── */}
        <section className="features-wrap">
          <p className="eyebrow">Tính năng nổi bật</p>
          <h2 className="sec-title">Bỏ phiếu không thể can thiệp</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FeatureCard icon="🔒" title="Mã hóa đầu cuối"   desc="Bảo vệ lựa chọn của cử tri từ thời điểm khởi tạo cho đến khi xử lý bên trong môi trường TEE (Secure Enclave)." delay="0ms"   />
            <FeatureCard icon="⚖️" title="Smart Privacy Lai"  desc="Bằng chứng bỏ phiếu công khai để kiểm chứng, nhưng nội dung lá phiếu ẩn danh tuyệt đối — minh bạch mà vẫn riêng tư." delay="80ms"  />
            <FeatureCard icon="🛡️" title="Chống Thao Túng"    desc="Ngăn chặn front-running và chống MEV, không ai có thể theo dõi xu hướng bỏ phiếu để thay đổi cục diện." delay="160ms" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FeatureCard icon="⛓️" title="On-chain & Verifiable" desc="Toàn bộ quy trình ghi lên blockchain — ai cũng xác minh được tính toàn vẹn mà không cần tin vào bên thứ ba." delay="40ms"  />
            <FeatureCard icon="🚀" title="Hiệu suất cao"         desc="Kiến trúc tối ưu xử lý hàng chục nghìn phiếu đồng thời với độ trễ dưới giây, không tắc nghẽn mạng." delay="120ms" />
          </div>
        </section>

        <hr className="hr" />

        {/* ── CTA BOTTOM ───────────────────────────────────────── */}
        <section className="cta-wrap">
          <div className="cta-box">
            <h2 className="cta-title">Sẵn sàng bắt đầu?</h2>
            <p className="cta-sub">Tạo cuộc bầu cử đầu tiên của bạn chỉ trong vài phút — hoàn toàn miễn phí.</p>
            <Link href="/elections/create" className="btn-primary" style={{ justifyContent: "center" }}>
              Bắt đầu ngay
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <div className="trust-row">
              <svg className="w-3.5 h-3.5" style={{color:"#10b981"}} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
              </svg>
              End-to-end encrypted
              <span className="trust-sep" />
              Oasis Sapphire TEE
              <span className="trust-sep" />
              On-chain verifiable
            </div>
          </div>
        </section>

      </div>
    </>
  );
}