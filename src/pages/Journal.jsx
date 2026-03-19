import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Plus, Search, Trash2, ChevronDown, ChevronUp, BookOpen, X } from 'lucide-react';
import { format } from 'date-fns';

const MOODS = ['😄', '🙂', '😐', '😞', '😡'];
const TAGS = ['Gratitude', 'Reflection', 'Goals', 'Ideas', 'Emotions', 'Health', 'Work', 'Personal'];

export default function Journal() {
  const { journal, addJournalEntry, updateJournalEntry, deleteJournalEntry } = useApp();
  const [view, setView] = useState('list');
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [draft, setDraft] = useState({ title: '', content: '', mood: '🙂', tags: [] });

  const filtered = journal.filter(e => {
    const q = search.toLowerCase();
    return !q || e.title?.toLowerCase().includes(q) || e.content?.toLowerCase().includes(q) || e.tags?.some(t => t.toLowerCase().includes(q));
  });

  const startNew = () => {
    setDraft({ title: '', content: '', mood: '🙂', tags: [] });
    setEditId(null);
    setView('write');
  };

  const startEdit = (entry) => {
    setDraft({ title: entry.title || '', content: entry.content || '', mood: entry.mood || '🙂', tags: entry.tags || [] });
    setEditId(entry.id);
    setView('write');
  };

  const handleSave = () => {
    if (!draft.content.trim()) return;
    if (editId) {
      updateJournalEntry(editId, draft);
      setEditId(null);
    } else {
      addJournalEntry(draft);
    }
    setDraft({ title: '', content: '', mood: '🙂', tags: [] });
    setView('list');
  };

  const toggleTag = (tag) => {
    setDraft(d => ({ ...d, tags: d.tags.includes(tag) ? d.tags.filter(t => t !== tag) : [...d.tags, tag] }));
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>Journal</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{journal.length} entries · Write your story</p>
        </div>
        <button onClick={startNew} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Entry
        </button>
      </motion.div>

      <AnimatePresence mode="wait">
        {view === 'write' ? (
          <motion.div key="write" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="glass-card p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-5">
                <div className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                  {format(new Date(), 'EEEE, MMMM d yyyy')}
                </div>
                <div className="flex gap-2">
                  {MOODS.map(m => (
                    <button key={m} onClick={() => setDraft(d => ({ ...d, mood: m }))}
                      className="text-2xl transition-all"
                      style={{ opacity: draft.mood === m ? 1 : 0.35, transform: draft.mood === m ? 'scale(1.2)' : 'scale(1)' }}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <input value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
                placeholder="Entry title (optional)" className="input-field font-display font-semibold text-lg mb-4"
                style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', borderRadius: 0, padding: '4px 0', fontSize: 20 }} />

              <textarea value={draft.content} onChange={e => setDraft(d => ({ ...d, content: e.target.value }))}
                placeholder="What's on your mind today? Write freely..."
                rows={12} className="input-field resize-none leading-relaxed mb-4"
                style={{ fontFamily: 'DM Sans, sans-serif', lineHeight: 1.8 }} />

              <div className="mb-5">
                <div className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Tags</div>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map(tag => (
                    <button key={tag} onClick={() => toggleTag(tag)}
                      className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                      style={{
                        background: draft.tags.includes(tag) ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${draft.tags.includes(tag) ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.1)'}`,
                        color: draft.tags.includes(tag) ? '#a78bfa' : 'var(--text-muted)',
                      }}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setView('list')} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleSave} className="btn-primary flex-1">{editId ? 'Update Entry' : 'Save Entry (+8 XP)'}</button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            {/* Search */}
            <div className="relative mb-5">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search entries..."
                className="input-field pl-10" />
            </div>

            {/* Entries */}
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">📖</div>
                <h3 className="font-display font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
                  {journal.length === 0 ? 'No entries yet' : 'No results found'}
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                  {journal.length === 0 ? 'Start your journaling journey today' : 'Try a different search term'}
                </p>
                {journal.length === 0 && <button onClick={startNew} className="btn-primary">Write First Entry</button>}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filtered.map((entry, i) => {
                  const isExpanded = expanded === entry.id;
                  const preview = entry.content?.slice(0, 150) + (entry.content?.length > 150 ? '...' : '');
                  return (
                    <motion.div key={entry.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                      className="glass-card p-5 group">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-base">{entry.mood || '📝'}</span>
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{format(new Date(entry.date), 'MMM d, yyyy · h:mm a')}</span>
                          </div>
                          {entry.title && <h3 className="font-display font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{entry.title}</h3>}
                          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                            {isExpanded ? entry.content : preview}
                          </p>
                          {entry.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {entry.tags.map(tag => (
                                <span key={tag} className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}>{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1.5 flex-shrink-0">
                          <button onClick={() => startEdit(entry)} className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(255,255,255,0.07)' }}>
                            <BookOpen size={12} style={{ color: 'var(--text-muted)' }} />
                          </button>
                          <button onClick={() => deleteJournalEntry(entry.id)} className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500/10">
                            <Trash2 size={12} className="text-rose-400" />
                          </button>
                        </div>
                      </div>
                      {entry.content?.length > 150 && (
                        <button onClick={() => setExpanded(isExpanded ? null : entry.id)}
                          className="mt-2 flex items-center gap-1 text-xs transition-colors hover:text-purple-400" style={{ color: 'var(--text-muted)' }}>
                          {isExpanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Read more</>}
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
