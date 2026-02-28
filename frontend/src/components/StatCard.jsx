const COLOR_MAP = {
  indigo:  { bg: 'bg-indigo-50 dark:bg-indigo-900/30',  text: 'text-indigo-700 dark:text-indigo-300',  num: 'text-indigo-900 dark:text-indigo-200'  },
  blue:    { bg: 'bg-blue-50 dark:bg-blue-900/30',    text: 'text-blue-700 dark:text-blue-300',    num: 'text-blue-900 dark:text-blue-200'    },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', num: 'text-emerald-900 dark:text-emerald-200' },
  amber:   { bg: 'bg-amber-50 dark:bg-amber-900/30',   text: 'text-amber-700 dark:text-amber-300',   num: 'text-amber-900 dark:text-amber-200'   },
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
