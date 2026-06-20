const lucide = require('lucide-react');
const imports = [
  'BookOpen', 'Award', 'Wrench', 'Plane', 'ShieldCheck', 'Clock',
  'CheckCircle2', 'AlertTriangle', 'Building2', 'Zap', 'IndianRupee',
  'Filter', 'Calendar', 'Search', 'Bell', 'Moon', 'ChevronDown',
  'LayoutDashboard', 'FileText', 'CheckCircle', 'XCircle',
  'BarChart3', 'PieChart', 'FileSpreadsheet', 'Users', 'Settings',
  'Activity', 'ExternalLink', 'MoreVertical', 'LogOut', 'ArrowUpRight', 'Eye', 'Sparkles'
];

let missing = [];
for (const item of imports) {
  if (!lucide[item]) {
    missing.push(item);
  }
}
console.log("Missing imports:", missing);
