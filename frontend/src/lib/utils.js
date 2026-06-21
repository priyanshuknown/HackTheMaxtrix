import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getCategoryLabel(category) {
  const labels = {
    exam_fee: 'Exam Fee',
    certification_fee: 'Certification',
    device_repair: 'Device Repair',
    interview_travel: 'Interview Travel',
  };
  return labels[category] || category;
}

export function getStatusBadgeClass(status) {
  const statusMap = {
    submitted: 'bg-amber-50 text-amber-700 border border-amber-200',
    verified: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    matched: 'bg-blue-50 text-blue-700 border border-blue-200',
    approved: 'bg-violet-50 text-violet-700 border border-violet-200',
    disbursed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    rejected: 'bg-red-50 text-red-700 border border-red-200',
  };
  return statusMap[status] || 'bg-gray-50 text-gray-700 border border-gray-200';
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
