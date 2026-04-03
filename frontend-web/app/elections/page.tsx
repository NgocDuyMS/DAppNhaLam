'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import { Election } from "@/types";
import PrivateVotingABI from "@/utils/PrivateVotingABI.json";
import { CONTRACT_ADDRESS } from "@/utils/contract";

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="skeleton-card rounded-3xl p-6 h-52 overflow-hidden relative">
      <div className="skeleton-line w-1/3 h-3 rounded-full mb-5" />
      <div className="skeleton-line w-3/4 h-5 rounded-full mb-3" />
      <div className="skeleton-line w-full h-3 rounded-full mb-2" />
      <div className="skeleton-line w-5/6 h-3 rounded-full mb-8" />
      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center">
        <div className="skeleton-line w-24 h-3 rounded-full" />
        <div className="skeleton-line w-20 h-3 rounded-full" />
      </div>
    </div>
  );
}

// ─── Election Card ────────────────────────────────────────────────────────────
function ElectionCard({ election, index }: { election: Election; index: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isActive = election.status === 'Active';

  useEffect(() => {
    const el = ref.current!;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const now = Date.now() / 1000;
  const total = election.endTime - election.startTime;
  const elapsed = now - election.startTime;
  const progress = total > 0 ? Math.min(Math.max((elapsed / total) * 100, 0), 100) : 0;

  const formatDate = (ts: number) =>
    new Date(ts * 1000).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${index * 80}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(32px) scale(0.97)",
        transition: "opacity 0.6s cubic-bezier(.22,1,.36,1), transform 0.6s cubic-bezier(.22,1,.36,1)",
      }}
      className="election-card group relative rounded-3xl p-6 flex flex-col gap-4 overflow-hidden cursor-pointer"
    >
      {/* Glow on hover */}
      <div className={`card-glow absolute inset-0 rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isActive ? 'glow-green' : 'glow-blue'}`} />

      {/* Top row */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <span className="text-slate-500 text-xs font-mono font-bold tracking-widest">#{String(election.id).padStart(3, '0')}</span>
        {isActive ? (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Đang diễn ra
          </span>
        ) : (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-slate-400 bg-slate-400/10 border border-slate-400/20">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Đã kết thúc
          </span>
        )}
      </div>

      {/* Title */}
      <div className="relative z-10">
        <h2 className="text-lg font-bold text-white leading-snug line-clamp-1 group-hover:text-blue-300 transition-colors duration-300">
          {election.title}
        </h2>
        <p className="text-slate-500 text-sm mt-1.5 line-clamp-2 leading-relaxed">
          {election.description}
        </p>
      </div>

      {/* Progress bar (only for active) */}
      {isActive && (
        <div className="relative z-10">
          <div className="flex justify-between text-xs text-slate-600 mb-1.5">
            <span>Tiến độ</span>
            <span>{Math.floor(progress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="relative z-10 flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
        <div className="text-xs text-slate-600 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {election.endTime > 0 ? formatDate(election.endTime) : "—"}
        </div>
        <Link
          href={`/elections/${election.id}`}
          className="cta-link group/link flex items-center gap-1.5 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors"
        >
          Tham gia
          <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover/link:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ElectionsListPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'ended'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum, {
          chainId: 23295,
          name: "unknown",
        });
        const contract = new ethers.Contract(CONTRACT_ADDRESS, PrivateVotingABI.abi, provider);
        let fetchedElections: Election[] = [];
        let currentId = 1;

        while (true) {
          const data = await contract.elections(currentId);
          if (!data.title || data.title === "") break;
          fetchedElections.push({
            id: Number(data.id),
            title: data.title,
            description: data.description,
            startTime: Number(data.startTime),
            endTime: Number(data.endTime),
            status: data.isRevealed ? 'Revealed' : 'Active',
            candidates: [],
            totalVotes: 0,
          });
          currentId++;
        }

        setElections(fetchedElections.reverse());
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchElections();
  }, []);

  const filtered = elections.filter((e) => {
    const matchFilter =
      filter === 'all' ||
      (filter === 'active' && e.status === 'Active') ||
      (filter === 'ended' && e.status !== 'Active');
    const matchSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const activeCount = elections.filter(e => e.status === 'Active').length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .elections-root {
          min-height: 100vh;
          background-color: #050917;
          background-image:
            radial-gradient(ellipse 70% 40% at 15% 0%, rgba(59,130,246,0.10) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 85% 20%, rgba(168,85,247,0.08) 0%, transparent 60%);
          font-family: 'DM Sans', sans-serif;
          color: #e2e8f0;
        }

        .page-title {
          font-family: 'Outfit', sans-serif;
          background: linear-gradient(135deg, #fff 30%, #93c5fd 70%, #c4b5fd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Create button */
        .btn-create {
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          background-size: 200% 200%;
          animation: gradShift 3s ease infinite;
          border-radius: 14px;
          font-weight: 700;
          font-size: 0.875rem;
          padding: 0.625rem 1.25rem;
          color: #fff;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          transition: transform 0.2s ease, box-shadow 0.3s ease;
        }
        .btn-create:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 0 30px rgba(99,102,241,0.5);
        }
        @keyframes gradShift {
          0%,100% { background-position:0% 50%; }
          50%      { background-position:100% 50%; }
        }

        /* Filter tabs */
        .filter-tab {
          padding: 0.45rem 1.1rem;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 600;
          border: 1px solid rgba(255,255,255,0.08);
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .filter-tab:hover { color: #e2e8f0; border-color: rgba(255,255,255,0.2); }
        .filter-tab.active {
          background: rgba(99,102,241,0.15);
          border-color: rgba(99,102,241,0.4);
          color: #a5b4fc;
        }

        /* Search */
        .search-input {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 0.6rem 1rem 0.6rem 2.6rem;
          color: #e2e8f0;
          font-size: 0.875rem;
          width: 220px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          outline: none;
          font-family: 'DM Sans', sans-serif;
        }
        .search-input::placeholder { color: #475569; }
        .search-input:focus {
          border-color: rgba(99,102,241,0.5);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }

        /* Cards */
        .election-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(12px);
          transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .election-card:hover {
          transform: translateY(-4px);
          border-color: rgba(99,102,241,0.25);
          box-shadow: 0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.1);
        }

        .card-glow { border-radius: 24px; }
        .glow-green { box-shadow: inset 0 0 60px rgba(52,211,153,0.06); }
        .glow-blue  { box-shadow: inset 0 0 60px rgba(99,102,241,0.06); }

        .progress-bar {
          background: linear-gradient(90deg, #3b82f6, #818cf8);
          box-shadow: 0 0 8px rgba(99,102,241,0.6);
        }

        /* Skeleton */
        .skeleton-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.05);
        }
        .skeleton-line {
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          display: block;
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Empty state */
        .empty-state {
          border: 1px dashed rgba(255,255,255,0.1);
          border-radius: 24px;
          background: rgba(255,255,255,0.02);
        }

        /* Stats badge */
        .stats-badge {
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 999px;
          padding: 0.3rem 0.8rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: #a5b4fc;
        }
      `}</style>

      <div className="elections-root px-6 py-14">
        <div className="max-w-5xl mx-auto">

          {/* ── Header ─────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400 mb-2">On-chain · Oasis Sapphire</p>
              <h1 className="page-title text-3xl md:text-4xl font-extrabold leading-tight">
                Danh sách Bầu cử
              </h1>
              <div className="flex items-center gap-3 mt-3">
                {!isLoading && (
                  <>
                    <span className="stats-badge">{elections.length} tổng</span>
                    {activeCount > 0 && (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        {activeCount} đang diễn ra
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            <Link href="/elections/create" className="btn-create self-start sm:self-auto">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Tạo cuộc bầu cử
            </Link>
          </div>

          {/* ── Toolbar ────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            {/* Filter tabs */}
            <div className="flex gap-2">
              {(['all', 'active', 'ended'] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={`filter-tab ${filter === f ? 'active' : ''}`}>
                  {f === 'all' ? 'Tất cả' : f === 'active' ? '🟢 Đang diễn ra' : '⚫ Đã kết thúc'}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {/* ── Content ────────────────────────────────────────────── */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state py-24 text-center">
              <div className="text-4xl mb-4">🗳️</div>
              <p className="text-slate-400 font-medium text-base mb-1">
                {search ? `Không tìm thấy kết quả cho "${search}"` : "Chưa có cuộc bầu cử nào"}
              </p>
              <p className="text-slate-600 text-sm">
                {search ? "Thử từ khóa khác nhé" : "Hãy là người đầu tiên tạo!"}
              </p>
              {!search && (
                <Link href="/elections/create" className="btn-create inline-flex mt-6">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Tạo ngay
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filtered.map((election, i) => (
                <ElectionCard key={election.id} election={election} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}