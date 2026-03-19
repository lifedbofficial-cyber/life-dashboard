import { motion } from 'framer-motion';
import { subDays, format, startOfWeek, eachDayOfInterval, addDays } from 'date-fns';

// Build 16 weeks of calendar data
function buildCalendarData(completedDates = []) {
  const dateSet = new Set(completedDates);
  const today = new Date();
  const calStart = subDays(today, 111); // ~16 weeks back

  const days = eachDayOfInterval({ start: calStart, end: today });

  // Pad so first day starts on Sunday
  const firstDay = days[0];
  const startPad = firstDay.getDay(); // 0=Sun
  const paddedDays = [...Array(startPad).fill(null), ...days];

  // Build weeks
  const weeks = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7));
  }

  return { weeks, dateSet };
}

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_LABELS = ['S','M','T','W','T','F','S'];

export default function HeatmapCalendar({ completedDates = [], habitName }) {
  const { weeks, dateSet } = buildCalendarData(completedDates);
  const totalDone = completedDates.length;

  // Figure out which weeks are which months for labels
  const monthLabels = [];
  weeks.forEach((week, wi) => {
    const firstReal = week.find(d => d !== null);
    if (!firstReal) return;
    const mo = firstReal.getMonth();
    if (wi === 0 || (weeks[wi - 1]?.find(d => d)?.getMonth() !== mo)) {
      monthLabels.push({ week: wi, label: MONTH_LABELS[mo] });
    }
  });

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted">Completion History</span>
        <span className="text-xs text-muted">{totalDone} total completions</span>
      </div>

      <div className="overflow-x-auto pb-2">
        <div style={{ minWidth: weeks.length * 14 + 24 }}>
          {/* Month Labels */}
          <div className="flex mb-1" style={{ paddingLeft: 24 }}>
            {weeks.map((_, wi) => {
              const ml = monthLabels.find(m => m.week === wi);
              return (
                <div key={wi} style={{ width: 14, flexShrink: 0 }}>
                  {ml && <span className="text-[10px] text-muted whitespace-nowrap">{ml.label}</span>}
                </div>
              );
            })}
          </div>

          <div className="flex gap-0">
            {/* Day Labels */}
            <div className="flex flex-col gap-[2px] mr-1" style={{ paddingTop: 0 }}>
              {DAY_LABELS.map((d, i) => (
                <div key={i} className="text-[10px] text-muted flex items-center justify-center" style={{ width: 14, height: 12 }}>
                  {i % 2 === 1 ? d : ''}
                </div>
              ))}
            </div>

            {/* Grid */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[2px]">
                {week.map((day, di) => {
                  if (!day) return <div key={di} style={{ width: 12, height: 12, flexShrink: 0 }} />;
                  const ds = day.toDateString();
                  const done = dateSet.has(ds);
                  const isToday = ds === new Date().toDateString();
                  const isFuture = day > new Date();
                  return (
                    <motion.div key={di}
                      whileHover={{ scale: 1.3 }}
                      title={`${format(day, 'MMM d')}${done ? ' ✓' : ''}`}
                      style={{
                        width: 12, height: 12, borderRadius: 3, flexShrink: 0,
                        background: isFuture ? 'rgba(255,255,255,0.03)'
                          : done ? 'linear-gradient(135deg, #8b5cf6, #06b6d4)'
                          : 'rgba(255,255,255,0.07)',
                        border: isToday ? '1.5px solid #8b5cf6' : 'none',
                        boxShadow: done ? '0 0 4px rgba(139,92,246,0.4)' : 'none',
                        cursor: 'default',
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-2">
        <span className="text-[10px] text-muted">Less</span>
        {[0.07, 0.3, 0.6, 1].map((o, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: i === 0 ? 'rgba(255,255,255,0.07)' : `rgba(139,92,246,${o})` }} />
        ))}
        <span className="text-[10px] text-muted">More</span>
      </div>
    </div>
  );
}