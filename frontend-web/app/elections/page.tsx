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
    <div className="sk-card rounded-2xl p-5 h-48 overflow-hidden relative">
      <div className="sk-line w-1/4 h-3 rounded-full mb-4" />
      <div className="sk-line w-3/4 h-5 rounded-full mb-3" />
      <div className="sk-line w-full h-3 rounded-full mb-2" />
      <div className="sk-line w-5/6 h-3 rounded-full mb-6" />
      <div className="absolute bottom-5 left-5 right-5 flex justify-between">
        <div className="sk-line w-20 h-3 rounded-full" />
        <div className="sk-line w-16 h-3 rounded-full" />
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
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(ref.current!);
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
        transitionDelay: `${index * 70}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
      className="e-card group relative bg-white rounded-2xl p-5 flex flex-col gap-3 border border-slate-100 cursor-pointer"
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <span className="text-slate-300 text-xs font-mono font-bold tracking-widest">
          #{String(election.id).padStart(3, '0')}
        </span>
        {isActive ? (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Đang diễn ra
          </span>
        ) : (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-100">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            Đã kết thúc
          </span>
        )}
      </div>

      {/* Title + desc */}
      <div>
        <h2 className="text-base font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors duration-200">
          {election.title}
        </h2>
        <p className="text-slate-400 text-sm mt-1 line-clamp-2 leading-relaxed">
          {election.description}
        </p>
      </div>

      {/* Progress */}
      {isActive && (
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Tiến độ</span>
            <span className="font-semibold text-blue-500">{Math.floor(progress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="e-progress h-full rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-auto">
        <div className="text-xs text-slate-300 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {election.endTime > 0 ? formatDate(election.endTime) : "—"}
        </div>
        <Link
          href={`/elections/${election.id}`}
          className="flex items-center gap-1 text-sm font-semibold text-blue-500 hover:text-blue-600 transition-colors"
        >
          Tham gia
          <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
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
        const provider = new ethers.JsonRpcProvider("https://testnet.sapphire.oasis.dev", 23295, {
          staticNetwork: true,
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
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');

        * { font-family: 'Be Vietnam Pro', sans-serif; }

        .page-root {
          min-height: 100vh;
          background: #f8fafc;
        }

        /* Header strip */
        .page-header-strip {
          background: #fff;
          border-bottom: 1px solid #f1f5f9;
          padding: 2rem 1.5rem 1.5rem;
        }

        .page-title {
          font-size: 1.6rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.02em;
        }

        /* Create button */
        .btn-create {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.55rem 1.1rem;
          border-radius: 10px;
          background: #2563eb;
          color: #fff;
          font-size: 0.85rem;
          font-weight: 600;
          transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
          white-space: nowrap;
        }
        .btn-create:hover {
          background: #1d4ed8;
          box-shadow: 0 4px 12px rgba(37,99,235,0.25);
          transform: translateY(-1px);
        }

        /* Filter tabs */
        .filter-tab {
          padding: 0.4rem 1rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          border: 1px solid #e2e8f0;
          background: #fff;
          color: #64748b;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .filter-tab:hover { border-color: #cbd5e1; color: #334155; }
        .filter-tab.active {
          background: #eff6ff;
          border-color: #bfdbfe;
          color: #2563eb;
        }

        /* Search */
        .search-wrap { position: relative; }
        .search-icon {
          position: absolute; left: 10px; top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }
        .search-input {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 0.5rem 0.9rem 0.5rem 2.2rem;
          color: #1e293b;
          font-size: 0.85rem;
          width: 210px;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .search-input::placeholder { color: #cbd5e1; }
        .search-input:focus {
          border-color: #93c5fd;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }

        /* Election card */
        .e-card {
          transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
        }
        .e-card:hover {
          box-shadow: 0 8px 24px rgba(15,23,42,0.08);
          transform: translateY(-2px);
          border-color: #e2e8f0;
        }

        /* Progress bar */
        .e-progress {
          background: linear-gradient(90deg, #3b82f6, #60a5fa);
        }

        /* Skeleton */
        .sk-card {
          background: #fff;
          border: 1px solid #f1f5f9;
        }
        .sk-line {
          display: block;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Stats pill */
        .stats-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.2rem 0.7rem;
          border-radius: 999px;
          background: #eff6ff;
          border: 1px solid #dbeafe;
          font-size: 0.72rem;
          font-weight: 700;
          color: #3b82f6;
        }

        /* Empty state */
        .empty-box {
          border: 1.5px dashed #e2e8f0;
          border-radius: 20px;
          background: #fff;
        }

        /* Chain badge */
        .chain-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.25rem 0.7rem;
          border-radius: 999px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          font-size: 0.7rem;
          font-weight: 700;
          color: #64748b;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .chain-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 5px rgba(16,185,129,0.6);
          animation: cpulse 2s ease-in-out infinite;
        }
        @keyframes cpulse {
          0%,100% { opacity:1; } 50% { opacity:0.4; }
        }
      `}</style>

      <div className="page-root">

        {/* ── Page header strip ──────────────────────────────────── */}
        <div className="page-header-strip">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                {/* Chain indicator */}
                <div className="chain-badge mb-3">
                  <span className="chain-dot" />
                  Oasis Sapphire · Testnet
                </div>

                <h1 className="page-title">Danh sách Bầu cử</h1>

                {!isLoading && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="stats-pill">{elections.length} cuộc bầu cử</span>
                    {activeCount > 0 && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        {activeCount} đang diễn ra
                      </span>
                    )}
                  </div>
                )}
              </div>

              <Link href="/elections/create" className="btn-create self-start sm:self-auto">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Tạo cuộc bầu cử
              </Link>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-5">
              <div className="flex gap-2">
                {(['all', 'active', 'ended'] as const).map((f) => (
                  <button key={f} onClick={() => setFilter(f)} className={`filter-tab ${filter === f ? 'active' : ''}`}>
                    {f === 'all' ? 'Tất cả' : f === 'active' ? '● Đang diễn ra' : '○ Đã kết thúc'}
                  </button>
                ))}
              </div>

              <div className="search-wrap">
                <svg className="search-icon w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
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
          </div>
        </div>

        {/* ── Content ───────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-6 py-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-box py-24 text-center">
              <div className="text-4xl mb-3">🗳️</div>
              <p className="text-slate-500 font-semibold text-base mb-1">
                {search ? `Không có kết quả cho "${search}"` : "Chưa có cuộc bầu cử nào"}
              </p>
              <p className="text-slate-400 text-sm">
                {search ? "Thử từ khóa khác nhé" : "Hãy là người đầu tiên tạo!"}
              </p>
              {!search && (
                <Link href="/elections/create" className="btn-create inline-flex mt-5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Tạo ngay
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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