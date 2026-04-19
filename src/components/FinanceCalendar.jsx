import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight, X, TrendingUp, TrendingDown } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday } from 'date-fns';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function FinanceCalendar({ transactions }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad so week starts on Monday
  const startPad = (getDay(monthStart) + 6) % 7; // 0=Mon
  const paddedDays = [...Array(startPad).fill(null), ...days];
  while (paddedDays.length % 7 !== 0) paddedDays.push(null);

  // Build daily totals
  const dailyData = useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      const d = new Date(t.date);
      if (d.getMonth() === month && d.getFullYear() === year) {
        const key = d.toDateString();
        if (!map[key]) map[key] = { income: 0, expenses: 0, txs: [] };
        if (t.type === 'income') map[key].income += t.amount;
        else map[key].expenses += t.amount;
        map[key].txs.push(t);
      }
    });
    return map;
  }, [transactions, month, year]);

  const monthIncome = Object.values(dailyData).reduce((s, d) => s + d.income, 0);
  const monthExpenses = Object.values(dailyData).reduce((s, d) => s + d.expenses, 0);
  const monthBalance = monthIncome - monthExpenses;

  const prevMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const selectedData = selectedDay ? dailyData[selectedDay.toDateString()] : null;

  function fmt(n) {
    if (n === 0) return null;
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`;
    return `₹${n}`;
  }

  return (
    <div>
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="w-8 h-8 rounded-xl flex items-center justify-center btn-secondary">
          <ChevronLeft size={16} />
        </button>
        <h3 className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <button onClick={nextMonth} className="w-8 h-8 rounded-xl flex items-center justify-center btn-secondary">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-muted py-1">{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {paddedDays.map((day, i) => {
          if (!day) return <div key={i} />;
          const key = day.toDateString();
          const data = dailyData[key];
          const hasIncome = data?.income > 0;
          const hasExpense = data?.expenses > 0;
          const isSelected = selectedDay && isSameDay(day, selectedDay);
          const todayDate = isToday(day);

          return (
            <motion.button key={i} whileTap={{ scale: 0.92 }}
              onClick={() => setSelectedDay(isSelected ? null : day)}
              className="flex flex-col items-center py-1.5 px-0.5 rounded-xl transition-all"
              style={{
                background: isSelected ? 'rgba(139,92,246,0.2)' : todayDate ? 'rgba(139,92,246,0.1)' : 'transparent',
                border: `1px solid ${isSelected ? 'rgba(139,92,246,0.5)' : todayDate ? 'rgba(139,92,246,0.3)' : 'transparent'}`,
                minHeight: 52,
              }}>
              <span className="text-xs font-semibold mb-0.5"
                style={{ color: todayDate ? '#a78bfa' : 'var(--text-primary)' }}>
                {format(day, 'd')}
              </span>
              {hasIncome && (
                <span className="text-[9px] font-bold leading-tight" style={{ color: '#34d399' }}>
                  +{fmt(data.income)}
                </span>
              )}
              {hasExpense && (
                <span className="text-[9px] font-bold leading-tight" style={{ color: '#fb7185' }}>
                  -{fmt(data.expenses)}
                </span>
              )}
              {(hasIncome || hasExpense) && (
                <div className="flex gap-0.5 mt-0.5">
                  {hasIncome && <div className="w-1 h-1 rounded-full bg-emerald-400" />}
                  {hasExpense && <div className="w-1 h-1 rounded-full bg-rose-400" />}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Monthly Totals */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="text-center">
          <div className="text-xs text-muted mb-0.5">Income</div>
          <div className="font-display font-bold text-sm" style={{ color: '#34d399' }}>₹{monthIncome.toLocaleString()}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted mb-0.5">Expense</div>
          <div className="font-display font-bold text-sm" style={{ color: '#fb7185' }}>₹{monthExpenses.toLocaleString()}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted mb-0.5">Balance</div>
          <div className="font-display font-bold text-sm" style={{ color: monthBalance >= 0 ? '#22d3ee' : '#fb7185' }}>
            ₹{Math.abs(monthBalance).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Day Detail Panel */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {format(selectedDay, 'EEEE, MMMM d')}
                </div>
                {selectedData ? (
                  <div className="text-xs text-muted">
                    {selectedData.income > 0 && <span className="text-emerald-400 mr-2">IN ₹{selectedData.income.toLocaleString()}</span>}
                    {selectedData.expenses > 0 && <span className="text-rose-400">OUT ₹{selectedData.expenses.toLocaleString()}</span>}
                  </div>
                ) : (
                  <div className="text-xs text-muted">No transactions</div>
                )}
              </div>
              <button onClick={() => setSelectedDay(null)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10">
                <X size={13} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
            {selectedData?.txs?.length > 0 ? (
              <div className="flex flex-col gap-2">
                {[...selectedData.txs].reverse().map(t => (
                  <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: t.type === 'income' ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)' }}>
                      {t.type === 'income'
                        ? <TrendingUp size={14} className="text-emerald-400" />
                        : <TrendingDown size={14} className="text-rose-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t.category}</div>
                      {t.description && <div className="text-xs text-muted truncate">{t.description}</div>}
                    </div>
                    <div className="font-mono font-bold text-sm" style={{ color: t.type === 'income' ? '#34d399' : '#fb7185' }}>
                      {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted text-sm">No transactions on this day</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}