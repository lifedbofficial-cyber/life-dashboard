import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, TrendingUp, TrendingDown, PiggyBank, AlertTriangle, Settings, ArrowRightCircle, X } from 'lucide-react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { format } from 'date-fns';
import FinanceCalendar from '../components/FinanceCalendar';

const EXPENSE_CATEGORIES = ['Food','Transport','Entertainment','Shopping','Health','Bills','Education','Other'];
const INCOME_CATEGORIES = ['Salary','Freelance','Investment','Gift','Other'];
const DONUT_COLORS = ['#8b5cf6','#06b6d4','#f59e0b','#10b981','#f43f5e','#3b82f6','#ec4899','#6366f1'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Finance() {
  const { transactions, addTransaction, deleteTransaction, budgets, updateBudget } = useApp();
  const [tab, setTab] = useState('overview');
  const [form, setForm] = useState({ type: 'expense', amount: '', category: 'Food', description: '' });
  const [showCarryForward, setShowCarryForward] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [tapCount, setTapCount] = useState({});

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const prevMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const prevMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

  const monthTx = transactions.filter(t => { const d = new Date(t.date); return d.getMonth() === thisMonth && d.getFullYear() === thisYear; });
  const prevMonthTx = transactions.filter(t => { const d = new Date(t.date); return d.getMonth() === prevMonth && d.getFullYear() === prevMonthYear; });

  const income = monthTx.filter(t => t.type === 'income').reduce((s,t) => s+t.amount, 0);
  const expenses = monthTx.filter(t => t.type === 'expense').reduce((s,t) => s+t.amount, 0);
  const savings = income - expenses;
  const prevIncome = prevMonthTx.filter(t => t.type === 'income').reduce((s,t) => s+t.amount, 0);
  const prevExpenses = prevMonthTx.filter(t => t.type === 'expense').reduce((s,t) => s+t.amount, 0);
  const prevBalance = prevIncome - prevExpenses;
  const alreadyCarriedForward = monthTx.some(t => t.description === 'carry-forward-from-prev-month');

  const expenseByCategory = EXPENSE_CATEGORIES.reduce((acc, cat) => {
    const total = monthTx.filter(t => t.type === 'expense' && t.category === cat).reduce((s,t) => s+t.amount, 0);
    if (total > 0) acc[cat] = total;
    return acc;
  }, {});

  const budgetWarnings = EXPENSE_CATEGORIES.filter(cat => {
    const spent = expenseByCategory[cat]||0;
    const limit = budgets[cat]||0;
    return limit > 0 && spent > limit*0.8;
  });

  const yearlyData = MONTHS.map((_,mi) => {
    const txs = transactions.filter(t => new Date(t.date).getMonth()===mi && new Date(t.date).getFullYear()===thisYear);
    return { income: txs.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0), expenses: txs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0) };
  });
  const yearlyIncome = yearlyData.reduce((s,m)=>s+m.income,0);
  const yearlyExpenses = yearlyData.reduce((s,m)=>s+m.expenses,0);

  const catKeys = Object.keys(expenseByCategory);
  const donutData = { labels: catKeys, datasets: [{ data: catKeys.map(k=>expenseByCategory[k]), backgroundColor: DONUT_COLORS.slice(0,catKeys.length), borderColor: 'transparent', hoverOffset: 6 }] };
  const donutOptions = { responsive: true, plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` Rs.${ctx.raw.toLocaleString()}` }, backgroundColor: 'rgba(10,10,20,0.9)', borderWidth: 1, padding: 10, bodyColor: '#f0f0ff', titleColor: '#a78bfa' } }, cutout: '65%' };

  const handleAdd = () => {
    if (!form.amount || isNaN(+form.amount)) return;
    addTransaction({...form, amount: parseFloat(form.amount)});
    setForm(f=>({...f, amount:'', description:''}));
  };

  const handleCarryForward = () => {
    if (prevBalance > 0) {
      addTransaction({ type:'income', amount:prevBalance, category:'Other', description:'carry-forward-from-prev-month' });
    } else {
      addTransaction({ type:'expense', amount:Math.abs(prevBalance), category:'Other', description:'carry-forward-from-prev-month' });
    }
    setShowCarryForward(false);
  };

  const handleCardTap = (key) => {
    const n = Date.now();
    const last = tapCount[key]||0;
    if (n-last < 400) setExpandedCard(key);
    setTapCount(t=>({...t,[key]:n}));
  };

  const summaryCards = [
    { key:'income', label:'Income', value:income, icon:<TrendingUp size={18}/>, textColor:'#34d399', bg:'rgba(16,185,129,0.12)', border:'rgba(16,185,129,0.25)', prefix:'+₹' },
    { key:'expenses', label:'Expenses', value:expenses, icon:<TrendingDown size={18}/>, textColor:'#fb7185', bg:'rgba(244,63,94,0.12)', border:'rgba(244,63,94,0.25)', prefix:'-₹' },
    { key:'savings', label:'Savings', value:Math.abs(savings), icon:<PiggyBank size={18}/>, textColor:savings>=0?'#22d3ee':'#fb7185', bg:savings>=0?'rgba(6,182,212,0.12)':'rgba(244,63,94,0.12)', border:savings>=0?'rgba(6,182,212,0.25)':'rgba(244,63,94,0.25)', prefix:savings>=0?'₹':'-₹' },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto pb-24 lg:pb-8">
      <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-3xl mb-1" style={{color:'var(--text-primary)'}}>Finance</h1>
          <p className="text-sm text-muted">Track income, expenses, and build financial freedom.</p>
        </div>
        <button onClick={()=>setTab('budgets')} className="btn-secondary flex items-center gap-2 text-sm"><Settings size={15}/> Set Budgets</button>
      </motion.div>

      {/* Carry Forward Banner */}
      <AnimatePresence>
        {prevBalance !== 0 && !alreadyCarriedForward && (
          <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="mb-5 p-4 rounded-2xl flex items-start gap-3"
            style={{background:prevBalance>0?'rgba(6,182,212,0.08)':'rgba(244,63,94,0.08)',border:`1px solid ${prevBalance>0?'rgba(6,182,212,0.25)':'rgba(244,63,94,0.25)'}`}}>
            <ArrowRightCircle size={18} className={prevBalance>0?'text-cyan-400':'text-rose-400'} style={{flexShrink:0,marginTop:2}}/>
            <div className="flex-1">
              <div className="text-sm font-semibold mb-0.5" style={{color:prevBalance>0?'#22d3ee':'#fb7185'}}>
                {prevBalance>0 ?  `₹${prevBalance.toLocaleString()} savings from ${MONTHS[prevMonth]}` :  `₹${Math.abs(prevBalance).toLocaleString()} deficit from ${MONTHS[prevMonth]}`}
              </div>
              <div className="text-xs text-muted">{prevBalance>0?'Carry your leftover savings into this month?':'Log last month deficit in this month?'}</div>
            </div>
            <button onClick={()=>setShowCarryForward(true)} className="text-xs px-3 py-1.5 rounded-xl font-semibold flex-shrink-0"
              style={{background:prevBalance>0?'rgba(6,182,212,0.15)':'rgba(244,63,94,0.15)',color:prevBalance>0?'#22d3ee':'#fb7185',border:`1px solid ${prevBalance>0?'rgba(6,182,212,0.3)':'rgba(244,63,94,0.3)'}`}}>
              Carry Forward
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Budget Warnings */}
      <AnimatePresence>
        {budgetWarnings.length > 0 && (
          <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="mb-5 p-4 rounded-2xl flex items-start gap-3"
            style={{background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.25)'}}>
            <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5"/>
            <div>
              <div className="text-sm font-semibold text-amber-400 mb-1">Budget Alert</div>
              <div className="text-xs flex flex-wrap gap-x-4 gap-y-1">
                {budgetWarnings.map(cat=>{const spent=expenseByCategory[cat]||0;const limit=budgets[cat];const pct=Math.round((spent/limit)*100);return <span key={cat} style={{color:pct>=100?'#fb7185':'#fbbf24'}}>{pct>=100?'Red':'Yellow'} {cat}: ₹{spent.toLocaleString()} / ₹{limit.toLocaleString()} ({pct}%)</span>;})}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Cards */}
      <p className="text-xs text-muted mb-2">Double tap a card to see full details</p>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {summaryCards.map((s,i)=>(
          <motion.div key={s.key} initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
            onClick={()=>handleCardTap(s.key)} className="glass-card p-4 cursor-pointer select-none">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{background:s.bg,border:`1px solid ${s.border}`,color:s.textColor}}>{s.icon}</div>
            <div className="font-display font-bold mb-0.5 truncate" style={{color:s.textColor,fontSize:'clamp(0.85rem,2vw,1.1rem)'}}>{s.prefix}{s.value.toLocaleString()}</div>
            <div className="text-xs text-muted">{s.label} this month</div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[{id:'overview',label:'Overview'},{id:'calendar',label:'Calendar'},{id:'add',label:'Add'},{id:'history',label:'History'},{id:'budgets',label:'Budgets'}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab===t.id?'btn-primary':'btn-secondary'}`}>{t.label}</button>
        ))}
      </div>

      {tab==='calendar' && <motion.div initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} className="glass-card p-5"><FinanceCalendar transactions={transactions}/></motion.div>}

      {tab==='overview' && (
        <div className="flex flex-col gap-5">
          <div className="grid sm:grid-cols-2 gap-5">
            {catKeys.length>0?(
              <motion.div initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} className="glass-card p-5">
                <h3 className="font-display font-semibold mb-4" style={{color:'var(--text-primary)'}}>Spending Breakdown</h3>
                <div style={{maxHeight:180,display:'flex',justifyContent:'center'}}><Doughnut data={donutData} options={donutOptions}/></div>
                <div className="flex flex-col gap-2 mt-4">
                  {catKeys.map((cat,i)=>{const spent=expenseByCategory[cat];const budget=budgets[cat]||0;const over=budget>0&&spent>budget;return(
                    <div key={cat} className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{background:DONUT_COLORS[i]}}/><span className="text-xs text-muted">{cat}</span>{over&&<AlertTriangle size={10} className="text-amber-400"/>}</div>
                      <div className="text-right"><span className="text-xs font-mono font-medium" style={{color:over?'#fb7185':'var(--text-primary)'}}>₹{spent.toLocaleString()}</span>{budget>0&&<span className="text-xs text-muted ml-1">/ ₹{budget.toLocaleString()}</span>}</div>
                    </div>
                  );})}
                </div>
              </motion.div>
            ):(
              <div className="glass-card p-5 flex items-center justify-center text-center"><div><div className="text-3xl mb-2">money</div><p className="text-sm text-muted">Add expenses to see breakdown</p></div></div>
            )}
            <motion.div initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="glass-card p-5">
              <h3 className="font-display font-semibold mb-4" style={{color:'var(--text-primary)'}}>Monthly Summary</h3>
              <div className="flex flex-col gap-4">
                {[{label:'Income',amount:income,color:'#34d399'},{label:'Expenses',amount:expenses,color:'#fb7185'},{label:'Savings',amount:Math.max(savings,0),color:'#22d3ee'}].map(item=>(
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1"><span className="text-muted">{item.label}</span><span className="font-mono font-semibold" style={{color:item.color}}>₹{item.amount.toLocaleString()}</span></div>
                    <div className="h-2 rounded-full" style={{background:'rgba(255,255,255,0.07)'}}><motion.div className="h-full rounded-full" initial={{width:0}} animate={{width:`${income>0?Math.min((item.amount/income)*100,100):0}%`}} transition={{delay:0.3,duration:0.8}} style={{background:item.color}}/></div>
                  </div>
                ))}
                {income>0&&<div className="pt-3 border-t" style={{borderColor:'var(--border)'}}><div className="text-center"><div className="font-display font-bold text-2xl" style={{color:savings>=0?'#22d3ee':'#fb7185'}}>{Math.round((Math.max(savings,0)/income)*100)}%</div><div className="text-xs text-muted">Savings Rate</div></div></div>}
              </div>
            </motion.div>
          </div>
          <motion.div initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:0.15}} className="glass-card p-5">
            <h3 className="font-display font-semibold mb-1" style={{color:'var(--text-primary)'}}>Yearly Summary - {thisYear}</h3>
            <div className="flex gap-6 mb-4 flex-wrap">
              {[{label:'Total Income',value:yearlyIncome,color:'#34d399'},{label:'Total Expenses',value:yearlyExpenses,color:'#fb7185'},{label:'Net Savings',value:Math.abs(yearlyIncome-yearlyExpenses),color:yearlyIncome>=yearlyExpenses?'#22d3ee':'#fb7185'}].map(s=>(
                <div key={s.label}><div className="font-display font-bold text-xl" style={{color:s.color}}>₹{s.value.toLocaleString()}</div><div className="text-xs text-muted">{s.label}</div></div>
              ))}
            </div>
            <Bar data={{
              labels: MONTHS,
              datasets: [
                { label: 'Income', data: yearlyData.map(m => m.income), backgroundColor: 'rgba(52,211,153,0.7)', borderRadius: 6, barPercentage: 0.45 },
                { label: 'Expenses', data: yearlyData.map(m => m.expenses), backgroundColor: 'rgba(251,113,133,0.7)', borderRadius: 6, barPercentage: 0.45 },
              ],
            }} options={{
              responsive: true,
              plugins: {
                legend: { labels: { color: 'rgba(255,255,255,0.5)', font: { size: 11 }, boxWidth: 12, boxHeight: 12 } },
                tooltip: { backgroundColor: 'rgba(10,10,20,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 10, bodyColor: '#f0f0ff', titleColor: '#a78bfa', callbacks: { label: ctx => ` Rs.${ctx.raw.toLocaleString()}` } }
              },
              scales: {
                x: { ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
                y: { ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 }, callback: v =>  `₹${(v/1000).toFixed(0)}k` }, grid: { color: 'rgba(255,255,255,0.04)' } },
              },
            }} />
          </motion.div>
        </div>
      )}

      {tab==='add' && (
        <motion.div initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} className="glass-card p-5 max-w-md">
          <h3 className="font-display font-semibold mb-4" style={{color:'var(--text-primary)'}}>Log Transaction</h3>
          <div className="flex gap-2 mb-4">
            {['expense','income'].map(type=>(<button key={type} onClick={()=>setForm(f=>({...f,type,category:type==='expense'?'Food':'Salary'}))} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${form.type===type?'btn-primary':'btn-secondary'}`}>{type==='expense'?'Expense':'Income'}</button>))}
          </div>
          <div className="flex flex-col gap-3">
            <div><label className="text-xs font-medium mb-1 block text-muted">AMOUNT</label><input type="number" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} placeholder="0.00" className="input-field"/></div>
            <div><label className="text-xs font-medium mb-1 block text-muted">CATEGORY</label><select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} className="select-field">{(form.type==='expense'?EXPENSE_CATEGORIES:INCOME_CATEGORIES).map(c=><option key={c} value={c}>{c}</option>)}</select></div>
            <div><label className="text-xs font-medium mb-1 block text-muted">NOTE (optional)</label><input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="What was this for?" className="input-field"/></div>
            <button onClick={handleAdd} className="btn-primary flex items-center justify-center gap-2 mt-1"><Plus size={16}/> Add Transaction</button>
          </div>
        </motion.div>
      )}

      {tab==='history' && (
        <motion.div initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} className="glass-card p-5">
          <h3 className="font-display font-semibold mb-4" style={{color:'var(--text-primary)'}}>Transaction History</h3>
          {transactions.length===0?<p className="text-sm text-center py-8 text-muted">No transactions yet.</p>:(
            <div className="flex flex-col gap-2">
              {[...transactions].reverse().slice(0,30).map(t=>(
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl group" style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)'}}>
                  <div className="text-lg">{t.type==='income'?'In':'Out'}</div>
                  <div className="flex-1 min-w-0"><div className="text-sm font-medium" style={{color:'var(--text-primary)'}}>{t.category}</div>{t.description&&<div className="text-xs truncate text-muted">{t.description}</div>}</div>
                  <div className="text-right"><div className="font-mono font-semibold text-sm" style={{color:t.type==='income'?'#34d399':'#fb7185'}}>{t.type==='income'?'+':'-'}₹{t.amount.toLocaleString()}</div><div className="text-xs text-muted">{format(new Date(t.date),'MMM d')}</div></div>
                  <button onClick={()=>deleteTransaction(t.id)} className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/10"><Trash2 size={12} className="text-red-400"/></button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {tab==='budgets' && (
        <motion.div initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} className="glass-card p-5">
          <h3 className="font-display font-semibold mb-1" style={{color:'var(--text-primary)'}}>Monthly Budgets</h3>
          <p className="text-xs text-muted mb-5">Set spending limits. Warning at 80%, alert at 100%.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {EXPENSE_CATEGORIES.map(cat=>{const spent=expenseByCategory[cat]||0;const budget=budgets[cat]||0;const pct=budget>0?Math.min((spent/budget)*100,100):0;return(
              <div key={cat} className="p-4 rounded-xl" style={{background:'rgba(255,255,255,0.03)',border:'1px solid var(--border)'}}>
                <div className="flex items-center justify-between mb-2"><span className="text-sm font-semibold" style={{color:'var(--text-primary)'}}>{cat}</span><span className="text-xs text-muted">Spent: ₹{spent.toLocaleString()}</span></div>
                <div className="flex items-center gap-2 mb-2"><span className="text-xs text-muted font-medium">₹</span><input type="number" defaultValue={budget||''} placeholder="No limit" onBlur={e=>updateBudget(cat,Number(e.target.value)||0)} className="input-field text-sm py-1.5 flex-1"/></div>
                {budget>0&&(<><div className="h-1.5 rounded-full mb-1" style={{background:'rgba(255,255,255,0.07)'}}><div className="h-full rounded-full transition-all" style={{width:`${pct}%`,background:pct>=100?'#f43f5e':pct>=80?'#f59e0b':'#10b981'}}/></div><div className="text-xs text-right" style={{color:pct>=100?'#fb7185':pct>=80?'#fbbf24':'#34d399'}}>{Math.round(pct)}% used</div></>)}
              </div>
            );})}
          </div>
        </motion.div>
      )}

      {/* Carry Forward Modal */}
      <AnimatePresence>
        {showCarryForward && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.75)',backdropFilter:'blur(8px)'}}>
            <motion.div initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}} className="glass-card p-6 max-w-sm w-full rounded-3xl">
              <div className="flex items-center justify-between mb-4"><h3 className="font-display font-bold text-lg" style={{color:'var(--text-primary)'}}>Carry Forward Balance</h3><button onClick={()=>setShowCarryForward(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10"><X size={16} style={{color:'var(--text-muted)'}}/></button></div>
              <div className="text-center mb-5">
                <div className="font-display font-bold text-2xl mb-1" style={{color:prevBalance>0?'#22d3ee':'#fb7185'}}>{prevBalance>0?'+':'-'}₹{Math.abs(prevBalance).toLocaleString()}</div>
                <div className="text-sm text-muted">{prevBalance>0?`Leftover from ${MONTHS[prevMonth]}`:`Overspent in ${MONTHS[prevMonth]}`}</div>
              </div>
              <div className="p-3 rounded-xl mb-5" style={{background:'rgba(255,255,255,0.04)',border:'1px solid var(--border)'}}><div className="text-xs text-muted mb-1">This will add to {MONTHS[thisMonth]}:</div><div className="text-sm font-medium" style={{color:prevBalance>0?'#34d399':'#fb7185'}}>{prevBalance>0?`+₹${prevBalance.toLocaleString()} income`:`-₹${Math.abs(prevBalance).toLocaleString()} expense`} (carry forward)</div></div>
              <div className="flex gap-3"><button onClick={()=>setShowCarryForward(false)} className="btn-secondary flex-1">Cancel</button><button onClick={handleCarryForward} className="btn-primary flex-1 justify-center">Confirm</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Detail Modal */}
      <AnimatePresence>
        {expandedCard && (()=>{
          const d = expandedCard==='income'?{label:'Income',current:income,color:'#34d399',prefix:'+₹',txs:monthTx.filter(t=>t.type==='income')}:expandedCard==='expenses'?{label:'Expenses',current:expenses,color:'#fb7185',prefix:'-₹',txs:monthTx.filter(t=>t.type==='expense')}:{label:'Savings',current:Math.abs(savings),color:savings>=0?'#22d3ee':'#fb7185',prefix:savings>=0?'₹':'-₹',txs:[]};
          return(
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{background:'rgba(0,0,0,0.75)',backdropFilter:'blur(8px)'}} onClick={e=>e.target===e.currentTarget&&setExpandedCard(null)}>
              <motion.div initial={{y:60,opacity:0}} animate={{y:0,opacity:1}} exit={{y:60,opacity:0}} className="glass-card p-6 w-full max-w-md rounded-3xl max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4"><h3 className="font-display font-bold text-xl" style={{color:'var(--text-primary)'}}>{d.label} Details</h3><button onClick={()=>setExpandedCard(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10"><X size={16} style={{color:'var(--text-muted)'}}/></button></div>
                <div className="text-3xl font-display font-bold mb-4" style={{color:d.color}}>{d.prefix}{d.current.toLocaleString()}</div>
                {d.txs.length>0?(<div className="flex flex-col gap-2">{[...d.txs].reverse().map(t=>(<div key={t.id} className="flex items-center justify-between p-3 rounded-xl" style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)'}}><div><div className="text-sm font-medium" style={{color:'var(--text-primary)'}}>{t.category}</div>{t.description&&<div className="text-xs text-muted">{t.description}</div>}</div><div className="text-right"><div className="font-mono font-bold text-sm" style={{color:d.color}}>₹{t.amount.toLocaleString()}</div><div className="text-xs text-muted">{format(new Date(t.date),'MMM d')}</div></div></div>))}</div>):(<p className="text-sm text-center text-muted py-4">Savings = Income - Expenses</p>)}
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}