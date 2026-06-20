const recharts = require('recharts');
const imports = [
  'LineChart', 'Line', 'XAxis', 'YAxis', 'CartesianGrid', 'Tooltip', 'ResponsiveContainer',
  'PieChart', 'Pie', 'Cell'
];

let missing = [];
for (const item of imports) {
  if (!recharts[item]) {
    missing.push(item);
  }
}
console.log("Missing recharts imports:", missing);
