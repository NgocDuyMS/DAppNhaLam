"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// ─── Particle background ────────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    type Particle = {
      x: number; y: number; vx: number; vy: number;
      r: number; alpha: number; color: string;
    };

    const colors = ["#60a5fa", "#818cf8", "#a78bfa", "#38bdf8"];
    const particles: Particle[] = Array.from({ length: 60 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2.5 + 0.5,
      alpha: Math.random() * 0.5 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99,102,241,${0.12 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.7 }}
    />
  );
}

// ─── Animated counter ───────────────────────────────────────────────────────
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        let start = 0;
        const step = target / 60;
        const tick = () => {
          start = Math.min(start + step, target);
          setVal(Math.floor(start));
          if (start < target) requestAnimationFrame(tick);
        };
        tick();
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ─── Feature card ───────────────────────────────────────────────────────────
function FeatureCard({
  icon, title, desc, accent, delay,
}: {
  icon: string; title: string; desc: string; accent: string; delay: string;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.2 }
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
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
      }}
      className="group relative p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 overflow-hidden cursor-default"
    >
      {/* glow blob */}
      <div
        className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-700 ${accent}`}
      />
      <div className="relative z-10">
        <div className="text-4xl mb-5">{icon}</div>
        <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{title}</h3>
        <p className="text-slate-400 leading-relaxed text-sm">{desc}</p>
      </div>
      {/* bottom accent line */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 ${accent.replace("bg-", "bg-")}`}
        style={{ background: "linear-gradient(90deg, transparent, currentColor)" }}
      />
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        :root {
          --blue:   #3b82f6;
          --indigo: #6366f1;
          --purple: #a855f7;
          --cyan:   #06b6d4;
        }

        body { font-family: 'DM Sans', sans-serif; }

        .font-display { font-family: 'Outfit', sans-serif; }

        .gradient-text {
          background: linear-gradient(135deg, #60a5fa 0%, #818cf8 40%, #c084fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .btn-primary {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #3b82f6, #6366f1, #a855f7);
          background-size: 200% 200%;
          animation: gradientShift 3s ease infinite;
          transition: transform 0.2s ease, box-shadow 0.3s ease;
        }
        .btn-primary:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 0 40px rgba(99,102,241,0.6), 0 20px 40px rgba(0,0,0,0.3);
        }
        .btn-primary::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .btn-primary:hover::after { opacity: 1; }

        .btn-secondary {
          border: 1.5px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(12px);
          transition: transform 0.2s ease, border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
        }
        .btn-secondary:hover {
          transform: translateY(-2px) scale(1.02);
          border-color: rgba(99,102,241,0.6);
          background: rgba(99,102,241,0.08);
          box-shadow: 0 0 30px rgba(99,102,241,0.15);
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50%       { background-position: 100% 50%; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%       { transform: translateY(-16px) rotate(1deg); }
          66%       { transform: translateY(-8px) rotate(-1deg); }
        }

        @keyframes pulse-ring {
          0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(99,102,241,0.5); }
          70%  { transform: scale(1);    box-shadow: 0 0 0 16px rgba(99,102,241,0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(99,102,241,0); }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .animate-slide-up { animation: slide-up 0.8s cubic-bezier(.22,1,.36,1) both; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-450 { animation-delay: 0.45s; }
        .delay-600 { animation-delay: 0.6s; }

        .floating { animation: float 7s ease-in-out infinite; }
        .floating-2 { animation: float 9s ease-in-out 1s infinite; }

        .badge-pulse { animation: pulse-ring 2.5s cubic-bezier(.455,.03,.515,.955) infinite; }

        .stat-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(16px);
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          border-color: rgba(99,102,241,0.3);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3), 0 0 20px rgba(99,102,241,0.1);
        }

        /* Mesh gradient background */
        .mesh-bg {
          background-color: #050917;
          background-image:
            radial-gradient(ellipse 80% 50% at 20% 20%, rgba(59,130,246,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 60% 60% at 80% 10%, rgba(168,85,247,0.1) 0%, transparent 60%),
            radial-gradient(ellipse 70% 50% at 50% 80%, rgba(6,182,212,0.07) 0%, transparent 60%);
        }

        .section-divider {
          border: none;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        }
      `}</style>

      <div className="mesh-bg min-h-screen text-white relative overflow-x-hidden">
        <ParticleCanvas />

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <main className="relative z-10 flex flex-col items-center px-6 pt-28 pb-24 text-center max-w-6xl mx-auto">

          {/* Floating decoration blobs */}
          <div className="floating absolute top-10 left-10 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }} />
          <div className="floating-2 absolute top-32 right-8 w-56 h-56 rounded-full blur-3xl opacity-15 pointer-events-none"
            style={{ background: "radial-gradient(circle, #a855f7, transparent)" }} />

          {/* Badge */}
          {mounted && (
            <div className="animate-slide-up delay-100 inline-flex items-center gap-2 px-5 py-2 mb-8 rounded-full text-sm font-semibold text-blue-300 border border-blue-500/30 bg-blue-500/10 backdrop-blur-md badge-pulse">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
              Powered by Oasis Sapphire
            </div>
          )}

          {/* Headline */}
          {mounted && (
            <h1 className="font-display animate-slide-up delay-200 text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] mb-0">
              Nền tảng Quản trị
              <br />
              <span className="gradient-text">Bảo Mật & Phi Tập Trung</span>
            </h1>
          )}

          {/* Sub */}
          {mounted && (
            <p className="animate-slide-up delay-300 max-w-2xl mt-7 text-lg text-slate-400 leading-relaxed">
              Dự án <span className="text-white font-semibold">Private Voting dApp</span> do đội ngũ{" "}
              <span className="text-white font-semibold">dAppNhaLam</span> kiến tạo.
              Giải quyết triệt để "áp lực đồng lứa" và sự thao túng kết quả trong các tổ chức DAO nhờ công nghệ bảo mật thế hệ mới.
            </p>
          )}

          {/* CTA buttons */}
          {mounted && (
            <div className="animate-slide-up delay-450 flex flex-col sm:flex-row gap-4 mt-12">
              <Link
                href="/elections"
                className="btn-primary px-9 py-4 rounded-2xl text-base font-bold text-white inline-flex items-center gap-2"
              >
                <span>Khám phá Bầu cử ngay</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="/elections/create"
                className="btn-secondary px-9 py-4 rounded-2xl text-base font-bold text-slate-200 inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>Tạo cuộc bầu cử mới</span>
              </Link>
            </div>
          )}

          {/* Stats row */}
          {mounted && (
            <div className="animate-slide-up delay-600 grid grid-cols-3 gap-6 mt-20 w-full max-w-2xl">
              {[
                { label: "Cuộc bầu cử", target: 1240, suffix: "+" },
                { label: "Cử tri", target: 48500, suffix: "+" },
                { label: "Uptime", target: 99, suffix: "%" },
              ].map((s) => (
                <div key={s.label} className="stat-card rounded-2xl p-5 flex flex-col items-center">
                  <span className="font-display text-3xl font-bold gradient-text">
                    <Counter target={s.target} suffix={s.suffix} />
                  </span>
                  <span className="text-slate-500 text-xs mt-1 font-medium uppercase tracking-widest">{s.label}</span>
                </div>
              ))}
            </div>
          )}
        </main>

        <hr className="section-divider mx-6" />

        {/* ── FEATURES ──────────────────────────────────────────────────── */}
        <section className="relative z-10 w-full px-6 py-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400 mb-3">Tính năng nổi bật</p>
              <h2 className="font-display text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                Bỏ phiếu{" "}
                <span className="gradient-text">không thể can thiệp</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard
                icon="🔒"
                title="Mã hóa đầu cuối"
                desc="Bảo vệ lựa chọn của cử tri ngay từ thời điểm khởi tạo cho đến khi được xử lý bên trong môi trường TEE (Secure Enclave)."
                accent="bg-blue-500"
                delay="0ms"
              />
              <FeatureCard
                icon="⚖️"
                title="Smart Privacy Lai"
                desc="Bằng chứng bỏ phiếu là công khai để kiểm chứng, nhưng nội dung lá phiếu ẩn danh tuyệt đối — minh bạch mà vẫn riêng tư."
                accent="bg-indigo-500"
                delay="120ms"
              />
              <FeatureCard
                icon="🛡️"
                title="Chống Thao Túng"
                desc="Ngăn chặn tình trạng front-running và chống MEV, không ai có thể theo dõi xu hướng bỏ phiếu để thay đổi cục diện."
                accent="bg-purple-500"
                delay="240ms"
              />
            </div>

            {/* Extra row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <FeatureCard
                icon="⛓️"
                title="On-chain & Verifiable"
                desc="Toàn bộ quy trình được ghi lên blockchain — bất kỳ ai cũng có thể xác minh tính toàn vẹn mà không cần tin tưởng vào bên thứ ba."
                accent="bg-cyan-500"
                delay="60ms"
              />
              <FeatureCard
                icon="🚀"
                title="Hiệu suất cao"
                desc="Kiến trúc tối ưu giúp xử lý hàng chục nghìn phiếu bầu đồng thời với độ trễ dưới giây, không tắc nghẽn mạng."
                accent="bg-violet-500"
                delay="180ms"
              />
            </div>
          </div>
        </section>

        {/* ── CTA BOTTOM ────────────────────────────────────────────────── */}
        <section className="relative z-10 px-6 pb-28">
          <div className="max-w-3xl mx-auto text-center rounded-3xl border border-white/10 bg-white/4 backdrop-blur-md p-14"
            style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.06), rgba(168,85,247,0.06))" }}>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
              Sẵn sàng bắt đầu?
            </h2>
            <p className="text-slate-400 mb-8 text-base">
              Tạo cuộc bầu cử đầu tiên của bạn chỉ trong vài phút — hoàn toàn miễn phí.
            </p>
            <Link
              href="/elections/create"
              className="btn-primary px-10 py-4 rounded-2xl text-base font-bold text-white inline-flex items-center gap-2"
            >
              Bắt đầu ngay
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}