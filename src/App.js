import React, { useState, useEffect, useRef } from 'react';

/*
╔══════════════════════════════════════════════════════════════════════════════╗
║                         מפת הסקציות - SECTION MAP                           ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  SECTION 1:  HEBREW_CALENDAR  - לוח עברי וגימטריה                           ║
║  SECTION 2:  STYLES           - עיצוב CSS                                   ║
║  SECTION 3:  STATE            - משתנים ו-State                              ║
║  SECTION 4:  FUNCTIONS        - פונקציות עזר                                ║
║  SECTION 5:  TIMER            - טיימר ונקודות שלב                           ║
║  SECTION 6:  PHASE1           - שלב 1: שיעורים יומיים                       ║
║  SECTION 7:  PHASE2           - שלב 2: תקשורת + סקירת משימות                ║
║  SECTION 8:  PHASE3           - שלב 3: ביצוע משימות מהירות                  ║
║  SECTION 9:  PHASE4           - שלב 4: משימה בפוקוס                         ║
║  SECTION 10: HOME_SCREEN      - מסך הבית                                    ║
║  SECTION 11: TASKS_SCREEN     - מסך ניהול משימות                            ║
║  SECTION 12: DONATIONS_SCREEN - מסך צדקה                                    ║
║  SECTION 13: HISTORY_SCREEN   - מסך היסטוריה                                ║
║  SECTION 14: SETTINGS_SCREEN  - מסך הגדרות                                  ║
║  SECTION 15: MODALS           - חלונות עריכה והשלמה                         ║
║  SECTION 16: MAIN_RENDER      - רנדור ראשי                                  ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 1: HEBREW_CALENDAR - לוח עברי וגימטריה                              ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

const HEBREW_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
const GEMATRIA_UNITS = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
const GEMATRIA_TENS = ['', 'י', 'כ', 'ל'];

const numberToGematria = (num) => {
  if (num === 15) return 'ט״ו';
  if (num === 16) return 'ט״ז';
  if (num <= 9) return GEMATRIA_UNITS[num] + '׳';
  if (num === 10) return 'י׳';
  if (num === 20) return 'כ׳';
  if (num === 30) return 'ל׳';
  const tens = Math.floor(num / 10);
  const units = num % 10;
  if (units === 0) return GEMATRIA_TENS[tens] + '׳';
  return GEMATRIA_TENS[tens] + '״' + GEMATRIA_UNITS[units];
};

const yearToGematria = (year) => {
  const hundreds = Math.floor((year % 1000) / 100);
  const tens = Math.floor((year % 100) / 10);
  const units = year % 10;
  const hundredsLetters = ['', 'ק', 'ר', 'ש', 'ת', 'תק', 'תר', 'תש', 'תת', 'תתק'];
  let result = 'ה';
  result += hundredsLetters[hundreds];
  const lastTwo = (tens * 10) + units;
  if (lastTwo === 15) result += 'ט״ו';
  else if (lastTwo === 16) result += 'ט״ז';
  else {
    if (tens > 0) result += GEMATRIA_TENS[tens];
    if (units > 0) result += '״' + GEMATRIA_UNITS[units];
  }
  return result;
};

const gregorianToHebrew = (gDate) => {
  const hebrewFormatter = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', { day: 'numeric', month: 'long', year: 'numeric' });
  const parts = hebrewFormatter.formatToParts(gDate);
  let day = 1, monthName = '', year = 5785;
  parts.forEach(part => {
    if (part.type === 'day') day = parseInt(part.value);
    if (part.type === 'month') monthName = part.value;
    if (part.type === 'year') year = parseInt(part.value);
  });
  return { year, day, monthName, dayOfWeek: HEBREW_DAYS[gDate.getDay()], gematriaDay: numberToGematria(day), gematriaYear: yearToGematria(year) };
};

const formatGregorianDate = (date = new Date()) => date.toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 2: STYLES - עיצוב CSS                                               ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap');
  
  /* --- 2.1 COLORS - צבעים --- */
  :root {
    --primary: #2563eb; --primary-dark: #1d4ed8;
    --success: #10b981; --success-light: #d1fae5;
    --warning: #f59e0b; --warning-light: #fef3c7;
    --danger: #ef4444; --danger-light: #fee2e2;
    --bg-primary: #f8fafc; --bg-card: #ffffff;
    --text-primary: #1e293b; --text-secondary: #64748b; --text-muted: #94a3b8;
    --border: #e2e8f0;
    --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
    --radius: 12px; --radius-lg: 16px;
  }

  /* --- 2.2 BASE - בסיס --- */
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Rubik', sans-serif; background: var(--bg-primary); color: var(--text-primary); direction: rtl; min-height: 100vh; }
  .app-container { max-width: 480px; margin: 0 auto; min-height: 100vh; background: var(--bg-card); position: relative; overflow-x: hidden; }

  /* --- 2.3 ANIMATIONS - אנימציות --- */
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes popIn { 0% { opacity: 0; transform: scale(0.9); } 70% { transform: scale(1.02); } 100% { opacity: 1; transform: scale(1); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .animate-slide-up { animation: slideUp 0.4s ease-out forwards; }

  /* --- 2.4 HEADER - כותרת עליונה --- */
  .header { background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); color: white; padding: 24px 20px; position: relative; }
  .header-date { font-size: 14px; opacity: 0.9; margin-bottom: 4px; }
  .header-hebrew-date { font-size: 24px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
  .header-year { font-size: 14px; opacity: 0.8; margin-top: 4px; }
  .back-btn { position: absolute; top: 16px; right: 16px; width: 40px; height: 40px; border: none; background: rgba(255,255,255,0.2); border-radius: 50%; color: white; cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center; }

  /* --- 2.5 KPI_CARD - כרטיס משימות פתוחות --- */
  .kpi-card { background: var(--bg-card); margin: -20px 16px 16px; padding: 16px 20px; border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); display: flex; align-items: center; justify-content: space-between; position: relative; z-index: 10; }
  .kpi-value { font-size: 36px; font-weight: 700; color: var(--primary); }
  .kpi-label { font-size: 14px; color: var(--text-secondary); }
  .kpi-icon { width: 48px; height: 48px; background: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; }

  /* --- 2.6 CALENDAR - לוח שנה --- */
  .calendar-widget { background: var(--bg-card); margin: 16px; border-radius: var(--radius-lg); box-shadow: var(--shadow); overflow: hidden; }
  .calendar-header { display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid var(--border); }
  .calendar-title { font-weight: 600; font-size: 16px; text-align: center; flex: 1; }
  .calendar-nav { display: flex; gap: 8px; }
  .calendar-nav-btn { width: 32px; height: 32px; border: none; background: var(--bg-primary); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
  .calendar-nav-btn:hover { background: var(--primary); color: white; }
  .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; padding: 12px; }
  .calendar-day-header { text-align: center; font-size: 12px; color: var(--text-muted); padding: 8px 0; font-weight: 500; }
  .calendar-day { aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 14px; border-radius: 8px; cursor: pointer; transition: all 0.2s; position: relative; gap: 2px; }
  .calendar-day:hover { background: var(--bg-primary); }
  .calendar-day.today { background: var(--primary); color: white; font-weight: 600; }
  .calendar-day.has-tasks::after { content: ''; position: absolute; bottom: 4px; width: 4px; height: 4px; background: var(--warning); border-radius: 50%; }
  .calendar-day.today.has-tasks::after { background: white; }
  .calendar-day.other-month { color: var(--text-muted); opacity: 0.5; }
  .calendar-day-hebrew { font-size: 10px; opacity: 0.7; }

  /* --- 2.7 ACTION_BUTTONS - כפתורי פעולה --- */
  .action-buttons { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; padding: 0 16px; margin-bottom: 16px; }
  .action-btn { padding: 16px; border: none; border-radius: var(--radius); cursor: pointer; font-family: inherit; font-size: 14px; font-weight: 500; display: flex; flex-direction: column; align-items: center; gap: 8px; transition: all 0.2s; }
  .action-btn-primary { background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); color: white; grid-column: span 2; }
  .action-btn-primary:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
  .action-btn-secondary { background: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border); }
  .action-btn-secondary:hover { border-color: var(--primary); color: var(--primary); }
  .action-btn-icon { font-size: 24px; }

  /* --- 2.8 TIMER - טיימר --- */
  .timer-container { background: var(--bg-card); padding: 24px; text-align: center; border-bottom: 1px solid var(--border); }
  .timer-display { font-size: 48px; font-weight: 700; color: var(--primary); font-variant-numeric: tabular-nums; }
  .timer-display.warning { color: var(--warning); }
  .timer-display.danger { color: var(--danger); animation: pulse 1s infinite; }
  .timer-label { font-size: 14px; color: var(--text-secondary); margin-top: 4px; }
  .timer-controls { display: flex; justify-content: center; gap: 12px; margin-top: 16px; }
  .timer-btn { padding: 10px 24px; border: none; border-radius: 8px; cursor: pointer; font-family: inherit; font-size: 14px; font-weight: 500; }
  .timer-btn-pause { background: var(--warning); color: white; }
  .timer-btn-skip { background: var(--bg-primary); color: var(--text-secondary); }

  /* --- 2.9 PHASE_NAV - נקודות שלבים --- */
  .phase-nav { display: flex; justify-content: center; gap: 8px; padding: 16px; background: var(--bg-primary); }
  .phase-dot { width: 12px; height: 12px; border-radius: 50%; background: var(--border); transition: all 0.3s; }
  .phase-dot.active { background: var(--primary); transform: scale(1.2); }
  .phase-dot.completed { background: var(--success); }

  /* --- 2.10 STUDY_ITEMS - פריטי לימוד --- */
  .study-list { padding: 16px; }
  .study-item { background: var(--bg-card); border-radius: var(--radius); padding: 16px; margin-bottom: 12px; border: 1px solid var(--border); animation: slideUp 0.3s ease-out forwards; opacity: 0; }
  .study-item:nth-child(1) { animation-delay: 0.05s; }
  .study-item:nth-child(2) { animation-delay: 0.1s; }
  .study-item:nth-child(3) { animation-delay: 0.15s; }
  .study-item:nth-child(4) { animation-delay: 0.2s; }
  .study-item-header { display: flex; justify-content: space-between; align-items: center; }
  .study-item-title { font-weight: 500; display: flex; align-items: center; gap: 8px; }
  .study-item-icon { font-size: 20px; }
  .study-select { padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; font-family: inherit; font-size: 14px; background: var(--bg-primary); cursor: pointer; min-width: 120px; }
  .study-select.completed { background: var(--success-light); border-color: var(--success); color: var(--success); }
  .rambam-quantity { display: flex; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px dashed var(--border); }
  .rambam-btn { flex: 1; padding: 10px; border: 2px solid var(--border); border-radius: 8px; background: var(--bg-card); cursor: pointer; font-family: inherit; font-size: 16px; font-weight: 600; }
  .rambam-btn.selected { border-color: var(--primary); background: var(--primary); color: white; }

  /* --- 2.11 COMM_CHECK - בדיקת תקשורת --- */
  .comm-check { display: flex; justify-content: center; gap: 16px; padding: 20px; background: var(--bg-primary); }
  .comm-item { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; cursor: pointer; transition: all 0.3s; position: relative; }
  .comm-item.whatsapp { background: #dcfce7; color: #22c55e; }
  .comm-item.email { background: #dbeafe; color: #3b82f6; }
  .comm-item.sms { background: #fef3c7; color: #f59e0b; }
  .comm-item.checked { transform: scale(0.9); opacity: 0.6; }
  .comm-item.checked::after { content: '✓'; position: absolute; top: -4px; right: -4px; width: 20px; height: 20px; background: var(--success); color: white; border-radius: 50%; font-size: 12px; display: flex; align-items: center; justify-content: center; }

  /* --- 2.12 TASK_TABS - טאבים של משימות --- */
  .task-tabs { display: flex; padding: 0 16px; border-bottom: 1px solid var(--border); background: var(--bg-card); }
  .task-tab { flex: 1; padding: 14px; border: none; background: none; cursor: pointer; font-family: inherit; font-size: 14px; font-weight: 500; color: var(--text-secondary); position: relative; }
  .task-tab.active { color: var(--primary); }
  .task-tab.active::after { content: ''; position: absolute; bottom: 0; left: 16px; right: 16px; height: 3px; background: var(--primary); border-radius: 3px 3px 0 0; }
  .task-tab-count { background: var(--bg-primary); padding: 2px 8px; border-radius: 10px; font-size: 12px; margin-right: 6px; }
  .task-tab.active .task-tab-count { background: var(--primary); color: white; }

  /* --- 2.13 TASK_LIST - רשימת משימות --- */
  .task-list { padding: 16px; min-height: 200px; }
  .task-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; margin-bottom: 10px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: all 0.2s; animation: slideIn 0.3s ease-out forwards; opacity: 0; }
  .task-item:nth-child(1) { animation-delay: 0.05s; }
  .task-item:nth-child(2) { animation-delay: 0.1s; }
  .task-item:nth-child(3) { animation-delay: 0.15s; }
  .task-item:hover { border-color: var(--primary); box-shadow: var(--shadow); }
  .task-item.done { opacity: 0.6; background: var(--success-light); }
  .task-item.done .task-title { text-decoration: line-through; color: var(--text-muted); }
  .task-checkbox { width: 24px; height: 24px; min-width: 24px; border: 2px solid var(--border); border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; cursor: pointer; }
  .task-item:hover .task-checkbox { border-color: var(--primary); }
  .task-item.done .task-checkbox { background: var(--success); border-color: var(--success); color: white; }
  .task-content { flex: 1; min-width: 0; }
  .task-title { font-weight: 500; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .task-meta { font-size: 12px; color: var(--text-muted); display: flex; gap: 12px; }

  /* --- 2.14 ADD_TASK - הוספת משימה --- */
  .add-task-bar { display: flex; gap: 8px; padding: 16px; background: var(--bg-card); border-top: 1px solid var(--border); position: sticky; bottom: 0; }
  .add-task-input { flex: 1; padding: 12px 16px; border: 1px solid var(--border); border-radius: var(--radius); font-family: inherit; font-size: 14px; background: var(--bg-primary); }
  .add-task-input:focus { outline: none; border-color: var(--primary); }
  .add-task-btn { padding: 12px 20px; border: none; border-radius: var(--radius); background: var(--primary); color: white; cursor: pointer; font-family: inherit; font-size: 14px; font-weight: 500; }

  /* --- 2.15 FOCUS_TASK - משימה בפוקוס --- */
  .focus-task-container { padding: 24px; text-align: center; }
  .focus-task-card { background: var(--bg-card); border-radius: var(--radius-lg); padding: 32px 24px; box-shadow: var(--shadow-lg); animation: popIn 0.4s ease-out; }
  .focus-task-label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
  .focus-task-title { font-size: 24px; font-weight: 600; margin-bottom: 12px; line-height: 1.4; }
  .focus-task-description { color: var(--text-secondary); font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
  .focus-task-btn { padding: 16px 32px; border: none; border-radius: var(--radius); background: var(--success); color: white; cursor: pointer; font-family: inherit; font-size: 16px; font-weight: 600; }
  .focus-task-progress { margin-top: 24px; font-size: 14px; color: var(--text-muted); }

  /* --- 2.16 MODAL - חלון קופץ --- */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: flex-end; justify-content: center; z-index: 1000; animation: fadeIn 0.2s ease-out; }
  .modal-content { background: var(--bg-card); width: 100%; max-width: 480px; max-height: 90vh; border-radius: var(--radius-lg) var(--radius-lg) 0 0; overflow: hidden; animation: slideUp 0.3s ease-out; }
  .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid var(--border); }
  .modal-title { font-weight: 600; font-size: 18px; }
  .modal-close { width: 36px; height: 36px; border: none; background: var(--bg-primary); border-radius: 50%; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; }
  .modal-body { padding: 20px; overflow-y: auto; max-height: 60vh; }

  /* --- 2.17 FORM - טפסים --- */
  .form-group { margin-bottom: 20px; }
  .form-label { display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: var(--text-secondary); }
  .form-input { width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: var(--radius); font-family: inherit; font-size: 14px; }
  .form-input:focus { outline: none; border-color: var(--primary); }
  .form-textarea { resize: vertical; min-height: 100px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  /* --- 2.18 COMPLETION - אפשרויות השלמה --- */
  .completion-options { display: flex; flex-direction: column; gap: 12px; }
  .completion-btn { padding: 16px 20px; border: 2px solid var(--border); border-radius: var(--radius); background: var(--bg-card); cursor: pointer; font-family: inherit; font-size: 14px; display: flex; align-items: center; gap: 12px; text-align: right; }
  .completion-btn:hover { border-color: var(--primary); }
  .completion-btn.success { border-color: var(--success); background: var(--success-light); }
  .completion-btn.success:hover { background: var(--success); color: white; }
  .completion-btn-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
  .completion-btn.success .completion-btn-icon { background: var(--success); color: white; }
  .completion-btn.postpone .completion-btn-icon { background: var(--warning-light); color: var(--warning); }
  .completion-btn.cancel .completion-btn-icon { background: var(--bg-primary); color: var(--text-muted); }
  .date-picker-container { margin-top: 12px; padding: 12px; background: var(--bg-primary); border-radius: 8px; }

  /* --- 2.19 DONATIONS - צדקה --- */
  .donations-container { padding: 16px; }
  .add-donation-form { background: var(--bg-primary); border-radius: var(--radius); padding: 16px; margin-bottom: 16px; }
  .donation-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; margin-bottom: 12px; display: flex; align-items: center; gap: 12px; }
  .donation-item.completed { background: var(--success-light); border-color: var(--success); }
  .donation-checkbox { width: 24px; height: 24px; border: 2px solid var(--border); border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
  .donation-item.completed .donation-checkbox { background: var(--success); border-color: var(--success); color: white; }
  .donation-content { flex: 1; }
  .donation-amount { font-weight: 600; font-size: 18px; color: var(--primary); }
  .donation-purpose { font-size: 14px; color: var(--text-secondary); margin-top: 2px; }
  .donation-date { font-size: 12px; color: var(--text-muted); }
  .donation-delete { width: 32px; height: 32px; border: none; background: var(--danger-light); color: var(--danger); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; }

  /* --- 2.20 SETTINGS & HISTORY - הגדרות והיסטוריה --- */
  .settings-container { padding: 16px; }
  .settings-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; margin-bottom: 12px; }
  .settings-item-header { display: flex; justify-content: space-between; align-items: center; }
  .settings-item-title { font-weight: 500; }
  .settings-item-desc { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
  .history-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; margin-bottom: 12px; }
  .history-date { font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
  .history-stats { display: flex; gap: 16px; font-size: 14px; color: var(--text-secondary); }

  /* --- 2.21 MISC - שונות --- */
  .next-btn-container { padding: 16px; background: var(--bg-card); border-top: 1px solid var(--border); }
  .next-btn { width: 100%; padding: 16px; border: none; border-radius: var(--radius); background: var(--primary); color: white; cursor: pointer; font-family: inherit; font-size: 16px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .next-btn:disabled { background: var(--text-muted); cursor: not-allowed; }
  .empty-state { text-align: center; padding: 48px 24px; color: var(--text-muted); }
  .empty-state-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
  .notification { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: var(--text-primary); color: white; padding: 12px 24px; border-radius: var(--radius); box-shadow: var(--shadow-lg); z-index: 2000; animation: slideUp 0.3s ease-out; }
  .notification.success { background: var(--success); }
  .notification.warning { background: var(--warning); }
  .notification.error { background: var(--danger); }
`;


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 3: STATE - משתנים ו-State                                           ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

const DailyRoutineManager = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [currentPhase, setCurrentPhase] = useState(1);
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: 'לענות למיילים דחופים', tab: 0, status: 'pending', date: new Date().toISOString().split('T')[0] },
      { id: 2, title: 'לבדוק הודעות WhatsApp', tab: 0, status: 'pending', date: new Date().toISOString().split('T')[0] },
      { id: 3, title: 'פגישה עם צוות הפיתוח', tab: 1, status: 'pending', date: new Date().toISOString().split('T')[0], description: 'דיון על התקדמות הפרויקט' },
    ];
  });
  const [donations, setDonations] = useState(() => {
    const saved = localStorage.getItem('donations');
    return saved ? JSON.parse(saved) : [];
  });
  const [studies, setStudies] = useState({ chumash: null, tanya: null, rambam: null, rambamCount: null, hayomYom: null });
  const [commChecks, setCommChecks] = useState({ whatsapp: false, email: false, sms: false });
  const [activeTab, setActiveTab] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [timerPaused, setTimerPaused] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [showModal, setShowModal] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [notification, setNotification] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [showHebrewCalendar, setShowHebrewCalendar] = useState(true);
  const [postponeDate, setPostponeDate] = useState('');
  const [newDonation, setNewDonation] = useState({ amount: '', purpose: '' });
  const [showPostpone, setShowPostpone] = useState(false);
  const [endOfDayTime, setEndOfDayTime] = useState(() => localStorage.getItem('endOfDayTime') || '18:00');
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('geminiKey') || '');
  const audioRef = useRef(null);

  const today = new Date().toISOString().split('T')[0];
  const hebrewDate = gregorianToHebrew(new Date());
  const gregorianDate = formatGregorianDate();
  const phaseTimers = { 1: 120, 2: 900, 3: 1500, 4: 1800 };
  const openTasks = tasks.filter(t => t.status !== 'done' && t.date <= today).length;
  const pendingDonations = donations.filter(d => !d.completed);


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 4: FUNCTIONS - פונקציות עזר                                         ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

  useEffect(() => { localStorage.setItem('tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('donations', JSON.stringify(donations)); }, [donations]);
  useEffect(() => {
    if (currentScreen === 'routine' && !timerPaused && timerSeconds > 0) {
      const interval = setInterval(() => setTimerSeconds(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [currentScreen, timerPaused, timerSeconds]);

  const showNotificationMessage = (message, type = 'info') => { setNotification({ message, type }); setTimeout(() => setNotification(null), 3000); };
  const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  const getTimerClass = () => timerSeconds <= 30 ? 'danger' : timerSeconds <= 60 ? 'warning' : '';

  const startRoutine = () => { setCurrentScreen('routine'); setCurrentPhase(1); setTimerSeconds(phaseTimers[1]); setTimerPaused(false); setStudies({ chumash: null, tanya: null, rambam: null, rambamCount: null, hayomYom: null }); setCommChecks({ whatsapp: false, email: false, sms: false }); setCurrentTaskIndex(0); };
  const canProceedPhase1 = () => { const { chumash, tanya, rambam, rambamCount, hayomYom } = studies; if (!chumash || !tanya || !rambam || !hayomYom) return false; if (rambam === 'done' && !rambamCount) return false; return true; };
  const canProceedPhase2 = () => commChecks.whatsapp && commChecks.email && commChecks.sms;
  const nextPhase = () => { if (currentPhase < 4) { const next = currentPhase + 1; setCurrentPhase(next); setTimerSeconds(phaseTimers[next]); setTimerPaused(false); } else { showNotificationMessage('סיימת את הרוטינה היומית! 🎉', 'success'); setCurrentScreen('home'); } };

  const addTask = () => { if (!newTaskTitle.trim()) return; setTasks([...tasks, { id: Date.now(), title: newTaskTitle.trim(), tab: activeTab, status: 'pending', date: today, description: '', reminderTime: null }]); setNewTaskTitle(''); showNotificationMessage('משימה נוספה!', 'success'); };
  const updateTask = (updatedTask) => { setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t)); closeModal(); };
  const deleteTask = (taskId) => { setTasks(tasks.filter(t => t.id !== taskId)); closeModal(); showNotificationMessage('משימה נמחקה', 'info'); };
  const closeModal = () => { setShowModal(null); setEditingTask(null); setPostponeDate(''); setShowPostpone(false); };
  const handleTaskComplete = (task, action, newDate = null) => { if (action === 'complete') { setTasks(tasks.map(t => t.id === task.id ? { ...t, status: 'done' } : t)); showNotificationMessage('משימה הושלמה! ✓', 'success'); if (currentPhase === 4) { setCurrentTaskIndex(prev => prev + 1); setTimerSeconds(phaseTimers[4]); } } else if (action === 'postpone' && newDate) { setTasks(tasks.map(t => t.id === task.id ? { ...t, date: newDate, status: 'pending' } : t)); showNotificationMessage('משימה הועברה לתאריך אחר', 'info'); } closeModal(); };

  const addDonation = () => { if (!newDonation.amount || !newDonation.purpose) return; setDonations([{ id: Date.now(), amount: parseFloat(newDonation.amount), purpose: newDonation.purpose, date: today, completed: false }, ...donations]); setNewDonation({ amount: '', purpose: '' }); showNotificationMessage('נוסף!', 'success'); };
  const toggleDonation = (id) => setDonations(donations.map(d => d.id === id ? { ...d, completed: !d.completed } : d));
  const deleteDonation = (id) => { setDonations(donations.filter(d => d.id !== id)); showNotificationMessage('נמחק', 'info'); };

  const getDaysInMonth = (date) => { const year = date.getFullYear(), month = date.getMonth(); const firstDay = new Date(year, month, 1), lastDay = new Date(year, month + 1, 0); const days = []; for (let i = firstDay.getDay() - 1; i >= 0; i--) days.push({ date: new Date(year, month, -i), otherMonth: true }); for (let i = 1; i <= lastDay.getDate(); i++) days.push({ date: new Date(year, month, i), otherMonth: false }); const remaining = 42 - days.length; for (let i = 1; i <= remaining; i++) days.push({ date: new Date(year, month + 1, i), otherMonth: true }); return days; };
  const getTasksForDate = (date) => tasks.filter(t => t.date === date.toISOString().split('T')[0]);


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 5: TIMER - טיימר ונקודות שלב                                        ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

  const renderHeader = (showBack = false, title = null) => {
    const todayDate = new Date();
    const hDate = gregorianToHebrew(todayDate);
    const gDateStr = todayDate.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric', year: 'numeric' });
    return (
      <div className="header">
        {showBack && <button className="back-btn" onClick={() => setCurrentScreen('home')}>←</button>}
        {title ? <div className="header-hebrew-date">{title}</div> : (
          <div className="header-hebrew-date">
            <span>יום {hDate.dayOfWeek}</span>
            <span>•</span>
            <span>{hDate.gematriaDay} {hDate.monthName}</span>
            <span>•</span>
            <span>{gDateStr}</span>
          </div>
        )}
      </div>
    );
  };

  const renderTimer = () => (<div className="timer-container"><div className={`timer-display ${getTimerClass()}`}>{formatTime(timerSeconds)}</div><div className="timer-label">שלב {currentPhase} מתוך 4</div><div className="timer-controls"><button className="timer-btn timer-btn-pause" onClick={() => setTimerPaused(!timerPaused)}>{timerPaused ? '▶ המשך' : '⏸ השהה'}</button><button className="timer-btn timer-btn-skip" onClick={nextPhase}>דלג ←</button></div></div>);

  const renderPhaseNav = () => (<div className="phase-nav">{[1, 2, 3, 4].map(phase => (<div key={phase} className={`phase-dot ${phase === currentPhase ? 'active' : ''} ${phase < currentPhase ? 'completed' : ''}`} />))}</div>);


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 6: PHASE1 - שלב 1: שיעורים יומיים                                   ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

  const renderPhase1 = () => (
    <div className="study-list">
      <h3 style={{ marginBottom: 16, color: 'var(--text-secondary)' }}>שיעורים יומיים</h3>
      {[{ key: 'chumash', icon: '📖', title: 'חומש עם רש"י' }, { key: 'tanya', icon: '📚', title: 'תניא' }, { key: 'rambam', icon: '⚖️', title: 'רמב"ם' }, { key: 'hayomYom', icon: '📅', title: 'היום יום' }].map(item => (
        <div key={item.key} className="study-item">
          <div className="study-item-header">
            <div className="study-item-title"><span className="study-item-icon">{item.icon}</span>{item.title}</div>
            <select className={`study-select ${studies[item.key] === 'done' ? 'completed' : ''}`} value={studies[item.key] || ''} onChange={(e) => setStudies({ ...studies, [item.key]: e.target.value || null })}><option value="">בחר סטטוס</option><option value="not_yet">עדיין לא</option><option value="done">למדתי ✓</option></select>
          </div>
          {item.key === 'rambam' && studies.rambam === 'done' && (<div className="rambam-quantity">{[1, 2, 3].map(num => (<button key={num} className={`rambam-btn ${studies.rambamCount === num ? 'selected' : ''}`} onClick={() => setStudies({ ...studies, rambamCount: num })}>{num} פרק{num > 1 ? 'ים' : ''}</button>))}</div>)}
        </div>
      ))}
      <div className="next-btn-container"><button className="next-btn" disabled={!canProceedPhase1()} onClick={nextPhase}>המשך לשלב הבא ←</button></div>
    </div>
  );


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 7: PHASE2 - שלב 2: תקשורת + סקירת משימות                            ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

  const renderPhase2 = () => (
    <>
      <div className="comm-check">
        <div className={`comm-item whatsapp ${commChecks.whatsapp ? 'checked' : ''}`} onClick={() => setCommChecks({ ...commChecks, whatsapp: !commChecks.whatsapp })}>💬</div>
        <div className={`comm-item email ${commChecks.email ? 'checked' : ''}`} onClick={() => setCommChecks({ ...commChecks, email: !commChecks.email })}>✉️</div>
        <div className={`comm-item sms ${commChecks.sms ? 'checked' : ''}`} onClick={() => setCommChecks({ ...commChecks, sms: !commChecks.sms })}>📱</div>
      </div>
      <div className="task-tabs">
        <button className={`task-tab ${activeTab === 0 ? 'active' : ''}`} onClick={() => setActiveTab(0)}><span className="task-tab-count">{tasks.filter(t => t.tab === 0 && t.status !== 'done').length}</span>משימות מהירות</button>
        <button className={`task-tab ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}><span className="task-tab-count">{tasks.filter(t => t.tab === 1 && t.status !== 'done').length}</span>משימות יומיות</button>
      </div>
      <div className="task-list">
        {tasks.filter(t => t.tab === activeTab && t.date <= today).map(task => (
          <div key={task.id} className={`task-item ${task.status === 'done' ? 'done' : ''}`}>
            <div 
              className="task-checkbox" 
              onClick={(e) => { 
                e.stopPropagation(); 
                const taskCopy = {...task};
                setEditingTask(taskCopy); 
                setTimeout(() => setShowModal('complete'), 0);
              }}
            >
              {task.status === 'done' && '✓'}
            </div>
            <div className="task-content" onClick={() => { setEditingTask({...task}); setShowModal('editTask'); }}>
              <div className="task-title">{task.title}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="add-task-bar"><input type="text" className="add-task-input" placeholder="הוסף משימה חדשה..." value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addTask()} /><button className="add-task-btn" onClick={addTask}>+ הוסף</button></div>
      <div className="next-btn-container"><button className="next-btn" disabled={!canProceedPhase2()} onClick={nextPhase}>המשך לביצוע משימות ←</button></div>
    </>
  );


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 8: PHASE3 - שלב 3: ביצוע משימות מהירות                              ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

  const renderPhase3 = () => {
    const quickTasks = tasks.filter(t => t.tab === 0 && t.date <= today && t.status !== 'done');
    return (
      <div className="task-list">
        <h3 style={{ marginBottom: 16, color: 'var(--text-secondary)' }}>משימות מהירות לביצוע</h3>
        {quickTasks.length === 0 ? (<div className="empty-state"><div className="empty-state-icon">🎉</div><p>כל המשימות המהירות הושלמו!</p><button className="next-btn" style={{ marginTop: 20 }} onClick={nextPhase}>המשך לשלב הבא ←</button></div>) : (<>{quickTasks.map(task => (<div key={task.id} className="task-item"><div className="task-checkbox" onClick={(e) => { e.stopPropagation(); const taskCopy = {...task}; setEditingTask(taskCopy); setTimeout(() => setShowModal('complete'), 0); }}></div><div className="task-content" onClick={() => { setEditingTask({...task}); setShowModal('editTask'); }}><div className="task-title">{task.title}</div>{task.description && <div className="task-meta">{task.description.substring(0, 50)}...</div>}</div></div>))}<div className="next-btn-container"><button className="next-btn" onClick={nextPhase}>המשך לשלב הבא ←</button></div></>)}
      </div>
    );
  };


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 9: PHASE4 - שלב 4: משימה בפוקוס                                     ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

  const renderPhase4 = () => {
    const dailyTasks = tasks.filter(t => t.tab === 1 && t.date <= today && t.status !== 'done');
    return (
      <div className="task-list">
        <h3 style={{ marginBottom: 16, color: 'var(--text-secondary)' }}>משימות יומיות לביצוע</h3>
        {dailyTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎉</div>
            <p>כל המשימות היומיות הושלמו!</p>
            <button className="next-btn" style={{ marginTop: 20 }} onClick={nextPhase}>סיים רוטינה ←</button>
          </div>
        ) : (
          <>
            {dailyTasks.map(task => (
              <div key={task.id} className="task-item">
                <div className="task-checkbox" onClick={(e) => { e.stopPropagation(); const taskCopy = {...task}; setEditingTask(taskCopy); setTimeout(() => setShowModal('complete'), 0); }}></div>
                <div className="task-content" onClick={() => { setEditingTask({...task}); setShowModal('editTask'); }}>
                  <div className="task-title">{task.title}</div>
                  {task.description && <div className="task-meta">{task.description.substring(0, 50)}...</div>}
                </div>
              </div>
            ))}
            <div className="next-btn-container"><button className="next-btn" onClick={nextPhase}>סיים רוטינה ←</button></div>
          </>
        )}
      </div>
    );
  };


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 10: HOME_SCREEN - מסך הבית                                          ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

  const renderHomeScreen = () => (
    <>
      {renderHeader()}
      <div className="kpi-card animate-slide-up"><div><div className="kpi-value">{openTasks}</div><div className="kpi-label">משימות פתוחות</div></div><div className="kpi-icon">📋</div></div>
      <div className="calendar-widget animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="calendar-header">
          <div className="calendar-nav"><button className="calendar-nav-btn" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}>→</button><button className="calendar-nav-btn" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}>←</button></div>
          <div className="calendar-title">{showHebrewCalendar ? (() => { const h = gregorianToHebrew(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 15)); return `${h.monthName} ${h.gematriaYear}`; })() : calendarMonth.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}</div>
          <button className="calendar-nav-btn" onClick={() => setShowHebrewCalendar(!showHebrewCalendar)}>{showHebrewCalendar ? '📅' : '🔯'}</button>
        </div>
        <div className="calendar-grid">
          {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map(day => <div key={day} className="calendar-day-header">{day}</div>)}
          {getDaysInMonth(calendarMonth).map((day, idx) => { const dateStr = day.date.toISOString().split('T')[0]; const isToday = dateStr === today; const dayTasks = getTasksForDate(day.date); const hDate = gregorianToHebrew(day.date); return (<div key={idx} className={`calendar-day ${day.otherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${dayTasks.length > 0 ? 'has-tasks' : ''}`} onClick={() => { if (dayTasks.length > 0) alert(`משימות ל-${day.date.toLocaleDateString('he-IL')}:\n\n${dayTasks.map(t => `• ${t.title}`).join('\n')}`); }}><span>{showHebrewCalendar ? day.date.getDate() : hDate.gematriaDay}</span></div>); })}
        </div>
      </div>
      <div className="action-buttons">
        <button className="action-btn action-btn-primary" onClick={startRoutine}><span className="action-btn-icon">▶️</span>התחל רוטינה יומית</button>
        <button className="action-btn action-btn-secondary" onClick={() => setCurrentScreen('tasks')}><span className="action-btn-icon">📋</span>ניהול משימות</button>
        <button className="action-btn action-btn-secondary" onClick={() => setCurrentScreen('donations')}><span className="action-btn-icon">💝</span>צדקה{pendingDonations.length > 0 && <span style={{ background: 'var(--danger)', color: 'white', padding: '2px 6px', borderRadius: 10, fontSize: 11, marginRight: 4 }}>{pendingDonations.length}</span>}</button>
        <button className="action-btn action-btn-secondary" onClick={() => setCurrentScreen('history')}><span className="action-btn-icon">📊</span>היסטוריה</button>
        <button className="action-btn action-btn-secondary" onClick={() => setCurrentScreen('settings')} style={{ gridColumn: 'span 2' }}><span className="action-btn-icon">⚙️</span>הגדרות</button>
      </div>
    </>
  );


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 11: TASKS_SCREEN - מסך ניהול משימות                                 ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

  const renderTasksScreen = () => (
    <>
      {renderHeader(true, 'ניהול משימות')}
      <div className="task-tabs">
        <button className={`task-tab ${activeTab === 0 ? 'active' : ''}`} onClick={() => setActiveTab(0)}>
          <span className="task-tab-count">{tasks.filter(t => t.tab === 0 && t.status !== 'done').length}</span>מהירות
        </button>
        <button className={`task-tab ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}>
          <span className="task-tab-count">{tasks.filter(t => t.tab === 1 && t.status !== 'done').length}</span>יומיות
        </button>
      </div>
      <div className="task-list">
        {tasks.filter(t => t.tab === activeTab).map(task => (
          <div key={task.id} className={`task-item ${task.status === 'done' ? 'done' : ''}`}>
            <div 
              className="task-checkbox" 
              onClick={(e) => { 
                e.stopPropagation(); 
                const taskCopy = {...task};
                setEditingTask(taskCopy); 
                setTimeout(() => setShowModal('complete'), 0);
              }}
            >
              {task.status === 'done' && '✓'}
            </div>
            <div className="task-content" onClick={() => { setEditingTask({...task}); setShowModal('editTask'); }}>
              <div className="task-title">{task.title}</div>
              <div className="task-meta"><span>📅 {new Date(task.date).toLocaleDateString('he-IL')}</span></div>
            </div>
          </div>
        ))}
      </div>
      <div className="add-task-bar">
        <input type="text" className="add-task-input" placeholder="הוסף משימה חדשה..." value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addTask()} />
        <button className="add-task-btn" onClick={addTask}>+ הוסף</button>
      </div>
    </>
  );


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 12: DONATIONS_SCREEN - מסך צדקה                                     ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

  const renderDonationsScreen = () => (
    <>
      {renderHeader(true, 'צדקה')}
      <div className="donations-container">
        <div className="add-donation-form">
          <h4 style={{ marginBottom: 12, color: 'var(--text-secondary)' }}>רשום התחייבות חדשה</h4>
          <div className="form-group" style={{ marginBottom: 12 }}><input type="number" className="form-input" placeholder="סכום ₪" value={newDonation.amount} onChange={(e) => setNewDonation({ ...newDonation, amount: e.target.value })} /></div>
          <div className="form-group" style={{ marginBottom: 12 }}><input type="text" className="form-input" placeholder="לאן / מטרה" value={newDonation.purpose} onChange={(e) => setNewDonation({ ...newDonation, purpose: e.target.value })} /></div>
          <button className="next-btn" onClick={addDonation} disabled={!newDonation.amount || !newDonation.purpose}>+ הוסף</button>
        </div>
        {donations.length === 0 ? <div className="empty-state"><div className="empty-state-icon">💝</div><p>אין רשומות</p></div> : donations.map(donation => (<div key={donation.id} className={`donation-item ${donation.completed ? 'completed' : ''}`}><div className="donation-checkbox" onClick={() => toggleDonation(donation.id)}>{donation.completed && '✓'}</div><div className="donation-content"><div className="donation-amount">₪{donation.amount.toLocaleString()}</div><div className="donation-purpose">{donation.purpose}</div><div className="donation-date">{new Date(donation.date).toLocaleDateString('he-IL')}</div></div><button className="donation-delete" onClick={() => deleteDonation(donation.id)}>🗑️</button></div>))}
      </div>
    </>
  );


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 13: HISTORY_SCREEN - מסך היסטוריה                                   ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

  const renderHistoryScreen = () => (
    <>
      {renderHeader(true, 'היסטוריה')}
      <div className="settings-container">
        {[...Array(7)].map((_, i) => { const date = new Date(); date.setDate(date.getDate() - i); return date; }).map(date => { const dateStr = date.toISOString().split('T')[0]; const dayTasks = tasks.filter(t => t.date === dateStr); const completed = dayTasks.filter(t => t.status === 'done').length; const hDate = gregorianToHebrew(date); return (<div key={dateStr} className="history-item"><div className="history-date">📅 {date.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}<span style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 8 }}>({hDate.gematriaDay} {hDate.monthName})</span></div><div className="history-stats"><span>✓ {completed} הושלמו</span><span>📋 {dayTasks.length} סה"כ</span></div></div>); })}
      </div>
    </>
  );


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 14: SETTINGS_SCREEN - מסך הגדרות                                    ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

  const renderSettingsScreen = () => (
    <>
      {renderHeader(true, 'הגדרות')}
      <div className="settings-container">
        <div className="settings-item"><div className="settings-item-header"><div><div className="settings-item-title">שעת סיום יום עבודה</div><div className="settings-item-desc">תזכורת תישלח 20 דקות לפני</div></div><input type="time" className="form-input" style={{ width: 100 }} value={endOfDayTime} onChange={(e) => { setEndOfDayTime(e.target.value); localStorage.setItem('endOfDayTime', e.target.value); }} /></div></div>
        <div className="settings-item"><div className="settings-item-title">מפתח API של Gemini</div><div className="settings-item-desc">לשימוש בפירוק משימות אוטומטי</div><input type="password" className="form-input" style={{ marginTop: 12 }} placeholder="הזן מפתח API..." value={geminiKey} onChange={(e) => { setGeminiKey(e.target.value); localStorage.setItem('geminiKey', e.target.value); }} /></div>
        <div className="settings-item"><div className="settings-item-header"><div><div className="settings-item-title">איפוס נתונים</div><div className="settings-item-desc">מחיקת כל המשימות והנתונים</div></div><button className="timer-btn" style={{ background: 'var(--danger)' }} onClick={() => { if (window.confirm('האם למחוק את כל הנתונים?')) { localStorage.clear(); setTasks([]); setDonations([]); showNotificationMessage('הנתונים נמחקו', 'info'); } }}>אפס</button></div></div>
      </div>
    </>
  );


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 15: MODALS - חלונות עריכה והשלמה                                    ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

  const renderEditTaskModal = () => {
    if (!editingTask) return null;
    return (<div className="modal-overlay" onClick={closeModal}><div className="modal-content" onClick={e => e.stopPropagation()}><div className="modal-header"><div className="modal-title">עריכת משימה</div><button className="modal-close" onClick={closeModal}>✕</button></div><div className="modal-body"><div className="form-group"><label className="form-label">כותרת</label><input type="text" className="form-input" value={editingTask.title || ''} onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })} /></div><div className="form-group"><label className="form-label">תיאור</label><textarea className="form-input form-textarea" value={editingTask.description || ''} onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })} placeholder="תיאור המשימה..." /></div><div className="form-row"><div className="form-group"><label className="form-label">תאריך</label><input type="date" className="form-input" value={editingTask.date || ''} onChange={(e) => setEditingTask({ ...editingTask, date: e.target.value })} /></div><div className="form-group"><label className="form-label">תזכורת</label><input type="time" className="form-input" value={editingTask.reminderTime || ''} onChange={(e) => setEditingTask({ ...editingTask, reminderTime: e.target.value || null })} /></div></div><div className="form-group"><label className="form-label">סוג משימה</label><select className="form-input" value={editingTask.tab || 0} onChange={(e) => setEditingTask({ ...editingTask, tab: parseInt(e.target.value) })}><option value={0}>משימה מהירה</option><option value={1}>משימה יומית</option></select></div><div style={{ display: 'flex', gap: 12, marginTop: 24 }}><button className="next-btn" style={{ flex: 1 }} onClick={() => updateTask(editingTask)}>שמור שינויים</button><button className="timer-btn" style={{ background: 'var(--danger)' }} onClick={() => deleteTask(editingTask.id)}>🗑️</button></div></div></div></div>);
  };

  const renderCompletionModal = () => {
    if (!editingTask || !editingTask.id) return null;
    return (<div className="modal-overlay" onClick={closeModal}><div className="modal-content" onClick={e => e.stopPropagation()}><div className="modal-header"><div className="modal-title">סיום משימה</div><button className="modal-close" onClick={closeModal}>✕</button></div><div className="modal-body"><p style={{ marginBottom: 20, color: 'var(--text-secondary)' }}>מה הסטטוס של המשימה "<strong>{editingTask.title}</strong>"?</p><div className="completion-options"><button className="completion-btn success" onClick={() => handleTaskComplete(editingTask, 'complete')}><div className="completion-btn-icon">✓</div><div><div style={{ fontWeight: 600 }}>הושלם בהצלחה</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>סמן את המשימה כמבוצעת</div></div></button><button className="completion-btn postpone" onClick={() => setShowPostpone(!showPostpone)}><div className="completion-btn-icon">📅</div><div><div style={{ fontWeight: 600 }}>המשך טיפול</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>העבר לתאריך אחר</div></div></button>{showPostpone && (<div className="date-picker-container"><input type="date" className="form-input" value={postponeDate} onChange={(e) => setPostponeDate(e.target.value)} min={today} /><button className="next-btn" style={{ marginTop: 8 }} onClick={() => { if (postponeDate) handleTaskComplete(editingTask, 'postpone', postponeDate); }} disabled={!postponeDate}>העבר לתאריך זה</button></div>)}<button className="completion-btn cancel" onClick={closeModal}><div className="completion-btn-icon">↩️</div><div><div style={{ fontWeight: 600 }}>השאר להיום</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>חזור למשימות</div></div></button></div></div></div></div>);
  };

  const renderRoutineScreen = () => (<><div className="header"><button className="back-btn" onClick={() => setCurrentScreen('home')}>✕</button><div className="header-hebrew-date">רוטינה יומית</div><div className="header-date">{gregorianDate}</div></div>{renderPhaseNav()}{renderTimer()}{currentPhase === 1 && renderPhase1()}{currentPhase === 2 && renderPhase2()}{currentPhase === 3 && renderPhase3()}{currentPhase === 4 && renderPhase4()}</>);


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 16: MAIN_RENDER - רנדור ראשי                                        ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

  return (
    <>
      <style>{styles}</style>
      <div className="app-container">
        {currentScreen === 'home' && renderHomeScreen()}
        {currentScreen === 'routine' && renderRoutineScreen()}
        {currentScreen === 'tasks' && renderTasksScreen()}
        {currentScreen === 'donations' && renderDonationsScreen()}
        {currentScreen === 'history' && renderHistoryScreen()}
        {currentScreen === 'settings' && renderSettingsScreen()}
        {showModal === 'editTask' && renderEditTaskModal()}
        {showModal === 'complete' && renderCompletionModal()}
        {notification && <div className={`notification ${notification.type}`}>{notification.message}</div>}
        <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1s" />
      </div>
    </>
  );
};

const App = DailyRoutineManager;
export default App;
