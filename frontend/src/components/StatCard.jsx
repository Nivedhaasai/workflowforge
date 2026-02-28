const COLOR_MAP = {
  indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-700',  num: 'text-indigo-900'  },
  blue:    { bg: 'bg-blue-50',    text: 'text-blue-700',    num: 'text-blue-900'    },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', num: 'text-emerald-900' },
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-700',   num: 'text-amber-900'   },
};

export default function StatCard({ icon, label, value, color = 'indigo' }) {
  const c = COLOR_MAP[color] || COLOR_MAP.indigo;
  return (
    <div className={`${c.bg} rounded-2xl p-6 border border-opacity-20`}>
      <div className="text-2xl mb-3">{icon}</div>
      <div className={`text-3xl font-bold ${c.num} mb-1`}>{value}</div>
      <div className={`text-sm font-medium ${c.text}`}>{label}</div>
    </div>
  );
}
