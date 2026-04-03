'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface ResultsChartProps {
  data: { name: string; votes: number }[];
}

// Bảng màu gradient cho các ứng viên
const COLORS = ['#2563eb', '#4f46e5', '#7c3aed', '#db2777', '#ea580c'];

export default function ResultsChart({ data }: ResultsChartProps) {
  // Tính tổng số phiếu
  const total = data.reduce((sum, item) => sum + item.votes, 0);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mt-8">
      {/* Biểu đồ Cột (Bar Chart) */}
      <div className="p-6 bg-white border rounded-2xl shadow-sm h-100">
        <h4 className="mb-6 text-sm font-bold text-gray-500 uppercase tracking-wider">Phân bổ số phiếu</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
            <Tooltip 
              cursor={{fill: '#f9fafb'}}
              contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
            />
            <Bar dataKey="votes" radius={[6, 6, 0, 0]} barSize={40}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Biểu đồ Tròn (Pie Chart) */}
      <div className="p-6 bg-white border rounded-2xl shadow-sm h-100">
        <h4 className="mb-6 text-sm font-bold text-gray-500 uppercase tracking-wider">Tỷ lệ phần trăm (%)</h4>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="votes"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}