'use client';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'white' | 'blue';
}

export default function Spinner({ size = 'md', color = 'white' }: SpinnerProps) {
  // Tùy chỉnh kích thước bằng Tailwind
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-4',
  };

  // Tùy chỉnh màu sắc
  const colorClasses = {
    white: 'border-white border-t-transparent',
    blue: 'border-blue-600 border-t-transparent',
  };

  return (
    <div className={`inline-block animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]}`} />
  );
}