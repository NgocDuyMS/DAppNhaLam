'use client';

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { ethers } from "ethers";
import { getVotingContract } from "@/utils/contract";
import TransactionModal, { TxStatus } from "@/components/TransactionModal";

// ─── Schema ──────────────────────────────────────────────────────────────────
const formSchema = z.object({
  title: z.string().min(5, "Tiêu đề phải có ít nhất 5 ký tự"),
  description: z.string().min(10, "Mô tả quá ngắn, hãy viết rõ hơn"),
  startTime: z.string().min(1, "Vui lòng chọn thời gian bắt đầu"),
  endTime: z.string().min(1, "Vui lòng chọn thời gian kết thúc"),
  candidates: z.array(z.object({ name: z.string().min(1, "Không được để trống") })).min(2, "Cần ít nhất 2 ứng viên"),
}).refine((data) => new Date(data.endTime) > new Date(data.startTime), {
  message: "Thời gian kết thúc phải sau thời gian bắt đầu",
  path: ["endTime"],
});

type ElectionFormValues = z.infer<typeof formSchema>;

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepDot({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`step-dot ${active ? 'step-active' : done ? 'step-done' : 'step-idle'}`}>
        {done ? (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        ) : n}
      </div>
    </div>
  );
}

export default function CreateElectionPage() {
  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<ElectionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", description: "", startTime: "", endTime: "", candidates: [{ name: "" }, { name: "" }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "candidates" });

  const [modalState, setModalState] = useState({
    isOpen: false, status: 'idle' as TxStatus, message: '', txHash: '',
  });

  // derive active step for visual indicator
  const watched = watch(["title", "description", "startTime", "endTime"]);
  const step1Done = watched[0].length >= 5 && watched[1].length >= 10;
  const step2Done = watched[2].length > 0 && watched[3].length > 0;

  const onSubmit = async (data: ElectionFormValues) => {
    try {
      setModalState({ isOpen: true, status: 'waiting_wallet', message: 'Vui lòng xác nhận giao dịch trên MetaMask của bạn...', txHash: '' });
      if (!window.ethereum) throw new Error("Không tìm thấy ví MetaMask!");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = await getVotingContract(provider, false);
      const startTimestamp = Math.floor(new Date(data.startTime).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(data.endTime).getTime() / 1000);
      const candidateNames = data.candidates.map(c => c.name);
      const tx = await contract.createElection(data.title, data.description, startTimestamp, endTimestamp, candidateNames);
      setModalState(prev => ({ ...prev, status: 'mining', message: 'Đang mã hóa và gửi dữ liệu lên Oasis Sapphire...', txHash: tx.hash }));
      await tx.wait();
      setModalState(prev => ({ ...prev, status: 'success', message: 'Cuộc bầu cử đã được khởi tạo an toàn trên chuỗi!' }));
    } catch (error: any) {
      const rejected = error.code === 'ACTION_REJECTED' || error.code === 4001;
      setModalState({ isOpen: true, status: 'error', message: rejected ? 'Bạn đã từ chối ký giao dịch.' : 'Đã xảy ra lỗi khi tương tác với Smart Contract.', txHash: '' });
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .create-root {
          min-height: 100vh;
          background-color: #050917;
          background-image:
            radial-gradient(ellipse 60% 50% at 10% 0%,  rgba(59,130,246,0.10) 0%, transparent 65%),
            radial-gradient(ellipse 50% 40% at 90% 15%, rgba(168,85,247,0.08) 0%, transparent 60%);
          font-family: 'DM Sans', sans-serif;
          color: #e2e8f0;
          padding: 4rem 1.5rem 6rem;
        }

        .page-title {
          font-family: 'Outfit', sans-serif;
          background: linear-gradient(135deg, #fff 30%, #93c5fd 70%, #c4b5fd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Card */
        .form-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(16px);
          border-radius: 28px;
          padding: 2.5rem;
        }

        /* Section block */
        .form-section {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 1.5rem;
        }

        .section-label {
          font-family: 'Outfit', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #6366f1;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* Inputs */
        .field-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: #94a3b8;
          margin-bottom: 0.45rem;
          letter-spacing: 0.02em;
        }

        .field-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 14px;
          padding: 0.7rem 1rem;
          color: #e2e8f0;
          font-size: 0.9rem;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
          outline: none;
          color-scheme: dark;
        }
        .field-input::placeholder { color: #334155; }
        .field-input:focus {
          border-color: rgba(99,102,241,0.5);
          background: rgba(99,102,241,0.04);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        .field-input.error {
          border-color: rgba(239,68,68,0.5);
          box-shadow: 0 0 0 3px rgba(239,68,68,0.08);
        }

        textarea.field-input { resize: none; height: 96px; }

        .field-error {
          margin-top: 0.4rem;
          font-size: 0.78rem;
          color: #f87171;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        /* Candidate row */
        .candidate-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          animation: fadeSlideIn 0.3s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes fadeSlideIn {
          from { opacity:0; transform: translateY(12px); }
          to   { opacity:1; transform: translateY(0); }
        }

        .candidate-index {
          width: 28px;
          height: 28px;
          min-width: 28px;
          border-radius: 50%;
          background: rgba(99,102,241,0.15);
          border: 1px solid rgba(99,102,241,0.25);
          color: #818cf8;
          font-size: 0.72rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Outfit', sans-serif;
        }

        .btn-remove {
          width: 36px;
          height: 36px;
          min-width: 36px;
          border-radius: 10px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.15);
          color: #f87171;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
          cursor: pointer;
        }
        .btn-remove:hover {
          background: rgba(239,68,68,0.15);
          border-color: rgba(239,68,68,0.35);
          transform: scale(1.08);
        }

        .btn-add-candidate {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 1rem;
          border-radius: 12px;
          background: rgba(99,102,241,0.08);
          border: 1px dashed rgba(99,102,241,0.3);
          color: #818cf8;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-add-candidate:hover {
          background: rgba(99,102,241,0.14);
          border-color: rgba(99,102,241,0.5);
          color: #a5b4fc;
        }

        /* Step dots */
        .step-dot {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem; font-weight: 700;
          transition: all 0.3s ease;
          font-family: 'Outfit', sans-serif;
        }
        .step-idle  { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #475569; }
        .step-active{ background: rgba(99,102,241,0.2); border: 1px solid rgba(99,102,241,0.5); color: #a5b4fc; box-shadow: 0 0 16px rgba(99,102,241,0.3); }
        .step-done  { background: rgba(52,211,153,0.15); border: 1px solid rgba(52,211,153,0.4); color: #34d399; }

        .step-line {
          flex: 1; height: 1px;
          background: linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04));
        }

        /* Buttons */
        .btn-submit {
          background: linear-gradient(135deg, #3b82f6, #6366f1, #a855f7);
          background-size: 200% 200%;
          animation: gradShift 3s ease infinite;
          border-radius: 16px;
          padding: 0.85rem 2rem;
          font-weight: 700;
          font-size: 0.95rem;
          color: #fff;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: transform 0.2s ease, box-shadow 0.3s ease;
          font-family: 'Outfit', sans-serif;
          letter-spacing: 0.01em;
          cursor: pointer;
        }
        .btn-submit:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 0 40px rgba(99,102,241,0.5), 0 16px 32px rgba(0,0,0,0.3);
        }
        @keyframes gradShift {
          0%,100% { background-position:0% 50%; }
          50%      { background-position:100% 50%; }
        }

        .btn-cancel {
          padding: 0.85rem 1.5rem;
          border-radius: 16px;
          font-weight: 600;
          font-size: 0.875rem;
          color: #64748b;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.07);
          transition: color 0.2s, border-color 0.2s, background 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-cancel:hover {
          color: #94a3b8;
          border-color: rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.03);
        }

        .divider {
          border: none;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
          margin: 1.5rem 0;
        }
      `}</style>

      <div className="create-root">
        <div className="max-w-2xl mx-auto">

          {/* ── Page header ───────────────────────────────────────── */}
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400 mb-2">On-chain · Oasis Sapphire</p>
            <h1 className="page-title text-3xl md:text-4xl font-extrabold leading-tight">
              Tạo Cuộc Bầu Cử Mới
            </h1>
            <p className="text-slate-500 text-sm mt-2">Dữ liệu được mã hóa và ghi lên blockchain ngay lập tức.</p>
          </div>

          {/* ── Step indicator ────────────────────────────────────── */}
          <div className="flex items-center gap-3 mb-8 px-1">
            <StepDot n={1} active={!step1Done} done={step1Done} />
            <div className="step-line" />
            <StepDot n={2} active={step1Done && !step2Done} done={step2Done} />
            <div className="step-line" />
            <StepDot n={3} active={step1Done && step2Done} done={false} />
          </div>

          {/* ── Form card ─────────────────────────────────────────── */}
          <div className="form-card">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

              {/* Section 1 — Basic info */}
              <div className="form-section">
                <div className="section-label">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Thông tin cơ bản
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="field-label">Tiêu đề bầu cử</label>
                    <input
                      {...register("title")}
                      placeholder="VD: Bầu chọn Ban điều hành Q3 2025"
                      className={`field-input ${errors.title ? 'error' : ''}`}
                    />
                    {errors.title && (
                      <p className="field-error">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg>
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="field-label">Mô tả chi tiết</label>
                    <textarea
                      {...register("description")}
                      placeholder="Mô tả mục tiêu, quy trình và các thông tin quan trọng của cuộc bầu cử..."
                      className={`field-input ${errors.description ? 'error' : ''}`}
                    />
                    {errors.description && (
                      <p className="field-error">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg>
                        {errors.description.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2 — Time */}
              <div className="form-section">
                <div className="section-label">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 6v6l4 2"/>
                  </svg>
                  Thời gian diễn ra
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="field-label">Bắt đầu</label>
                    <input type="datetime-local" {...register("startTime")} className={`field-input ${errors.startTime ? 'error' : ''}`} />
                    {errors.startTime && <p className="field-error">{errors.startTime.message}</p>}
                  </div>
                  <div>
                    <label className="field-label">Kết thúc</label>
                    <input type="datetime-local" {...register("endTime")} className={`field-input ${errors.endTime ? 'error' : ''}`} />
                    {errors.endTime && <p className="field-error">{errors.endTime.message}</p>}
                  </div>
                </div>
              </div>

              {/* Section 3 — Candidates */}
              <div className="form-section">
                <div className="flex items-center justify-between mb-4">
                  <div className="section-label" style={{ marginBottom: 0 }}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    Ứng viên
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold" style={{ letterSpacing: 0 }}>
                      {fields.length}
                    </span>
                  </div>
                  <button type="button" onClick={() => append({ name: "" })} className="btn-add-candidate">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" d="M12 4.5v15m7.5-7.5h-15"/>
                    </svg>
                    Thêm ứng viên
                  </button>
                </div>

                {errors.candidates?.root && (
                  <p className="field-error mb-3">{errors.candidates.root.message}</p>
                )}

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id}>
                      <div className="candidate-row">
                        <span className="candidate-index">{index + 1}</span>
                        <input
                          {...register(`candidates.${index}.name` as const)}
                          placeholder={`Tên ứng viên ${index + 1}`}
                          className={`field-input ${errors.candidates?.[index]?.name ? 'error' : ''}`}
                          style={{ marginBottom: 0 }}
                        />
                        <button type="button" onClick={() => remove(index)} className="btn-remove" title="Xóa">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" d="M6 18 18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                      {errors.candidates?.[index]?.name && (
                        <p className="field-error mt-1 ml-10">{errors.candidates[index]?.name?.message}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <hr className="divider" />

              {/* Footer buttons */}
              <div className="flex items-center justify-between">
                <Link href="/elections" className="btn-cancel">
                  ← Hủy bỏ
                </Link>
                <button type="submit" className="btn-submit">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/>
                  </svg>
                  Khởi tạo Bầu cử
                </button>
              </div>

            </form>
          </div>

          {/* Info note */}
          <div className="mt-5 flex items-start gap-2.5 px-4 py-3 rounded-2xl border border-white/5 bg-white/2">
            <svg className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
            </svg>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dữ liệu bầu cử được mã hóa hoàn toàn bởi <span className="text-slate-400 font-semibold">Oasis Sapphire TEE</span> trước khi ghi lên blockchain. Không ai — kể cả người tạo — có thể xem kết quả trước khi công bố.
            </p>
          </div>

        </div>
      </div>

      <TransactionModal
        isOpen={modalState.isOpen}
        status={modalState.status}
        message={modalState.message}
        txHash={modalState.txHash}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
      />
    </>
  );
}