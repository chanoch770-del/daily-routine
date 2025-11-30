import React, { useState, useEffect, useRef, useCallback } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { signInWithRedirect, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { db, auth, googleProvider, GEMINI_API_KEY } from './firebase';

/*
╔══════════════════════════════════════════════════════════════════════════════╗
║                              LifeOS v2.0                                      ║
║                     Personal Productivity System                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  SECTION 1:  TRANSLATIONS    - Hebrew & English texts                        ║
║  SECTION 2:  STYLES          - Google Material Design CSS                    ║
║  SECTION 3:  HELPERS         - Hebrew calendar, utilities                    ║
║  SECTION 4:  COMPONENT       - Main LifeOS component                         ║
║  SECTION 5:  STATE           - All state variables                           ║
║  SECTION 6:  EFFECTS         - useEffect hooks                               ║
║  SECTION 7:  HANDLERS        - Event handlers & functions                    ║
║  SECTION 8:  RENDER_COMMON   - Shared UI components                          ║
║  SECTION 9:  RENDER_ONBOARD  - Path selection & FRX                          ║
║  SECTION 10: RENDER_DOER     - Doer dashboard & execution                    ║
║  SECTION 11: RENDER_PLANNER  - Planner dashboard & timeline                  ║
║  SECTION 12: RENDER_SCREENS  - Settings, History, Lists                      ║
║  SECTION 13: RENDER_MODALS   - All modals                                    ║
║  SECTION 14: MAIN_RENDER     - Main render function                          ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 1: TRANSLATIONS - Hebrew & English                                  ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

const translations = {
  he: {
    // App
    appName: 'LifeOS',
    
    // Path Selection
    pathSelectionTitle: 'ברוכים הבאים! איך אתם מעדיפים לנהל את היום?',
    doerTitle: 'פוקוס יומי',
    doerDesc: 'אני רוצה לקום בבוקר, לראות רשימת משימות פשוטה, ולהתחיל לרוץ. בלי יומנים מסובכים.',
    plannerTitle: 'תכנון חכם',
    plannerDesc: 'הלו"ז שלי עמוס. אני צריך יומן ויזואלי ועוזר AI שיעזור לי לשבץ משימות ופגישות.',
    saveAndStart: 'שמור והתחל',
    
    // FRX - Doer
    anchorsQuestion: 'מהם הדברים שאתה עושה כל יום, חובה?',
    sprintQuestion: 'האם אתה רוצה להתחיל את היום ב׳ניקוי שולחן׳ של משימות קצרות?',
    finishSetup: 'סיים הגדרה',
    
    // FRX - Planner
    workFrameTitle: 'מסגרת עבודה',
    workFrameDesc: 'הגדר שעות וימי עבודה כדי שה-AI לא ישבץ משימות בלילה',
    anchorsTimeQuestion: 'מתי בערך קורים הדברים הקבועים?',
    anchorsNote: 'אלו רק עוגנים, תוכל להזיז אותם ביומן כל יום.',
    connectCalendar: 'חבר את Google Calendar',
    
    // Anchors
    anchors: 'עוגנים',
    shacharit: 'שחרית',
    mincha: 'מנחה',
    maariv: 'מעריב',
    chitat: 'חת"ת',
    rambam: 'רמב"ם',
    dafYomi: 'דף יומי',
    customAnchor: 'עוגן אישי',
    addAnchor: 'הוסף עוגן',
    
    // Morning Wizard
    morningWizardTitle: 'בוקר טוב! מה בתוכנית להיום?',
    selectAnchors: 'עוגנים להיום',
    selectSprintTasks: 'משימות לספרינט',
    selectFocusTasks: 'משימות פוקוס (1-3)',
    
    // Execution Mode
    startDay: 'התחל סדר יום',
    goForIt: 'צא לדרך',
    finishDay: 'סיים סדר יום',
    anchorsChecklist: 'צ׳קליסט עוגנים',
    sprintTimer: 'ספרינט מהיר',
    focusMode: 'מצב פוקוס',
    congrats: 'כל הכבוד!',
    youEarned: 'הרווחת',
    
    // Planner
    autoSchedule: 'שיבוץ אוטומטי',
    reschedule: 'סדר מחדש',
    drawer: 'מגירת משימות',
    timeline: 'יומן',
    today: 'היום',
    
    // Tasks
    tasks: 'משימות',
    task: 'משימה',
    newTask: 'משימה חדשה',
    addTask: 'הוסף משימה',
    editTask: 'עריכת משימה',
    deleteTask: 'מחק משימה',
    taskCompleted: 'משימה הושלמה!',
    taskAdded: 'משימה נוספה!',
    noTasks: 'אין משימות',
    allTasksCompleted: 'כל המשימות הושלמו!',
    quickTask: 'משימה מהירה',
    focusTask: 'משימה בפוקוס',
    backlog: 'רשימת משימות',
    
    // Task Fields
    title: 'כותרת',
    description: 'תיאור',
    date: 'תאריך',
    project: 'פרויקט',
    duration: 'משך (דקות)',
    scheduledTime: 'שעה מתוכננת',
    
    // Time
    minutes: 'דקות',
    hours: 'שעות',
    min: 'דק׳',
    
    // General
    save: 'שמור',
    cancel: 'ביטול',
    delete: 'מחק',
    edit: 'עריכה',
    add: 'הוסף',
    done: 'בוצע',
    close: 'סגור',
    yes: 'כן',
    no: 'לא',
    all: 'הכל',
    
    // Menu
    menu: 'תפריט',
    settings: 'הגדרות',
    history: 'היסטוריה',
    lists: 'רשימות',
    logout: 'התנתק',
    
    // Settings
    settingsTitle: 'הגדרות',
    userType: 'סוג משתמש',
    switchToDoer: 'עבור לפוקוס יומי',
    switchToPlanner: 'עבור לתכנון חכם',
    language: 'שפה',
    hebrew: 'עברית',
    english: 'English',
    hebrewCalendar: 'לוח עברי',
    showHebrewDates: 'הצג תאריכים עבריים',
    rewards: 'תגמולים',
    rewardsEnabled: 'מערכת תגמולים פעילה',
    rewardPerTask: 'תגמול למשימה',
    targetName: 'שם היעד',
    targetAmount: 'סכום יעד',
    currentBalance: 'יתרה נוכחית',
    workHours: 'שעות עבודה',
    workDays: 'ימי עבודה',
    sprintDuration: 'משך ספרינט',
    editAnchors: 'עריכת עוגנים',
    
    // History
    historyTitle: 'היסטוריה וסטטיסטיקות',
    completedTasks: 'משימות שהושלמו',
    totalTimeSpent: 'זמן כולל',
    averagePerDay: 'ממוצע ליום',
    streakDays: 'ימים ברצף',
    anchorCompletion: 'השלמת עוגנים',
    sprintCompletion: 'השלמת ספרינטים',
    thisWeek: 'השבוע',
    thisMonth: 'החודש',
    allTime: 'הכל',
    
    // Lists
    listsTitle: 'רשימות',
    newList: 'רשימה חדשה',
    listName: 'שם הרשימה',
    createList: 'צור רשימה',
    deleteList: 'מחק רשימה',
    emptyList: 'הרשימה ריקה',
    note: 'הערה',
    link: 'קישור',
    
    // Login
    loginTitle: 'LifeOS',
    loginSubtitle: 'מערכת ניהול חיים אישית',
    loginWithGoogle: 'התחבר עם Google',
    
    // Days
    sunday: 'ראשון',
    monday: 'שני',
    tuesday: 'שלישי',
    wednesday: 'רביעי',
    thursday: 'חמישי',
    friday: 'שישי',
    saturday: 'שבת',
    sun: 'א׳',
    mon: 'ב׳',
    tue: 'ג׳',
    wed: 'ד׳',
    thu: 'ה׳',
    fri: 'ו׳',
    sat: 'ש׳',
    
    // Notifications
    welcomeBack: 'ברוך שובך',
    dataSaved: 'נשמר בהצלחה',
    error: 'שגיאה',
  },
  
  en: {
    // App
    appName: 'LifeOS',
    
    // Path Selection
    pathSelectionTitle: 'Welcome! How do you prefer to manage your day?',
    doerTitle: 'Daily Focus',
    doerDesc: 'I want to wake up, see a simple task list, and start running. No complicated calendars.',
    plannerTitle: 'Smart Planning',
    plannerDesc: 'My schedule is packed. I need a visual calendar and AI assistant to help schedule tasks and meetings.',
    saveAndStart: 'Save & Start',
    
    // FRX - Doer
    anchorsQuestion: 'What are the things you do every day, without exception?',
    sprintQuestion: 'Do you want to start the day with a quick "desk cleanup" of short tasks?',
    finishSetup: 'Finish Setup',
    
    // FRX - Planner
    workFrameTitle: 'Work Schedule',
    workFrameDesc: 'Set your working hours so AI won\'t schedule tasks at night',
    anchorsTimeQuestion: 'When do your fixed activities usually happen?',
    anchorsNote: 'These are just anchors, you can move them in the calendar daily.',
    connectCalendar: 'Connect Google Calendar',
    
    // Anchors
    anchors: 'Anchors',
    shacharit: 'Morning Prayer',
    mincha: 'Afternoon Prayer',
    maariv: 'Evening Prayer',
    chitat: 'Daily Study',
    rambam: 'Rambam',
    dafYomi: 'Daf Yomi',
    customAnchor: 'Custom Anchor',
    addAnchor: 'Add Anchor',
    
    // Morning Wizard
    morningWizardTitle: 'Good morning! What\'s the plan for today?',
    selectAnchors: 'Today\'s Anchors',
    selectSprintTasks: 'Sprint Tasks',
    selectFocusTasks: 'Focus Tasks (1-3)',
    
    // Execution Mode
    startDay: 'Start Day',
    goForIt: 'Let\'s Go!',
    finishDay: 'Finish Day',
    anchorsChecklist: 'Anchors Checklist',
    sprintTimer: 'Quick Sprint',
    focusMode: 'Focus Mode',
    congrats: 'Great job!',
    youEarned: 'You earned',
    
    // Planner
    autoSchedule: 'Auto-Schedule',
    reschedule: 'Reschedule',
    drawer: 'Task Drawer',
    timeline: 'Timeline',
    today: 'Today',
    
    // Tasks
    tasks: 'Tasks',
    task: 'Task',
    newTask: 'New Task',
    addTask: 'Add Task',
    editTask: 'Edit Task',
    deleteTask: 'Delete Task',
    taskCompleted: 'Task completed!',
    taskAdded: 'Task added!',
    noTasks: 'No tasks',
    allTasksCompleted: 'All tasks completed!',
    quickTask: 'Quick Task',
    focusTask: 'Focus Task',
    backlog: 'Task List',
    
    // Task Fields
    title: 'Title',
    description: 'Description',
    date: 'Date',
    project: 'Project',
    duration: 'Duration (min)',
    scheduledTime: 'Scheduled Time',
    
    // Time
    minutes: 'minutes',
    hours: 'hours',
    min: 'min',
    
    // General
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    done: 'Done',
    close: 'Close',
    yes: 'Yes',
    no: 'No',
    all: 'All',
    
    // Menu
    menu: 'Menu',
    settings: 'Settings',
    history: 'History',
    lists: 'Lists',
    logout: 'Logout',
    
    // Settings
    settingsTitle: 'Settings',
    userType: 'User Type',
    switchToDoer: 'Switch to Daily Focus',
    switchToPlanner: 'Switch to Smart Planning',
    language: 'Language',
    hebrew: 'עברית',
    english: 'English',
    hebrewCalendar: 'Hebrew Calendar',
    showHebrewDates: 'Show Hebrew dates',
    rewards: 'Rewards',
    rewardsEnabled: 'Rewards system enabled',
    rewardPerTask: 'Reward per task',
    targetName: 'Target name',
    targetAmount: 'Target amount',
    currentBalance: 'Current balance',
    workHours: 'Work Hours',
    workDays: 'Work Days',
    sprintDuration: 'Sprint Duration',
    editAnchors: 'Edit Anchors',
    
    // History
    historyTitle: 'History & Statistics',
    completedTasks: 'Completed Tasks',
    totalTimeSpent: 'Total Time',
    averagePerDay: 'Daily Average',
    streakDays: 'Day Streak',
    anchorCompletion: 'Anchor Completion',
    sprintCompletion: 'Sprint Completion',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    allTime: 'All Time',
    
    // Lists
    listsTitle: 'Lists',
    newList: 'New List',
    listName: 'List Name',
    createList: 'Create List',
    deleteList: 'Delete List',
    emptyList: 'List is empty',
    note: 'Note',
    link: 'Link',
    
    // Login
    loginTitle: 'LifeOS',
    loginSubtitle: 'Personal Life Management System',
    loginWithGoogle: 'Sign in with Google',
    
    // Days
    sunday: 'Sunday',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sun: 'Sun',
    mon: 'Mon',
    tue: 'Tue',
    wed: 'Wed',
    thu: 'Thu',
    fri: 'Fri',
    sat: 'Sat',
    
    // Notifications
    welcomeBack: 'Welcome back',
    dataSaved: 'Saved successfully',
    error: 'Error',
  }
};


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 2: STYLES - Google Material Design CSS                              ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Google+Sans:wght@400;500;700&display=swap');
  
  /* CSS Variables - Google Material Design */
  :root {
    --primary: #1a73e8;
    --primary-dark: #1557b0;
    --primary-light: #e8f0fe;
    --secondary: #5f6368;
    --success: #34a853;
    --success-light: #e6f4ea;
    --warning: #fbbc04;
    --warning-light: #fef7e0;
    --danger: #ea4335;
    --danger-light: #fce8e6;
    --purple: #9334e6;
    --purple-light: #f3e8ff;
    
    --bg-primary: #ffffff;
    --bg-secondary: #f8f9fa;
    --bg-tertiary: #f1f3f4;
    
    --text-primary: #202124;
    --text-secondary: #5f6368;
    --text-muted: #9aa0a6;
    
    --border: #dadce0;
    --border-light: #e8eaed;
    
    --shadow-sm: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
    --shadow-md: 0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15);
    --shadow-lg: 0 1px 3px 0 rgba(60,64,67,0.3), 0 8px 16px 4px rgba(60,64,67,0.15);
    
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 16px;
    --radius-full: 9999px;
    
    --font-sans: 'Google Sans', 'Roboto', -apple-system, sans-serif;
    --font-body: 'Roboto', -apple-system, sans-serif;
  }
  
  /* Reset & Base */
  * { margin: 0; padding: 0; box-sizing: border-box; }
  
  body {
    font-family: var(--font-body);
    background: var(--bg-secondary);
    color: var(--text-primary);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
  
  /* App Container */
  .app {
    min-height: 100vh;
    max-width: 100%;
    overflow-x: hidden;
  }
  
  .app.rtl { direction: rtl; }
  .app.ltr { direction: ltr; }
  
  /* ===== LOGIN SCREEN ===== */
  .login-screen {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  .login-card {
    background: white;
    border-radius: var(--radius-lg);
    padding: 48px 40px;
    text-align: center;
    box-shadow: var(--shadow-lg);
    max-width: 400px;
    width: 100%;
  }
  
  .login-logo {
    font-family: var(--font-sans);
    font-size: 32px;
    font-weight: 700;
    color: var(--primary);
    margin-bottom: 8px;
  }
  
  .login-subtitle {
    color: var(--text-secondary);
    font-size: 14px;
    margin-bottom: 32px;
  }
  
  .login-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    padding: 12px 24px;
    border: 1px solid var(--border);
    border-radius: var(--radius-full);
    background: white;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .login-btn:hover {
    background: var(--bg-secondary);
    box-shadow: var(--shadow-sm);
  }
  
  .login-btn img {
    width: 20px;
    height: 20px;
  }
  
  /* ===== PATH SELECTION ===== */
  .path-selection {
    min-height: 100vh;
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--bg-secondary);
  }
  
  .path-selection-title {
    font-family: var(--font-sans);
    font-size: 24px;
    font-weight: 500;
    color: var(--text-primary);
    text-align: center;
    margin-bottom: 32px;
    max-width: 400px;
  }
  
  .path-cards {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    max-width: 500px;
  }
  
  .path-card {
    background: white;
    border: 2px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 24px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .path-card:hover {
    border-color: var(--primary);
    box-shadow: var(--shadow-md);
  }
  
  .path-card.selected {
    border-color: var(--primary);
    background: var(--primary-light);
  }
  
  .path-card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }
  
  .path-card-icon {
    font-size: 32px;
  }
  
  .path-card-title {
    font-family: var(--font-sans);
    font-size: 18px;
    font-weight: 500;
    color: var(--text-primary);
  }
  
  .path-card-desc {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.6;
  }
  
  .path-selection-btn {
    margin-top: 24px;
    padding: 14px 32px;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: var(--radius-full);
    font-family: var(--font-sans);
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    opacity: 0;
    pointer-events: none;
  }
  
  .path-selection-btn.visible {
    opacity: 1;
    pointer-events: auto;
  }
  
  .path-selection-btn:hover {
    background: var(--primary-dark);
    box-shadow: var(--shadow-md);
  }
  
  /* ===== HEADER ===== */
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: white;
    border-bottom: 1px solid var(--border-light);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .header-logo {
    font-family: var(--font-sans);
    font-size: 20px;
    font-weight: 700;
    color: var(--primary);
  }
  
  .header-back {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    border-radius: var(--radius-full);
    cursor: pointer;
    font-size: 20px;
    color: var(--text-secondary);
  }
  
  .header-back:hover {
    background: var(--bg-secondary);
  }
  
  .header-title {
    font-family: var(--font-sans);
    font-size: 18px;
    font-weight: 500;
    color: var(--text-primary);
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .header-balance {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: var(--success-light);
    border-radius: var(--radius-full);
    font-size: 14px;
    font-weight: 500;
    color: var(--success);
  }
  
  .menu-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    border-radius: var(--radius-full);
    cursor: pointer;
    font-size: 20px;
    color: var(--text-secondary);
  }
  
  .menu-btn:hover {
    background: var(--bg-secondary);
  }
  
  /* ===== SIDEBAR MENU ===== */
  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.3);
    z-index: 200;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
  }
  
  .sidebar-overlay.open {
    opacity: 1;
    pointer-events: auto;
  }
  
  .sidebar {
    position: fixed;
    top: 0;
    bottom: 0;
    width: 280px;
    background: white;
    z-index: 201;
    transform: translateX(100%);
    transition: transform 0.3s;
    display: flex;
    flex-direction: column;
  }
  
  .app.rtl .sidebar { right: 0; transform: translateX(100%); }
  .app.ltr .sidebar { left: 0; transform: translateX(-100%); }
  .app.rtl .sidebar.open { transform: translateX(0); }
  .app.ltr .sidebar.open { transform: translateX(0); }
  
  .sidebar-header {
    padding: 20px;
    border-bottom: 1px solid var(--border-light);
  }
  
  .sidebar-user {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .sidebar-avatar {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-full);
    object-fit: cover;
  }
  
  .sidebar-user-name {
    font-weight: 500;
    color: var(--text-primary);
  }
  
  .sidebar-user-email {
    font-size: 12px;
    color: var(--text-muted);
  }
  
  .sidebar-nav {
    flex: 1;
    padding: 8px 0;
    overflow-y: auto;
  }
  
  .sidebar-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 20px;
    cursor: pointer;
    color: var(--text-primary);
    transition: background 0.2s;
  }
  
  .sidebar-item:hover {
    background: var(--bg-secondary);
  }
  
  .sidebar-item-icon {
    font-size: 20px;
    width: 24px;
    text-align: center;
  }
  
  .sidebar-item-text {
    font-size: 14px;
  }
  
  .sidebar-divider {
    height: 1px;
    background: var(--border-light);
    margin: 8px 0;
  }
  
  .sidebar-footer {
    padding: 16px 20px;
    border-top: 1px solid var(--border-light);
  }
  
  /* ===== DOER DASHBOARD ===== */
  .doer-dashboard {
    padding: 20px;
    padding-bottom: 100px;
  }
  
  .start-day-btn {
    width: 100%;
    padding: 20px;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-family: var(--font-sans);
    font-size: 18px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 24px;
    transition: all 0.2s;
    box-shadow: var(--shadow-sm);
  }
  
  .start-day-btn:hover {
    background: var(--primary-dark);
    box-shadow: var(--shadow-md);
  }
  
  .start-day-btn .icon {
    font-size: 24px;
  }
  
  .section-title {
    font-family: var(--font-sans);
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  /* ===== TASK LIST ===== */
  .task-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .task-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: white;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-light);
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .task-item:hover {
    border-color: var(--border);
    box-shadow: var(--shadow-sm);
  }
  
  .task-item.completed {
    opacity: 0.6;
  }
  
  .task-item.completed .task-title {
    text-decoration: line-through;
  }
  
  .task-checkbox {
    width: 22px;
    height: 22px;
    border: 2px solid var(--border);
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.2s;
    cursor: pointer;
  }
  
  .task-checkbox:hover {
    border-color: var(--primary);
    background: var(--primary-light);
  }
  
  .task-checkbox.checked {
    background: var(--primary);
    border-color: var(--primary);
    color: white;
  }
  
  .task-content {
    flex: 1;
    min-width: 0;
  }
  
  .task-title {
    font-size: 15px;
    color: var(--text-primary);
    margin-bottom: 4px;
  }
  
  .task-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  
  .task-chip {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    background: var(--bg-tertiary);
    border-radius: var(--radius-full);
    font-size: 12px;
    color: var(--text-secondary);
  }
  
  .task-chip.project {
    background: var(--primary-light);
    color: var(--primary);
  }
  
  .task-actions {
    display: flex;
    gap: 4px;
  }
  
  .task-action-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    border-radius: var(--radius-full);
    cursor: pointer;
    color: var(--text-muted);
    transition: all 0.2s;
  }
  
  .task-action-btn:hover {
    background: var(--bg-secondary);
    color: var(--text-secondary);
  }
  
  /* ===== ADD TASK BAR ===== */
  .add-task-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px 20px;
    background: white;
    border-top: 1px solid var(--border-light);
    display: flex;
    gap: 12px;
    z-index: 50;
  }
  
  .add-task-input {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid var(--border);
    border-radius: var(--radius-full);
    font-size: 15px;
    outline: none;
    transition: border-color 0.2s;
  }
  
  .add-task-input:focus {
    border-color: var(--primary);
  }
  
  .add-task-btn {
    padding: 12px 20px;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: var(--radius-full);
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .add-task-btn:hover {
    background: var(--primary-dark);
  }
  
  /* ===== PLANNER DASHBOARD ===== */
  .planner-dashboard {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 65px);
  }
  
  .planner-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    background: white;
    border-bottom: 1px solid var(--border-light);
  }
  
  .planner-date-nav {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .planner-nav-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border);
    background: white;
    border-radius: var(--radius-full);
    cursor: pointer;
    color: var(--text-secondary);
    transition: all 0.2s;
  }
  
  .planner-nav-btn:hover {
    background: var(--bg-secondary);
  }
  
  .planner-today-btn {
    padding: 8px 16px;
    border: 1px solid var(--border);
    background: white;
    border-radius: var(--radius-full);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    color: var(--primary);
    transition: all 0.2s;
  }
  
  .planner-today-btn:hover {
    background: var(--primary-light);
  }
  
  .planner-date-title {
    font-family: var(--font-sans);
    font-size: 16px;
    font-weight: 500;
    color: var(--text-primary);
  }
  
  .auto-schedule-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: var(--radius-full);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .auto-schedule-btn:hover {
    background: var(--primary-dark);
  }
  
  /* ===== TIMELINE ===== */
  .timeline-container {
    flex: 1;
    overflow-y: auto;
    padding: 0 20px 100px 20px;
  }
  
  .timeline {
    position: relative;
    margin-top: 16px;
  }
  
  .timeline-hour {
    display: flex;
    height: 60px;
    border-top: 1px solid var(--border-light);
  }
  
  .timeline-hour-label {
    width: 50px;
    padding-top: 4px;
    font-size: 12px;
    color: var(--text-muted);
    text-align: right;
    padding-right: 12px;
    flex-shrink: 0;
  }
  
  .timeline-hour-content {
    flex: 1;
    position: relative;
  }
  
  .timeline-block {
    position: absolute;
    left: 8px;
    right: 8px;
    padding: 8px 12px;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all 0.2s;
    overflow: hidden;
  }
  
  .timeline-block:hover {
    box-shadow: var(--shadow-sm);
  }
  
  .timeline-block.task {
    background: var(--primary-light);
    border-right: 4px solid var(--primary);
  }
  
  .timeline-block.anchor {
    background: var(--purple-light);
    border-right: 4px solid var(--purple);
  }
  
  .timeline-block.meeting {
    background: var(--bg-tertiary);
    border-right: 4px solid var(--secondary);
  }
  
  .timeline-block-title {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .timeline-block-time {
    font-size: 11px;
    color: var(--text-secondary);
    margin-top: 2px;
  }
  
  .timeline-now-line {
    position: absolute;
    left: 50px;
    right: 0;
    height: 2px;
    background: var(--danger);
    z-index: 10;
  }
  
  .timeline-now-line::before {
    content: '';
    position: absolute;
    right: -5px;
    top: -4px;
    width: 10px;
    height: 10px;
    border-radius: var(--radius-full);
    background: var(--danger);
  }
  
  /* ===== TASK DRAWER ===== */
  .drawer-fab {
    position: fixed;
    bottom: 24px;
    width: 56px;
    height: 56px;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: var(--radius-full);
    font-size: 24px;
    cursor: pointer;
    box-shadow: var(--shadow-lg);
    z-index: 50;
    transition: all 0.2s;
  }
  
  .app.rtl .drawer-fab { left: 24px; }
  .app.ltr .drawer-fab { right: 24px; }
  
  .drawer-fab:hover {
    transform: scale(1.1);
  }
  
  .drawer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    box-shadow: var(--shadow-lg);
    z-index: 150;
    transform: translateY(100%);
    transition: transform 0.3s;
    max-height: 70vh;
    display: flex;
    flex-direction: column;
  }
  
  .drawer.open {
    transform: translateY(0);
  }
  
  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-light);
  }
  
  .drawer-title {
    font-family: var(--font-sans);
    font-size: 16px;
    font-weight: 500;
  }
  
  .drawer-close {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    border-radius: var(--radius-full);
    cursor: pointer;
    font-size: 20px;
    color: var(--text-secondary);
  }
  
  .drawer-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px 20px;
  }
  
  .drawer-task {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    margin-bottom: 8px;
    cursor: grab;
  }
  
  .drawer-task:active {
    cursor: grabbing;
  }
  
  .drawer-task-drag {
    color: var(--text-muted);
  }
  
  /* ===== FRX WIZARD ===== */
  .frx-container {
    min-height: 100vh;
    padding: 24px;
    background: var(--bg-secondary);
  }
  
  .frx-card {
    background: white;
    border-radius: var(--radius-lg);
    padding: 32px 24px;
    max-width: 500px;
    margin: 0 auto;
    box-shadow: var(--shadow-sm);
  }
  
  .frx-step {
    font-size: 12px;
    color: var(--text-muted);
    margin-bottom: 8px;
  }
  
  .frx-title {
    font-family: var(--font-sans);
    font-size: 20px;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 24px;
  }
  
  .frx-options {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
  }
  
  .frx-option {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .frx-option:hover {
    border-color: var(--primary);
  }
  
  .frx-option.selected {
    border-color: var(--primary);
    background: var(--primary-light);
  }
  
  .frx-option-checkbox {
    width: 20px;
    height: 20px;
    border: 2px solid var(--border);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: all 0.2s;
  }
  
  .frx-option.selected .frx-option-checkbox {
    background: var(--primary);
    border-color: var(--primary);
  }
  
  .frx-option-text {
    flex: 1;
    font-size: 15px;
    color: var(--text-primary);
  }
  
  .frx-toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 0;
    border-bottom: 1px solid var(--border-light);
  }
  
  .frx-toggle-label {
    font-size: 15px;
    color: var(--text-primary);
  }
  
  .toggle {
    width: 48px;
    height: 28px;
    background: var(--border);
    border-radius: var(--radius-full);
    position: relative;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .toggle.on {
    background: var(--primary);
  }
  
  .toggle::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 24px;
    height: 24px;
    background: white;
    border-radius: var(--radius-full);
    box-shadow: var(--shadow-sm);
    transition: transform 0.2s;
  }
  
  .toggle.on::after {
    transform: translateX(20px);
  }
  
  .frx-select {
    padding: 12px 16px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    font-size: 15px;
    width: 120px;
    outline: none;
  }
  
  .frx-buttons {
    display: flex;
    gap: 12px;
    margin-top: 24px;
  }
  
  .frx-btn {
    flex: 1;
    padding: 14px;
    border-radius: var(--radius-md);
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .frx-btn.secondary {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    color: var(--text-primary);
  }
  
  .frx-btn.primary {
    background: var(--primary);
    border: none;
    color: white;
  }
  
  .frx-btn.primary:hover {
    background: var(--primary-dark);
  }
  
  /* ===== EXECUTION MODE ===== */
  .execution-mode {
    min-height: 100vh;
    background: var(--bg-secondary);
  }
  
  .execution-section {
    background: white;
    margin: 16px;
    border-radius: var(--radius-lg);
    overflow: hidden;
  }
  
  .execution-section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    background: var(--bg-secondary);
    font-family: var(--font-sans);
    font-weight: 500;
    color: var(--text-primary);
  }
  
  .execution-section-content {
    padding: 16px 20px;
  }
  
  .anchor-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--border-light);
  }
  
  .anchor-item:last-child {
    border-bottom: none;
  }
  
  .sprint-timer {
    text-align: center;
    padding: 24px;
  }
  
  .sprint-timer-display {
    font-family: var(--font-sans);
    font-size: 48px;
    font-weight: 300;
    color: var(--primary);
    margin-bottom: 16px;
  }
  
  .sprint-timer-label {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 16px;
  }
  
  .sprint-tasks {
    margin-top: 16px;
  }
  
  .focus-task-card {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    color: white;
    padding: 24px;
    border-radius: var(--radius-lg);
    margin: 16px;
  }
  
  .focus-task-label {
    font-size: 12px;
    opacity: 0.8;
    margin-bottom: 8px;
  }
  
  .focus-task-title {
    font-family: var(--font-sans);
    font-size: 20px;
    font-weight: 500;
    margin-bottom: 16px;
  }
  
  .focus-stopwatch {
    font-size: 36px;
    font-weight: 300;
    text-align: center;
    padding: 16px;
    background: rgba(255,255,255,0.1);
    border-radius: var(--radius-md);
    margin-bottom: 16px;
  }
  
  .focus-controls {
    display: flex;
    gap: 12px;
  }
  
  .focus-btn {
    flex: 1;
    padding: 12px;
    border-radius: var(--radius-md);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .focus-btn.play {
    background: white;
    color: var(--primary);
    border: none;
  }
  
  .focus-btn.complete {
    background: var(--success);
    color: white;
    border: none;
  }
  
  .finish-day-btn {
    margin: 24px 16px;
    padding: 16px;
    background: var(--success);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-family: var(--font-sans);
    font-size: 16px;
    font-weight: 500;
    width: calc(100% - 32px);
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .finish-day-btn:hover {
    background: #2e7d32;
  }
  
  /* ===== MORNING WIZARD ===== */
  .morning-wizard {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 300;
    padding: 24px;
  }
  
  .morning-wizard-card {
    background: white;
    border-radius: var(--radius-lg);
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .morning-wizard-header {
    padding: 24px;
    border-bottom: 1px solid var(--border-light);
  }
  
  .morning-wizard-title {
    font-family: var(--font-sans);
    font-size: 20px;
    font-weight: 500;
    color: var(--text-primary);
  }
  
  .morning-wizard-section {
    padding: 20px 24px;
    border-bottom: 1px solid var(--border-light);
  }
  
  .morning-wizard-section-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
    margin-bottom: 12px;
  }
  
  .morning-wizard-footer {
    padding: 16px 24px;
    display: flex;
    justify-content: flex-end;
  }
  
  .morning-wizard-btn {
    padding: 12px 32px;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: var(--radius-full);
    font-weight: 500;
    cursor: pointer;
  }
  
  /* ===== REWARD POPUP ===== */
  .reward-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: var(--radius-lg);
    padding: 48px;
    text-align: center;
    box-shadow: var(--shadow-lg);
    z-index: 400;
    animation: popIn 0.3s ease;
  }
  
  @keyframes popIn {
    from { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
    to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  }
  
  .reward-popup-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }
  
  .reward-popup-title {
    font-family: var(--font-sans);
    font-size: 24px;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 8px;
  }
  
  .reward-popup-amount {
    font-size: 32px;
    font-weight: 700;
    color: var(--success);
  }
  
  /* ===== MODALS ===== */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 300;
    padding: 24px;
  }
  
  .modal {
    background: white;
    border-radius: var(--radius-lg);
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid var(--border-light);
  }
  
  .modal-title {
    font-family: var(--font-sans);
    font-size: 18px;
    font-weight: 500;
  }
  
  .modal-close {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    border-radius: var(--radius-full);
    cursor: pointer;
    font-size: 20px;
    color: var(--text-secondary);
  }
  
  .modal-body {
    padding: 24px;
  }
  
  .modal-footer {
    display: flex;
    gap: 12px;
    padding: 16px 24px;
    border-top: 1px solid var(--border-light);
    justify-content: flex-end;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
    margin-bottom: 8px;
  }
  
  .form-input {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    font-size: 15px;
    outline: none;
    transition: border-color 0.2s;
  }
  
  .form-input:focus {
    border-color: var(--primary);
  }
  
  .btn {
    padding: 10px 20px;
    border-radius: var(--radius-md);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .btn-secondary {
    background: white;
    border: 1px solid var(--border);
    color: var(--text-primary);
  }
  
  .btn-secondary:hover {
    background: var(--bg-secondary);
  }
  
  .btn-primary {
    background: var(--primary);
    border: none;
    color: white;
  }
  
  .btn-primary:hover {
    background: var(--primary-dark);
  }
  
  .btn-danger {
    background: var(--danger);
    border: none;
    color: white;
  }
  
  /* ===== SETTINGS ===== */
  .settings-container {
    padding: 20px;
    padding-bottom: 40px;
  }
  
  .settings-section {
    background: white;
    border-radius: var(--radius-lg);
    margin-bottom: 16px;
    overflow: hidden;
  }
  
  .settings-section-header {
    padding: 16px 20px;
    font-family: var(--font-sans);
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
    background: var(--bg-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .settings-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-light);
  }
  
  .settings-row:last-child {
    border-bottom: none;
  }
  
  .settings-row-info {
    flex: 1;
  }
  
  .settings-row-title {
    font-size: 15px;
    color: var(--text-primary);
    margin-bottom: 2px;
  }
  
  .settings-row-desc {
    font-size: 13px;
    color: var(--text-muted);
  }
  
  .settings-select {
    padding: 8px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    font-size: 14px;
    outline: none;
  }
  
  /* ===== HISTORY ===== */
  .history-container {
    padding: 20px;
    padding-bottom: 40px;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 24px;
  }
  
  .stat-card {
    background: white;
    border-radius: var(--radius-lg);
    padding: 20px;
    text-align: center;
  }
  
  .stat-value {
    font-family: var(--font-sans);
    font-size: 28px;
    font-weight: 700;
    color: var(--primary);
    margin-bottom: 4px;
  }
  
  .stat-label {
    font-size: 13px;
    color: var(--text-secondary);
  }
  
  .history-section {
    background: white;
    border-radius: var(--radius-lg);
    margin-bottom: 16px;
    overflow: hidden;
  }
  
  .history-section-header {
    padding: 16px 20px;
    font-family: var(--font-sans);
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
    background: var(--bg-secondary);
  }
  
  .history-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    border-bottom: 1px solid var(--border-light);
  }
  
  .history-item:last-child {
    border-bottom: none;
  }
  
  /* ===== LISTS ===== */
  .lists-container {
    padding: 20px;
    padding-bottom: 100px;
  }
  
  .list-card {
    background: white;
    border-radius: var(--radius-lg);
    padding: 16px 20px;
    margin-bottom: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .list-card:hover {
    box-shadow: var(--shadow-sm);
  }
  
  .list-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  
  .list-card-title {
    font-family: var(--font-sans);
    font-size: 16px;
    font-weight: 500;
    color: var(--text-primary);
  }
  
  .list-card-count {
    font-size: 13px;
    color: var(--text-muted);
  }
  
  .list-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--border-light);
  }
  
  .list-item:last-child {
    border-bottom: none;
  }
  
  /* ===== NOTIFICATION ===== */
  .notification {
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    background: var(--text-primary);
    color: white;
    border-radius: var(--radius-full);
    font-size: 14px;
    z-index: 500;
    animation: slideUp 0.3s ease;
  }
  
  @keyframes slideUp {
    from { transform: translateX(-50%) translateY(20px); opacity: 0; }
    to { transform: translateX(-50%) translateY(0); opacity: 1; }
  }
  
  .notification.success { background: var(--success); }
  .notification.error { background: var(--danger); }
  
  /* ===== LOADING ===== */
  .loading {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 16px;
  }
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border);
    border-top-color: var(--primary);
    border-radius: var(--radius-full);
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  /* ===== EMPTY STATE ===== */
  .empty-state {
    text-align: center;
    padding: 48px 24px;
  }
  
  .empty-state-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }
  
  .empty-state-title {
    font-family: var(--font-sans);
    font-size: 18px;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 8px;
  }
  
  .empty-state-desc {
    font-size: 14px;
    color: var(--text-secondary);
  }
  
  /* ===== RESPONSIVE ===== */
  @media (min-width: 768px) {
    .path-cards {
      flex-direction: row;
    }
    
    .path-card {
      flex: 1;
    }
    
    .stats-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
`;


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 3: HELPERS - Hebrew Calendar & Utilities                            ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

// Hebrew Calendar
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

const gregorianToHebrew = (gDate) => {
  try {
    const hebrewFormatter = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', { 
      day: 'numeric', month: 'long', year: 'numeric' 
    });
    const parts = hebrewFormatter.formatToParts(gDate);
    let day = 1, monthName = '', year = 5785;
    parts.forEach(part => {
      if (part.type === 'day') day = parseInt(part.value);
      if (part.type === 'month') monthName = part.value;
      if (part.type === 'year') year = parseInt(part.value);
    });
    return { 
      year, day, monthName, 
      dayOfWeek: HEBREW_DAYS[gDate.getDay()], 
      gematriaDay: numberToGematria(day)
    };
  } catch (e) {
    return { year: 5785, day: 1, monthName: '', dayOfWeek: '', gematriaDay: '' };
  }
};

// Gemini API
const askGemini = async (prompt) => {
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash'];
  
  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
      }
    } catch (e) {
      console.log(`Model ${model} failed`);
    }
  }
  return null;
};

// Date utilities
const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
};

const formatTimeHMS = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${mins}:${String(secs).padStart(2, '0')}`;
};


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 4: MAIN COMPONENT                                                   ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

