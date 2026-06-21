import { cn } from '../../lib/utils';

export function Card({ children, interactive = false, className, onClick }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl bg-white shadow-sm border border-gray-100 p-6",
        interactive && "cursor-pointer hover:border-blue-300 hover:shadow-md transition-all duration-200",
        className
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, iconColor, iconBg }) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", iconBg)}>
          <Icon size={18} className={iconColor} />
        </div>
        <span className="text-sm text-gray-500 font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </Card>
  );
}
