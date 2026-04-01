import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, TrendingUp, TrendingDown, PiggyBank, AlertTriangle, Settings, X } from 'lucide-react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { format } from 'date-fns';

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Bills', 'Education', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];
const DONUT_COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#f43f5e', '#3b82f6', '#ec4899', '#6366f1'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Finance() {
  const { transactions, addTransaction, deleteTransaction, budgets, updateBudget } = useApp();
  const [tab, setTab] = useState('overview');
  const [form, setForm] = useState({ type: 'expense', amount: '', category: 'Food', description: '' });
  const [expandedCard, setExpandedCard] = useState(null); // 'income' | 'expenses' | 'savings'
  const [tapCount, setTapCount] = useState({});

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const prevMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const prevMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

  const monthTx = transactions.filter(t => new Date(t.date).getMonth() === thisMonth && new Date(t.date).getFullYear() === thisYear);
  const prevMonthTx = transactions.filter(t => new Date(t.date).getMonth() === prevMonth && new Date(t.date).getFullYear() === prevMonthYear);

  const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const savings = income - expenses;

  const prevIncome = prevMonthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const prevExpenses = prevMonthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const prevSavings = prevIncome - prevExpenses;

  const expenseByCategory = EXPENSE_CATEGORIES.reduce((acc, cat) => {
    const total = monthTx.filter(t => t.type === 'expense' && t.category === cat).reduce((s, t) => s + t.amount, 0);
    if (total > 0) acc[cat] = total;
    return acc;
  }, {});

  const budgetWarnings = EXPENSE_CATEGORIES.filter(cat => {
    const spent = expenseByCategory[cat] || 0;
    const limit = budgets[cat] || 0;
    return limit > 0 && spent > limit * 0.8;
  });

  // Yearly data — income & expenses per month
  const yearlyData = MONTHS.map((_, mi) => {
    const txs = transactions.filter(t => new Date(t.date).getMonth() === mi && new Date(t.date).getFullYear() === thisYear);
    return {
      income: txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expenses: txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    };
  });

  const yearlyIncome = yearlyData.reduce((s, m) => s + m.income, 0);
  const yearlyExpenses = yearlyData.reduce((s, m) => s + m.expenses, 0);
  const yearlySavings = yearlyIncome - yearlyExpenses;

  const barData = {
    labels: MONTHS,
    datasets: [
      { label: 'Income', data: yearlyData.map(m => m.income), backgroundColor: 'rgba(52,211,153,0.7)', borderRadius: 6 },
      { label: 'Expenses', data: yearlyData.map(m => m.expenses), backgroundColor: 'rgba(251,113,133,0.7)', borderRadius: 6 },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: 'rgba(255,255,255,0.5)', font: { size: 11 } } },
      tooltip: { backgroundColor: 'rgba(10,10,20,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 10, bodyColor: '#f0f0ff', titleColor: '#a78bfa', callbacks: { label: ctx => ` ₹${ctx.raw.toLocaleString()}` } }
    },
    scales: {
      x: { ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 }, callback: v => `₹${(v/1000).toFixed(0)}k` }, grid: { color: 'rgba(255,255,255,0.04)' } },
    },
  };

  const catKeys = Object.keys(expenseByCategory);
  const donutData = {
    labels: catKeys,
    datasets: [{ data: catKeys.map(k => expenseByCategory[k]), backgroundColor: DONUT_COLORS.slice(0, catKeys.length), borderColor: 'transparent', hoverOffset: 6 }]
  };
  const donutOptions = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ₹${ctx.raw.toLocaleString()}` }, backgroundColor: 'rgba(10,10,20,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 10, bodyColor: '#f0f0ff', titleColor: '#a78bfa' } },
    cutout: '65%',
  };

  const handleAdd = () => {
    if (!form.amount || isNaN(+form.amount)) return;
    addTransaction({ ...form, amount: parseFloat(form.amount) });
    setForm(f => ({ ...f, amount: '', description: '' }));
  };

  // Double tap handler
  const handleCardTap = (cardKey) => {
    const now = Date.now();
    const last = tapCount[cardKey] || 0;
    if (now - last < 400) {
      setExpandedCard(cardKey);
    }
    setTapCount(t => ({ ...t, [cardKey]: now }));
  };

  const cardDetails = {
    income: { label: 'Income', current: income, prev: prevIncome, color: '#34d399', prefix: '+₹', txs: monthTx.filter(t => t.type === 'income'), prevTxs: prevMonthTx.filter(t => t.type === 'income') },
    expenses: { label: 'Expenses', current: expenses, prev: prevExpenses, color: '#fb7185', prefix: '-₹', txs: monthTx.filter(t => t.type === 'expense'), prevTxs: prevMonthTx.filter(t => t.type === 'expense') },
    savings: { label: 'Savings', current: Math.abs(savings), prev: Math.abs(prevSavings), color: savings >= 0 ? '#22d3ee' : '#fb7185', prefix: savings >= 0 ? '₹' : '-₹', txs: [], prevTxs: [] },
  };

  const summaryCards = [
    { key: 'income', label: 'Income', value: income, icon: <TrendingUp size={18} />, textColor: '#34d399', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', prefix: '+₹' },
    { key: 'expenses', label: 'Expenses', value: expenses, icon: <TrendingDown size={18} />, textColor: '#fb7185', bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.25)', prefix: '-₹' },
    { key: 'savings', label: 'Savings', value: Math.abs(savings), icon: <PiggyBank size={18} />, textColor: savings >= 0 ? '#22d3ee' : '#fb7185', bg: savings >= 0 ? 'rgba(6,182,212,0.12)' : 'rgba(244,63,94,0.12)', border: savings >= 0 ? 'rgba(6,182,212,0.25)' : 'rgba(244,63,94,0.25)', prefix: savings >= 0 ? '₹' : '-₹' },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>Finance</h1>
          <p className="text-sm text-muted">Track income, expenses, and build financial freedom.</p>
        </div>
        <button onClick={() => setTab('budgets')} className="btn-secondary flex items-center gap-2 text-sm">
          <Settings size={15} /> Set Budgets
        </button>
      </motion.div>

      {/* Budget Warnings */}
      <AnimatePresence>
        {budgetWarnings.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-5 p-4 rounded-2xl flex items-start gap-3"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-amber-400 mb-1">Budget Alert</div>
              <div className="text-xs flex flex-wrap gap-x-4 gap-y-1">
                {budgetWarnings.map(cat => {
                  const spent = expenseByCategory[cat] || 0;
                  const limit = budgets[cat];
                  const pct = Math.round((spent / limit) * 100);
                  return <span key={cat} style={{ color: pct >= 100 ? '#fb7185' : '#fbbf24' }}>{pct >= 100 ? '🔴' : '🟡'} {cat}: ₹{spent.toLocaleString()} / ₹{limit.toLocaleString()} ({pct}%)</span>;
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Cards — double tap to expand */}
      <p className="text-xs text-muted mb-2">💡 Double tap a card to see full details</p>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {summaryCards.map((s, i) => (
          <motion.div key={s.key}
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            onClick={() => handleCardTap(s.key)}
            className="glass-card p-4 cursor-pointer select-none active:scale-95 transition-transform"
            style={{ WebkitUserSelect: 'none' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.textColor }}>
              {s.icon}
            </div>
            <div className="font-display font-bold mb-0.5 truncate" style={{ color: s.textColor, fontSize: 'clamp(0.85rem, 2vw, 1.1rem)' }}>
              {s.prefix}{s.value.toLocaleString()}
            </div>
            <div className="text-xs text-muted">{s.label} this month</div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['overview', 'add', 'history', 'budgets'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${tab === t ? 'btn-primary' : 'btn-secondary'}`}>
            {t === 'budgets' ? '⚙️ Budgets' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="flex flex-col gap-5">
          <div className="grid sm:grid-cols-2 gap-5">
            {catKeys.length > 0 ? (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
                <h3 className="font-display font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Spending Breakdown</h3>
                <div style={{ maxHeight: 180, display: 'flex', justifyContent: 'center' }}>
                  <Doughnut data={donutData} options={donutOptions} />
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  {catKeys.map((cat, i) => {
                    const spent = expenseByCategory[cat];
                    const budget = budgets[cat] || 0;
                    const over = budget > 0 && spent > budget;
                    return (
                      <div key={cat} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: DONUT_COLORS[i] }} />
                          <span className="text-xs text-muted">{cat}</span>
                          {over && <AlertTriangle size={10} className="text-amber-400" />}
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-medium" style={{ color: over ? '#fb7185' : 'var(--text-primary)' }}>₹{spent.toLocaleString()}</span>
                          {budget > 0 && <span className="text-xs text-muted ml-1">/ ₹{budget.toLocaleString()}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <div className="glass-card p-5 flex items-center justify-center text-center">
                <div><div className="text-3xl mb-2">💰</div><p className="text-sm text-muted">Add expenses to see breakdown</p></div>
              </div>
            )}

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
              <h3 className="font-display font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Monthly Summary</h3>
              <div className="flex flex-col gap-4">
                {[
                  { label: 'Income', amount: income, color: '#34d399' },
                  { label: 'Expenses', amount: expenses, color: '#fb7185' },
                  { label: 'Savings', amount: Math.max(savings, 0), color: '#22d3ee' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted">{item.label}</span>
                      <span className="font-mono font-semibold" style={{ color: item.color }}>₹{item.amount.toLocaleString()}</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
                      <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                        animate={{ width: `${income > 0 ? Math.min((item.amount / income) * 100, 100) : 0}%` }}
                        transition={{ delay: 0.3, duration: 0.8 }} style={{ background: item.color }} />
                    </div>
                  </div>
                ))}
                {income > 0 && (
                  <div className="pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                    <div className="text-center">
                      <div className="font-display font-bold text-2xl" style={{ color: savings >= 0 ? '#22d3ee' : '#fb7185' }}>
                        {Math.round((Math.max(savings, 0) / income) * 100)}%
                      </div>
                      <div className="text-xs text-muted">Savings Rate</div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* ── Yearly Summary ── */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5">
            <h3 className="font-display font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Yearly Summary — {thisYear}</h3>
            <div className="flex gap-6 mb-5 flex-wrap">
              {[
                { label: 'Total Income', value: yearlyIncome, color: '#34d399', prefix: '₹' },
                { label: 'Total Expenses', value: yearlyExpenses, color: '#fb7185', prefix: '₹' },
                { label: 'Net Savings', value: Math.abs(yearlySavings), color: yearlySavings >= 0 ? '#22d3ee' : '#fb7185', prefix: yearlySavings >= 0 ? '₹' : '-₹' },
              ].map(s => (
                <div key={s.label}>
                  <div className="font-display font-bold text-xl" style={{ color: s.color }}>{s.prefix}{s.value.toLocaleString()}</div>
                  <div className="text-xs text-muted">{s.label}</div>
                </div>
              ))}
            </div>
            <Bar data={barData} options={barOptions} />
          </motion.div>
        </div>
      )}

      {/* Add Tab */}
      {tab === 'add' && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 max-w-md">
          <h3 className="font-display font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Log Transaction</h3>
          <div className="flex gap-2 mb-4">
            {['expense', 'income'].map(type => (
              <button key={type} onClick={() => setForm(f => ({ ...f, type, category: type === 'expense' ? 'Food' : 'Salary' }))}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${form.type === type ? 'btn-primary' : 'btn-secondary'}`}>
                {type === 'expense' ? '🔴 Expense' : '🟢 Income'}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block text-muted">AMOUNT (₹)</label>
              <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" className="input-field" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block text-muted">CATEGORY</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="select-field">
                {(form.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {form.type === 'expense' && budgets[form.category] > 0 && (() => {
              const spent = expenseByCategory[form.category] || 0;
              const budget = budgets[form.category];
              const pct = Math.min((spent / budget) * 100, 100);
              return (
                <div className="p-3 rounded-xl" style={{ background: pct >= 100 ? 'rgba(244,63,94,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${pct >= 100 ? 'rgba(244,63,94,0.2)' : 'var(--border)'}` }}>
                  <div className="flex justify-between text-xs mb-1.5 text-muted">
                    <span>{form.category} budget</span>
                    <span style={{ color: pct >= 100 ? '#fb7185' : pct >= 80 ? '#fbbf24' : '#34d399' }}>₹{spent.toLocaleString()} / ₹{budget.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct >= 100 ? '#f43f5e' : pct >= 80 ? '#f59e0b' : '#10b981' }} />
                  </div>
                </div>
              );
            })()}
            <div>
              <label className="text-xs font-medium mb-1 block text-muted">NOTE (optional)</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What was this for?" className="input-field" />
            </div>
            <button onClick={handleAdd} className="btn-primary flex items-center justify-center gap-2 mt-1">
              <Plus size={16} /> Add Transaction
            </button>
          </div>
        </motion.div>
      )}

      {/* History Tab */}
      {tab === 'history' && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
          <h3 className="font-display font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Transaction History</h3>
          {transactions.length === 0 ? (
            <p className="text-sm text-center py-8 text-muted">No transactions yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {[...transactions].reverse().slice(0, 30).map(t => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl group"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-lg">{t.type === 'income' ? '💚' : '🔴'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t.category}</div>
                    {t.description && <div className="text-xs truncate text-muted">{t.description}</div>}
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-semibold text-sm" style={{ color: t.type === 'income' ? '#34d399' : '#fb7185' }}>
                      {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted">{format(new Date(t.date), 'MMM d')}</div>
                  </div>
                  <button onClick={() => deleteTransaction(t.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/10">
                    <Trash2 size={12} className="text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Budgets Tab */}
      {tab === 'budgets' && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
          <h3 className="font-display font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Monthly Budgets</h3>
          <p className="text-xs text-muted mb-5">Set spending limits. Warning at 80%, alert at 100%.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {EXPENSE_CATEGORIES.map(cat => {
              const spent = expenseByCategory[cat] || 0;
              const budget = budgets[cat] || 0;
              const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
              return (
                <div key={cat} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{cat}</span>
                    <span className="text-xs text-muted">Spent: ₹{spent.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-muted font-medium">₹</span>
                    <input type="number" defaultValue={budget || ''} placeholder="No limit"
                      onBlur={e => updateBudget(cat, Number(e.target.value) || 0)}
                      className="input-field text-sm py-1.5 flex-1" />
                  </div>
                  {budget > 0 && (
                    <>
                      <div className="h-1.5 rounded-full mb-1" style={{ background: 'rgba(255,255,255,0.07)' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct >= 100 ? '#f43f5e' : pct >= 80 ? '#f59e0b' : '#10b981' }} />
                      </div>
                      <div className="text-xs text-right" style={{ color: pct >= 100 ? '#fb7185' : pct >= 80 ? '#fbbf24' : '#34d399' }}>{Math.round(pct)}% used</div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Card Detail Modal (double tap) ── */}
      <AnimatePresence>
        {expandedCard && (() => {
          const d = cardDetails[expandedCard];
          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
              onClick={e => e.target === e.currentTarget && setExpandedCard(null)}>
              <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
                className="glass-card p-6 w-full max-w-md rounded-3xl max-h-[80vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>{d.label} Details</h3>
                  <button onClick={() => setExpandedCard(null)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <X size={16} style={{ color: 'var(--text-muted)' }} />
                  </button>
                </div>

                {/* This month vs last month */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
                    <div className="text-xs text-muted mb-1">{MONTHS[thisMonth]} (this month)</div>
                    <div className="font-display font-bold text-2xl" style={{ color: d.color }}>{d.prefix}{d.current.toLocaleString()}</div>
                  </div>
                  <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
                    <div className="text-xs text-muted mb-1">{MONTHS[prevMonth]} (last month)</div>
                    <div className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>₹{d.prev.toLocaleString()}</div>
                    {d.prev > 0 && (
                      <div className="text-xs mt-1" style={{ color: d.current > d.prev ? (expandedCard === 'expenses' ? '#fb7185' : '#34d399') : (expandedCard === 'expenses' ? '#34d399' : '#fb7185') }}>
                        {d.current > d.prev ? '▲' : '▼'} {Math.abs(Math.round(((d.current - d.prev) / d.prev) * 100))}% vs last month
                      </div>
                    )}
                  </div>
                </div>

                {/* Transaction list for this card */}
                {d.txs.length > 0 && (
                  <>
                    <div className="text-xs font-medium text-muted uppercase tracking-wider mb-3">This month's transactions</div>
                    <div className="flex flex-col gap-2 mb-4">
                      {[...d.txs].reverse().map(t => (
                        <div key={t.id} className="flex items-center justify-between p-3 rounded-xl"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div>
                            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t.category}</div>
                            {t.description && <div className="text-xs text-muted">{t.description}</div>}
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-semibold text-sm" style={{ color: d.color }}>₹{t.amount.toLocaleString()}</div>
                            <div className="text-xs text-muted">{format(new Date(t.date), 'MMM d')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Previous month transactions */}
                {d.prevTxs.length > 0 && (
                  <>
                    <div className="text-xs font-medium text-muted uppercase tracking-wider mb-3">{MONTHS[prevMonth]} transactions</div>
                    <div className="flex flex-col gap-2">
                      {[...d.prevTxs].reverse().map(t => (
                        <div key={t.id} className="flex items-center justify-between p-3 rounded-xl"
                          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                          <div>
                            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)', opacity: 0.7 }}>{t.category}</div>
                            {t.description && <div className="text-xs text-muted">{t.description}</div>}
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>₹{t.amount.toLocaleString()}</div>
                            <div className="text-xs text-muted">{format(new Date(t.date), 'MMM d')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {d.txs.length === 0 && d.prevTxs.length === 0 && expandedCard === 'savings' && (
                  <p className="text-sm text-center text-muted py-4">Savings = Income − Expenses</p>
                )}
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}