const LifeOS = () => {
  
  // ╔══════════════════════════════════════════════════════════════════════════════╗
  // ║  SECTION 5: STATE                                                            ║
  // ╚══════════════════════════════════════════════════════════════════════════════╝
  
  // Auth & Loading
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Navigation
  const [currentScreen, setCurrentScreen] = useState('home');
  const [showSidebar, setShowSidebar] = useState(false);
  
  // User Settings
  const [userSettings, setUserSettings] = useState({
    userType: null, // 'doer' | 'planner'
    isOnboarded: false,
    frxCompleted: false,
    language: null,
    showHebrewCalendar: true,
    
    // Doer Config
    doerConfig: {
      anchors: [],
      sprintEnabled: true,
      sprintDuration: 15
    },
    
    // Planner Config
    plannerConfig: {
      workDays: [0, 1, 2, 3, 4], // Sunday-Thursday
      workHoursStart: '08:00',
      workHoursEnd: '18:00',
      anchorsWithTime: []
    },
    
    // Rewards
    rewards: {
      enabled: true,
      currency: '₪',
      ratePerTask: 5,
      currentBalance: 0,
      targetName: '',
      targetAmount: 0
    }
  });
  
  // Tasks
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  // Lists
  const [lists, setLists] = useState([]);
  const [editingList, setEditingList] = useState(null);
  const [newListTitle, setNewListTitle] = useState('');
  
  // Execution Mode (Doer)
  const [isExecutionMode, setIsExecutionMode] = useState(false);
  const [showMorningWizard, setShowMorningWizard] = useState(false);
  const [todayAnchors, setTodayAnchors] = useState([]);
  const [todaySprintTasks, setTodaySprintTasks] = useState([]);
  const [todayFocusTasks, setTodayFocusTasks] = useState([]);
  const [completedAnchors, setCompletedAnchors] = useState({});
  const [sprintTimeLeft, setSprintTimeLeft] = useState(0);
  const [sprintRunning, setSprintRunning] = useState(false);
  const [currentFocusIndex, setCurrentFocusIndex] = useState(0);
  const [focusStopwatch, setFocusStopwatch] = useState(0);
  const [focusRunning, setFocusRunning] = useState(false);
  
  // Planner
  const [timelineDate, setTimelineDate] = useState(new Date());
  const [showDrawer, setShowDrawer] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  
  // FRX (First Run Experience)
  const [frxStep, setFrxStep] = useState(1);
  const [frxAnchors, setFrxAnchors] = useState([]);
  const [frxSprintEnabled, setFrxSprintEnabled] = useState(true);
  const [frxSprintDuration, setFrxSprintDuration] = useState(15);
  const [frxWorkDays, setFrxWorkDays] = useState([0, 1, 2, 3, 4]);
  const [frxWorkStart, setFrxWorkStart] = useState('08:00');
  const [frxWorkEnd, setFrxWorkEnd] = useState('18:00');
  const [frxAnchorsWithTime, setFrxAnchorsWithTime] = useState([]);
  
  // Modals
  const [showModal, setShowModal] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [lastRewardAmount, setLastRewardAmount] = useState(0);
  
  // Refs
  const audioRef = useRef(null);
  const sprintIntervalRef = useRef(null);
  const focusIntervalRef = useRef(null);
  
  // Computed values
  const today = getLocalDateString();
  const hebrewDate = gregorianToHebrew(new Date());
  
  // Translation function
  const getCurrentLanguage = useCallback(() => {
    if (userSettings.language) return userSettings.language;
    const browserLang = navigator.language || 'en';
    return browserLang.startsWith('he') ? 'he' : 'en';
  }, [userSettings.language]);
  
  const t = useCallback((key) => {
    const lang = getCurrentLanguage();
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  }, [getCurrentLanguage]);
  
  const isRTL = useCallback(() => getCurrentLanguage() === 'he', [getCurrentLanguage]);
  
  // Default anchors list
  const defaultAnchors = [
    { id: 'shacharit', key: 'shacharit', icon: '🌅' },
    { id: 'mincha', key: 'mincha', icon: '☀️' },
    { id: 'maariv', key: 'maariv', icon: '🌙' },
    { id: 'chitat', key: 'chitat', icon: '📖' },
    { id: 'rambam', key: 'rambam', icon: '📚' },
    { id: 'dafYomi', key: 'dafYomi', icon: '📜' }
  ];


  // ╔══════════════════════════════════════════════════════════════════════════════╗
  // ║  SECTION 6: EFFECTS                                                          ║
  // ╚══════════════════════════════════════════════════════════════════════════════╝
  
  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);
  
  // Load user data from Firebase
  useEffect(() => {
    if (!user) return;
    
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.tasks) setTasks(data.tasks);
        if (data.lists) setLists(data.lists);
        if (data.settings) {
          setUserSettings(prev => ({ ...prev, ...data.settings }));
        }
      }
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, [user]);
  
  // Save data to Firebase
  const saveToFirebase = useCallback(async (data) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), data, { merge: true });
    } catch (error) {
      console.error('Save error:', error);
    }
  }, [user]);
  
  // Auto-save tasks
  useEffect(() => {
    if (!user || isLoading) return;
    const timeoutId = setTimeout(() => {
      saveToFirebase({ tasks, updatedAt: new Date().toISOString() });
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [tasks, user, isLoading, saveToFirebase]);
  
  // Auto-save settings
  useEffect(() => {
    if (!user || isLoading) return;
    const timeoutId = setTimeout(() => {
      saveToFirebase({ settings: userSettings, updatedAt: new Date().toISOString() });
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [userSettings, user, isLoading, saveToFirebase]);
  
  // Auto-save lists
  useEffect(() => {
    if (!user || isLoading) return;
    const timeoutId = setTimeout(() => {
      saveToFirebase({ lists, updatedAt: new Date().toISOString() });
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [lists, user, isLoading, saveToFirebase]);
  
  // Sprint timer
  useEffect(() => {
    if (sprintRunning && sprintTimeLeft > 0) {
      sprintIntervalRef.current = setInterval(() => {
        setSprintTimeLeft(prev => {
          if (prev <= 1) {
            setSprintRunning(false);
            playSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(sprintIntervalRef.current);
  }, [sprintRunning, sprintTimeLeft]);
  
  // Focus stopwatch
  useEffect(() => {
    if (focusRunning) {
      focusIntervalRef.current = setInterval(() => {
        setFocusStopwatch(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(focusIntervalRef.current);
  }, [focusRunning]);
  
  
  // ╔══════════════════════════════════════════════════════════════════════════════╗
  // ║  SECTION 7: HANDLERS                                                         ║
  // ╚══════════════════════════════════════════════════════════════════════════════╝
  
  // Notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
  
  // Play sound
  const playSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {}
  };
  
  // Auth handlers
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      showNotification(`${t('welcomeBack')} ${result.user.displayName}!`);
    } catch (error) {
      if (error.code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, googleProvider);
      }
    }
  };
  
  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
    setTasks([]);
    setLists([]);
    setShowSidebar(false);
  };
  
  // Path selection
  const handleSelectPath = (path) => {
    setUserSettings(prev => ({ ...prev, userType: path, isOnboarded: true }));
  };
  
  // FRX handlers
  const handleFrxToggleAnchor = (anchorId) => {
    setFrxAnchors(prev => 
      prev.includes(anchorId) 
        ? prev.filter(id => id !== anchorId)
        : [...prev, anchorId]
    );
  };
  
  const handleFrxComplete = () => {
    if (userSettings.userType === 'doer') {
      setUserSettings(prev => ({
        ...prev,
        frxCompleted: true,
        doerConfig: {
          anchors: frxAnchors,
          sprintEnabled: frxSprintEnabled,
          sprintDuration: frxSprintDuration
        }
      }));
    } else {
      setUserSettings(prev => ({
        ...prev,
        frxCompleted: true,
        plannerConfig: {
          workDays: frxWorkDays,
          workHoursStart: frxWorkStart,
          workHoursEnd: frxWorkEnd,
          anchorsWithTime: frxAnchorsWithTime
        }
      }));
    }
    setCurrentScreen('home');
  };
  
  // Task handlers
  const parseTaskTitle = (title) => {
    const match = title.match(/^(.+?)\*\s*(.+)$/);
    if (match) return { project: match[1].trim(), title: match[2].trim() };
    return { project: null, title: title.trim() };
  };
  
  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const parsed = parseTaskTitle(newTaskTitle);
    const newTask = {
      id: Date.now(),
      title: parsed.title,
      project: parsed.project,
      status: 'pending',
      date: today,
      isAnchor: false,
      scheduledTime: null,
      estimatedMinutes: null,
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle('');
    showNotification(t('taskAdded'));
  };
  
  const completeTask = (taskId) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const completed = task.status !== 'done';
        if (completed && userSettings.rewards?.enabled) {
          addReward(userSettings.rewards.ratePerTask);
        }
        return { 
          ...task, 
          status: completed ? 'done' : 'pending',
          completedAt: completed ? new Date().toISOString() : null
        };
      }
      return task;
    }));
  };
  
  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setShowModal(null);
  };
  
  const saveTask = (updatedTask) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    setShowModal(null);
    setEditingTask(null);
  };
  
  // Rewards
  const addReward = (amount) => {
    setUserSettings(prev => ({
      ...prev,
      rewards: {
        ...prev.rewards,
        currentBalance: (prev.rewards?.currentBalance || 0) + amount
      }
    }));
    setLastRewardAmount(amount);
    setShowRewardPopup(true);
    setTimeout(() => setShowRewardPopup(false), 2000);
  };
  
  // Morning Wizard (Doer)
  const handleStartDay = () => {
    const anchors = userSettings.doerConfig?.anchors || [];
    setTodayAnchors(anchors);
    setCompletedAnchors({});
    setTodaySprintTasks([]);
    setTodayFocusTasks([]);
    setShowMorningWizard(true);
  };
  
  const handleMorningWizardComplete = () => {
    setShowMorningWizard(false);
    setIsExecutionMode(true);
    setSprintTimeLeft((userSettings.doerConfig?.sprintDuration || 15) * 60);
  };
  
  const handleToggleAnchor = (anchorId) => {
    setCompletedAnchors(prev => ({
      ...prev,
      [anchorId]: !prev[anchorId]
    }));
  };
  
  const handleFinishDay = () => {
    setIsExecutionMode(false);
    setSprintRunning(false);
    setFocusRunning(false);
    
    const completedCount = Object.values(completedAnchors).filter(Boolean).length;
    const totalReward = completedCount * 2 + todaySprintTasks.filter(t => t.status === 'done').length * 3;
    
    if (totalReward > 0 && userSettings.rewards?.enabled) {
      addReward(totalReward);
    }
    
    showNotification(t('congrats'));
  };
  
  // Planner - Auto Schedule
  const handleAutoSchedule = async () => {
    const unscheduled = tasks.filter(t => 
      t.status !== 'done' && 
      !t.scheduledTime && 
      t.date === today
    );
    
    if (unscheduled.length === 0) {
      showNotification('אין משימות לשיבוץ');
      return;
    }
    
    // Simple auto-schedule: distribute tasks across available hours
    const workStart = parseInt(userSettings.plannerConfig?.workHoursStart?.split(':')[0] || 8);
    const workEnd = parseInt(userSettings.plannerConfig?.workHoursEnd?.split(':')[0] || 18);
    
    let currentHour = workStart;
    const scheduled = unscheduled.map(task => {
      const time = `${String(currentHour).padStart(2, '0')}:00`;
      currentHour += 1;
      if (currentHour >= workEnd) currentHour = workStart;
      return { ...task, scheduledTime: time };
    });
    
    setTasks(prev => prev.map(task => {
      const found = scheduled.find(s => s.id === task.id);
      return found || task;
    }));
    
    showNotification('משימות שובצו בהצלחה');
  };
  
  // Lists handlers
  const addList = () => {
    if (!newListTitle.trim()) return;
    const newList = {
      id: Date.now(),
      title: newListTitle.trim(),
      items: [],
      createdAt: new Date().toISOString()
    };
    setLists(prev => [...prev, newList]);
    setNewListTitle('');
    showNotification(t('dataSaved'));
  };
  
  const deleteList = (listId) => {
    setLists(prev => prev.filter(l => l.id !== listId));
    setEditingList(null);
  };


  // ╔══════════════════════════════════════════════════════════════════════════════╗
  // ║  SECTION 8: RENDER - Common Components                                       ║
  // ╚══════════════════════════════════════════════════════════════════════════════╝
  
  // Header
  const renderHeader = (showBack = false, title = null) => (
    <div className="header">
      <div className="header-left">
        {showBack ? (
          <button className="header-back" onClick={() => setCurrentScreen('home')}>
            {isRTL() ? '→' : '←'}
          </button>
        ) : (
          <div className="header-logo">LifeOS</div>
        )}
        {title && <div className="header-title">{title}</div>}
      </div>
      <div className="header-right">
        {userSettings.rewards?.enabled && (
          <div className="header-balance">
            💰 {userSettings.rewards.currency}{(userSettings.rewards.currentBalance || 0).toFixed(0)}
          </div>
        )}
        <button className="menu-btn" onClick={() => setShowSidebar(true)}>☰</button>
      </div>
    </div>
  );
  
  // Sidebar
  const renderSidebar = () => (
    <>
      <div 
        className={`sidebar-overlay ${showSidebar ? 'open' : ''}`} 
        onClick={() => setShowSidebar(false)} 
      />
      <div className={`sidebar ${showSidebar ? 'open' : ''}`}>
        <div className="sidebar-header">
          {user && (
            <div className="sidebar-user">
              {user.photoURL && <img src={user.photoURL} alt="" className="sidebar-avatar" />}
              <div>
                <div className="sidebar-user-name">{user.displayName}</div>
                <div className="sidebar-user-email">{user.email}</div>
              </div>
            </div>
          )}
        </div>
        <div className="sidebar-nav">
          <div className="sidebar-item" onClick={() => { setCurrentScreen('home'); setShowSidebar(false); }}>
            <span className="sidebar-item-icon">🏠</span>
            <span className="sidebar-item-text">{userSettings.userType === 'doer' ? t('doerTitle') : t('plannerTitle')}</span>
          </div>
          <div className="sidebar-item" onClick={() => { setCurrentScreen('history'); setShowSidebar(false); }}>
            <span className="sidebar-item-icon">📊</span>
            <span className="sidebar-item-text">{t('history')}</span>
          </div>
          <div className="sidebar-item" onClick={() => { setCurrentScreen('lists'); setShowSidebar(false); }}>
            <span className="sidebar-item-icon">📚</span>
            <span className="sidebar-item-text">{t('lists')}</span>
          </div>
          <div className="sidebar-divider" />
          <div className="sidebar-item" onClick={() => { setCurrentScreen('settings'); setShowSidebar(false); }}>
            <span className="sidebar-item-icon">⚙️</span>
            <span className="sidebar-item-text">{t('settings')}</span>
          </div>
        </div>
        <div className="sidebar-footer">
          <div className="sidebar-item" onClick={handleSignOut}>
            <span className="sidebar-item-icon">🚪</span>
            <span className="sidebar-item-text">{t('logout')}</span>
          </div>
        </div>
      </div>
    </>
  );
  
  
  // ╔══════════════════════════════════════════════════════════════════════════════╗
  // ║  SECTION 9: RENDER - Onboarding & FRX                                        ║
  // ╚══════════════════════════════════════════════════════════════════════════════╝
  
  // Login Screen
  const renderLoginScreen = () => (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">LifeOS</div>
        <div className="login-subtitle">{t('loginSubtitle')}</div>
        <button className="login-btn" onClick={handleGoogleSignIn}>
          <img src="https://www.google.com/favicon.ico" alt="Google" />
          {t('loginWithGoogle')}
        </button>
      </div>
    </div>
  );
  
  // Path Selection
  const renderPathSelection = () => (
    <div className="path-selection">
      <div className="path-selection-title">{t('pathSelectionTitle')}</div>
      <div className="path-cards">
        <div 
          className={`path-card ${userSettings.userType === 'doer' ? 'selected' : ''}`}
          onClick={() => handleSelectPath('doer')}
        >
          <div className="path-card-header">
            <span className="path-card-icon">✅</span>
            <span className="path-card-title">{t('doerTitle')}</span>
          </div>
          <div className="path-card-desc">{t('doerDesc')}</div>
        </div>
        <div 
          className={`path-card ${userSettings.userType === 'planner' ? 'selected' : ''}`}
          onClick={() => handleSelectPath('planner')}
        >
          <div className="path-card-header">
            <span className="path-card-icon">📅✨</span>
            <span className="path-card-title">{t('plannerTitle')}</span>
          </div>
          <div className="path-card-desc">{t('plannerDesc')}</div>
        </div>
      </div>
      <button 
        className={`path-selection-btn ${userSettings.userType ? 'visible' : ''}`}
        onClick={() => setCurrentScreen('frx')}
      >
        {t('saveAndStart')}
      </button>
    </div>
  );
  
  // FRX - Doer
  const renderDoerFRX = () => (
    <div className="frx-container">
      <div className="frx-card">
        {frxStep === 1 && (
          <>
            <div className="frx-step">{isRTL() ? 'שלב 1 מתוך 2' : 'Step 1 of 2'}</div>
            <div className="frx-title">{t('anchorsQuestion')}</div>
            <div className="frx-options">
              {defaultAnchors.map(anchor => (
                <div 
                  key={anchor.id}
                  className={`frx-option ${frxAnchors.includes(anchor.id) ? 'selected' : ''}`}
                  onClick={() => handleFrxToggleAnchor(anchor.id)}
                >
                  <div className="frx-option-checkbox">
                    {frxAnchors.includes(anchor.id) && '✓'}
                  </div>
                  <span className="frx-option-text">{anchor.icon} {t(anchor.key)}</span>
                </div>
              ))}
            </div>
            <div className="frx-buttons">
              <button className="frx-btn primary" onClick={() => setFrxStep(2)}>
                {isRTL() ? 'המשך' : 'Continue'}
              </button>
            </div>
          </>
        )}
        
        {frxStep === 2 && (
          <>
            <div className="frx-step">{isRTL() ? 'שלב 2 מתוך 2' : 'Step 2 of 2'}</div>
            <div className="frx-title">{t('sprintQuestion')}</div>
            <div className="frx-toggle-row">
              <span className="frx-toggle-label">{t('sprintTimer')}</span>
              <div 
                className={`toggle ${frxSprintEnabled ? 'on' : ''}`}
                onClick={() => setFrxSprintEnabled(!frxSprintEnabled)}
              />
            </div>
            {frxSprintEnabled && (
              <div className="frx-toggle-row">
                <span className="frx-toggle-label">{t('sprintDuration')}</span>
                <select 
                  className="frx-select"
                  value={frxSprintDuration}
                  onChange={(e) => setFrxSprintDuration(Number(e.target.value))}
                >
                  <option value={5}>5 {t('min')}</option>
                  <option value={10}>10 {t('min')}</option>
                  <option value={15}>15 {t('min')}</option>
                  <option value={20}>20 {t('min')}</option>
                  <option value={25}>25 {t('min')}</option>
                </select>
              </div>
            )}
            <div className="frx-buttons">
              <button className="frx-btn secondary" onClick={() => setFrxStep(1)}>
                {isRTL() ? 'חזור' : 'Back'}
              </button>
              <button className="frx-btn primary" onClick={handleFrxComplete}>
                {t('finishSetup')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
  
  // FRX - Planner
  const renderPlannerFRX = () => (
    <div className="frx-container">
      <div className="frx-card">
        {frxStep === 1 && (
          <>
            <div className="frx-step">{isRTL() ? 'שלב 1 מתוך 3' : 'Step 1 of 3'}</div>
            <div className="frx-title">{t('workFrameTitle')}</div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: 14 }}>
              {t('workFrameDesc')}
            </p>
            <div className="frx-toggle-row">
              <span className="frx-toggle-label">{t('workHours')}</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input 
                  type="time" 
                  className="frx-select"
                  value={frxWorkStart}
                  onChange={(e) => setFrxWorkStart(e.target.value)}
                />
                <span>-</span>
                <input 
                  type="time" 
                  className="frx-select"
                  value={frxWorkEnd}
                  onChange={(e) => setFrxWorkEnd(e.target.value)}
                />
              </div>
            </div>
            <div className="frx-buttons">
              <button className="frx-btn primary" onClick={() => setFrxStep(2)}>
                {isRTL() ? 'המשך' : 'Continue'}
              </button>
            </div>
          </>
        )}
        
        {frxStep === 2 && (
          <>
            <div className="frx-step">{isRTL() ? 'שלב 2 מתוך 3' : 'Step 2 of 3'}</div>
            <div className="frx-title">{t('anchorsTimeQuestion')}</div>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 13 }}>
              {t('anchorsNote')}
            </p>
            <div className="frx-options">
              {defaultAnchors.slice(0, 4).map(anchor => (
                <div 
                  key={anchor.id}
                  className={`frx-option ${frxAnchors.includes(anchor.id) ? 'selected' : ''}`}
                  onClick={() => handleFrxToggleAnchor(anchor.id)}
                >
                  <div className="frx-option-checkbox">
                    {frxAnchors.includes(anchor.id) && '✓'}
                  </div>
                  <span className="frx-option-text">{anchor.icon} {t(anchor.key)}</span>
                </div>
              ))}
            </div>
            <div className="frx-buttons">
              <button className="frx-btn secondary" onClick={() => setFrxStep(1)}>
                {isRTL() ? 'חזור' : 'Back'}
              </button>
              <button className="frx-btn primary" onClick={() => setFrxStep(3)}>
                {isRTL() ? 'המשך' : 'Continue'}
              </button>
            </div>
          </>
        )}
        
        {frxStep === 3 && (
          <>
            <div className="frx-step">{isRTL() ? 'שלב 3 מתוך 3' : 'Step 3 of 3'}</div>
            <div className="frx-title">{t('connectCalendar')}</div>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <button 
                className="frx-btn secondary" 
                style={{ marginBottom: 16 }}
                onClick={() => {/* Google Calendar OAuth */}}
              >
                📅 {t('connectCalendar')}
              </button>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                {isRTL() ? 'ניתן לדלג ולחבר אחר כך' : 'You can skip and connect later'}
              </p>
            </div>
            <div className="frx-buttons">
              <button className="frx-btn secondary" onClick={() => setFrxStep(2)}>
                {isRTL() ? 'חזור' : 'Back'}
              </button>
              <button className="frx-btn primary" onClick={handleFrxComplete}>
                {t('finishSetup')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );


  // ╔══════════════════════════════════════════════════════════════════════════════╗
  // ║  SECTION 10: RENDER - Doer Dashboard & Execution                             ║
  // ╚══════════════════════════════════════════════════════════════════════════════╝
  
  // Morning Wizard Modal
  const renderMorningWizard = () => {
    const quickTasks = tasks.filter(t => t.status !== 'done' && (t.date === null || t.date <= today));
    const anchors = userSettings.doerConfig?.anchors || [];
    
    return (
      <div className="morning-wizard">
        <div className="morning-wizard-card">
          <div className="morning-wizard-header">
            <div className="morning-wizard-title">{t('morningWizardTitle')}</div>
          </div>
          
          {/* Anchors Section */}
          <div className="morning-wizard-section">
            <div className="morning-wizard-section-title">{t('selectAnchors')}</div>
            {anchors.map(anchorId => {
              const anchor = defaultAnchors.find(a => a.id === anchorId);
              if (!anchor) return null;
              return (
                <div key={anchorId} className="task-item" style={{ marginBottom: 8 }}>
                  <div 
                    className={`task-checkbox ${todayAnchors.includes(anchorId) ? 'checked' : ''}`}
                    onClick={() => {
                      setTodayAnchors(prev => 
                        prev.includes(anchorId) 
                          ? prev.filter(id => id !== anchorId)
                          : [...prev, anchorId]
                      );
                    }}
                  >
                    {todayAnchors.includes(anchorId) && '✓'}
                  </div>
                  <span>{anchor.icon} {t(anchor.key)}</span>
                </div>
              );
            })}
          </div>
          
          {/* Sprint Tasks Section */}
          {userSettings.doerConfig?.sprintEnabled && (
            <div className="morning-wizard-section">
              <div className="morning-wizard-section-title">{t('selectSprintTasks')}</div>
              {quickTasks.slice(0, 5).map(task => (
                <div key={task.id} className="task-item" style={{ marginBottom: 8 }}>
                  <div 
                    className={`task-checkbox ${todaySprintTasks.find(t => t.id === task.id) ? 'checked' : ''}`}
                    onClick={() => {
                      setTodaySprintTasks(prev => 
                        prev.find(t => t.id === task.id)
                          ? prev.filter(t => t.id !== task.id)
                          : [...prev, task]
                      );
                    }}
                  >
                    {todaySprintTasks.find(t => t.id === task.id) && '✓'}
                  </div>
                  <span>{task.title}</span>
                </div>
              ))}
            </div>
          )}
          
          {/* Focus Tasks Section */}
          <div className="morning-wizard-section">
            <div className="morning-wizard-section-title">{t('selectFocusTasks')}</div>
            {quickTasks.filter(t => !todaySprintTasks.find(s => s.id === t.id)).slice(0, 5).map(task => (
              <div key={task.id} className="task-item" style={{ marginBottom: 8 }}>
                <div 
                  className={`task-checkbox ${todayFocusTasks.find(t => t.id === task.id) ? 'checked' : ''}`}
                  onClick={() => {
                    if (todayFocusTasks.find(t => t.id === task.id)) {
                      setTodayFocusTasks(prev => prev.filter(t => t.id !== task.id));
                    } else if (todayFocusTasks.length < 3) {
                      setTodayFocusTasks(prev => [...prev, task]);
                    }
                  }}
                >
                  {todayFocusTasks.find(t => t.id === task.id) && '✓'}
                </div>
                <span>{task.title}</span>
              </div>
            ))}
          </div>
          
          <div className="morning-wizard-footer">
            <button className="morning-wizard-btn" onClick={handleMorningWizardComplete}>
              {t('goForIt')} 🚀
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Execution Mode
  const renderExecutionMode = () => {
    const currentFocusTask = todayFocusTasks[currentFocusIndex];
    
    return (
      <div className="execution-mode">
        {renderHeader(false)}
        
        {/* Anchors Checklist */}
        <div className="execution-section">
          <div className="execution-section-header">
            ✓ {t('anchorsChecklist')}
          </div>
          <div className="execution-section-content">
            {todayAnchors.map(anchorId => {
              const anchor = defaultAnchors.find(a => a.id === anchorId);
              if (!anchor) return null;
              return (
                <div key={anchorId} className="anchor-item">
                  <div 
                    className={`task-checkbox ${completedAnchors[anchorId] ? 'checked' : ''}`}
                    onClick={() => handleToggleAnchor(anchorId)}
                  >
                    {completedAnchors[anchorId] && '✓'}
                  </div>
                  <span style={{ 
                    textDecoration: completedAnchors[anchorId] ? 'line-through' : 'none',
                    opacity: completedAnchors[anchorId] ? 0.6 : 1
                  }}>
                    {anchor.icon} {t(anchor.key)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Sprint Timer */}
        {userSettings.doerConfig?.sprintEnabled && todaySprintTasks.length > 0 && (
          <div className="execution-section">
            <div className="execution-section-header">
              ⏱️ {t('sprintTimer')}
            </div>
            <div className="execution-section-content">
              <div className="sprint-timer">
                <div className="sprint-timer-display">{formatTime(sprintTimeLeft)}</div>
                <div className="sprint-timer-label">
                  {todaySprintTasks.filter(t => t.status === 'done').length} / {todaySprintTasks.length} {t('tasks')}
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={() => setSprintRunning(!sprintRunning)}
                >
                  {sprintRunning ? '⏸ Pause' : '▶ Start'}
                </button>
              </div>
              <div className="sprint-tasks">
                {todaySprintTasks.map(task => (
                  <div key={task.id} className="task-item" style={{ marginBottom: 8 }}>
                    <div 
                      className={`task-checkbox ${task.status === 'done' ? 'checked' : ''}`}
                      onClick={() => completeTask(task.id)}
                    >
                      {task.status === 'done' && '✓'}
                    </div>
                    <span style={{ 
                      textDecoration: task.status === 'done' ? 'line-through' : 'none' 
                    }}>
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Focus Mode */}
        {todayFocusTasks.length > 0 && currentFocusTask && (
          <div className="focus-task-card">
            <div className="focus-task-label">
              {t('focusMode')} • {currentFocusIndex + 1}/{todayFocusTasks.length}
            </div>
            <div className="focus-task-title">{currentFocusTask.title}</div>
            <div className="focus-stopwatch">{formatTimeHMS(focusStopwatch)}</div>
            <div className="focus-controls">
              <button 
                className="focus-btn play"
                onClick={() => setFocusRunning(!focusRunning)}
              >
                {focusRunning ? '⏸ Pause' : '▶ Start'}
              </button>
              <button 
                className="focus-btn complete"
                onClick={() => {
                  completeTask(currentFocusTask.id);
                  setFocusStopwatch(0);
                  setFocusRunning(false);
                  if (currentFocusIndex < todayFocusTasks.length - 1) {
                    setCurrentFocusIndex(prev => prev + 1);
                  }
                }}
              >
                ✓ {t('done')}
              </button>
            </div>
          </div>
        )}
        
        {/* Finish Day Button */}
        <button className="finish-day-btn" onClick={handleFinishDay}>
          {t('finishDay')} 🎉
        </button>
      </div>
    );
  };
  
  // Doer Dashboard
  const renderDoerDashboard = () => {
    const openTasks = tasks.filter(t => t.status !== 'done' && (t.date === null || t.date <= today));
    
    return (
      <>
        {renderHeader()}
        <div className="doer-dashboard">
          {/* Start Day Button */}
          <button className="start-day-btn" onClick={handleStartDay}>
            <span className="icon">▶</span>
            {t('startDay')}
          </button>
          
          {/* Task List */}
          <div className="section-title">{t('backlog')} ({openTasks.length})</div>
          <div className="task-list">
            {openTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <div className="empty-state-title">{t('noTasks')}</div>
              </div>
            ) : (
              openTasks.map(task => (
                <div key={task.id} className="task-item">
                  <div 
                    className={`task-checkbox ${task.status === 'done' ? 'checked' : ''}`}
                    onClick={() => completeTask(task.id)}
                  >
                    {task.status === 'done' && '✓'}
                  </div>
                  <div 
                    className="task-content"
                    onClick={() => { setEditingTask(task); setShowModal('editTask'); }}
                  >
                    <div className="task-title">{task.title}</div>
                    <div className="task-meta">
                      {task.project && <span className="task-chip project">{task.project}</span>}
                    </div>
                  </div>
                  <button 
                    className="task-action-btn"
                    onClick={() => { setEditingTask(task); setShowModal('deleteTask'); }}
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Add Task Bar */}
        <div className="add-task-bar">
          <input
            type="text"
            className="add-task-input"
            placeholder={isRTL() ? 'פרויקט* משימה חדשה...' : 'Project* New task...'}
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
          />
          <button className="add-task-btn" onClick={addTask}>+</button>
        </div>
      </>
    );
  };


  // ╔══════════════════════════════════════════════════════════════════════════════╗
  // ║  SECTION 11: RENDER - Planner Dashboard & Timeline                           ║
  // ╚══════════════════════════════════════════════════════════════════════════════╝
  
  // Planner Dashboard
  const renderPlannerDashboard = () => {
    const dateStr = getLocalDateString(timelineDate);
    const dayTasks = tasks.filter(t => t.date === dateStr);
    const scheduledTasks = dayTasks.filter(t => t.scheduledTime);
    const unscheduledTasks = dayTasks.filter(t => !t.scheduledTime && t.status !== 'done');
    const allUnscheduled = tasks.filter(t => !t.scheduledTime && t.status !== 'done');
    
    const workStart = parseInt(userSettings.plannerConfig?.workHoursStart?.split(':')[0] || 6);
    const workEnd = parseInt(userSettings.plannerConfig?.workHoursEnd?.split(':')[0] || 22);
    const hours = Array.from({ length: workEnd - workStart + 1 }, (_, i) => workStart + i);
    
    // Calculate now line position
    const now = new Date();
    const nowHour = now.getHours();
    const nowMinute = now.getMinutes();
    const nowPosition = ((nowHour - workStart) * 60 + nowMinute);
    const isToday = dateStr === today;
    
    return (
      <>
        {renderHeader()}
        <div className="planner-dashboard">
          {/* Toolbar */}
          <div className="planner-toolbar">
            <div className="planner-date-nav">
              <button 
                className="planner-nav-btn"
                onClick={() => {
                  const newDate = new Date(timelineDate);
                  newDate.setDate(newDate.getDate() - 1);
                  setTimelineDate(newDate);
                }}
              >
                {isRTL() ? '→' : '←'}
              </button>
              <button 
                className="planner-today-btn"
                onClick={() => setTimelineDate(new Date())}
              >
                {t('today')}
              </button>
              <button 
                className="planner-nav-btn"
                onClick={() => {
                  const newDate = new Date(timelineDate);
                  newDate.setDate(newDate.getDate() + 1);
                  setTimelineDate(newDate);
                }}
              >
                {isRTL() ? '←' : '→'}
              </button>
              <span className="planner-date-title">
                {timelineDate.toLocaleDateString(isRTL() ? 'he-IL' : 'en-US', { 
                  weekday: 'long', day: 'numeric', month: 'long' 
                })}
              </span>
            </div>
            <button className="auto-schedule-btn" onClick={handleAutoSchedule}>
              ✨ {t('autoSchedule')}
            </button>
          </div>
          
          {/* Timeline */}
          <div className="timeline-container">
            <div className="timeline">
              {/* Now line */}
              {isToday && nowHour >= workStart && nowHour <= workEnd && (
                <div className="timeline-now-line" style={{ top: nowPosition }} />
              )}
              
              {/* Hours */}
              {hours.map(hour => {
                const hourTasks = scheduledTasks.filter(t => {
                  const taskHour = parseInt(t.scheduledTime?.split(':')[0] || 0);
                  return taskHour === hour;
                });
                
                // Anchors for this hour
                const anchors = userSettings.plannerConfig?.anchorsWithTime?.filter(a => {
                  const anchorHour = parseInt(a.time?.split(':')[0] || 0);
                  return anchorHour === hour;
                }) || [];
                
                return (
                  <div key={hour} className="timeline-hour">
                    <div className="timeline-hour-label">
                      {String(hour).padStart(2, '0')}:00
                    </div>
                    <div className="timeline-hour-content">
                      {/* Anchor blocks */}
                      {anchors.map((anchor, idx) => (
                        <div 
                          key={`anchor-${anchor.id}`}
                          className="timeline-block anchor"
                          style={{ 
                            top: 4 + idx * 40,
                            height: Math.min((anchor.duration || 30), 55)
                          }}
                        >
                          <div className="timeline-block-title">
                            {defaultAnchors.find(a => a.id === anchor.id)?.icon} {t(anchor.id)}
                          </div>
                          <div className="timeline-block-time">
                            {anchor.duration} {t('min')}
                          </div>
                        </div>
                      ))}
                      
                      {/* Task blocks */}
                      {hourTasks.map((task, idx) => (
                        <div 
                          key={task.id}
                          className="timeline-block task"
                          style={{ 
                            top: 4 + (anchors.length + idx) * 40,
                            height: Math.min((task.estimatedMinutes || 30), 55)
                          }}
                          onClick={() => { setEditingTask(task); setShowModal('editTask'); }}
                        >
                          <div className="timeline-block-title">{task.title}</div>
                          <div className="timeline-block-time">
                            {task.scheduledTime}
                            {task.estimatedMinutes && ` • ${task.estimatedMinutes} ${t('min')}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Drawer FAB */}
        <button className="drawer-fab" onClick={() => setShowDrawer(true)}>
          📋
        </button>
        
        {/* Task Drawer */}
        <div className={`drawer ${showDrawer ? 'open' : ''}`}>
          <div className="drawer-header">
            <div className="drawer-title">{t('drawer')} ({allUnscheduled.length})</div>
            <button className="drawer-close" onClick={() => setShowDrawer(false)}>✕</button>
          </div>
          <div className="drawer-content">
            {allUnscheduled.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">✨</div>
                <div className="empty-state-desc">{t('noTasks')}</div>
              </div>
            ) : (
              allUnscheduled.map(task => (
                <div 
                  key={task.id} 
                  className="drawer-task"
                  draggable
                  onDragStart={() => setDraggedTask(task)}
                  onClick={() => { setEditingTask(task); setShowModal('editTask'); }}
                >
                  <span className="drawer-task-drag">⋮⋮</span>
                  <span>{task.title}</span>
                  {task.project && <span className="task-chip project">{task.project}</span>}
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Add Task Bar */}
        <div className="add-task-bar" style={{ bottom: showDrawer ? 'auto' : 0 }}>
          <input
            type="text"
            className="add-task-input"
            placeholder={isRTL() ? 'פרויקט* משימה חדשה...' : 'Project* New task...'}
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
          />
          <button className="add-task-btn" onClick={addTask}>+</button>
        </div>
      </>
    );
  };


  // ╔══════════════════════════════════════════════════════════════════════════════╗
  // ║  SECTION 12: RENDER - Settings, History, Lists                               ║
  // ╚══════════════════════════════════════════════════════════════════════════════╝
  
  // Settings Screen
  const renderSettingsScreen = () => (
    <>
      {renderHeader(true, t('settingsTitle'))}
      <div className="settings-container">
        {/* User Type */}
        <div className="settings-section">
          <div className="settings-section-header">{t('userType')}</div>
          <div className="settings-row">
            <div className="settings-row-info">
              <div className="settings-row-title">
                {userSettings.userType === 'doer' ? t('doerTitle') : t('plannerTitle')}
              </div>
              <div className="settings-row-desc">
                {userSettings.userType === 'doer' ? t('doerDesc') : t('plannerDesc')}
              </div>
            </div>
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setUserSettings(prev => ({
                  ...prev,
                  userType: prev.userType === 'doer' ? 'planner' : 'doer'
                }));
              }}
            >
              {userSettings.userType === 'doer' ? t('switchToPlanner') : t('switchToDoer')}
            </button>
          </div>
        </div>
        
        {/* Language */}
        <div className="settings-section">
          <div className="settings-section-header">{t('language')}</div>
          <div className="settings-row">
            <div className="settings-row-info">
              <div className="settings-row-title">{t('language')}</div>
            </div>
            <select 
              className="settings-select"
              value={userSettings.language || 'auto'}
              onChange={(e) => setUserSettings(prev => ({ 
                ...prev, 
                language: e.target.value === 'auto' ? null : e.target.value 
              }))}
            >
              <option value="auto">Auto</option>
              <option value="he">{t('hebrew')}</option>
              <option value="en">{t('english')}</option>
            </select>
          </div>
          <div className="settings-row">
            <div className="settings-row-info">
              <div className="settings-row-title">{t('hebrewCalendar')}</div>
              <div className="settings-row-desc">{t('showHebrewDates')}</div>
            </div>
            <div 
              className={`toggle ${userSettings.showHebrewCalendar ? 'on' : ''}`}
              onClick={() => setUserSettings(prev => ({ 
                ...prev, 
                showHebrewCalendar: !prev.showHebrewCalendar 
              }))}
            />
          </div>
        </div>
        
        {/* Rewards */}
        <div className="settings-section">
          <div className="settings-section-header">{t('rewards')}</div>
          <div className="settings-row">
            <div className="settings-row-info">
              <div className="settings-row-title">{t('rewardsEnabled')}</div>
            </div>
            <div 
              className={`toggle ${userSettings.rewards?.enabled ? 'on' : ''}`}
              onClick={() => setUserSettings(prev => ({ 
                ...prev, 
                rewards: { ...prev.rewards, enabled: !prev.rewards?.enabled }
              }))}
            />
          </div>
          {userSettings.rewards?.enabled && (
            <>
              <div className="settings-row">
                <div className="settings-row-info">
                  <div className="settings-row-title">{t('currentBalance')}</div>
                </div>
                <span style={{ fontWeight: 600, color: 'var(--success)' }}>
                  {userSettings.rewards.currency}{(userSettings.rewards.currentBalance || 0).toFixed(0)}
                </span>
              </div>
              <div className="settings-row">
                <div className="settings-row-info">
                  <div className="settings-row-title">{t('rewardPerTask')}</div>
                </div>
                <input 
                  type="number"
                  className="settings-select"
                  style={{ width: 80 }}
                  value={userSettings.rewards?.ratePerTask || 5}
                  onChange={(e) => setUserSettings(prev => ({ 
                    ...prev, 
                    rewards: { ...prev.rewards, ratePerTask: Number(e.target.value) }
                  }))}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
  
  // History Screen
  const renderHistoryScreen = () => {
    const completedTasks = tasks.filter(t => t.status === 'done');
    const thisWeekTasks = completedTasks.filter(t => {
      const date = new Date(t.completedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    });
    
    // Calculate stats
    const totalCompleted = completedTasks.length;
    const weekCompleted = thisWeekTasks.length;
    const totalTime = tasks.reduce((sum, t) => sum + (t.timeSpentSeconds || 0), 0);
    
    return (
      <>
        {renderHeader(true, t('historyTitle'))}
        <div className="history-container">
          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{totalCompleted}</div>
              <div className="stat-label">{t('completedTasks')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{weekCompleted}</div>
              <div className="stat-label">{t('thisWeek')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{Math.floor(totalTime / 3600)}h</div>
              <div className="stat-label">{t('totalTimeSpent')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {userSettings.rewards?.enabled ? 
                  `${userSettings.rewards.currency}${(userSettings.rewards.currentBalance || 0).toFixed(0)}` : 
                  '-'
                }
              </div>
              <div className="stat-label">{t('rewards')}</div>
            </div>
          </div>
          
          {/* Recent Completed */}
          <div className="history-section">
            <div className="history-section-header">{t('completedTasks')}</div>
            {completedTasks.slice(0, 10).map(task => (
              <div key={task.id} className="history-item">
                <span>✓</span>
                <span style={{ flex: 1 }}>{task.title}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : ''}
                </span>
              </div>
            ))}
            {completedTasks.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-desc">{t('noTasks')}</div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };
  
  // Lists Screen
  const renderListsScreen = () => {
    if (editingList) {
      const list = lists.find(l => l.id === editingList);
      if (!list) return null;
      
      return (
        <>
          {renderHeader(false)}
          <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
              <button 
                className="header-back" 
                onClick={() => setEditingList(null)}
              >
                {isRTL() ? '→' : '←'}
              </button>
              <h2 style={{ margin: 0 }}>{list.title}</h2>
            </div>
            
            {list.items?.map((item, idx) => (
              <div key={idx} className="list-item">
                <span>{item.type === 'link' ? '🔗' : '📝'}</span>
                <span style={{ flex: 1 }}>{item.content}</span>
                <button 
                  className="task-action-btn"
                  onClick={() => {
                    setLists(prev => prev.map(l => 
                      l.id === list.id 
                        ? { ...l, items: l.items.filter((_, i) => i !== idx) }
                        : l
                    ));
                  }}
                >
                  🗑️
                </button>
              </div>
            ))}
            
            <button 
              className="btn btn-danger"
              style={{ marginTop: 20 }}
              onClick={() => deleteList(list.id)}
            >
              {t('deleteList')}
            </button>
          </div>
        </>
      );
    }
    
    return (
      <>
        {renderHeader(true, t('listsTitle'))}
        <div className="lists-container">
          {/* Add List */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <input
              type="text"
              className="add-task-input"
              style={{ flex: 1 }}
              placeholder={t('listName')}
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addList()}
            />
            <button className="add-task-btn" onClick={addList}>+</button>
          </div>
          
          {/* Lists */}
          {lists.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📚</div>
              <div className="empty-state-title">{t('emptyList')}</div>
            </div>
          ) : (
            lists.map(list => (
              <div 
                key={list.id} 
                className="list-card"
                onClick={() => setEditingList(list.id)}
              >
                <div className="list-card-header">
                  <div className="list-card-title">📋 {list.title}</div>
                  <div className="list-card-count">{list.items?.length || 0} items</div>
                </div>
              </div>
            ))
          )}
        </div>
      </>
    );
  };


  // ╔══════════════════════════════════════════════════════════════════════════════╗
  // ║  SECTION 13: RENDER - Modals                                                 ║
  // ╚══════════════════════════════════════════════════════════════════════════════╝
  
  // Edit Task Modal
  const renderEditTaskModal = () => {
    if (!editingTask) return null;
    
    return (
      <div className="modal-overlay" onClick={() => setShowModal(null)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-title">{t('editTask')}</div>
            <button className="modal-close" onClick={() => setShowModal(null)}>✕</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">{t('title')}</label>
              <input
                type="text"
                className="form-input"
                value={editingTask.title}
                onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('project')}</label>
              <input
                type="text"
                className="form-input"
                value={editingTask.project || ''}
                onChange={(e) => setEditingTask({ ...editingTask, project: e.target.value || null })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('date')}</label>
              <input
                type="date"
                className="form-input"
                value={editingTask.date || ''}
                onChange={(e) => setEditingTask({ ...editingTask, date: e.target.value || null })}
              />
            </div>
            {userSettings.userType === 'planner' && (
              <>
                <div className="form-group">
                  <label className="form-label">{t('scheduledTime')}</label>
                  <input
                    type="time"
                    className="form-input"
                    value={editingTask.scheduledTime || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, scheduledTime: e.target.value || null })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('duration')}</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editingTask.estimatedMinutes || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, estimatedMinutes: Number(e.target.value) || null })}
                    placeholder="30"
                  />
                </div>
              </>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowModal(null)}>
              {t('cancel')}
            </button>
            <button className="btn btn-primary" onClick={() => saveTask(editingTask)}>
              {t('save')}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Delete Confirmation Modal
  const renderDeleteModal = () => {
    if (!editingTask) return null;
    
    return (
      <div className="modal-overlay" onClick={() => setShowModal(null)}>
        <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
          <div className="modal-header">
            <div className="modal-title">{t('deleteTask')}</div>
            <button className="modal-close" onClick={() => setShowModal(null)}>✕</button>
          </div>
          <div className="modal-body" style={{ textAlign: 'center' }}>
            <p>{isRTL() ? 'האם למחוק את המשימה?' : 'Delete this task?'}</p>
            <p style={{ fontWeight: 500 }}>{editingTask.title}</p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowModal(null)}>
              {t('cancel')}
            </button>
            <button className="btn btn-danger" onClick={() => deleteTask(editingTask.id)}>
              {t('delete')}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Reward Popup
  const renderRewardPopup = () => (
    <>
      <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.3)' }} onClick={() => setShowRewardPopup(false)} />
      <div className="reward-popup">
        <div className="reward-popup-icon">🎉</div>
        <div className="reward-popup-title">{t('congrats')}</div>
        <div className="reward-popup-amount">
          +{userSettings.rewards?.currency}{lastRewardAmount}
        </div>
      </div>
    </>
  );


  // ╔══════════════════════════════════════════════════════════════════════════════╗
  // ║  SECTION 14: MAIN RENDER                                                     ║
  // ╚══════════════════════════════════════════════════════════════════════════════╝
  
  // Loading
  if (isLoading) {
    return (
      <div className={`app ${isRTL() ? 'rtl' : 'ltr'}`}>
        <style>{styles}</style>
        <div className="loading">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }
  
  // Not logged in
  if (!user) {
    return (
      <div className={`app ${isRTL() ? 'rtl' : 'ltr'}`}>
        <style>{styles}</style>
        {renderLoginScreen()}
      </div>
    );
  }
  
  // Path not selected
  if (!userSettings.isOnboarded) {
    return (
      <div className={`app ${isRTL() ? 'rtl' : 'ltr'}`}>
        <style>{styles}</style>
        {renderPathSelection()}
      </div>
    );
  }
  
  // FRX not completed
  if (!userSettings.frxCompleted && currentScreen === 'frx') {
    return (
      <div className={`app ${isRTL() ? 'rtl' : 'ltr'}`}>
        <style>{styles}</style>
        {userSettings.userType === 'doer' ? renderDoerFRX() : renderPlannerFRX()}
      </div>
    );
  }
  
  // First time after path selection - redirect to FRX
  if (!userSettings.frxCompleted && currentScreen === 'home') {
    setCurrentScreen('frx');
    return null;
  }
  
  // Execution Mode (Doer)
  if (isExecutionMode && userSettings.userType === 'doer') {
    return (
      <div className={`app ${isRTL() ? 'rtl' : 'ltr'}`}>
        <style>{styles}</style>
        {renderExecutionMode()}
        {showRewardPopup && renderRewardPopup()}
      </div>
    );
  }
  
  // Main App
  return (
    <div className={`app ${isRTL() ? 'rtl' : 'ltr'}`}>
      <style>{styles}</style>
      
      {/* Main Content */}
      {currentScreen === 'home' && userSettings.userType === 'doer' && renderDoerDashboard()}
      {currentScreen === 'home' && userSettings.userType === 'planner' && renderPlannerDashboard()}
      {currentScreen === 'settings' && renderSettingsScreen()}
      {currentScreen === 'history' && renderHistoryScreen()}
      {currentScreen === 'lists' && renderListsScreen()}
      
      {/* Sidebar */}
      {renderSidebar()}
      
      {/* Morning Wizard */}
      {showMorningWizard && renderMorningWizard()}
      
      {/* Modals */}
      {showModal === 'editTask' && renderEditTaskModal()}
      {showModal === 'deleteTask' && renderDeleteModal()}
      
      {/* Reward Popup */}
      {showRewardPopup && renderRewardPopup()}
      
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default LifeOS;
