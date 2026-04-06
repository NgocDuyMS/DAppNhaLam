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

// ─── Step dot ────────────────────────────────────────────────────────────────
function StepDot({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <div className={`step-dot ${active ? 'step-active' : done ? 'step-done' : 'step-idle'}`}>
      {done ? (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      ) : n}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CreateElectionPage() {
  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<ElectionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", description: "", startTime: "", endTime: "", candidates: [{ name: "" }, { name: "" }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "candidates" });

  const [modalState, setModalState] = useState({
    isOpen: false, status: 'idle' as TxStatus, message: '', txHash: '',
  });

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
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');

        * { font-family: 'Be Vietnam Pro', sans-serif; }

        .create-root {
          min-height: 100vh;
          background: #f8fafc;
          color: #1e293b;
        }

        .create-header-strip {
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
          margin-bottom: 0.75rem;
        }
        .chain-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 5px rgba(16,185,129,0.6);
          animation: cpulse 2s ease-in-out infinite;
        }
        @keyframes cpulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        /* Steps */
        .step-dot {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem; font-weight: 700; flex-shrink: 0;
          transition: all 0.25s ease;
        }
        .step-idle   { background:#f1f5f9; border:1.5px solid #e2e8f0; color:#94a3b8; }
        .step-active { background:#eff6ff; border:1.5px solid #93c5fd; color:#2563eb; box-shadow:0 0 0 4px rgba(37,99,235,0.08); }
        .step-done   { background:#f0fdf4; border:1.5px solid #86efac; color:#16a34a; }
        .step-line   { flex:1; height:1px; background:#e2e8f0; }

        /* Form card */
        .form-card {
          background: #fff;
          border: 1px solid #f1f5f9;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 1px 4px rgba(15,23,42,0.04);
        }

        .form-section {
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 14px;
          padding: 1.25rem;
        }

        .section-label {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #2563eb;
          margin-bottom: 1rem;
          display: flex; align-items: center; gap: 0.4rem;
        }

        /* Inputs */
        .field-label {
          display: block;
          font-size: 0.8rem; font-weight: 600; color: #475569;
          margin-bottom: 0.4rem;
        }
        .field-input {
          width: 100%;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 0.65rem 0.9rem;
          color: #1e293b; font-size: 0.875rem;
          outline: none; color-scheme: light;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .field-input::placeholder { color: #cbd5e1; }
        .field-input:focus {
          border-color: #93c5fd;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }
        .field-input.has-error {
          border-color: #fca5a5;
          box-shadow: 0 0 0 3px rgba(239,68,68,0.08);
        }
        textarea.field-input { resize:none; height:90px; }

        .field-error {
          margin-top: 0.35rem; font-size: 0.775rem; color: #ef4444;
          display: flex; align-items: center; gap: 0.3rem;
        }

        /* Candidates */
        .candidate-row {
          display: flex; align-items: center; gap: 0.6rem;
          animation: fadeUp 0.25s ease both;
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

        .candidate-index {
          width:26px; height:26px; min-width:26px; border-radius:50%;
          background:#eff6ff; border:1px solid #dbeafe;
          color:#3b82f6; font-size:0.72rem; font-weight:700;
          display:flex; align-items:center; justify-content:center;
        }

        .btn-remove {
          width:34px; height:34px; min-width:34px; border-radius:8px;
          background:#fff5f5; border:1px solid #fecaca; color:#ef4444;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; transition:background 0.15s, transform 0.15s;
        }
        .btn-remove:hover { background:#fee2e2; transform:scale(1.06); }

        .btn-add-candidate {
          display:inline-flex; align-items:center; gap:0.35rem;
          padding:0.4rem 0.85rem; border-radius:8px;
          background:#fff; border:1.5px dashed #bfdbfe;
          color:#3b82f6; font-size:0.8rem; font-weight:600;
          cursor:pointer; transition:background 0.15s, border-color 0.15s;
        }
        .btn-add-candidate:hover { background:#eff6ff; border-color:#93c5fd; }

        .count-badge {
          padding:0.15rem 0.55rem; border-radius:999px;
          background:#eff6ff; border:1px solid #dbeafe;
          color:#3b82f6; font-size:0.72rem; font-weight:700;
        }

        .form-divider { border:none; height:1px; background:#f1f5f9; margin:0.25rem 0; }

        /* Buttons */
        .btn-submit {
          display:inline-flex; align-items:center; gap:0.45rem;
          padding:0.7rem 1.6rem; border-radius:10px;
          background:#2563eb; color:#fff;
          font-size:0.875rem; font-weight:700; cursor:pointer;
          transition:background 0.15s, box-shadow 0.15s, transform 0.15s;
        }
        .btn-submit:hover {
          background:#1d4ed8;
          box-shadow:0 4px 14px rgba(37,99,235,0.3);
          transform:translateY(-1px);
        }

        .btn-cancel {
          display:inline-flex; align-items:center; gap:0.3rem;
          padding:0.7rem 1.2rem; border-radius:10px;
          background:transparent; border:1px solid #e2e8f0;
          color:#64748b; font-size:0.875rem; font-weight:600;
          transition:border-color 0.15s, color 0.15s, background 0.15s;
        }
        .btn-cancel:hover { border-color:#cbd5e1; color:#475569; background:#f8fafc; }

        .info-note {
          display:flex; align-items:flex-start; gap:0.6rem;
          padding:0.85rem 1rem; border-radius:12px;
          background:#f0f9ff; border:1px solid #bae6fd;
        }
      `}</style>

      <div className="create-root">

        {/* Header */}
        <div className="create-header-strip">
          <div className="max-w-2xl mx-auto">
            <div className="chain-badge">
              <span className="chain-dot" />
              Oasis Sapphire · Testnet
            </div>
            <h1 className="page-title">Tạo Cuộc Bầu Cử Mới</h1>
            <p className="text-sm text-slate-400 mt-1">Dữ liệu được mã hóa và ghi lên blockchain ngay lập tức.</p>
          </div>
        </div>

        {/* Body */}
        <div className="max-w-2xl mx-auto px-6 py-8">

          {/* Steps */}
          <div className="flex items-center gap-2 mb-6">
            <StepDot n={1} active={!step1Done} done={step1Done} />
            <div className="step-line" />
            <StepDot n={2} active={step1Done && !step2Done} done={step2Done} />
            <div className="step-line" />
            <StepDot n={3} active={step1Done && step2Done} done={false} />
          </div>

          {/* Form card */}
          <div className="form-card">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* Section 1 */}
              <div className="form-section">
                <div className="section-label">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" d="M16.862 4.487 18.35 2.999a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/>
                  </svg>
                  Thông tin cơ bản
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="field-label">Tiêu đề bầu cử</label>
                    <input {...register("title")} placeholder="VD: Bầu chọn Ban điều hành Q3 2025" className={`field-input ${errors.title ? 'has-error' : ''}`} />
                    {errors.title && <p className="field-error"><svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg>{errors.title.message}</p>}
                  </div>
                  <div>
                    <label className="field-label">Mô tả chi tiết</label>
                    <textarea {...register("description")} placeholder="Mô tả mục tiêu, quy trình và các thông tin quan trọng..." className={`field-input ${errors.description ? 'has-error' : ''}`} />
                    {errors.description && <p className="field-error"><svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg>{errors.description.message}</p>}
                  </div>
                </div>
              </div>

              {/* Section 2 */}
              <div className="form-section">
                <div className="section-label">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 6v6l4 2"/>
                  </svg>
                  Thời gian diễn ra
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="field-label">Bắt đầu</label>
                    <input type="datetime-local" {...register("startTime")} className={`field-input ${errors.startTime ? 'has-error' : ''}`} />
                    {errors.startTime && <p className="field-error">{errors.startTime.message}</p>}
                  </div>
                  <div>
                    <label className="field-label">Kết thúc</label>
                    <input type="datetime-local" {...register("endTime")} className={`field-input ${errors.endTime ? 'has-error' : ''}`} />
                    {errors.endTime && <p className="field-error">{errors.endTime.message}</p>}
                  </div>
                </div>
              </div>

              {/* Section 3 */}
              <div className="form-section">
                <div className="flex items-center justify-between mb-4">
                  <div className="section-label" style={{ marginBottom: 0 }}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>
                    </svg>
                    Ứng viên
                    <span className="count-badge">{fields.length}</span>
                  </div>
                  <button type="button" onClick={() => append({ name: "" })} className="btn-add-candidate">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" d="M12 4.5v15m7.5-7.5h-15"/>
                    </svg>
                    Thêm ứng viên
                  </button>
                </div>

                {errors.candidates?.root && <p className="field-error mb-3">{errors.candidates.root.message}</p>}

                <div className="space-y-2.5">
                  {fields.map((field, index) => (
                    <div key={field.id}>
                      <div className="candidate-row">
                        <span className="candidate-index">{index + 1}</span>
                        <input
                          {...register(`candidates.${index}.name` as const)}
                          placeholder={`Tên ứng viên ${index + 1}`}
                          className={`field-input ${errors.candidates?.[index]?.name ? 'has-error' : ''}`}
                          style={{ marginBottom: 0 }}
                        />
                        <button type="button" onClick={() => remove(index)} className="btn-remove" title="Xóa">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" d="M6 18 18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                      {errors.candidates?.[index]?.name && (
                        <p className="field-error mt-1 ml-9">{errors.candidates[index]?.name?.message}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <hr className="form-divider" />

              {/* Footer */}
              <div className="flex items-center justify-between pt-1">
                <Link href="/elections" className="btn-cancel">← Hủy bỏ</Link>
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
          <div className="info-note mt-4">
            <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
            </svg>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dữ liệu bầu cử được mã hóa hoàn toàn bởi <span className="font-semibold text-slate-600">Oasis Sapphire TEE</span> trước khi ghi lên blockchain. Không ai — kể cả người tạo — có thể xem kết quả trước khi công bố.
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