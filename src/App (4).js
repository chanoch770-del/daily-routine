import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getAuth, signInWithRedirect, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, getRedirectResult } from 'firebase/auth';

/*
╔══════════════════════════════════════════════════════════════════════════════╗
║                         מפת הסקציות - SECTION MAP                           ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  SECTION 0:  FIREBASE & GOOGLE - הגדרות Firebase ו-Google                   ║
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
// ║  SECTION 0: FIREBASE & GOOGLE - הגדרות Firebase ו-Google                    ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

const firebaseConfig = {
  apiKey: "AIzaSyD3B8BkXmFmM-b9CQKkQZ_M40bj58BDx5A",
  authDomain: "ttm1-8ff6b.firebaseapp.com",
  projectId: "ttm1-8ff6b",
  storageBucket: "ttm1-8ff6b.firebasestorage.app",
  messagingSenderId: "962295822873",
  appId: "1:962295822873:web:64c6e684bd455febc508c8"
};

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = '1002783323490-e8q8obn4nj2i3t20cbep45cnrvclvkc3.apps.googleusercontent.com';
const GEMINI_API_KEY = 'AIzaSyCPsxNy1CkH-f9SMvp3mYhjN_YbDEmyL7s';

// Google API Scopes
const GOOGLE_SCOPES = {
  gmail: 'https://www.googleapis.com/auth/gmail.readonly',
  drive: 'https://www.googleapis.com/auth/drive.file',
  calendar: 'https://www.googleapis.com/auth/calendar'
};

const app = initializeApp(firebaseConfig);
// Use new persistence API with multi-tab support for real-time sync
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});
const auth = getAuth(app);


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  TRANSLATIONS - תרגומים                                                      ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

const translations = {
  he: {
    // General
    appName: 'ניהול סדר יום',
    welcome: 'ברוכים הבאים',
    loading: 'טוען נתונים...',
    save: 'שמור',
    cancel: 'ביטול',
    delete: 'מחק',
    edit: 'עריכה',
    add: 'הוסף',
    done: 'בוצע',
    close: 'סגור',
    yes: 'כן',
    no: 'לא',
    today: 'היום',
    
    // Login
    loginTitle: 'ניהול סדר יום',
    loginSubtitle: 'התחבר עם חשבון Google כדי לסנכרן את המשימות שלך בין מכשירים',
    loginWithGoogle: 'התחבר עם Google',
    logout: 'התנתק',
    
    // Home Screen
    openTasks: 'משימות פתוחות',
    startRoutine: 'התחל רוטינה',
    quickTasks: 'משימות מהירות',
    dailyTasks: 'משימות יומיות',
    manageTasks: 'ניהול משימות',
    donations: 'צדקה',
    history: 'היסטוריה',
    lists: 'רשימות',
    settings: 'הגדרות',
    
    // Tasks
    task: 'משימה',
    tasks: 'משימות',
    newTask: 'משימה חדשה',
    addTask: 'הוסף משימה',
    editTask: 'עריכת משימה',
    deleteTask: 'מחיקת משימה',
    deleteTaskConfirm: 'האם אתה בטוח שברצונך למחוק את המשימה',
    includingSubtasks: 'כולל {count} תתי-משימות',
    taskCompleted: 'משימה הושלמה!',
    taskAdded: 'משימה נוספה!',
    taskDeleted: 'משימה נמחקה',
    noTasks: 'אין משימות',
    allTasksCompleted: 'כל המשימות הושלמו!',
    stopTimer: 'עצור טיימר',
    startTimer: 'התחל טיימר',
    addSubtask: 'הוסף תת-משימה',
    deleteTask: 'מחק משימה',
    newSubtask: 'תת-משימה חדשה...',
    newTaskPlaceholder: 'פרויקט* משימה חדשה...',
    add: 'הוסף',
    from: 'מתוך',
    openTasks: 'משימות פתוחות',
    noDateTasks: 'משימות ללא תאריך',
    overdueTasks: 'משימות באיחור',
    todayTasks: 'משימות להיום',
    confirmDelete: 'האם למחוק?',
    confirmDeleteRecurring: 'זו משימה חוזרת. האם למחוק?',
    searchGooglePlaceholder: 'חפש באימיילים, דרייב...',
    searching: 'מחפש...',
    noResults: 'לא נמצאו תוצאות',
    addAsTask: 'הוסף כמשימה',
    
    // Task Fields
    title: 'כותרת',
    description: 'תיאור',
    date: 'תאריך',
    project: 'פרויקט',
    projectName: 'שם פרויקט',
    taskType: 'סוג משימה',
    quickTask: 'משימה מהירה',
    dailyTask: 'משימה יומית',
    reminder: 'תזכורת',
    atTaskTime: 'בזמן המשימה',
    minutesBefore: '{min} דקות לפני',
    hourBefore: 'שעה לפני',
    scheduledTime: 'שעה מתוכננת',
    duration: 'משך (דקות)',
    recurrence: 'חזרה',
    noRecurrence: 'ללא חזרה',
    daily: 'יומי',
    weekly: 'שבועי',
    biweekly: 'דו-שבועי',
    monthly: 'חודשי',
    yearly: 'שנתי',
    custom: 'מותאם אישית',
    
    // Routine
    routine: 'רוטינה',
    dailyRoutine: 'רוטינה יומית',
    phase: 'שלב',
    studies: 'שיעורים',
    communication: 'תקשורת',
    focusTask: 'משימה בפוקוס',
    continueToDaily: 'המשך למשימות יומיות',
    completeRoutine: 'סיים רוטינה',
    
    // Studies
    chumash: 'חומש',
    tanya: 'תניא',
    rambam: 'רמב"ם',
    hayomYom: 'היום יום',
    chapters: 'פרקים',
    chapter: 'פרק',
    
    // Communication
    whatsapp: 'WhatsApp',
    email: 'אימייל',
    sms: 'SMS',
    
    // Calendar
    calendar: 'לוח שנה',
    sun: 'א',
    mon: 'ב',
    tue: 'ג',
    wed: 'ד',
    thu: 'ה',
    fri: 'ו',
    sat: 'ש',
    
    // Timeline
    timeline: 'יומן',
    unscheduledTasks: 'משימות ללא זמן',
    dragToSchedule: 'גרור משימה לשעה הרצויה',
    scheduledTo: 'משימה תוזמנה ל-{time}',
    
    // Lists
    newList: 'רשימה חדשה',
    listName: 'שם הרשימה',
    createList: 'צור רשימה',
    deleteList: 'מחק רשימה',
    deleteListConfirm: 'האם למחוק את הרשימה?',
    listCreated: 'רשימה נוצרה!',
    listDeleted: 'רשימה נמחקה',
    emptyList: 'הרשימה ריקה',
    addItemsAbove: 'הוסף פריטים למעלה',
    noListsYet: 'אין רשימות עדיין',
    createFirstList: 'צור רשימה ראשונה למעלה',
    items: 'פריטים',
    addItem: 'הוסף פריט',
    itemAdded: 'פריט נוסף!',
    note: 'הערה',
    link: 'קישור',
    idea: 'רעיון',
    
    // Donations
    donationsTitle: 'צדקה',
    totalDonated: 'סה"כ נתרם',
    pendingDonations: 'תרומות ממתינות',
    addDonation: 'הוסף תרומה',
    amount: 'סכום',
    purpose: 'מטרה',
    paid: 'שולם',
    markAsPaid: 'סמן כשולם',
    
    // History
    historyTitle: 'היסטוריה',
    downloadReport: 'הורד דוח 30 יום',
    reportDownloaded: 'הדוח הורד בהצלחה!',
    productivity: 'פרודוקטיביות',
    routineCompleted: 'רוטינה הושלמה',
    noRoutine: 'לא בוצעה רוטינה',
    
    // Settings
    settingsTitle: 'הגדרות',
    language: 'שפה',
    hebrew: 'עברית',
    english: 'English',
    modules: 'מודולים פעילים',
    generalSettings: 'הגדרות כלליות',
    routineSettings: 'הגדרות רוטינה',
    timerSettings: 'זמני טיימר (בדקות)',
    endOfDay: 'סוף היום',
    unfinishedPolicy: 'מדיניות משימות לא גמורות',
    rollover: 'העבר למחר',
    backlog: 'העבר לראשי',
    includeStudies: 'שיעורים יומיים',
    showStudiesPhase: 'הצג שלב שיעורים ברוטינה',
    enableQuickTasks: 'משימות מהירות',
    showQuickTasksPhase: 'הצג שלב משימות מהירות ברוטינה',
    manageStudies: 'ניהול שיעורים',
    counter: 'מונה',
    studyName: 'שם השיעור',
    addStudy: 'הוסף',
    tasksDesc: 'ניהול משימות יומיות ומהירות',
    routineDesc: 'רוטינה יומית עם שלבים',
    donationsDesc: 'מעקב תרומות וצדקות',
    historyDesc: 'צפייה בסטטיסטיקות ודוחות',
    listsDesc: 'שמור הערות, קישורים ורעיונות',
    enableRewards: 'הפעל תגמולים',
    enableRewardsDesc: 'קבל תגמול על כל משימה שהושלמה',
    speedBonusDesc: 'בונוס לכל דקה שנחסכה (לפי הערכת זמן)',
    target: 'יעד',
    targetPlaceholder: 'שם היעד (למשל: AirPods)',
    
    // Rewards
    rewards: 'תגמולים',
    rewardsSystem: 'מערכת תגמולים',
    currentBalance: 'יתרה נוכחית',
    rewardPerTask: 'תגמול למשימה',
    speedBonus: 'בונוס מהירות לדקה',
    targetName: 'שם היעד',
    targetAmount: 'סכום יעד',
    resetBalance: 'אפס יתרה',
    excellent: 'מצוין!',
    currency: 'מטבע',
    
    // AI Assistant
    aiAssistant: 'עוזר AI',
    howCanIHelp: 'איך אוכל לעזור?',
    createTask: 'צור משימה',
    todayTasks: 'משימות היום',
    mostUrgent: 'דחוף ביותר',
    writeMessage: 'כתוב או הקלט הודעה...',
    thinking: 'חושב...',
    taskCreated: 'משימה נוצרה!',
    
    // Voice
    recording: 'מקליט... דבר עכשיו',
    startRecording: 'התחל הקלטה קולית',
    stopRecording: 'עצור הקלטה',
    transcribing: 'מתמלל...',
    microphoneError: 'לא ניתן לגשת למיקרופון',
    transcriptionError: 'שגיאה בתמלול',
    
    // Onboarding
    onboardingTitle: 'ברוכים הבאים!',
    onboardingSubtitle: 'בוא נתאים את האפליקציה אליך.\nבחר את המודולים שאתה רוצה להשתמש בהם:',
    onboardingNote: 'אל דאגה, תוכל לשנות את ההגדרות בכל עת דרך מסך ההגדרות',
    startApp: 'התחל!',
    
    // Notifications & Messages
    hello: 'שלום',
    welcomeBack: 'ברוך הבא',
    signedOut: 'התנתקת בהצלחה',
    connectionError: 'שגיאה בהתחברות',
    aiError: 'שגיאה בחיבור ל-AI',
    processingError: 'שגיאה בעיבוד ההצעות',
    aiSuggestionsError: 'שגיאה בקבלת הצעות מ-AI',
    noSubtasksSelected: 'לא נבחרו תתי-משימות',
    subtasksAdded: 'נוספו {count} תתי-משימות!',
    permissionRevoked: 'ההרשאה בוטלה',
    notesSaved: 'ההערות נשמרו! נשתמש בהן בפעם הבאה',
    subtaskAdded: 'תת-משימה נוספה',
    studiesLoaded: 'השיעורים שמילאת היום נטענו',
    studiesSaved: 'שיעורים יומיים נשמרו!',
    routineEnded: 'רוטינה הסתיימה',
    link: 'קישור',
    sourcesChecked: 'מקורות נבדקו!',
    noQuickTasks: 'אין משימות מהירות - עובר למשימות יומיות',
    routineCompleted: 'סיימת את הרוטינה היומית!',
    openInEmail: 'פתח באימייל',
    openInDrive: 'פתח ב-Drive',
    noSubject: 'ללא נושא',
    unknown: 'לא ידוע',
    noProjects: 'אין פרויקטים',
    couldNotUnderstand: 'לא הצלחתי להבין, נסה שוב',
    breakingDown: 'מפרק משימה...',
    breakdownWithAI: 'פרק לתתי-משימות עם AI',
    addSelected: 'הוסף נבחרים',
    selectAll: 'בחר הכל',
    unselectAll: 'בטל בחירה',
    aiSuggestions: 'הצעות AI',
    
    // Misc
    all: 'הכל',
    main: 'ראשי',
    noDate: 'ללא תאריך',
    withDate: 'עם תאריך',
    subtasks: 'תתי-משימות',
    addSubtask: 'הוסף תת-משימה',
    newSubtask: 'תת-משימה חדשה',
    aiBreakdown: 'פירוק AI',
    sendToMain: 'שלח לראשי',
    postpone: 'דחה',
    complete: 'השלם',
    notes: 'הערות',
    notesForNextTime: 'הערות לפעם הבאה',
    openLink: 'פתח קישור',
    totalTime: 'סה"כ זמן',
    hours: 'שעות',
    minutes: 'דקות',
    noOpenTasks: 'אין משימות פתוחות!',
    taskMovedToMain: 'משימה הועברה לראשי',
    studyAdded: 'שיעור נוסף!',
    dataDeleted: 'הנתונים נמחקו',
    added: 'נוסף!',
    deleted: 'נמחק',
    deleteData: 'מחק נתונים',
    deleteDataConfirm: 'האם למחוק את כל הנתונים?',
    day: 'יום',
    days: 'ימים',
    week: 'שבוע',
    weeks: 'שבועות',
    month: 'חודש',
    months: 'חודשים',
    year: 'שנה',
    years: 'שנים'
  },
  
  en: {
    // General
    appName: 'Daily Planner',
    welcome: 'Welcome',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    done: 'Done',
    close: 'Close',
    yes: 'Yes',
    no: 'No',
    today: 'Today',
    
    // Login
    loginTitle: 'Daily Planner',
    loginSubtitle: 'Sign in with Google to sync your tasks across devices',
    loginWithGoogle: 'Sign in with Google',
    logout: 'Sign Out',
    
    // Home Screen
    openTasks: 'Open Tasks',
    startRoutine: 'Start Routine',
    quickTasks: 'Quick Tasks',
    dailyTasks: 'Daily Tasks',
    manageTasks: 'Manage Tasks',
    donations: 'Charity',
    history: 'History',
    lists: 'Lists',
    settings: 'Settings',
    
    // Tasks
    task: 'Task',
    tasks: 'Tasks',
    newTask: 'New Task',
    addTask: 'Add Task',
    editTask: 'Edit Task',
    deleteTask: 'Delete Task',
    deleteTaskConfirm: 'Are you sure you want to delete the task',
    includingSubtasks: 'including {count} subtasks',
    taskCompleted: 'Task completed!',
    taskAdded: 'Task added!',
    taskDeleted: 'Task deleted',
    noTasks: 'No tasks',
    allTasksCompleted: 'All tasks completed!',
    stopTimer: 'Stop timer',
    startTimer: 'Start timer',
    addSubtask: 'Add subtask',
    newSubtask: 'New subtask...',
    newTaskPlaceholder: 'Project* New task...',
    add: 'Add',
    from: 'from',
    openTasks: 'Open Tasks',
    noDateTasks: 'Tasks without date',
    overdueTasks: 'Overdue tasks',
    todayTasks: 'Today\'s tasks',
    confirmDelete: 'Delete?',
    confirmDeleteRecurring: 'This is a recurring task. Delete?',
    searchGooglePlaceholder: 'Search emails, Drive...',
    searching: 'Searching...',
    noResults: 'No results found',
    addAsTask: 'Add as task',
    
    // Task Fields
    title: 'Title',
    description: 'Description',
    date: 'Date',
    project: 'Project',
    projectName: 'Project name',
    taskType: 'Task Type',
    quickTask: 'Quick Task',
    dailyTask: 'Daily Task',
    reminder: 'Reminder',
    atTaskTime: 'At task time',
    minutesBefore: '{min} minutes before',
    hourBefore: '1 hour before',
    scheduledTime: 'Scheduled Time',
    duration: 'Duration (min)',
    recurrence: 'Recurrence',
    noRecurrence: 'No recurrence',
    daily: 'Daily',
    weekly: 'Weekly',
    biweekly: 'Every 2 weeks',
    monthly: 'Monthly',
    yearly: 'Yearly',
    custom: 'Custom',
    
    // Routine
    routine: 'Routine',
    dailyRoutine: 'Daily Routine',
    phase: 'Phase',
    studies: 'Studies',
    communication: 'Communication',
    focusTask: 'Focus Task',
    continueToDaily: 'Continue to Daily Tasks',
    completeRoutine: 'Complete Routine',
    
    // Studies
    chumash: 'Chumash',
    tanya: 'Tanya',
    rambam: 'Rambam',
    hayomYom: 'Hayom Yom',
    chapters: 'Chapters',
    chapter: 'Chapter',
    
    // Communication
    whatsapp: 'WhatsApp',
    email: 'Email',
    sms: 'SMS',
    
    // Calendar
    calendar: 'Calendar',
    sun: 'S',
    mon: 'M',
    tue: 'T',
    wed: 'W',
    thu: 'T',
    fri: 'F',
    sat: 'S',
    
    // Timeline
    timeline: 'Timeline',
    unscheduledTasks: 'Unscheduled Tasks',
    dragToSchedule: 'Drag a task to schedule it',
    scheduledTo: 'Task scheduled for {time}',
    
    // Lists
    newList: 'New List',
    listName: 'List name',
    createList: 'Create',
    deleteList: 'Delete List',
    deleteListConfirm: 'Delete this list?',
    listCreated: 'List created!',
    listDeleted: 'List deleted',
    emptyList: 'List is empty',
    addItemsAbove: 'Add items above',
    noListsYet: 'No lists yet',
    createFirstList: 'Create your first list above',
    items: 'items',
    addItem: 'Add Item',
    itemAdded: 'Item added!',
    note: 'Note',
    link: 'Link',
    idea: 'Idea',
    
    // Donations
    donationsTitle: 'Charity',
    totalDonated: 'Total Donated',
    pendingDonations: 'Pending Donations',
    addDonation: 'Add Donation',
    amount: 'Amount',
    purpose: 'Purpose',
    paid: 'Paid',
    markAsPaid: 'Mark as Paid',
    
    // History
    historyTitle: 'History',
    downloadReport: 'Download 30-Day Report',
    reportDownloaded: 'Report downloaded!',
    productivity: 'Productivity',
    routineCompleted: 'Routine Completed',
    noRoutine: 'No routine completed',
    
    // Settings
    settingsTitle: 'Settings',
    language: 'Language',
    hebrew: 'עברית',
    english: 'English',
    modules: 'Active Modules',
    generalSettings: 'General Settings',
    routineSettings: 'Routine Settings',
    timerSettings: 'Timer Settings (minutes)',
    endOfDay: 'End of Day',
    unfinishedPolicy: 'Unfinished Tasks Policy',
    rollover: 'Roll over to tomorrow',
    backlog: 'Move to backlog',
    includeStudies: 'Daily Studies',
    showStudiesPhase: 'Show studies phase in routine',
    enableQuickTasks: 'Quick Tasks',
    showQuickTasksPhase: 'Show quick tasks phase in routine',
    manageStudies: 'Manage Studies',
    counter: 'Counter',
    studyName: 'Study name',
    addStudy: 'Add',
    tasksDesc: 'Manage daily and quick tasks',
    routineDesc: 'Daily routine with phases',
    donationsDesc: 'Track donations and charity',
    historyDesc: 'View statistics and reports',
    listsDesc: 'Save notes, links and ideas',
    enableRewards: 'Enable Rewards',
    enableRewardsDesc: 'Get rewards for completed tasks',
    speedBonusDesc: 'Bonus for each minute saved (based on estimate)',
    target: 'Target',
    targetPlaceholder: 'Target name (e.g. AirPods)',
    
    // Rewards
    rewards: 'Rewards',
    rewardsSystem: 'Rewards System',
    currentBalance: 'Current Balance',
    rewardPerTask: 'Reward per Task',
    speedBonus: 'Speed Bonus per Minute',
    targetName: 'Target Name',
    targetAmount: 'Target Amount',
    resetBalance: 'Reset Balance',
    excellent: 'Excellent!',
    currency: 'Currency',
    
    // AI Assistant
    aiAssistant: 'AI Assistant',
    howCanIHelp: 'How can I help?',
    createTask: 'Create Task',
    todayTasks: "Today's Tasks",
    mostUrgent: 'Most Urgent',
    writeMessage: 'Type or record a message...',
    thinking: 'Thinking...',
    taskCreated: 'Task created!',
    
    // Voice
    recording: 'Recording... speak now',
    startRecording: 'Start voice recording',
    stopRecording: 'Stop recording',
    transcribing: 'Transcribing...',
    microphoneError: 'Cannot access microphone',
    transcriptionError: 'Transcription error',
    
    // Onboarding
    onboardingTitle: 'Welcome!',
    onboardingSubtitle: "Let's customize the app for you.\nSelect the modules you want to use:",
    onboardingNote: "Don't worry, you can change these settings anytime",
    startApp: "Let's Go!",
    
    // Notifications & Messages
    hello: 'Hello',
    welcomeBack: 'Welcome back',
    signedOut: 'Signed out successfully',
    connectionError: 'Connection error',
    aiError: 'AI connection error',
    processingError: 'Error processing suggestions',
    aiSuggestionsError: 'Error getting AI suggestions',
    noSubtasksSelected: 'No subtasks selected',
    subtasksAdded: '{count} subtasks added!',
    permissionRevoked: 'Permission revoked',
    notesSaved: "Notes saved! We'll use them next time",
    subtaskAdded: 'Subtask added',
    studiesLoaded: "Today's studies loaded",
    studiesSaved: 'Daily studies saved!',
    routineEnded: 'Routine completed',
    link: 'Link',
    sourcesChecked: 'Sources checked!',
    noQuickTasks: 'No quick tasks - moving to daily tasks',
    routineCompleted: 'You completed your daily routine!',
    openInEmail: 'Open in Email',
    openInDrive: 'Open in Drive',
    noSubject: 'No subject',
    unknown: 'Unknown',
    noProjects: 'No projects',
    couldNotUnderstand: "Couldn't understand, try again",
    breakingDown: 'Breaking down...',
    breakdownWithAI: 'Break into subtasks with AI',
    addSelected: 'Add Selected',
    selectAll: 'Select All',
    unselectAll: 'Unselect All',
    aiSuggestions: 'AI Suggestions',
    
    // Misc
    all: 'All',
    main: 'Main',
    noDate: 'No date',
    withDate: 'With date',
    subtasks: 'Subtasks',
    addSubtask: 'Add Subtask',
    newSubtask: 'New subtask',
    aiBreakdown: 'AI Breakdown',
    sendToMain: 'Send to Main',
    postpone: 'Postpone',
    complete: 'Complete',
    notes: 'Notes',
    notesForNextTime: 'Notes for next time',
    openLink: 'Open Link',
    totalTime: 'Total Time',
    hours: 'hours',
    minutes: 'minutes',
    noOpenTasks: 'No open tasks!',
    taskMovedToMain: 'Task moved to main',
    studyAdded: 'Study added!',
    dataDeleted: 'Data deleted',
    added: 'Added!',
    deleted: 'Deleted',
    deleteData: 'Delete Data',
    deleteDataConfirm: 'Delete all data?',
    day: 'day',
    days: 'days',
    week: 'week',
    weeks: 'weeks',
    month: 'month',
    months: 'months',
    year: 'year',
    years: 'years'
  }
};
const googleProvider = new GoogleAuthProvider();

// פונקציה לבקשת הרשאות - משתמשת ב-redirect במקום popup
const requestGooglePermission = (scope, permissionType) => {
  // שמור את סוג ההרשאה ב-sessionStorage
  sessionStorage.setItem('pending_permission', permissionType);
  
  const redirectUri = window.location.origin + window.location.pathname;
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=token` +
    `&scope=${encodeURIComponent(scope)}` +
    `&include_granted_scopes=true`;
  
  // redirect לדף האימות של גוגל
  window.location.href = authUrl;
};

// פונקציה לחיפוש אימיילים ב-Gmail
const searchGmailEmails = async (accessToken, maxResults = 20) => {
  try {
    // קבל את האימיילים האחרונים (בלי פילטר ספציפי)
    const searchResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );
    
    if (!searchResponse.ok) {
      console.log('Gmail search failed:', searchResponse.status);
      return [];
    }
    
    const searchData = await searchResponse.json();
    if (!searchData.messages) return [];
    
    // קבל פרטים על כל אימייל
    const emails = await Promise.all(
      searchData.messages.map(async (msg) => {
        const msgResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
          { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        if (!msgResponse.ok) return null;
        const msgData = await msgResponse.json();
        
        const headers = msgData.payload?.headers || [];
        return {
          id: msg.id,
          subject: headers.find(h => h.name === 'Subject')?.value || 'ללא נושא',
          from: headers.find(h => h.name === 'From')?.value || '',
          date: headers.find(h => h.name === 'Date')?.value || '',
          snippet: msgData.snippet || ''
        };
      })
    );
    
    return emails.filter(e => e !== null);
  } catch (error) {
    console.error('Gmail search error:', error);
    return [];
  }
};

// פונקציה לחיפוש קבצים ב-Drive
const searchDriveFiles = async (accessToken, maxResults = 20) => {
  try {
    // קבל קבצים אחרונים (בלי פילטר ספציפי)
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?pageSize=${maxResults}&orderBy=modifiedTime desc&fields=files(id,name,mimeType,webViewLink,modifiedTime)`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );
    
    if (!response.ok) {
      console.log('Drive search failed:', response.status);
      return [];
    }
    
    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error('Drive search error:', error);
    return [];
  }
};

// פונקציה לשימוש ב-Gemini לסינון אימיילים וקבצים רלוונטיים
const filterRelevantItemsWithAI = async (task, answers, emails, files) => {
  const contextInfo = answers ? Object.entries(answers).map(([k, v]) => v).filter(v => v).join(', ') : '';
  
  const prompt = `אתה עוזר חכם שמנתח אימיילים וקבצים כדי למצוא את הרלוונטיים למשימה ספציפית.

המשימה: "${task.title}"
${task.date ? `תאריך המשימה: ${task.date}` : 'אין תאריך ספציפי'}
${contextInfo ? `מידע נוסף מהמשתמש: ${contextInfo}` : ''}
תאריך היום: ${task.date || 'לא צוין'}

רשימת אימיילים:
${emails.map((e, i) => `${i + 1}. נושא: "${e.subject}" | מ: ${e.from} | תאריך: ${e.date} | תקציר: ${e.snippet?.substring(0, 100)}...`).join('\n')}

רשימת קבצים מ-Drive:
${files.map((f, i) => `${i + 1}. שם: "${f.name}" | עודכן: ${f.modifiedTime}`).join('\n')}

כללים חשובים לסינון:
1. בחר רק פריטים שרלוונטיים למשימה הספציפית הזו
2. אם יש תאריך למשימה - בדוק שהאימייל מתאים לתאריך (לא אירוע שכבר עבר!)
3. אם המשימה היא "טיול לישראל ב-15 בינואר" ויש אימייל על טיול לישראל שהיה ב-1 בדצמבר - זה לא רלוונטי!
4. התמקד באימיילים עם אישורים, הזמנות, קבלות שרלוונטיים לעתיד או לתאריך המשימה
5. התעלם מניוזלטרים, פרסומות, ספאם
6. אם אין פריטים רלוונטיים באמת - עדיף להחזיר רשימה ריקה

החזר JSON בפורמט הבא (ורק את ה-JSON):
{
  "relevantEmails": [1, 3, 5],
  "relevantFiles": [2, 4],
  "reasoning": "הסבר קצר למה בחרת את אלה ולמה לא בחרת אחרים"
}

אם אין פריטים רלוונטיים, החזר:
{"relevantEmails": [], "relevantFiles": [], "reasoning": "לא נמצאו פריטים רלוונטיים למשימה הספציפית הזו"}`;

  console.log('🤖 [AI FILTER] Prompt:', prompt);
  
  const response = await askGemini(prompt);
  console.log('🤖 [AI FILTER] Response:', response);
  
  if (response) {
    try {
      const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const data = JSON.parse(cleanResponse);
      console.log('🤖 [AI FILTER] Parsed:', data);
      console.log('🤖 [AI FILTER] Reasoning:', data.reasoning);
      return data;
    } catch (e) {
      console.error('Error parsing AI filter response:', e);
    }
  }
  
  return { relevantEmails: [], relevantFiles: [], reasoning: 'שגיאה בניתוח' };
};

// פונקציה להוספת אירוע ללוח השנה
const addCalendarEvent = async (accessToken, event) => {
  try {
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      }
    );
    
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Calendar add error:', error);
    return null;
  }
};

// Gemini API function
const askGemini = async (prompt) => {
  try {
    // Try different model versions - newest first
    const models = [
      'gemini-2.5-flash-preview-05-20',  // Newest (May 2025)
      'gemini-2.5-pro-preview-05-06',     // Most capable (May 2025)
      'gemini-2.0-flash',                  // Fast (Dec 2024)
      'gemini-1.5-pro',                    // Fallback
      'gemini-1.5-flash'                   // Last fallback
    ];
    
    for (const model of models) {
      try {
        console.log(`🤖 [GEMINI] Trying model: ${model}`);
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });
        
        if (response.ok) {
          console.log(`🤖 [GEMINI] Success with model: ${model}`);
          const data = await response.json();
          return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
        }
      } catch (e) {
        console.log(`Model ${model} failed, trying next...`);
      }
    }
    return null;
  } catch (error) {
    console.error('Gemini API error:', error);
    return null;
  }
};


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
  const tensLetters = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
  const unitsLetters = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
  
  let result = 'ה׳';
  result += hundredsLetters[hundreds] || '';
  
  const lastTwo = (tens * 10) + units;
  if (lastTwo === 15) {
    result += 'ט״ו';
  } else if (lastTwo === 16) {
    result += 'ט״ז';
  } else if (lastTwo === 0) {
    // שנה עגולה כמו תש"פ
  } else if (units === 0) {
    // רק עשרות כמו תש"פ (80)
    result += tensLetters[tens] || '';
  } else if (tens === 0) {
    // רק יחידות
    result += '״' + unitsLetters[units];
  } else {
    // עשרות ויחידות
    result += tensLetters[tens] + '״' + unitsLetters[units];
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

// פונקציה לחישוב ימים בחודש עברי
const getHebrewMonthDays = (gDate) => {
  const days = [];
  const hDate = gregorianToHebrew(gDate);
  const currentHebrewMonth = hDate.monthName;
  
  // מצא את התאריך הלועזי של א׳ בחודש העברי
  let searchDate = new Date(gDate);
  searchDate.setDate(searchDate.getDate() - hDate.day + 1);
  
  // חפש אחורה עד שנמצא א׳ בחודש
  while (gregorianToHebrew(searchDate).day !== 1) {
    searchDate.setDate(searchDate.getDate() - 1);
  }
  
  const firstDayOfMonth = new Date(searchDate);
  const startDayOfWeek = firstDayOfMonth.getDay();
  
  // הוסף ימים ריקים מתחילת השבוע
  for (let i = 0; i < startDayOfWeek; i++) {
    const emptyDate = new Date(firstDayOfMonth);
    emptyDate.setDate(emptyDate.getDate() - (startDayOfWeek - i));
    days.push({ date: emptyDate, otherMonth: true });
  }
  
  // הוסף את ימי החודש העברי
  let currentDate = new Date(firstDayOfMonth);
  while (gregorianToHebrew(currentDate).monthName === currentHebrewMonth) {
    days.push({ date: new Date(currentDate), otherMonth: false });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // השלם את השבוע האחרון
  while (days.length % 7 !== 0) {
    days.push({ date: new Date(currentDate), otherMonth: true });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
};


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 2: STYLES - עיצוב CSS                                               ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap');
  
  /* --- 2.1 COLORS - צבעים --- */
  :root {
    --primary: #2563eb; --primary-dark: #1d4ed8; --primary-light: rgba(37, 99, 235, 0.1);
    --success: #10b981; --success-light: #d1fae5;
    --warning: #f59e0b; --warning-light: #fef3c7;
    --danger: #ef4444; --danger-light: #fee2e2;
    --bg-primary: #f8fafc; --bg-secondary: #f1f5f9; --bg-card: #ffffff;
    --text-primary: #1e293b; --text-secondary: #64748b; --text-muted: #94a3b8;
    --border: #e2e8f0;
    --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    --shadow-md: 0 6px 10px -2px rgb(0 0 0 / 0.1);
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

  /* --- LTR SUPPORT --- */
  .app-container.ltr { direction: ltr; text-align: left; }
  .app-container.ltr .back-btn { right: auto; left: 16px; }
  .app-container.ltr .project-count { margin-right: 0; margin-left: 4px; }
  .app-container.ltr .wallet-display { margin-left: 0; margin-right: auto; }
  .app-container.ltr .task-checkbox { margin-right: 0; margin-left: 12px; }
  .app-container.ltr .drag-handle { margin-right: 0; margin-left: 8px; }
  .app-container.ltr .timeline-hours { right: auto; left: 0; text-align: right; padding-left: 8px; padding-right: 0; }
  .app-container.ltr .timeline-events { right: auto; left: 60px; }
  .app-container.ltr .timeline-event { border-right: none; border-left: 4px solid var(--primary); }
  .app-container.ltr .timeline-now-line { right: auto; left: 60px; }
  .app-container.ltr .timeline-now-line::before { right: auto; left: -6px; }
  .app-container.ltr .ai-fab { left: auto; right: 20px; }
  .app-container.ltr .timeline-toggle-btn { left: auto; right: 20px; }
  .app-container.ltr .header-right { margin-left: 0; margin-right: auto; }

  /* --- 2.4 HEADER - כותרת עליונה --- */
  .header { background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); color: white; padding: 24px 20px; position: relative; }
  .header-date { font-size: 14px; opacity: 0.9; margin-bottom: 4px; }
  .header-hebrew-date { font-size: 20px; font-weight: 600; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .header-year { font-size: 14px; opacity: 0.8; margin-top: 4px; }
  .back-btn { position: absolute; top: 16px; right: 16px; width: 40px; height: 40px; border: none; background: rgba(255,255,255,0.2); border-radius: 50%; color: white; cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center; }

  /* --- 2.5 KPI_CARD - כרטיס משימות פתוחות --- */
  .kpi-card { background: var(--bg-card); margin: -20px 16px 16px; padding: 16px 20px; border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); display: flex; align-items: center; justify-content: space-between; position: relative; z-index: 10; cursor: pointer; transition: all 0.2s; }
  .kpi-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
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
  .calendar-day { aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 14px; border-radius: 8px; cursor: pointer; transition: all 0.2s; position: relative; gap: 1px; }
  .calendar-day:hover { background: var(--bg-primary); }
  .calendar-day.today { background: var(--primary); color: white; font-weight: 600; }
  .calendar-day.has-tasks::after { content: ''; position: absolute; bottom: 4px; width: 4px; height: 4px; background: var(--warning); border-radius: 50%; }
  .calendar-day.today.has-tasks::after { background: white; }
  .calendar-day.other-month { color: var(--text-muted); opacity: 0.5; }
  .calendar-day-secondary { font-size: 9px; opacity: 0.7; }
  .calendar-day.today .calendar-day-secondary { opacity: 0.9; }
  /* סימון משימות חוזרות */
  .calendar-day.has-recurring::after { background: var(--primary); width: 5px; height: 5px; }
  .calendar-day.today.has-recurring::after { background: white; }
  .recurring-dot { position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%); font-size: 8px; line-height: 1; }
  .calendar-day.today .recurring-dot { filter: brightness(10); }

  /* --- 2.7 PROJECT_BUTTONS - כפתורי פרויקטים --- */
  .projects-bar { display: flex; gap: 8px; padding: 0 16px 12px; flex-wrap: wrap; }
  .project-btn { padding: 6px 12px; border: 1px solid var(--border); border-radius: 20px; background: var(--bg-card); cursor: pointer; font-family: inherit; font-size: 12px; color: var(--text-secondary); transition: all 0.2s; }
  .project-btn:hover { border-color: var(--primary); color: var(--primary); }
  .project-btn.active { background: var(--primary); color: white; border-color: var(--primary); }
  .project-count { background: rgba(0,0,0,0.1); padding: 2px 6px; border-radius: 10px; margin-right: 4px; font-size: 10px; }
  .project-btn.active .project-count { background: rgba(255,255,255,0.2); }

  /* --- 2.8 ACTION_BUTTONS - כפתורי פעולה --- */
  .action-buttons { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; padding: 0 16px; margin-bottom: 16px; }
  .action-btn { padding: 16px; border: none; border-radius: var(--radius); cursor: pointer; font-family: inherit; font-size: 14px; font-weight: 500; display: flex; flex-direction: column; align-items: center; gap: 8px; transition: all 0.2s; }
  .action-btn-primary { background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); color: white; grid-column: span 2; }
  .action-btn-primary:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
  .action-btn-secondary { background: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border); }
  .action-btn-secondary:hover { border-color: var(--primary); color: var(--primary); }
  .action-btn-icon { font-size: 24px; }

  /* --- 2.9 TIMER - טיימר --- */
  .timer-container { background: var(--bg-card); padding: 24px; text-align: center; border-bottom: 1px solid var(--border); }
  .timer-display { font-size: 48px; font-weight: 700; color: var(--primary); font-variant-numeric: tabular-nums; }
  .timer-display.warning { color: var(--warning); }
  .timer-display.danger { color: var(--danger); animation: pulse 1s infinite; }
  .timer-label { font-size: 14px; color: var(--text-secondary); margin-top: 4px; }
  .timer-controls { display: flex; justify-content: center; gap: 12px; margin-top: 16px; }
  .timer-btn { padding: 10px 24px; border: none; border-radius: 8px; cursor: pointer; font-family: inherit; font-size: 14px; font-weight: 500; }
  .timer-btn-pause { background: var(--warning); color: white; }
  .timer-btn-skip { background: var(--bg-primary); color: var(--text-secondary); }

  /* --- 2.10 PHASE_NAV - נקודות שלבים --- */
  .phase-nav { display: flex; justify-content: center; gap: 8px; padding: 16px; background: var(--bg-primary); }
  .phase-dot { width: 12px; height: 12px; border-radius: 50%; background: var(--border); transition: all 0.3s; }
  .phase-dot.active { background: var(--primary); transform: scale(1.2); }
  .phase-dot.completed { background: var(--success); }

  /* --- 2.11 STUDY_ITEMS - פריטי לימוד --- */
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

  /* --- 2.12 COMM_CHECK - סקירת מקורות --- */
  .comm-check { display: flex; justify-content: center; gap: 12px; padding: 16px; }
  .comm-item { 
    width: 80px; 
    height: 80px; 
    border-radius: 16px; 
    display: flex; 
    flex-direction: column;
    align-items: center; 
    justify-content: center; 
    gap: 6px;
    cursor: pointer; 
    transition: all 0.3s; 
    position: relative;
    border: 2px solid transparent;
  }
  .comm-item.whatsapp { background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); color: #16a34a; }
  .comm-item.email { background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); color: #2563eb; }
  .comm-item.sms { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); color: #d97706; }
  .comm-item:hover { transform: translateY(-2px); box-shadow: var(--shadow); }
  .comm-item.checked { 
    transform: scale(0.95); 
    opacity: 0.7; 
    border-color: var(--success);
  }
  .comm-item.checked::after { 
    content: '✓'; 
    position: absolute; 
    top: -6px; 
    right: -6px; 
    width: 24px; 
    height: 24px; 
    background: var(--success); 
    color: white; 
    border-radius: 50%; 
    font-size: 14px; 
    font-weight: bold;
    display: flex; 
    align-items: center; 
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  .comm-item-label { font-size: 11px; font-weight: 500; }

  /* --- 2.12.1 PHASE2_TABS - טאבים בשלב 2 --- */
  .phase2-tabs { 
    display: flex; 
    gap: 8px; 
    padding: 0 16px; 
    margin: 16px 0;
  }
  .phase2-tab { 
    flex: 1; 
    padding: 14px 16px; 
    border: 2px solid var(--border); 
    border-radius: 12px; 
    background: var(--bg-card); 
    cursor: pointer; 
    font-family: inherit; 
    font-size: 14px; 
    font-weight: 600; 
    color: var(--text-secondary); 
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .phase2-tab:hover { 
    border-color: var(--primary); 
    color: var(--primary);
  }
  .phase2-tab.active { 
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); 
    color: white; 
    border-color: var(--primary);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }
  .phase2-tab-icon { font-size: 18px; }
  .phase2-tab-count { 
    background: rgba(0,0,0,0.1); 
    padding: 2px 8px; 
    border-radius: 10px; 
    font-size: 12px;
  }
  .phase2-tab.active .phase2-tab-count { 
    background: rgba(255,255,255,0.25); 
  }

  /* --- 2.12.2 SECTION_HEADER - כותרת סקציה --- */
  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    color: var(--text-secondary);
    font-size: 13px;
    font-weight: 600;
  }
  .section-header-icon { font-size: 16px; }

  /* --- 2.12.3 BTN - כפתורים כלליים --- */
  .btn {
    padding: 12px 20px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .btn:hover { transform: translateY(-1px); }
  .btn:active { transform: translateY(0); }
  .btn-primary {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }
  .btn-primary:hover { box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4); }
  .btn-secondary {
    background: var(--bg-card);
    color: var(--text-primary);
    border: 2px solid var(--border);
  }
  .btn-secondary:hover { border-color: var(--primary); color: var(--primary); }
  .btn-success {
    background: linear-gradient(135deg, var(--success) 0%, #16a34a 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
  }
  .btn-success:hover { box-shadow: 0 6px 16px rgba(34, 197, 94, 0.4); }
  .btn-warning {
    background: linear-gradient(135deg, var(--warning) 0%, #d97706 100%);
    color: white;
  }
  .btn-danger {
    background: linear-gradient(135deg, var(--danger) 0%, #dc2626 100%);
    color: white;
  }
  .btn-icon { font-size: 18px; }

  /* --- 2.13 TASK_TABS - טאבים של משימות --- */
  .task-tabs { display: flex; padding: 0 16px; border-bottom: 1px solid var(--border); background: var(--bg-card); }
  .task-tab { flex: 1; padding: 14px; border: none; background: none; cursor: pointer; font-family: inherit; font-size: 14px; font-weight: 500; color: var(--text-secondary); position: relative; }
  .task-tab.active { color: var(--primary); }
  .task-tab.active::after { content: ''; position: absolute; bottom: 0; left: 16px; right: 16px; height: 3px; background: var(--primary); border-radius: 3px 3px 0 0; }
  .task-tab-count { background: var(--bg-primary); padding: 2px 8px; border-radius: 10px; font-size: 12px; margin-right: 6px; }
  .task-tab.active .task-tab-count { background: var(--primary); color: white; }

  /* --- 2.14 TASK_LIST - רשימת משימות --- */
  .task-list { padding: 16px; min-height: 200px; }
  .task-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; margin-bottom: 10px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: all 0.2s; animation: slideIn 0.3s ease-out forwards; opacity: 0; }
  .task-item:nth-child(1) { animation-delay: 0.05s; }
  .task-item:nth-child(2) { animation-delay: 0.1s; }
  .task-item:nth-child(3) { animation-delay: 0.15s; }
  .task-item:hover { border-color: var(--primary); box-shadow: var(--shadow); }
  .task-item.done { opacity: 0.6; background: var(--success-light); }
  .task-item.done .task-title { text-decoration: line-through; color: var(--text-muted); }
  .task-item.no-date { border-right: 3px solid var(--warning); }
  .task-checkbox { width: 24px; height: 24px; min-width: 24px; border: 2px solid var(--border); border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; cursor: pointer; }
  .task-item:hover .task-checkbox { border-color: var(--primary); }
  .task-item.done .task-checkbox { background: var(--success); border-color: var(--success); color: white; }
  .task-content { flex: 1; min-width: 0; }
  .task-title { font-weight: 500; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .task-meta { font-size: 12px; color: var(--text-muted); display: flex; gap: 12px; align-items: center; }
  
  /* כפתור מחיקה */
  .task-delete-btn {
    width: 32px;
    height: 32px;
    min-width: 32px;
    border: none;
    background: transparent;
    color: var(--text-muted);
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    transition: all 0.2s;
    opacity: 0;
  }
  .task-item:hover .task-delete-btn { opacity: 1; }
  .task-delete-btn:hover {
    background: rgba(239, 68, 68, 0.1);
    color: var(--danger);
  }
  
  /* חלון אישור מחיקה */
  .confirm-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1100;
    animation: fadeIn 0.2s ease-out;
    padding: 20px;
  }
  .confirm-modal {
    background: var(--bg-card);
    border-radius: 20px;
    padding: 28px 24px;
    max-width: 340px;
    width: 100%;
    text-align: center;
    animation: popIn 0.3s ease-out;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }
  .confirm-modal-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    font-size: 28px;
  }
  .confirm-modal-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--text-primary);
  }
  .confirm-modal-message {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 24px;
    line-height: 1.5;
  }
  .confirm-modal-buttons {
    display: flex;
    gap: 12px;
  }
  .confirm-modal-buttons .btn {
    flex: 1;
    padding: 14px 20px;
  }

  /* חלון חזרה מותאמת אישית */
  .recurrence-modal {
    background: var(--bg-card);
    border-radius: 20px;
    padding: 24px;
    max-width: 360px;
    width: 100%;
    animation: popIn 0.3s ease-out;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }
  .recurrence-modal-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 24px;
    color: var(--text-primary);
  }
  .recurrence-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }
  .recurrence-row label {
    color: var(--text-secondary);
    font-size: 14px;
    min-width: 80px;
  }
  .recurrence-number-input {
    width: 70px;
    padding: 10px;
    border: 1px solid var(--border);
    border-radius: 8px;
    text-align: center;
    font-size: 16px;
    font-family: inherit;
  }
  .recurrence-number-input:focus {
    outline: none;
    border-color: var(--primary);
  }
  .recurrence-select {
    flex: 1;
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    background: var(--bg-card);
    cursor: pointer;
  }
  .recurrence-days {
    display: flex;
    gap: 8px;
    justify-content: center;
    margin-bottom: 20px;
  }
  .recurrence-day {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid var(--border);
    background: var(--bg-card);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--text-secondary);
  }
  .recurrence-day:hover {
    border-color: var(--primary);
  }
  .recurrence-day.selected {
    background: var(--primary);
    border-color: var(--primary);
    color: white;
  }
  .recurrence-section {
    margin-bottom: 20px;
  }
  .recurrence-section-title {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 12px;
  }
  .recurrence-end-option {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    cursor: pointer;
  }
  .recurrence-radio {
    width: 20px;
    height: 20px;
    border: 2px solid var(--border);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .recurrence-radio.selected {
    border-color: var(--primary);
  }
  .recurrence-radio.selected::after {
    content: '';
    width: 10px;
    height: 10px;
    background: var(--primary);
    border-radius: 50%;
  }
  .recurrence-end-label {
    font-size: 14px;
    color: var(--text-primary);
    min-width: 60px;
  }
  .recurrence-end-input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
  }
  .recurrence-end-input:disabled {
    background: var(--bg-secondary);
    color: var(--text-muted);
  }
  .recurrence-modal-buttons {
    display: flex;
    gap: 12px;
    margin-top: 24px;
    justify-content: flex-end;
  }
  
  .task-project { color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px; }
  .task-project.color-0 { background: #2563eb; }
  .task-project.color-1 { background: #10b981; }
  .task-project.color-2 { background: #8b5cf6; }
  .task-project.color-3 { background: #f59e0b; }
  .task-project.color-4 { background: #ef4444; }
  .task-project.color-5 { background: #ec4899; }
  .task-project.color-6 { background: #06b6d4; }
  .task-project.color-7 { background: #84cc16; }

  /* --- 2.15 ADD_TASK - הוספת משימה --- */
  .add-task-bar { display: flex; gap: 8px; padding: 16px; background: var(--bg-card); border-top: 1px solid var(--border); position: sticky; bottom: 0; }
  .add-task-input { flex: 1; padding: 12px 16px; border: 1px solid var(--border); border-radius: var(--radius); font-family: inherit; font-size: 14px; background: var(--bg-primary); }
  .add-task-input:focus { outline: none; border-color: var(--primary); }
  .add-task-btn { padding: 12px 20px; border: none; border-radius: var(--radius); background: var(--primary); color: white; cursor: pointer; font-family: inherit; font-size: 14px; font-weight: 500; }

  /* --- 2.16 FOCUS_TASK - משימה בפוקוס --- */
  .focus-task-container { padding: 24px; text-align: center; }
  .focus-task-card { background: var(--bg-card); border-radius: var(--radius-lg); padding: 32px 24px; box-shadow: var(--shadow-lg); animation: popIn 0.4s ease-out; }
  .focus-task-label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
  .focus-task-title { font-size: 24px; font-weight: 600; margin-bottom: 12px; line-height: 1.4; }
  .focus-task-description { color: var(--text-secondary); font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
  .focus-task-btn { padding: 16px 32px; border: none; border-radius: var(--radius); background: var(--success); color: white; cursor: pointer; font-family: inherit; font-size: 16px; font-weight: 600; }
  .focus-task-progress { margin-top: 24px; font-size: 14px; color: var(--text-muted); }

  /* --- 2.17 MODAL - חלון קופץ --- */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: flex-end; justify-content: center; z-index: 1000; animation: fadeIn 0.2s ease-out; }
  .modal-content { background: var(--bg-card); width: 100%; max-width: 480px; max-height: 90vh; border-radius: var(--radius-lg) var(--radius-lg) 0 0; overflow: hidden; animation: slideUp 0.3s ease-out; }
  .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid var(--border); }
  .modal-title { font-weight: 600; font-size: 18px; }
  .modal-close { width: 36px; height: 36px; border: none; background: var(--bg-primary); border-radius: 50%; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; }
  .modal-body { padding: 20px; overflow-y: auto; max-height: 60vh; }

  /* --- 2.18 FORM - טפסים --- */
  .form-group { margin-bottom: 20px; }
  .form-label { display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: var(--text-secondary); }
  .form-input { width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: var(--radius); font-family: inherit; font-size: 14px; }
  .form-input:focus { outline: none; border-color: var(--primary); }
  .form-textarea { resize: vertical; min-height: 100px; }
  .form-row { display: flex; gap: 12px; }
  .form-section { background: var(--bg-primary); border-radius: var(--radius); padding: 16px; margin-bottom: 16px; }
  .form-section .form-label { margin-bottom: 12px; font-size: 15px; }

  /* --- 2.19 COMPLETION - אפשרויות השלמה --- */
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

  /* --- 2.20 DONATIONS - צדקה --- */
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

  /* --- 2.21 SETTINGS & HISTORY - הגדרות והיסטוריה --- */
  .settings-container { padding: 16px; }
  .settings-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; margin-bottom: 12px; }
  .settings-item-header { display: flex; justify-content: space-between; align-items: center; }
  .settings-item-title { font-weight: 500; }
  .settings-item-desc { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
  .history-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; margin-bottom: 12px; }
  .history-date { font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
  .history-stats { display: flex; gap: 16px; font-size: 14px; color: var(--text-secondary); }

  /* --- 2.22 MISC - שונות --- */
  .next-btn-container { padding: 16px; background: var(--bg-card); border-top: 1px solid var(--border); }
  .next-btn { width: 100%; padding: 16px; border: none; border-radius: var(--radius); background: var(--primary); color: white; cursor: pointer; font-family: inherit; font-size: 16px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .next-btn:disabled { background: var(--text-muted); cursor: not-allowed; }
  .empty-state { text-align: center; padding: 48px 24px; color: var(--text-muted); }
  .empty-state-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
  .notification { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: var(--text-primary); color: white; padding: 12px 24px; border-radius: var(--radius); box-shadow: var(--shadow-lg); z-index: 2000; animation: slideUp 0.3s ease-out; }
  .notification.success { background: var(--success); }
  .notification.warning { background: var(--warning); }
  .notification.error { background: var(--danger); }

  /* --- 2.23 LOADING & SYNC - טעינה וסנכרון --- */
  .loading-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background: var(--bg-primary); }
  .loading-spinner { width: 48px; height: 48px; border: 4px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; }
  .loading-text { margin-top: 16px; color: var(--text-secondary); font-size: 16px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .sync-indicator { position: fixed; top: 12px; left: 12px; font-size: 20px; opacity: 0.6; z-index: 1000; transition: all 0.3s; padding: 4px 8px; border-radius: 8px; background: var(--bg-card); box-shadow: var(--shadow-sm); }
  .sync-indicator:hover { opacity: 1; transform: scale(1.1); }
  .sync-indicator.syncing { animation: spin 1s linear infinite; opacity: 1; }
  .sync-indicator.offline { background: var(--warning); color: white; opacity: 1; }
  @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }

  /* --- 2.24 LOGIN SCREEN - מסך התחברות --- */
  .login-screen { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); padding: 20px; }
  .login-card { background: var(--bg-card); border-radius: var(--radius-lg); padding: 48px 32px; text-align: center; max-width: 360px; width: 100%; box-shadow: var(--shadow-lg); }
  .login-icon { font-size: 64px; margin-bottom: 24px; }
  .login-title { font-size: 28px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; }
  .login-subtitle { font-size: 14px; color: var(--text-secondary); margin-bottom: 32px; line-height: 1.6; }
  .google-signin-btn { display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%; padding: 14px 24px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-card); color: var(--text-primary); font-family: inherit; font-size: 16px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
  .google-signin-btn:hover { background: var(--bg-primary); box-shadow: var(--shadow); }

  /* --- 2.25 USER INFO - פרטי משתמש --- */
  .user-info { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: var(--bg-primary); border-radius: var(--radius); margin: 16px; }
  .user-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
  .user-details { flex: 1; text-align: right; }
  .user-name { font-weight: 600; font-size: 14px; }
  .user-email { font-size: 12px; color: var(--text-muted); }
  .signout-btn { padding: 8px 12px; border: none; background: var(--danger-light); color: var(--danger); border-radius: 8px; cursor: pointer; font-size: 12px; }

  /* --- 2.26 GEMINI BUTTON - כפתור פירוק משימה --- */
  .gemini-btn { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 16px; border: 2px dashed var(--primary); border-radius: var(--radius); background: transparent; color: var(--primary); font-family: inherit; font-size: 14px; cursor: pointer; margin-top: 12px; width: 100%; }
  .gemini-btn:hover { background: var(--primary); color: white; border-style: solid; }
  .gemini-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .gemini-btn.loading { animation: pulse 1s ease-in-out infinite; }

  /* --- 2.27 AI MODAL - חלון AI --- */
  .ai-modal-body { padding: 20px; max-height: 70vh; overflow-y: auto; }
  .ai-question { background: var(--bg-primary); border-radius: var(--radius); padding: 16px; margin-bottom: 16px; }
  .ai-question-text { font-size: 15px; color: var(--text-primary); margin-bottom: 12px; }
  .ai-answer-input { width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius); font-family: inherit; font-size: 14px; }
  .ai-suggestions-list { display: flex; flex-direction: column; gap: 8px; }
  .ai-suggestion-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px; background: var(--bg-primary); border-radius: var(--radius); cursor: pointer; border: 2px solid transparent; transition: all 0.2s; }
  .ai-suggestion-item:hover { border-color: var(--primary-light); }
  .ai-suggestion-item.selected { border-color: var(--primary); background: var(--primary-light); }
  .ai-suggestion-checkbox { width: 22px; height: 22px; border: 2px solid var(--border); border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
  .ai-suggestion-item.selected .ai-suggestion-checkbox { background: var(--primary); border-color: var(--primary); color: white; }
  .ai-suggestion-content { flex: 1; }
  .ai-suggestion-title { font-weight: 500; margin-bottom: 4px; }
  .ai-suggestion-desc { font-size: 12px; color: var(--text-muted); }
  .ai-suggestion-link { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: var(--primary); margin-top: 6px; text-decoration: none; }
  .ai-suggestion-link:hover { text-decoration: underline; }
  .ai-loading { text-align: center; padding: 32px; color: var(--text-secondary); }
  .ai-loading-spinner { font-size: 32px; animation: spin 1s linear infinite; display: inline-block; }

  /* --- 2.28 HEADER WITH USER --- */
  .header-with-user { display: flex; align-items: center; justify-content: space-between; }
  .header-right { display: flex; align-items: center; gap: 12px; }
  .header-user-avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-light); }
  .header-welcome { font-size: 13px; color: var(--text-secondary); margin-bottom: 2px; }

  /* --- 2.29 SUBTASKS - תתי משימות --- */
  .task-item.subtask { margin-right: 24px; border-right: 3px solid var(--primary-light); background: var(--bg-primary); }
  .task-item.subtask .task-title { font-size: 13px; }
  .subtask-badge { display: inline-block; font-size: 10px; background: var(--primary-light); color: var(--primary); padding: 2px 6px; border-radius: 4px; margin-right: 6px; }
  .add-subtask-btn { display: flex; align-items: center; gap: 6px; padding: 8px 12px; margin-right: 24px; margin-top: -4px; margin-bottom: 8px; border: 1px dashed var(--border); border-radius: var(--radius); background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer; }
  .add-subtask-btn:hover { border-color: var(--primary); color: var(--primary); }
  .add-subtask-inline-btn { width: 28px; height: 28px; border-radius: 50%; border: 1px dashed var(--border); background: transparent; color: var(--text-muted); font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-left: 8px; }
  .add-subtask-inline-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-light); }

  /* --- 2.30 DRAG AND DROP --- */
  .task-item.dragging { opacity: 0.5; background: var(--primary-light); }
  .task-item.drag-over { border-top: 3px solid var(--primary); }
  .drag-handle { cursor: grab; padding: 4px; color: var(--text-muted); margin-left: 4px; font-size: 12px; }
  .drag-handle:active { cursor: grabbing; }
  .collapse-btn { background: none; border: none; padding: 4px; color: var(--text-muted); cursor: pointer; font-size: 10px; width: 20px; display: flex; align-items: center; justify-content: center; }
  .collapse-btn:hover { color: var(--primary); }
  .collapse-placeholder { width: 20px; }
  .subtask-count { font-size: 11px; color: var(--text-muted); margin-right: 6px; }

  /* --- 2.31 TASK LINK --- */
  .task-link-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 16px; background: var(--primary-light); color: var(--primary); border-radius: var(--radius); text-decoration: none; font-weight: 500; transition: all 0.2s; }
  .task-link-btn:hover { background: var(--primary); color: white; }

  /* --- 2.32 RETROSPECTIVE MODAL --- */
  .retrospective-modal { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
  .retrospective-icon { font-size: 48px; text-align: center; margin-bottom: 16px; }
  .retrospective-title { font-size: 18px; font-weight: 600; text-align: center; margin-bottom: 8px; }
  .retrospective-subtitle { font-size: 14px; color: var(--text-secondary); text-align: center; margin-bottom: 20px; }
  .retrospective-task-name { background: var(--primary-light); padding: 12px 16px; border-radius: var(--radius); text-align: center; font-weight: 500; margin-bottom: 20px; }
  .retrospective-textarea { width: 100%; min-height: 120px; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius); font-family: inherit; font-size: 14px; resize: vertical; }
  .retrospective-examples { font-size: 12px; color: var(--text-muted); margin-top: 8px; }
  .retrospective-buttons { display: flex; gap: 12px; margin-top: 20px; }
  .retrospective-buttons button { flex: 1; padding: 12px; border-radius: var(--radius); font-weight: 500; cursor: pointer; }
  .retrospective-skip { background: var(--bg-primary); border: 1px solid var(--border); color: var(--text-secondary); }
  .retrospective-save { background: var(--primary); border: none; color: white; }

  /* --- 2.33 GOOGLE PERMISSIONS SETUP --- */
  .permissions-setup { padding: 20px; }
  .permissions-title { font-size: 18px; font-weight: 600; text-align: center; margin-bottom: 8px; }
  .permissions-subtitle { font-size: 14px; color: var(--text-secondary); text-align: center; margin-bottom: 24px; }
  .permission-card { display: flex; align-items: center; gap: 16px; padding: 16px; background: var(--bg-secondary); border-radius: var(--radius); margin-bottom: 12px; border: 2px solid transparent; transition: all 0.2s; }
  .permission-card.enabled { border-color: var(--success); background: rgba(34, 197, 94, 0.1); }
  .permission-icon { font-size: 32px; width: 50px; text-align: center; }
  .permission-info { flex: 1; }
  .permission-name { font-weight: 600; margin-bottom: 4px; }
  .permission-desc { font-size: 12px; color: var(--text-muted); }
  .permission-btn { padding: 8px 16px; border-radius: var(--radius); font-weight: 500; cursor: pointer; transition: all 0.2s; }
  .permission-btn.connect { background: var(--primary); color: white; border: none; }
  .permission-btn.connected { background: var(--success); color: white; border: none; }
  .permission-btn.disconnect { background: transparent; color: var(--text-muted); border: 1px solid var(--border); font-size: 12px; }

  /* --- 2.34 FOUND ITEMS (Emails/Files) --- */
  .found-items-section { margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border); }
  .found-items-title { font-size: 14px; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
  .found-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px; background: var(--bg-secondary); border-radius: var(--radius); margin-bottom: 8px; cursor: pointer; transition: all 0.2s; }
  .found-item:hover { background: var(--primary-light); }
  .found-item.selected { border: 2px solid var(--primary); background: var(--primary-light); }
  .found-item-checkbox { width: 20px; height: 20px; border: 2px solid var(--border); border-radius: 4px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .found-item-checkbox.checked { background: var(--primary); border-color: var(--primary); color: white; }
  .found-item-icon { font-size: 24px; }
  .found-item-info { flex: 1; min-width: 0; }
  .found-item-title { font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .found-item-meta { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
  .found-item-snippet { font-size: 12px; color: var(--text-secondary); margin-top: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .searching-indicator { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 20px; color: var(--text-muted); }

  /* --- 2.35 ONBOARDING --- */
  .onboarding-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
  .onboarding-card { background: var(--bg-card); border-radius: 20px; max-width: 420px; width: 100%; padding: 32px; animation: slideUp 0.4s ease-out; }
  .onboarding-icon { font-size: 64px; text-align: center; margin-bottom: 20px; }
  .onboarding-title { font-size: 24px; font-weight: 700; text-align: center; margin-bottom: 8px; }
  .onboarding-subtitle { font-size: 14px; color: var(--text-secondary); text-align: center; margin-bottom: 24px; line-height: 1.6; }
  .onboarding-modules { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
  .onboarding-module { display: flex; align-items: center; gap: 16px; padding: 16px; background: var(--bg-secondary); border-radius: 12px; cursor: pointer; transition: all 0.2s; border: 2px solid transparent; }
  .onboarding-module:hover { background: var(--bg-primary); }
  .onboarding-module.selected { border-color: var(--primary); background: var(--primary-light); }
  .onboarding-module-icon { font-size: 28px; }
  .onboarding-module-info { flex: 1; }
  .onboarding-module-name { font-weight: 600; margin-bottom: 2px; }
  .onboarding-module-desc { font-size: 12px; color: var(--text-muted); }
  .onboarding-module-check { width: 24px; height: 24px; border: 2px solid var(--border); border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
  .onboarding-module.selected .onboarding-module-check { background: var(--primary); border-color: var(--primary); color: white; }
  .onboarding-note { font-size: 12px; color: var(--text-muted); text-align: center; margin-bottom: 20px; padding: 12px; background: var(--bg-secondary); border-radius: 8px; }
  .onboarding-start-btn { width: 100%; padding: 16px; background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .onboarding-start-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(124, 58, 237, 0.3); }

  /* --- 2.36 SETTINGS SECTIONS --- */
  .settings-section { background: var(--bg-card); border-radius: 16px; margin-bottom: 16px; overflow: hidden; }
  .settings-section-header { display: flex; align-items: center; gap: 12px; padding: 16px 20px; background: var(--bg-secondary); font-weight: 600; }
  .settings-section-icon { font-size: 20px; }
  .settings-section-content { padding: 16px 20px; }
  .settings-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border); }
  .settings-row:last-child { border-bottom: none; }
  .settings-row-info { flex: 1; }
  .settings-row-title { font-weight: 500; margin-bottom: 2px; }
  .settings-row-desc { font-size: 12px; color: var(--text-muted); }
  .settings-toggle { position: relative; width: 50px; height: 28px; background: var(--border); border-radius: 14px; cursor: pointer; transition: all 0.2s; }
  .settings-toggle.active { background: var(--primary); }
  .settings-toggle::after { content: ''; position: absolute; top: 2px; left: 2px; width: 24px; height: 24px; background: white; border-radius: 50%; transition: all 0.2s; }
  .settings-toggle.active::after { left: 24px; }
  .settings-number-input { width: 70px; padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; text-align: center; font-size: 14px; font-weight: 500; }
  .settings-select { padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; background: var(--bg-card); min-width: 120px; }

  /* --- 2.37 STUDY ITEMS EDITOR --- */
  .study-items-list { display: flex; flex-direction: column; gap: 8px; }
  .study-item-row { display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-secondary); border-radius: 10px; }
  .study-item-icon { font-size: 24px; cursor: pointer; }
  .study-item-title-input { flex: 1; padding: 8px 12px; border: 1px solid var(--border); border-radius: 6px; font-size: 14px; }
  .study-item-counter { display: flex; align-items: center; gap: 8px; }
  .study-item-delete { width: 32px; height: 32px; border: none; background: transparent; color: var(--text-muted); border-radius: 8px; cursor: pointer; }
  .study-item-delete:hover { background: rgba(239, 68, 68, 0.1); color: var(--danger); }
  .add-study-item-btn { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border: 2px dashed var(--border); border-radius: 10px; background: transparent; color: var(--text-muted); cursor: pointer; margin-top: 8px; }
  .add-study-item-btn:hover { border-color: var(--primary); color: var(--primary); }

  /* --- 2.38 MODULE CARDS (Dashboard) --- */
  .module-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; padding: 0 16px; margin-bottom: 16px; }
  .module-card { background: var(--bg-card); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s; border: 2px solid transparent; }
  .module-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
  .module-card:active { transform: scale(0.98); }
  .module-card.primary { background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); color: white; grid-column: span 2; }
  .module-card-icon { font-size: 32px; }
  .module-card-title { font-weight: 600; font-size: 14px; }
  .module-card-badge { position: absolute; top: -4px; right: -4px; background: var(--danger); color: white; font-size: 11px; padding: 2px 6px; border-radius: 10px; }

  /* --- 2.39 OFFLINE INDICATOR --- */
  .offline-banner { position: fixed; bottom: 0; left: 0; right: 0; background: var(--warning); color: white; padding: 8px 16px; text-align: center; font-size: 13px; z-index: 999; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .offline-banner-icon { animation: pulse 2s infinite; }

  /* --- 2.40 STOPWATCH - סטופר למשימות --- */
  .stopwatch-btn { width: 36px; height: 36px; border-radius: 50%; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; font-size: 16px; flex-shrink: 0; }
  .stopwatch-btn.play { background: var(--success); color: white; }
  .stopwatch-btn.play:hover { background: #16a34a; transform: scale(1.1); }
  .stopwatch-btn.pause { background: var(--warning); color: white; animation: pulse 2s infinite; }
  .stopwatch-btn.pause:hover { background: #d97706; }
  .stopwatch-display { font-family: 'SF Mono', 'Consolas', monospace; font-size: 13px; font-weight: 600; color: var(--primary); background: var(--primary-light); padding: 4px 8px; border-radius: 6px; min-width: 60px; text-align: center; }
  .stopwatch-display.running { color: var(--success); background: rgba(34, 197, 94, 0.15); animation: pulse 2s infinite; }
  .task-time-spent { font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }
  .task-time-spent.has-time { color: var(--primary); font-weight: 500; }

  /* --- 2.41 PROJECT FILTER CHIPS --- */
  .project-filter-bar { display: flex; gap: 8px; padding: 12px 16px; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
  .project-filter-bar::-webkit-scrollbar { display: none; }
  .project-chip { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: var(--bg-secondary); border: 2px solid transparent; border-radius: 20px; font-size: 13px; font-weight: 500; white-space: nowrap; cursor: pointer; transition: all 0.2s; }
  .project-chip:hover { background: var(--bg-primary); border-color: var(--border); }
  .project-chip.active { background: var(--primary-light); border-color: var(--primary); color: var(--primary); }
  .project-chip-count { background: var(--bg-card); padding: 2px 6px; border-radius: 10px; font-size: 11px; font-weight: 600; }
  .project-chip.active .project-chip-count { background: var(--primary); color: white; }
  .project-summary { padding: 12px 16px; background: linear-gradient(135deg, var(--primary-light) 0%, rgba(124, 58, 237, 0.05) 100%); border-radius: 12px; margin: 0 16px 12px; display: flex; align-items: center; justify-content: space-between; }
  .project-summary-title { font-weight: 600; color: var(--primary); }
  .project-summary-time { font-size: 18px; font-weight: 700; color: var(--primary); }

  /* --- 2.42 REWARDS WALLET --- */
  .wallet-display { display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 20px; color: white; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .wallet-display:hover { transform: scale(1.05); box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4); }
  .wallet-icon { font-size: 18px; }
  .wallet-amount { font-size: 14px; }
  .reward-popup { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0); background: white; border-radius: 20px; padding: 32px; text-align: center; z-index: 1001; box-shadow: 0 20px 60px rgba(0,0,0,0.3); animation: rewardPop 0.5s ease-out forwards; }
  @keyframes rewardPop { 0% { transform: translate(-50%, -50%) scale(0); } 50% { transform: translate(-50%, -50%) scale(1.1); } 100% { transform: translate(-50%, -50%) scale(1); } }
  .reward-popup-icon { font-size: 64px; margin-bottom: 16px; }
  .reward-popup-title { font-size: 24px; font-weight: 700; color: var(--success); margin-bottom: 8px; }
  .reward-popup-amount { font-size: 36px; font-weight: 800; color: #f59e0b; }
  .reward-progress { margin-top: 16px; }
  .reward-progress-bar { height: 8px; background: var(--bg-secondary); border-radius: 4px; overflow: hidden; margin-bottom: 8px; }
  .reward-progress-fill { height: 100%; background: linear-gradient(90deg, #fbbf24, #f59e0b); border-radius: 4px; transition: width 0.5s ease-out; }
  .reward-progress-label { font-size: 12px; color: var(--text-muted); }
  .rewards-settings-card { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 16px; padding: 20px; margin-bottom: 16px; }
  .rewards-settings-title { font-weight: 600; font-size: 16px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
  .rewards-target-display { display: flex; align-items: center; justify-content: space-between; padding: 12px; background: white; border-radius: 10px; margin-top: 12px; }
  .rewards-target-name { font-weight: 600; }
  .rewards-target-progress { font-size: 14px; color: var(--text-secondary); }

  /* --- 2.43 LISTS MODULE --- */
  .lists-container { padding: 16px; }
  .list-card { background: var(--bg-card); border-radius: 16px; padding: 16px; margin-bottom: 12px; cursor: pointer; transition: all 0.2s; }
  .list-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
  .list-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .list-card-title { font-weight: 600; font-size: 16px; display: flex; align-items: center; gap: 8px; }
  .list-card-count { font-size: 12px; color: var(--text-muted); background: var(--bg-secondary); padding: 2px 8px; border-radius: 10px; }
  .list-items-preview { font-size: 13px; color: var(--text-secondary); }
  .list-detail-header { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--bg-card); border-radius: 16px; margin-bottom: 16px; }
  .list-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px; background: var(--bg-card); border-radius: 12px; margin-bottom: 8px; }
  .list-item-icon { font-size: 20px; }
  .list-item-content { flex: 1; }
  .list-item-title { font-weight: 500; margin-bottom: 4px; }
  .list-item-url { font-size: 12px; color: var(--primary); word-break: break-all; }
  .list-item-delete { background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; }
  .list-item-delete:hover { color: var(--danger); }
  .add-list-item-form { display: flex; flex-direction: column; gap: 12px; padding: 16px; background: var(--bg-card); border-radius: 16px; margin-bottom: 16px; }
  .list-item-type-selector { display: flex; gap: 8px; }
  .list-item-type-btn { padding: 8px 16px; border: 2px solid var(--border); border-radius: 20px; background: transparent; cursor: pointer; font-size: 13px; transition: all 0.2s; }
  .list-item-type-btn.active { border-color: var(--primary); background: var(--primary-light); color: var(--primary); }
  .add-list-btn { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 16px; border: 2px dashed var(--border); border-radius: 16px; background: transparent; color: var(--text-muted); cursor: pointer; width: 100%; font-size: 14px; }
  .add-list-btn:hover { border-color: var(--primary); color: var(--primary); }

  /* --- 2.44 AI ASSISTANT FAB --- */
  .ai-fab { position: fixed; bottom: 80px; left: 20px; width: 56px; height: 56px; border-radius: 28px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; cursor: pointer; box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4); display: flex; align-items: center; justify-content: center; font-size: 24px; z-index: 100; transition: all 0.3s; }
  .ai-fab:hover { transform: scale(1.1); box-shadow: 0 6px 30px rgba(102, 126, 234, 0.5); }
  .ai-fab.active { background: linear-gradient(135deg, #764ba2 0%, #667eea 100%); }
  .ai-assistant-modal { position: fixed; bottom: 150px; left: 20px; right: 20px; max-width: 400px; background: white; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); z-index: 101; overflow: hidden; animation: slideUp 0.3s ease-out; }
  .ai-assistant-header { padding: 16px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; display: flex; justify-content: space-between; align-items: center; }
  .ai-assistant-title { font-weight: 600; font-size: 16px; display: flex; align-items: center; gap: 8px; }
  .ai-assistant-close { background: rgba(255,255,255,0.2); border: none; color: white; width: 28px; height: 28px; border-radius: 14px; cursor: pointer; font-size: 16px; }
  .ai-assistant-body { padding: 20px; max-height: 300px; overflow-y: auto; }
  .ai-assistant-input-container { display: flex; gap: 8px; padding: 16px; border-top: 1px solid var(--border); }
  .ai-assistant-input { flex: 1; padding: 12px 16px; border: 1px solid var(--border); border-radius: 24px; font-size: 14px; }
  .ai-assistant-send { width: 44px; height: 44px; border-radius: 22px; background: var(--primary); color: white; border: none; cursor: pointer; font-size: 18px; }
  .ai-assistant-send:disabled { background: var(--border); cursor: not-allowed; }
  .ai-response { padding: 16px; background: var(--bg-secondary); border-radius: 12px; margin-bottom: 12px; }
  .ai-response-title { font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
  .ai-response-content { font-size: 14px; line-height: 1.6; }
  .ai-action-buttons { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
  .ai-action-btn { padding: 8px 16px; border-radius: 20px; border: 1px solid var(--primary); background: var(--primary-light); color: var(--primary); font-size: 13px; cursor: pointer; }
  .ai-action-btn:hover { background: var(--primary); color: white; }
  .ai-processing { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 20px; color: var(--text-muted); }
  .ai-suggestions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
  .ai-suggestion-chip { padding: 6px 12px; background: var(--bg-secondary); border-radius: 16px; font-size: 12px; cursor: pointer; }
  .ai-suggestion-chip:hover { background: var(--primary-light); color: var(--primary); }

  /* --- 2.45 VOICE ASSISTANT --- */
  .voice-btn { width: 44px; height: 44px; border-radius: 22px; background: transparent; border: 2px solid var(--border); cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center; transition: all 0.3s; }
  .voice-btn:hover { border-color: var(--primary); background: var(--primary-light); }
  .voice-btn.recording { background: var(--danger); border-color: var(--danger); animation: pulse 1s infinite; }
  .voice-btn.recording::after { content: ''; position: absolute; width: 60px; height: 60px; border-radius: 30px; border: 2px solid var(--danger); animation: voicePulse 1.5s infinite; }
  @keyframes voicePulse { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(1.5); opacity: 0; } }
  .voice-transcript { padding: 12px 16px; background: var(--bg-secondary); border-radius: 12px; margin: 12px 0; font-size: 14px; color: var(--text-secondary); min-height: 40px; }
  .voice-transcript.transcribing { color: var(--text-muted); font-style: italic; }
  
  /* --- 2.46 TIMELINE VIEW --- */
  .timeline-container { padding: 16px; }
  .timeline-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 16px; background: var(--bg-card); border-radius: 16px; }
  .timeline-date-nav { display: flex; align-items: center; gap: 12px; }
  .timeline-date-btn { width: 36px; height: 36px; border-radius: 18px; background: var(--bg-secondary); border: none; cursor: pointer; font-size: 16px; }
  .timeline-date-btn:hover { background: var(--primary-light); }
  .timeline-date-title { font-weight: 600; font-size: 16px; }
  .timeline-grid { position: relative; background: var(--bg-card); border-radius: 16px; padding: 16px; min-height: 600px; }
  .timeline-hours { position: absolute; right: 0; top: 16px; width: 50px; }
  .timeline-hour { height: 60px; font-size: 12px; color: var(--text-muted); text-align: left; padding-right: 8px; border-top: 1px dashed var(--border); }
  .timeline-hour:first-child { border-top: none; }
  .timeline-events { position: absolute; right: 60px; left: 16px; top: 16px; }
  .timeline-event { position: absolute; right: 0; left: 0; background: linear-gradient(135deg, var(--primary-light) 0%, #e9d5ff 100%); border-right: 4px solid var(--primary); border-radius: 8px; padding: 8px 12px; cursor: grab; transition: all 0.2s; overflow: hidden; }
  .timeline-event:hover { transform: translateX(-4px); box-shadow: var(--shadow-md); }
  .timeline-event.dragging { opacity: 0.5; cursor: grabbing; }
  .timeline-event-title { font-weight: 500; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .timeline-event-time { font-size: 11px; color: var(--text-secondary); margin-top: 2px; }
  .timeline-event-project { font-size: 10px; padding: 2px 6px; background: white; border-radius: 8px; display: inline-block; margin-top: 4px; }
  .timeline-drop-zone { position: absolute; right: 60px; left: 16px; height: 60px; border: 2px dashed transparent; border-radius: 8px; transition: all 0.2s; }
  .timeline-drop-zone.active { border-color: var(--primary); background: var(--primary-light); }
  .timeline-unscheduled { margin-top: 20px; padding: 16px; background: var(--bg-card); border-radius: 16px; }
  .timeline-unscheduled-title { font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
  .timeline-unscheduled-list { display: flex; flex-wrap: wrap; gap: 8px; }
  .timeline-unscheduled-item { padding: 8px 16px; background: var(--bg-secondary); border-radius: 20px; cursor: grab; font-size: 13px; transition: all 0.2s; }
  .timeline-unscheduled-item:hover { background: var(--primary-light); }
  .timeline-unscheduled-item.dragging { opacity: 0.5; }
  .timeline-now-line { position: absolute; right: 60px; left: 16px; height: 2px; background: var(--danger); z-index: 10; }
  .timeline-now-line::before { content: ''; position: absolute; right: -6px; top: -4px; width: 10px; height: 10px; border-radius: 50%; background: var(--danger); }
  .timeline-toggle-btn { position: fixed; bottom: 150px; left: 20px; width: 44px; height: 44px; border-radius: 22px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; cursor: pointer; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); display: flex; align-items: center; justify-content: center; font-size: 18px; z-index: 99; transition: all 0.3s; }
  .timeline-toggle-btn:hover { transform: scale(1.1); }
`;


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 3: STATE - משתנים ו-State                                           ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

const DailyRoutineManager = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [currentPhase, setCurrentPhase] = useState(1);
  const [tasks, setTasks] = useState([]);
  const [donations, setDonations] = useState([]);
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
  const [endOfDayTime, setEndOfDayTime] = useState('18:00');
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [user, setUser] = useState(null);
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  
  // ========== USER SETTINGS - הגדרות משתמש ==========
  const [userSettings, setUserSettings] = useState({
    isOnboarded: false,
    language: null, // null = auto-detect, 'he' = Hebrew, 'en' = English
    activeModules: {
      tasks: true,
      routine: true,
      donations: true,
      history: true,
      lists: false  // מודול רשימות
    },
    general: {
      endOfDayTime: '18:00',
      unfinishedTasksPolicy: 'rollover' // 'rollover' = העבר למחר, 'backlog' = העבר לראשי
    },
    routineConfig: {
      includeStudies: true,
      enableQuickTasks: true,
      timers: {
        studies: 2,      // דקות
        quickTasks: 15,  // דקות
        dailyTasks: 30   // דקות
      },
      studyItems: [
        { id: '1', title: 'חומש', icon: '📖', hasCounter: false },
        { id: '2', title: 'רמב"ם', icon: '📚', hasCounter: true, maxCount: 3 },
        { id: '3', title: 'תניא', icon: '📕', hasCounter: false },
        { id: '4', title: 'היום יום', icon: '📅', hasCounter: false }
      ],
      commSources: [
        { id: 'whatsapp', title: 'וואטסאפ', icon: '💬', enabled: true },
        { id: 'email', title: 'אימייל', icon: '📧', enabled: true },
        { id: 'sms', title: 'SMS', icon: '📱', enabled: true }
      ]
    },
    // ========== REWARDS - מערכת תגמולים ==========
    rewards: {
      enabled: false,
      currency: '₪',          // מטבע (ברירת מחדל לפי מיקום)
      ratePerTask: 5,         // תגמול בסיס למשימה
      ratePerMinuteSaved: 0.5, // בונוס לדקה שנחסכה
      currentBalance: 0,      // יתרה נוכחית
      targetName: '',         // שם היעד (למשל: AirPods)
      targetAmount: 0,        // סכום נדרש ליעד
      history: []             // היסטוריית רווחים
    }
  });
  
  // ========== STOPWATCH - סטופר למשימות ==========
  const [activeStopwatch, setActiveStopwatch] = useState(null); // { taskId, startTime }
  const [stopwatchDisplay, setStopwatchDisplay] = useState(0);  // שניות להצגה
  
  // ========== PROJECT FILTER - סינון לפי פרויקט ==========
  const [selectedProjectFilter, setSelectedProjectFilter] = useState(null); // null = הכל
  
  // מצב Onboarding
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingModules, setOnboardingModules] = useState({
    tasks: true,
    routine: true,
    donations: false,
    history: true
  });
  // עריכת שיעור
  const [editingStudyItem, setEditingStudyItem] = useState(null);
  const [newStudyItem, setNewStudyItem] = useState({ title: '', icon: '📖', hasCounter: false, maxCount: 1 });
  
  // ========== LISTS MODULE - מודול רשימות ==========
  const [lists, setLists] = useState([]); // [{ id, title, items: [{ id, type, content, url }] }]
  const [editingList, setEditingList] = useState(null);
  const [newListTitle, setNewListTitle] = useState('');
  const [newListItem, setNewListItem] = useState({ type: 'note', content: '', url: '' });
  
  // ========== AI ASSISTANT - עוזר AI ==========
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  
  // ========== VOICE ASSISTANT - מזכירה קולית ==========
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  // ========== TIMELINE VIEW - יומן Timeline ==========
  const [showTimeline, setShowTimeline] = useState(false);
  const [timelineDate, setTimelineDate] = useState(new Date());
  const [draggedTimelineTask, setDraggedTimelineTask] = useState(null);
  
  // מיקום המשתמש
  const [userLocation, setUserLocation] = useState({
    country: 'United States',
    city: '',
    currency: 'USD',
    currencySymbol: '$',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language || 'en-US'
  });
  // AI Flow States
  const [aiStep, setAiStep] = useState(null); // 'questions' | 'suggestions' | null
  const [aiQuestions, setAiQuestions] = useState([]);
  const [aiAnswers, setAiAnswers] = useState({});
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);
  const [aiTaskContext, setAiTaskContext] = useState(null);
  // Retrospective - הערות לפעם הבאה
  const [showRetrospective, setShowRetrospective] = useState(false);
  const [retrospectiveTask, setRetrospectiveTask] = useState(null);
  const [retrospectiveNotes, setRetrospectiveNotes] = useState('');
  // Drag and Drop
  const [draggedTask, setDraggedTask] = useState(null);
  const [addingSubtaskTo, setAddingSubtaskTo] = useState(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [collapsedTasks, setCollapsedTasks] = useState({}); // משימות מכווצות
  // מחיקת משימה עם אישור
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { task, isDaily }
  // חלון חזרה מותאמת אישית
  const [showRecurrenceModal, setShowRecurrenceModal] = useState(false);
  const [recurrenceSettings, setRecurrenceSettings] = useState({
    interval: 1,
    unit: 'week', // day, week, month, year
    weekDays: [4], // 0=א, 1=ב, 2=ג, 3=ד, 4=ה, 5=ו, 6=ש
    endType: 'never', // never, date, count
    endDate: '',
    endCount: 13
  });
  // Google Permissions - הרשאות גוגל
  const [googlePermissions, setGooglePermissions] = useState({
    gmail: false,
    drive: false,
    calendar: false
  });
  const [accessTokens, setAccessTokens] = useState({
    gmail: null,
    drive: null,
    calendar: null
  });
  const [showPermissionsSetup, setShowPermissionsSetup] = useState(false);
  const [foundEmails, setFoundEmails] = useState([]);
  const [foundFiles, setFoundFiles] = useState([]);
  const [isSearchingGoogle, setIsSearchingGoogle] = useState(false);
  // History & Time Tracking - מעקב היסטוריה וזמנים
  const [dailyHistory, setDailyHistory] = useState({}); // { '2024-01-15': { routineStartTime, phases: {...}, studies: {...} } }
  const [currentDayTracking, setCurrentDayTracking] = useState(null); // מעקב היום הנוכחי
  const [phase2Tab, setPhase2Tab] = useState(0); // 0 = משימות מהירות, 1 = משימות יומיות
  const audioRef = useRef(null);
  const isFirstLoad = useRef(true);

  // ========== TRANSLATION FUNCTION - פונקציית תרגום ==========
  
  // Detect language based on location or browser settings
  const detectLanguage = useCallback(() => {
    // Check if user is in Israel
    if (userLocation?.country === 'Israel' || userLocation?.timezone?.includes('Jerusalem')) {
      return 'he';
    }
    // Check browser language
    const browserLang = navigator.language || navigator.userLanguage || 'en';
    if (browserLang.startsWith('he')) {
      return 'he';
    }
    return 'en';
  }, [userLocation]);
  
  // Get current language (user setting or auto-detect)
  const getCurrentLanguage = useCallback(() => {
    if (userSettings.language) {
      return userSettings.language;
    }
    return detectLanguage();
  }, [userSettings.language, detectLanguage]);
  
  // Translation function
  const t = useCallback((key, params = {}) => {
    const lang = getCurrentLanguage();
    let text = translations[lang]?.[key] || translations['en']?.[key] || key;
    
    // Replace parameters like {count}, {time}, etc.
    Object.entries(params).forEach(([param, value]) => {
      text = text.replace(`{${param}}`, value);
    });
    
    return text;
  }, [getCurrentLanguage]);
  
  // Check if current language is RTL
  const isRTL = useCallback(() => getCurrentLanguage() === 'he', [getCurrentLanguage]);

  // פונקציה לקבלת תאריך מקומי בפורמט YYYY-MM-DD
  const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // פונקציה לפרסור מחרוזת תאריך לאובייקט Date מקומי (לא UTC!)
  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
  };

  // פונקציה להצגת תאריך בעברית מתוך מחרוזת
  const formatDateHebrew = (dateStr) => {
    if (!dateStr) return '';
    const date = parseLocalDate(dateStr);
    return date.toLocaleDateString(isRTL() ? 'he-IL' : 'en-US', { day: 'numeric', month: 'long' });
  };

  const today = getLocalDateString();
  const hebrewDate = gregorianToHebrew(new Date());
  const gregorianDate = formatGregorianDate();
  // טיימרים דינמיים לפי הגדרות משתמש (בשניות)
  const phaseTimers = { 
    1: userSettings.routineConfig.timers.studies * 60, 
    2: 900, // סקירה - קבוע 15 דקות
    3: userSettings.routineConfig.timers.quickTasks * 60, 
    4: userSettings.routineConfig.timers.dailyTasks * 60 
  };
  
  // משימות פתוחות - כולל משימות בלי תאריך
  const openTasks = tasks.filter(t => t.status !== 'done' && (t.date === null || t.date <= today)).length;
  const pendingDonations = donations.filter(d => !d.completed);
  
  // רשימת פרויקטים ייחודיים
  const projects = [...new Set(tasks.filter(t => t.project).map(t => t.project))];
  
  // פונקציה לקבלת צבע פרויקט לפי אינדקס
  const getProjectColor = (projectName) => {
    const index = projects.indexOf(projectName);
    return index >= 0 ? index % 8 : 0;
  };


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 4: FUNCTIONS - פונקציות עזר                                         ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

  // Google Sign In/Out functions
  const handleGoogleSignIn = async () => {
    try {
      // נסה Popup קודם, אם נכשל - השתמש ב-Redirect
      try {
        const result = await signInWithPopup(auth, googleProvider);
        setUser(result.user);
        showNotificationMessage(`${t('hello')} ${result.user.displayName}! 👋`, 'success');
      } catch (popupError) {
        console.log('Popup blocked, trying redirect...', popupError);
        await signInWithRedirect(auth, googleProvider);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      showNotificationMessage(t('connectionError'), 'error');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setTasks([]);
      setDonations([]);
      showNotificationMessage(t('signedOut'), 'info');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // בדיקת תוצאת Redirect (אם חזרנו מהתחברות)
  useEffect(() => {
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        setUser(result.user);
        showNotificationMessage(`${t('hello')} ${result.user.displayName}! 👋`, 'success');
      }
    }).catch((error) => {
      console.error('Redirect result error:', error);
    });
    
    // בדיקה אם חזרנו מ-OAuth של Google APIs (Gmail/Drive/Calendar)
    if (window.location.hash && window.location.hash.includes('access_token')) {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const permissionType = sessionStorage.getItem('pending_permission');
      
      if (accessToken && permissionType) {
        // עדכן את ה-state
        setGooglePermissions(prev => ({ ...prev, [permissionType]: true }));
        setAccessTokens(prev => ({ ...prev, [permissionType]: accessToken }));
        
        // שמור ב-localStorage
        const savedPermissions = localStorage.getItem('googlePermissions');
        const permissions = savedPermissions ? JSON.parse(savedPermissions) : {};
        permissions[permissionType] = true;
        localStorage.setItem('googlePermissions', JSON.stringify(permissions));
        
        const savedTokens = localStorage.getItem('accessTokens');
        const tokens = savedTokens ? JSON.parse(savedTokens) : {};
        tokens[permissionType] = accessToken;
        localStorage.setItem('accessTokens', JSON.stringify(tokens));
        
        // נקה
        sessionStorage.removeItem('pending_permission');
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // הודעה (עם delay קטן כדי שה-state יתעדכן)
        setTimeout(() => {
          alert(`הרשאת ${permissionType === 'gmail' ? 'Gmail' : permissionType === 'drive' ? 'Drive' : 'Calendar'} אושרה! ✓`);
        }, 100);
      }
    }
  }, []);

  // זיהוי מיקום המשתמש
  useEffect(() => {
    const detectLocation = async () => {
      try {
        // ניסיון לקבל מיקום מדויק מ-IP
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
          const data = await response.json();
          setUserLocation({
            country: data.country_name || 'United States',
            city: data.city || '',
            region: data.region || '',
            currency: data.currency || 'USD',
            currencySymbol: getCurrencySymbol(data.currency || 'USD'),
            timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language || 'en-US',
            countryCode: data.country_code || 'US'
          });
        }
      } catch (error) {
        console.log('Could not detect location, using defaults');
      }
    };
    detectLocation();
  }, []);

  // המרת קוד מטבע לסימן
  const getCurrencySymbol = (currencyCode) => {
    const symbols = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'ILS': '₪', 'JPY': '¥',
      'CAD': 'C$', 'AUD': 'A$', 'CHF': 'CHF', 'CNY': '¥', 'INR': '₹'
    };
    return symbols[currencyCode] || currencyCode;
  };

  // מעקב אחרי מצב ההתחברות
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setIsLoading(false);
        isFirstLoad.current = false;
      }
    });
    return () => unsubscribe();
  }, []);

  // מעקב אחרי מצב החיבור לאינטרנט
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      console.log('🌐 Back online');
    };
    const handleOffline = () => {
      setIsOffline(true);
      console.log('📴 Gone offline');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // דגלים לסנכרון
  const isSavingRef = useRef(false);
  const lastSaveTimestampRef = useRef('');
  const pendingSaveRef = useRef(null);
  const localDataVersionRef = useRef(0); // גרסה מקומית למניעת דריסה

  // פונקציית רענון ידנית מהשרת
  const forceRefreshFromServer = async () => {
    if (!user) return;
    
    setIsSyncing(true);
    try {
      const userDoc = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDoc);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('🔃 Force refresh from server:', { tasks: data.tasks?.length });
        
        if (data.tasks) setTasks(data.tasks);
        if (data.donations) setDonations(data.donations);
        if (data.lists) setLists(data.lists);
        if (data.endOfDayTime) setEndOfDayTime(data.endOfDayTime);
        
        lastSaveTimestampRef.current = data.lastUpdated || '';
        showNotificationMessage(isRTL() ? 'נתונים רועננו' : 'Data refreshed', 'success');
      }
    } catch (error) {
      console.error('❌ Force refresh error:', error);
      showNotificationMessage(isRTL() ? 'שגיאה ברענון' : 'Refresh error', 'error');
    }
    setIsSyncing(false);
  };

  // טעינה וסנכרון מ-Firebase
  useEffect(() => {
    if (!user) return;
    
    let isInitialLoad = true;
    
    const userDoc = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDoc, (docSnap) => {
      // אם אנחנו באמצע שמירה - התעלם מכל עדכון
      if (isSavingRef.current) {
        console.log('⏭️ Ignoring update while saving');
        return;
      }
      
      if (!docSnap.exists()) {
        if (isInitialLoad) {
          setShowOnboarding(true);
          setIsLoading(false);
          isFirstLoad.current = false;
          isInitialLoad = false;
        }
        return;
      }
      
      const data = docSnap.data();
      const serverTimestamp = data.lastUpdated || '';
      const fromCache = docSnap.metadata.fromCache;
      
      // בטעינה הראשונית - טען הכל
      if (isInitialLoad) {
        isInitialLoad = false;
        lastSaveTimestampRef.current = serverTimestamp;
        
        console.log('📥 Initial load:', { 
          tasks: data.tasks?.length, 
          timestamp: serverTimestamp,
          fromCache 
        });
        
        if (data.tasks) setTasks(data.tasks);
        if (data.donations) setDonations(data.donations);
        if (data.endOfDayTime) setEndOfDayTime(data.endOfDayTime);
        if (data.lists) setLists(data.lists);
        
        if (data.userSettings) {
          setUserSettings(prev => ({
            ...prev,
            ...data.userSettings,
            activeModules: { ...prev.activeModules, ...data.userSettings.activeModules },
            general: { ...prev.general, ...data.userSettings.general },
            routineConfig: { 
              ...prev.routineConfig, 
              ...data.userSettings.routineConfig,
              timers: { ...prev.routineConfig.timers, ...data.userSettings.routineConfig?.timers }
            },
            rewards: { ...prev.rewards, ...data.userSettings.rewards }
          }));
        } else {
          setShowOnboarding(true);
        }
        
        setIsLoading(false);
        isFirstLoad.current = false;
        return;
      }
      
      // אחרי הטעינה הראשונית:
      // אם ה-timestamp זהה או ישן יותר - התעלם
      if (serverTimestamp <= lastSaveTimestampRef.current) {
        console.log('⏭️ Ignoring old/same timestamp:', { 
          server: serverTimestamp, 
          local: lastSaveTimestampRef.current,
          fromCache
        });
        return;
      }
      
      // זה עדכון חדש ממכשיר אחר!
      console.log('🔄 New update from another device:', {
        serverTimestamp,
        ourLastSave: lastSaveTimestampRef.current,
        newTasksCount: data.tasks?.length,
        fromCache
      });
      
      lastSaveTimestampRef.current = serverTimestamp;
      localDataVersionRef.current++;
      
      if (data.tasks) setTasks(data.tasks);
      if (data.donations) setDonations(data.donations);
      if (data.lists) setLists(data.lists);
      if (data.endOfDayTime) setEndOfDayTime(data.endOfDayTime);
      if (data.userSettings) {
        setUserSettings(prev => ({
          ...prev,
          ...data.userSettings,
          activeModules: { ...prev.activeModules, ...data.userSettings.activeModules },
          general: { ...prev.general, ...data.userSettings.general },
          routineConfig: { 
            ...prev.routineConfig, 
            ...data.userSettings.routineConfig,
            timers: { ...prev.routineConfig.timers, ...data.userSettings.routineConfig?.timers }
          },
          rewards: { ...prev.rewards, ...data.userSettings.rewards }
        }));
      }
      
    }, (error) => {
      console.error('❌ Firebase listener error:', error);
      setIsLoading(false);
      isFirstLoad.current = false;
    });
    
    return () => unsubscribe();
  }, [user]);

  // שמירה ל-Firebase כשהנתונים משתנים
  useEffect(() => {
    if (!user || isFirstLoad.current || isLoading) return;
    
    // בטל שמירה קודמת שממתינה
    if (pendingSaveRef.current) {
      clearTimeout(pendingSaveRef.current);
    }
    
    // שמור אחרי 300ms של יציבות (debounce קצר יותר)
    pendingSaveRef.current = setTimeout(async () => {
      // סמן שאנחנו שומרים - מונע קבלת עדכונים
      isSavingRef.current = true;
      setIsSyncing(true);
      
      const timestamp = new Date().toISOString();
      
      try {
        const userDoc = doc(db, 'users', user.uid);
        await setDoc(userDoc, {
          tasks,
          donations,
          lists,
          endOfDayTime,
          userSettings,
          email: user.email,
          displayName: user.displayName,
          lastUpdated: timestamp
        }, { merge: true });
        
        // עדכן את ה-timestamp רק אחרי שמירה מוצלחת
        lastSaveTimestampRef.current = timestamp;
        
        console.log('📤 Saved:', { 
          tasks: tasks.length,
          timestamp
        });
      } catch (error) {
        console.error('❌ Save error:', error);
      }
      
      setIsSyncing(false);
      
      // המתן 200ms לפני שמאפשרים קבלת עדכונים (נותן זמן ל-echo לעבור)
      setTimeout(() => {
        isSavingRef.current = false;
      }, 200);
      
    }, 300);
    
    return () => {
      if (pendingSaveRef.current) {
        clearTimeout(pendingSaveRef.current);
      }
    };
  }, [tasks, donations, lists, endOfDayTime, userSettings, isLoading, user]);

  // יצירת הקשר מהיסטוריית המשימות עבור AI
  const getTaskHistoryContext = () => {
    // קח את 50 המשימות האחרונות (או פחות אם אין)
    const recentTasks = tasks.slice(-50);
    
    // קטגר את המשימות
    const completedTasks = recentTasks.filter(t => t.status === 'done');
    const travelTasks = recentTasks.filter(t => 
      t.title.includes('טיול') || t.title.includes('נסיעה') || t.title.includes('טיסה') || 
      t.title.includes('מלון') || t.title.includes('חופשה') || t.title.includes('travel')
    );
    const shoppingTasks = recentTasks.filter(t => 
      t.title.includes('קנ') || t.title.includes('לרכוש') || t.title.includes('להזמין') ||
      t.title.includes('buy') || t.title.includes('order')
    );
    const eventTasks = recentTasks.filter(t => 
      t.title.includes('אירוע') || t.title.includes('מסיבה') || t.title.includes('חתונה') ||
      t.title.includes('יום הולדת') || t.title.includes('event') || t.title.includes('party')
    );
    
    // חלץ פרויקטים ייחודיים
    const projects = [...new Set(recentTasks.filter(t => t.project).map(t => t.project))];
    
    // חלץ יעדי נסיעה מתוך תתי-משימות
    const destinations = recentTasks
      .filter(t => t.parentTaskId && travelTasks.some(tt => tt.id === t.parentTaskId))
      .map(t => t.title);

    let context = `
היסטוריית המשתמש (${recentTasks.length} משימות אחרונות):
- משימות שהושלמו: ${completedTasks.length}
- פרויקטים פעילים: ${projects.join(', ') || 'אין'}
`;

    if (travelTasks.length > 0) {
      context += `- נסיעות קודמות: ${travelTasks.map(t => t.title).slice(0, 5).join(', ')}
`;
    }
    
    if (shoppingTasks.length > 0) {
      context += `- קניות אחרונות: ${shoppingTasks.map(t => t.title).slice(0, 5).join(', ')}
`;
    }
    
    if (eventTasks.length > 0) {
      context += `- אירועים אחרונים: ${eventTasks.map(t => t.title).slice(0, 5).join(', ')}
`;
    }

    // הוסף תתי-משימות שהושלמו כדי ללמוד מה עבד
    const completedSubtasks = completedTasks.filter(t => t.parentTaskId);
    if (completedSubtasks.length > 0) {
      context += `
תתי-משימות שהושלמו בהצלחה (ללמוד מהן):
${completedSubtasks.slice(0, 10).map(t => `- ${t.title}`).join('\n')}
`;
    }

    return context;
  };

  // Gemini - שלב 1: קבלת שאלות מ-AI
  const startAIBreakdown = async (task) => {
    setAiTaskContext(task);
    setIsBreakingDown(true);
    setAiStep('questions');
    setAiAnswers({});
    setAiSuggestions([]);
    setSelectedSuggestions([]);
    setShowModal('aiBreakdown');
    
    const taskHistory = getTaskHistoryContext();
    
    const prompt = `אתה עוזר אישי מומחה שמכיר את המשתמש. המשתמש נמצא ב-${userLocation.city || userLocation.country} ורוצה לפרק את המשימה: "${task.title}"

${taskHistory}

בהתבסס על ההיסטוריה של המשתמש ומה שאתה יודע עליו, שאל 2-4 שאלות קצרות וממוקדות.
אם אתה רואה דפוסים בהיסטוריה (למשל, תמיד נוסע לאותו מקום, או קונה מותגים מסוימים), השתמש בזה כדי לשאול שאלות יותר ממוקדות.

דוגמאות:
- אם המשתמש נסע לישראל בעבר: "האם גם הפעם לישראל או ליעד אחר?"
- אם יש לו פרויקט פעיל: "האם זה קשור לפרויקט [שם]?"

החזר JSON בפורמט הבא (ורק את ה-JSON, בלי שום טקסט נוסף):
{
  "questions": [
    {"id": 1, "text": "שאלה ראשונה?"},
    {"id": 2, "text": "שאלה שנייה?"},
    {"id": 3, "text": "שאלה שלישית?"},
    {"id": 4, "text": "שאלה רביעית?"}
  ]
}

אם המשימה פשוטה מאוד, החזר:
{"questions": []}`;

    console.log('🤖 [AI QUESTIONS] Full prompt:', prompt);

    const response = await askGemini(prompt);
    setIsBreakingDown(false);
    
    if (response) {
      try {
        const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const data = JSON.parse(cleanResponse);
        if (data.questions && data.questions.length > 0) {
          setAiQuestions(data.questions);
        } else {
          // אין שאלות, עבור ישר להצעות
          generateAISuggestions(task, {});
        }
      } catch (e) {
        console.error('Error parsing AI questions:', e);
        generateAISuggestions(task, {});
      }
    } else {
      showNotificationMessage(t('aiError'), 'error');
      setShowModal('editTask');
    }
  };

  // Gemini - שלב 2: קבלת הצעות לתתי-משימות
  const generateAISuggestions = async (task, answers) => {
    setIsBreakingDown(true);
    setAiStep('suggestions');
    
    let contextInfo = '';
    if (Object.keys(answers).length > 0) {
      contextInfo = '\n\nמידע נוסף מהמשתמש:\n';
      aiQuestions.forEach(q => {
        if (answers[q.id]) {
          contextInfo += `- ${q.text} ${answers[q.id]}\n`;
        }
      });
    }

    const taskHistory = getTaskHistoryContext();

    const locationInfo = `
מיקום המשתמש:
- מדינה: ${userLocation.country}
- עיר: ${userLocation.city || 'לא ידוע'}
- אזור: ${userLocation.region || 'לא ידוע'}
- מטבע: ${userLocation.currency} (${userLocation.currencySymbol})
- אזור זמן: ${userLocation.timezone}
`;

    // חפש משימות דומות בעבר
    const similarPastTasks = tasks.filter(t => 
      t.status === 'done' && 
      t.id !== task.id &&
      (t.title.toLowerCase().includes(task.title.toLowerCase().split(' ')[0]) ||
       (task.project && t.project === task.project))
    );
    
    let pastLearnings = '';
    if (similarPastTasks.length > 0) {
      const pastSubtasks = tasks.filter(t => 
        similarPastTasks.some(st => st.id === t.parentTaskId)
      );
      if (pastSubtasks.length > 0) {
        pastLearnings = `
משימות דומות שהמשתמש עשה בעבר:
${similarPastTasks.slice(0, 3).map(t => `- ${t.title}`).join('\n')}

תתי-משימות שעבדו טוב במשימות הדומות:
${pastSubtasks.slice(0, 10).map(t => `- ${t.title}${t.status === 'done' ? ' ✓' : ''}`).join('\n')}

השתמש במידע הזה כדי להציע תתי-משימות שכבר עבדו למשתמש!
`;
      }
    }

    // חפש הערות retrospective רלוונטיות
    const relevantNotes = getRelevantRetrospectives(task.title);
    let retrospectiveWarnings = '';
    if (relevantNotes.length > 0) {
      retrospectiveWarnings = `
⚠️ הערות חשובות מהמשתמש ממשימות קודמות (חובה להתייחס!):
${relevantNotes.map(r => `
מתוך "${r.taskTitle}":
"${r.notes}"
`).join('\n')}

המשתמש כתב את ההערות האלה אחרי שסיים משימות דומות.
הוסף תת-משימה ראשונה בשם "⚠️ תזכורת: [תוכן ההערה]" כדי להזכיר לו!
`;
    }

    const prompt = `אתה עוזר אישי מומחה שמכיר את המשתמש היטב. המשתמש רוצה לפרק את המשימה: "${task.title}"
${task.date ? `תאריך המשימה: ${task.date}` : ''}
${contextInfo}
${locationInfo}
${taskHistory}
${pastLearnings}
${retrospectiveWarnings}

הנחיות חשובות:
1. כל המחירים והתקציבים יהיו במטבע ${userLocation.currency} (${userLocation.currencySymbol})
2. כל הטיסות, מלונות, השכרות רכב יתחילו מ-${userLocation.city || userLocation.country}
3. התחשב באזור הזמן ${userLocation.timezone} לתזמונים
4. הצעות יהיו רלוונטיות למיקום הגיאוגרפי של המשתמש
5. אם יש משימות דומות מהעבר - השתמש בהן כבסיס והוסף שיפורים!
6. אם יש הערות retrospective - הוסף תזכורת כתת-משימה ראשונה!

צור 5-10 תתי-משימות מפורטות וספציפיות.

🔗 קישורים חכמים - השתמש בפורמטים הבאים עם פרמטרים מלאים:

כלי AI:
- כתיבת אימייל עם Gemini: https://gemini.google.com/app?text=כתוב+אימייל+ל[שם]+בנושא+[נושא]+עם+הפרטים+[פרטים]
- עזרה כללית עם Gemini: https://gemini.google.com/app?text=[שאלה+או+בקשה+מפורטת]
- ChatGPT: https://chat.openai.com/?q=[שאלה+או+בקשה]

חיפוש ב-Gmail (עם פרמטרים מדויקים):
- חיפוש לפי נושא: https://mail.google.com/mail/u/0/#search/subject:[נושא]
- חיפוש לפי שולח: https://mail.google.com/mail/u/0/#search/from:[אימייל+או+שם]
- חיפוש לפי תאריך: https://mail.google.com/mail/u/0/#search/after:[YYYY-MM-DD]+before:[YYYY-MM-DD]
- חיפוש משולב: https://mail.google.com/mail/u/0/#search/from:[שולח]+subject:[נושא]+after:[תאריך]
- כתיבת אימייל חדש: https://mail.google.com/mail/u/0/?view=cm&to=[אימייל]&su=[נושא]&body=[תוכן]

חיפוש ב-Drive (עם פרמטרים מדויקים):
- חיפוש לפי שם: https://drive.google.com/drive/search?q=[שם+הקובץ]
- חיפוש לפי סוג: https://drive.google.com/drive/search?q=type:[document/spreadsheet/presentation]

אתרי הזמנות:
- טיסות: https://www.google.com/travel/flights?q=flights+from+${userLocation.city || userLocation.country}+to+[יעד]+on+[YYYY-MM-DD]
- מלונות: https://www.booking.com/searchresults.html?ss=[יעד]&checkin=[YYYY-MM-DD]&checkout=[YYYY-MM-DD]
- רכבים: https://www.kayak.com/cars/[יעד]/[YYYY-MM-DD]/[YYYY-MM-DD]
- אמזון: https://www.amazon.com/s?k=[מוצר+ספציפי]
- מפות: https://www.google.com/maps/search/[מקום+מדויק]
- Waze ניווט: https://waze.com/ul?q=[כתובת]

דוגמאות לתתי-משימות עם לינקים חכמים:
- "שלח אימייל ליוסי על הפגישה" → לינק: https://mail.google.com/mail/u/0/?view=cm&to=yossi@email.com&su=לגבי+הפגישה&body=היי+יוסי,+רציתי+לתאם...
- "בקש מ-AI עזרה בכתיבת הצעת מחיר" → לינק: https://gemini.google.com/app?text=עזור+לי+לכתוב+הצעת+מחיר+עבור+[פרויקט]+עם+הפרטים+[פרטים]
- "מצא את אישור ההזמנה מ-Booking" → לינק: https://mail.google.com/mail/u/0/#search/from:booking.com+subject:confirmation

החזר JSON בפורמט הבא (ורק את ה-JSON, בלי שום טקסט נוסף):
{
  "suggestions": [
    {
      "id": 1,
      "title": "כותרת התת-משימה",
      "description": "תיאור מפורט עם פרטים ספציפיים",
      "link": "https://...",
      "linkText": "טקסט הכפתור (למשל: פתח ב-Gmail, שאל את Gemini, הזמן טיסה)"
    }
  ]
}

חשוב: 
- כל לינק חייב להיות עם פרמטרים מלאים ככל האפשר!
- אם המשימה כוללת שליחת אימייל - הכן לינק עם הנמען, נושא ותוכן מוכן
- אם צריך עזרה מ-AI - הכן לינק ל-Gemini עם prompt מוכן
- החלף [סוגריים מרובעים] בערכים אמיתיים לפי ההקשר!

כתוב בעברית. היה ספציפי ומועיל ככל האפשר!`;

    console.log('🤖 [AI SUGGESTIONS] Full prompt:', prompt);
    console.log('🤖 [AI SUGGESTIONS] Context info:', contextInfo);
    console.log('🤖 [AI SUGGESTIONS] Location:', userLocation);
    console.log('🤖 [AI SUGGESTIONS] Retrospective warnings:', retrospectiveWarnings);

    const response = await askGemini(prompt);
    console.log('🤖 [AI SUGGESTIONS] Raw response:', response);
    setIsBreakingDown(false);
    
    if (response) {
      try {
        const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const data = JSON.parse(cleanResponse);
        if (data.suggestions) {
          // הוסף תמיד משימת "הערות לפעם הבאה" בסוף
          const retrospectiveSuggestion = {
            id: 999,
            title: "📝 הערות לפעם הבאה",
            description: "אחרי שתסיים, כתוב מה למדת ומה כדאי לזכור לפעם הבאה",
            link: "",
            linkText: "",
            isRetrospective: true
          };
          setAiSuggestions([...data.suggestions, retrospectiveSuggestion]);
          
          // חפש אימיילים וקבצים רלוונטיים אם יש הרשאות
          searchRelevantGoogleItems(task, answers);
        }
      } catch (e) {
        console.error('Error parsing AI suggestions:', e);
        showNotificationMessage(t('processingError'), 'error');
      }
    } else {
      showNotificationMessage(t('aiSuggestionsError'), 'error');
    }
  };

  // שלב 3: הוספת תתי-המשימות שנבחרו
  const addSelectedSubtasks = () => {
    if (selectedSuggestions.length === 0) {
      showNotificationMessage(t('noSubtasksSelected'), 'warning');
      return;
    }

    const parentTitle = aiTaskContext.title.length > 15 
      ? aiTaskContext.title.substring(0, 15) + '...' 
      : aiTaskContext.title;

    const selectedItems = aiSuggestions.filter(s => selectedSuggestions.includes(s.id));
    const newTasks = selectedItems.map((item, index) => ({
      id: Date.now() + index,
      title: item.title,
      description: item.description || '',
      link: item.link || null,
      linkText: item.linkText || null,
      tab: aiTaskContext.tab,
      status: 'pending',
      date: aiTaskContext.date,
      project: aiTaskContext.project,
      parentTaskId: aiTaskContext.id,
      parentTaskTitle: parentTitle,
      isRetrospective: item.isRetrospective || false // סמן משימת הערות
    }));

    // הוסף את תתי-המשימות בלי לשנות את המשימה המקורית
    setTasks(prev => [...prev, ...newTasks]);
    
    // הוסף גם אימיילים/קבצים שנבחרו
    const selectedEmailsToAdd = foundEmails
      .filter(e => selectedSuggestions.includes(`email_${e.id}`))
      .map((email, index) => ({
        id: Date.now() + newTasks.length + index,
        title: `📧 ${email.subject}`,
        description: `${isRTL() ? 'מ' : 'From'}: ${email.from}\n${email.snippet}`,
        link: `https://mail.google.com/mail/u/0/#inbox/${email.id}`,
        linkText: t('openInEmail'),
        tab: aiTaskContext.tab,
        status: 'pending',
        date: aiTaskContext.date,
        project: aiTaskContext.project,
        parentTaskId: aiTaskContext.id,
        parentTaskTitle: parentTitle
      }));
    
    const selectedFilesToAdd = foundFiles
      .filter(f => selectedSuggestions.includes(`file_${f.id}`))
      .map((file, index) => ({
        id: Date.now() + newTasks.length + selectedEmailsToAdd.length + index,
        title: `📄 ${file.name}`,
        description: isRTL() ? 'קובץ מ-Google Drive' : 'File from Google Drive',
        link: file.webViewLink,
        linkText: t('openInDrive'),
        tab: aiTaskContext.tab,
        status: 'pending',
        date: aiTaskContext.date,
        project: aiTaskContext.project,
        parentTaskId: aiTaskContext.id,
        parentTaskTitle: parentTitle
      }));
    
    if (selectedEmailsToAdd.length > 0 || selectedFilesToAdd.length > 0) {
      setTasks(prev => [...prev, ...selectedEmailsToAdd, ...selectedFilesToAdd]);
    }
    
    const totalAdded = newTasks.length + selectedEmailsToAdd.length + selectedFilesToAdd.length;
    showNotificationMessage(`נוספו ${totalAdded} תתי-משימות! 🎯`, 'success');
    closeAIModal();
  };

  const closeAIModal = () => {
    setShowModal(null);
    setAiStep(null);
    setAiQuestions([]);
    setAiAnswers({});
    setAiSuggestions([]);
    setSelectedSuggestions([]);
    setAiTaskContext(null);
    setFoundEmails([]);
    setFoundFiles([]);
  };

  const toggleSuggestionSelection = (id) => {
    setSelectedSuggestions(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // חיפוש אימיילים וקבצים רלוונטיים עם AI
  const searchRelevantGoogleItems = async (task, answers) => {
    console.log('🔍 [SEARCH] Starting AI-powered search for task:', task.title);
    console.log('🔍 [SEARCH] Answers:', answers);
    console.log('🔍 [SEARCH] Permissions:', googlePermissions);
    console.log('🔍 [SEARCH] Has tokens:', { gmail: !!accessTokens.gmail, drive: !!accessTokens.drive });
    
    setIsSearchingGoogle(true);
    setFoundEmails([]);
    setFoundFiles([]);
    
    let allEmails = [];
    let allFiles = [];
    
    // שלב 1: קבל אימיילים אחרונים
    if (googlePermissions.gmail && accessTokens.gmail) {
      console.log('🔍 [GMAIL] Fetching recent emails...');
      allEmails = await searchGmailEmails(accessTokens.gmail, 100);
      console.log('🔍 [GMAIL] Got', allEmails.length, 'emails');
    }
    
    // שלב 2: קבל קבצים אחרונים
    if (googlePermissions.drive && accessTokens.drive) {
      console.log('🔍 [DRIVE] Fetching recent files...');
      allFiles = await searchDriveFiles(accessTokens.drive, 100);
      console.log('🔍 [DRIVE] Got', allFiles.length, 'files');
    }
    
    // שלב 3: בקש מ-Gemini לסנן את הרלוונטיים
    if (allEmails.length > 0 || allFiles.length > 0) {
      console.log('🤖 [AI FILTER] Asking Gemini to find relevant items...');
      const filtered = await filterRelevantItemsWithAI(task, answers, allEmails, allFiles);
      
      // סנן לפי מה ש-Gemini בחר
      const relevantEmails = filtered.relevantEmails
        .map(idx => allEmails[idx - 1])
        .filter(e => e);
      
      const relevantFiles = filtered.relevantFiles
        .map(idx => allFiles[idx - 1])
        .filter(f => f);
      
      console.log('🔍 [RESULT] Relevant emails:', relevantEmails.length);
      console.log('🔍 [RESULT] Relevant files:', relevantFiles.length);
      console.log('🔍 [RESULT] AI reasoning:', filtered.reasoning);
      
      setFoundEmails(relevantEmails);
      setFoundFiles(relevantFiles);
    }
    
    setIsSearchingGoogle(false);
  };

  // בקשת הרשאה ספציפית מגוגל
  const handleRequestPermission = (permissionType) => {
    const scope = GOOGLE_SCOPES[permissionType];
    requestGooglePermission(scope, permissionType);
  };

  // ביטול הרשאה
  const handleRevokePermission = (permissionType) => {
    setGooglePermissions(prev => ({ ...prev, [permissionType]: false }));
    setAccessTokens(prev => ({ ...prev, [permissionType]: null }));
    
    const permissions = { ...googlePermissions, [permissionType]: false };
    localStorage.setItem('googlePermissions', JSON.stringify(permissions));
    
    const tokens = { ...accessTokens, [permissionType]: null };
    localStorage.setItem('accessTokens', JSON.stringify(tokens));
    
    showNotificationMessage(t('permissionRevoked'), 'info');
  };

  // טעינת הרשאות שמורות + טיפול ב-OAuth redirect
  useEffect(() => {
    // טען הרשאות שמורות
    const savedPermissions = localStorage.getItem('googlePermissions');
    const savedTokens = localStorage.getItem('accessTokens');
    
    if (savedPermissions) {
      try {
        setGooglePermissions(JSON.parse(savedPermissions));
      } catch (e) {
        console.log('Could not load saved permissions');
      }
    }
    
    if (savedTokens) {
      try {
        setAccessTokens(JSON.parse(savedTokens));
      } catch (e) {
        console.log('Could not load saved tokens');
      }
    }
  }, []);

  // טעינת היסטוריה יומית מ-localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('dailyHistory');
    if (savedHistory) {
      try {
        setDailyHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.log('Could not load daily history');
      }
    }
  }, []);

  // בדיקה אם משימה היא "גדולה" (ראויה ל-retrospective)
  const isSignificantTask = (task) => {
    if (!task || task.parentTaskId) return false; // לא תתי-משימות
    
    const significantKeywords = [
      'טיול', 'נסיעה', 'חופשה', 'טיסה', 'אירוע', 'מסיבה', 'חתונה', 'בר מצווה',
      'פרויקט', 'השקה', 'הובלה', 'דירה', 'רכב', 'קניית', 'רכישת',
      'travel', 'trip', 'vacation', 'event', 'project', 'wedding', 'party'
    ];
    
    const hasSubtasks = tasks.some(t => t.parentTaskId === task.id);
    const hasKeyword = significantKeywords.some(kw => 
      task.title.toLowerCase().includes(kw.toLowerCase())
    );
    
    return hasSubtasks || hasKeyword;
  };

  // שמירת הערות ל-retrospective
  const saveRetrospective = () => {
    if (retrospectiveTask && retrospectiveNotes.trim()) {
      setTasks(prev => prev.map(t => 
        t.id === retrospectiveTask.id 
          ? { 
              ...t, 
              retrospectiveDone: true,
              retrospectiveNotes: retrospectiveNotes.trim(),
              retrospectiveDate: new Date().toISOString()
            } 
          : t
      ));
      showNotificationMessage(t('notesSaved') + ' 📝', 'success');
    } else {
      // סמן שדילגנו
      setTasks(prev => prev.map(t => 
        t.id === retrospectiveTask.id 
          ? { ...t, retrospectiveDone: true } 
          : t
      ));
    }
    setShowRetrospective(false);
    setRetrospectiveTask(null);
    setRetrospectiveNotes('');
  };

  // חיפוש הערות רלוונטיות ממשימות קודמות
  const getRelevantRetrospectives = (taskTitle) => {
    const keywords = taskTitle.toLowerCase().split(' ').filter(w => w.length > 2);
    
    return tasks.filter(t => 
      t.retrospectiveNotes && 
      keywords.some(kw => t.title.toLowerCase().includes(kw))
    ).map(t => ({
      taskTitle: t.title,
      notes: t.retrospectiveNotes,
      date: t.retrospectiveDate
    }));
  };

  // הוספת תת-משימה ידנית
  const addSubtask = (parentTask) => {
    if (!newSubtaskTitle.trim()) return;
    
    const parentTitle = parentTask.title.length > 15 
      ? parentTask.title.substring(0, 15) + '...' 
      : parentTask.title;
    
    const subtask = {
      id: Date.now(),
      title: newSubtaskTitle.trim(),
      tab: parentTask.tab,
      status: 'pending',
      date: parentTask.date,
      project: parentTask.project,
      parentTaskId: parentTask.id,
      parentTaskTitle: parentTitle
    };
    
    setTasks(prev => [...prev, subtask]);
    setNewSubtaskTitle('');
    setAddingSubtaskTo(null);
    showNotificationMessage(t('subtaskAdded'), 'success');
  };

  // קבלת שם המשימה הראשית
  const getParentTaskTitle = (task) => {
    if (!task.parentTaskId) return null;
    const parent = tasks.find(t => t.id === task.parentTaskId);
    if (parent) {
      return parent.title.length > 12 ? parent.title.substring(0, 12) + '...' : parent.title;
    }
    return task.parentTaskTitle || null;
  };

  // פונקציות גרירה
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.target.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
    setDraggedTask(null);
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
  };

  const handleDragOver = (e, task) => {
    e.preventDefault();
    if (draggedTask && draggedTask.id !== task.id) {
      e.currentTarget.classList.add('drag-over');
    }
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e, targetTask) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    if (!draggedTask || draggedTask.id === targetTask.id) return;
    
    // שינוי סדר המשימות
    const tasksCopy = [...tasks];
    const draggedIndex = tasksCopy.findIndex(t => t.id === draggedTask.id);
    const targetIndex = tasksCopy.findIndex(t => t.id === targetTask.id);
    
    const [removed] = tasksCopy.splice(draggedIndex, 1);
    tasksCopy.splice(targetIndex, 0, removed);
    
    setTasks(tasksCopy);
    setDraggedTask(null);
  };

  // הצגה/הסתרה של תתי-משימות
  const toggleTaskCollapse = (taskId) => {
    setCollapsedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // בדיקה אם למשימה יש תתי-משימות
  const hasSubtasks = (taskId) => {
    return tasks.some(t => t.parentTaskId === taskId);
  };

  useEffect(() => {
    if (currentScreen === 'routine' && !timerPaused && timerSeconds > 0) {
      const interval = setInterval(() => setTimerSeconds(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
    // הפעלת צליל כשהטיימר מגיע ל-0
    if (currentScreen === 'routine' && timerSeconds === 0) {
      playSound();
    }
  }, [currentScreen, timerPaused, timerSeconds]);

  // בדיקת תזכורות כל דקה
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      tasks.forEach(task => {
        if (!task.reminderTime || task.status === 'done') return;
        
        // חישוב זמן התזכורת בדקות
        const [hours, minutes] = task.reminderTime.split(':').map(Number);
        const reminderMinutes = hours * 60 + minutes;
        const reminderBefore = parseInt(task.reminderBefore) || 0;
        const adjustedReminderMinutes = reminderMinutes - reminderBefore;
        
        // בדיקה אם זה הזמן הנכון והתאריך הנכון
        if (currentMinutes === adjustedReminderMinutes && task.date === today) {
          playSound();
          const beforeText = reminderBefore > 0 ? ` (עוד ${reminderBefore} דקות)` : '';
          showNotificationMessage(`🔔 תזכורת: ${task.title}${beforeText}`, 'warning');
        }
      });
    };
    const interval = setInterval(checkReminders, 60000);
    // בדיקה ראשונית
    checkReminders();
    return () => clearInterval(interval);
  }, [tasks, today]);

  const showNotificationMessage = (message, type = 'info') => { setNotification({ message, type }); setTimeout(() => setNotification(null), 3000); };
  const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  const getTimerClass = () => timerSeconds <= 30 ? 'danger' : timerSeconds <= 60 ? 'warning' : '';

  const startRoutine = () => { 
    const now = new Date();
    const todayKey = getLocalDateString(now);
    
    // בדוק אם יש כבר היסטוריה להיום (שיעורים שכבר מולאו)
    const existingHistory = dailyHistory[todayKey];
    const existingStudies = existingHistory?.studies;
    
    // התחל מעקב יום חדש (או המשך קיים)
    setCurrentDayTracking({
      date: todayKey,
      routineStartTime: existingHistory?.routineStartTime || now.toISOString(),
      phases: existingHistory?.phases || {
        1: { startTime: now.toISOString(), endTime: null, duration: null },
        2: { startTime: null, endTime: null, duration: null },
        3: { startTime: null, endTime: null, duration: null },
        4: { startTime: null, endTime: null, duration: null }
      },
      studies: existingStudies || null,
      routineEndTime: null,
      totalDuration: null
    });
    
    setCurrentScreen('routine'); 
    setCurrentPhase(1); 
    setTimerSeconds(phaseTimers[1]); 
    setTimerPaused(false); 
    
    // אם כבר יש שיעורים מהיום - טען אותם, אחרת אתחל מחדש
    if (existingStudies) {
      setStudies(existingStudies);
      showNotificationMessage(t('studiesLoaded') + ' ✓', 'info');
    } else {
      setStudies({ chumash: null, tanya: null, rambam: null, rambamCount: null, hayomYom: null }); 
    }
    
    setCommChecks({ whatsapp: false, email: false, sms: false }); 
    setCurrentTaskIndex(0); 
  };
  
  const canProceedPhase1 = () => { const { chumash, tanya, rambam, rambamCount, hayomYom } = studies; if (!chumash || !tanya || !rambam || !hayomYom) return false; if (rambam === 'done' && !rambamCount) return false; return true; };
  const canProceedPhase2 = () => commChecks.whatsapp && commChecks.email && commChecks.sms;
  
  const nextPhase = () => { 
    const now = new Date();
    const todayKey = getLocalDateString(now);
    
    // בדוק אם יש משימות מהירות (לדילוג על שלב 3)
    const quickTasks = tasks.filter(t => t.tab === 0 && (t.date === null || t.date <= today) && t.status !== 'done');
    
    // עדכן את הזמנים של השלב הנוכחי
    if (currentDayTracking) {
      const updatedTracking = { ...currentDayTracking };
      const currentPhaseData = updatedTracking.phases[currentPhase];
      
      if (currentPhaseData) {
        currentPhaseData.endTime = now.toISOString();
        if (currentPhaseData.startTime) {
          currentPhaseData.duration = Math.round((now - new Date(currentPhaseData.startTime)) / 1000); // בשניות
        }
      }
      
      // אם זה שלב 1, שמור את השיעורים היומיים מיד!
      if (currentPhase === 1) {
        updatedTracking.studies = { ...studies };
        
        // שמור מיד ל-localStorage וגם ל-state
        const savedHistory = localStorage.getItem('dailyHistory');
        const historyData = savedHistory ? JSON.parse(savedHistory) : {};
        historyData[todayKey] = updatedTracking;
        localStorage.setItem('dailyHistory', JSON.stringify(historyData));
        
        setDailyHistory(prev => ({
          ...prev,
          [todayKey]: updatedTracking
        }));
        
        showNotificationMessage(t('studiesSaved') + ' 📚', 'success');
      }
      
      // אם זה שלב 2, שמור את סטטוס המקורות!
      if (currentPhase === 2) {
        updatedTracking.commChecks = { ...commChecks };
        
        // שמור מיד ל-localStorage
        const savedHistory = localStorage.getItem('dailyHistory');
        const historyData = savedHistory ? JSON.parse(savedHistory) : {};
        historyData[todayKey] = updatedTracking;
        localStorage.setItem('dailyHistory', JSON.stringify(historyData));
        
        setDailyHistory(prev => ({
          ...prev,
          [todayKey]: updatedTracking
        }));
        
        showNotificationMessage(t('sourcesChecked') + ' ✓', 'success');
      }
      
      if (currentPhase < 4) {
        // חשב את השלב הבא
        let nextPhaseNum = currentPhase + 1;
        
        // אם אין משימות מהירות ועוברים משלב 2 - דלג ישירות לשלב 4
        if (currentPhase === 2 && quickTasks.length === 0) {
          nextPhaseNum = 4;
          showNotificationMessage(t('noQuickTasks'), 'info');
        }
        
        // התחל את השלב הבא
        updatedTracking.phases[nextPhaseNum] = {
          ...updatedTracking.phases[nextPhaseNum],
          startTime: now.toISOString()
        };
        setCurrentDayTracking(updatedTracking);
        
        setCurrentPhase(nextPhaseNum); 
        setTimerSeconds(phaseTimers[nextPhaseNum]); 
        setTimerPaused(false);
      } else { 
        // סיום הרוטינה
        updatedTracking.routineEndTime = now.toISOString();
        if (updatedTracking.routineStartTime) {
          updatedTracking.totalDuration = Math.round((now - new Date(updatedTracking.routineStartTime)) / 1000);
        }
        
        // שמור להיסטוריה
        setDailyHistory(prev => ({
          ...prev,
          [todayKey]: updatedTracking
        }));
        
        // שמור ב-localStorage
        const savedHistory = localStorage.getItem('dailyHistory');
        const historyData = savedHistory ? JSON.parse(savedHistory) : {};
        historyData[todayKey] = updatedTracking;
        localStorage.setItem('dailyHistory', JSON.stringify(historyData));
        
        setCurrentDayTracking(null);
        
        // טיפול במשימות שלא הושלמו לפי מדיניות המשתמש
        handleUnfinishedTasks();
        
        showNotificationMessage(t('routineCompleted') + ' 🎉', 'success'); 
        setCurrentScreen('home'); 
      }
    } else {
      // fallback אם אין tracking
      if (currentPhase < 4) { 
        let next = currentPhase + 1;
        // דלג על שלב 3 אם אין משימות מהירות
        if (currentPhase === 2 && quickTasks.length === 0) {
          next = 4;
        }
        setCurrentPhase(next); 
        setTimerSeconds(phaseTimers[next]); 
        setTimerPaused(false); 
      } else { 
        handleUnfinishedTasks();
        showNotificationMessage(t('routineCompleted') + ' 🎉', 'success'); 
        setCurrentScreen('home'); 
      }
    }
  };

  // טיפול במשימות שלא הושלמו בסוף היום
  const handleUnfinishedTasks = () => {
    const unfinishedTasks = tasks.filter(t => 
      t.status !== 'done' && 
      t.date === today && 
      !t.parentTaskId
    );
    
    if (unfinishedTasks.length === 0) return;
    
    const policy = userSettings.general.unfinishedTasksPolicy;
    
    if (policy === 'rollover') {
      // העבר למחר
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = getLocalDateString(tomorrow);
      
      setTasks(prev => prev.map(t => 
        unfinishedTasks.find(ut => ut.id === t.id)
          ? { ...t, date: tomorrowStr }
          : t
      ));
      
      if (unfinishedTasks.length > 0) {
        showNotificationMessage(`${unfinishedTasks.length} משימות הועברו למחר`, 'info');
      }
    } else if (policy === 'backlog') {
      // העבר לראשי (ללא תאריך)
      setTasks(prev => prev.map(t => 
        unfinishedTasks.find(ut => ut.id === t.id)
          ? { ...t, date: null }
          : t
      ));
      
      if (unfinishedTasks.length > 0) {
        showNotificationMessage(`${unfinishedTasks.length} משימות הועברו לראשי`, 'info');
      }
    }
  };

  // פונקציה לזיהוי פרויקט מהכותרת
  const parseTaskTitle = (title) => {
    const match = title.match(/^(.+?)\*\s*(.+)$/);
    if (match) {
      return { project: match[1].trim(), title: match[2].trim() };
    }
    return { project: null, title: title.trim() };
  };

  // פונקציה לתיאור הגדרות חזרה
  const getRecurrenceDescription = (settings) => {
    if (!settings) return '';
    
    const unitNames = {
      day: settings.interval === 1 ? 'יום' : 'ימים',
      week: settings.interval === 1 ? 'שבוע' : 'שבועות',
      month: settings.interval === 1 ? 'חודש' : 'חודשים',
      year: settings.interval === 1 ? 'שנה' : 'שנים'
    };
    
    const dayNames = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
    
    let desc = `כל ${settings.interval > 1 ? settings.interval + ' ' : ''}${unitNames[settings.unit]}`;
    
    // הוסף ימים בשבוע
    if (settings.unit === 'week' && settings.weekDays && settings.weekDays.length > 0) {
      const daysStr = settings.weekDays.sort().map(d => dayNames[d]).join(', ');
      desc += ` בימים ${daysStr}`;
    }
    
    // הוסף סיום
    if (settings.endType === 'date' && settings.endDate) {
      desc += ` עד ${formatDateHebrew(settings.endDate)}`;
    } else if (settings.endType === 'count') {
      desc += ` (${settings.endCount} פעמים)`;
    }
    
    return desc;
  };

  // פונקציה לפורמט תאריך משימה (לועזי + עברי + שעה + חזרה)
  const formatTaskDate = (task) => {
    if (!task.date) return t('main');
    const date = parseLocalDate(task.date);
    const gregorian = date.toLocaleDateString(isRTL() ? 'he-IL' : 'en-US', { day: 'numeric', month: 'numeric' });
    const hebrew = gregorianToHebrew(date);
    let result = isRTL() 
      ? `${gregorian} • ${hebrew.gematriaDay} ${hebrew.monthName}`
      : `${gregorian} • ${hebrew.monthName} ${hebrew.gematriaDay}`;
    if (task.reminderTime) {
      result += ` • 🔔 ${task.reminderTime}`;
    }
    if (task.recurrence && task.recurrence !== 'none') {
      result += ' • 🔄';
    }
    return result;
  };

  // פונקציה להפעלת צליל
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
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  // ========== STOPWATCH FUNCTIONS - פונקציות סטופר ==========
  
  // פורמט זמן לתצוגה (שניות -> HH:MM:SS או MM:SS)
  const formatStopwatchTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  // פורמט זמן קצר (לתצוגה במשימה)
  const formatTimeShort = (seconds) => {
    if (!seconds || seconds === 0) return null;
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) {
      return `${hrs}ש ${mins}ד`;
    }
    return `${mins} דקות`;
  };

  // התחל/עצור סטופר למשימה
  const toggleStopwatch = (taskId) => {
    if (activeStopwatch && activeStopwatch.taskId === taskId) {
      // עצור את הסטופר ושמור את הזמן
      const elapsedSeconds = Math.floor((Date.now() - activeStopwatch.startTime) / 1000);
      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { ...t, timeSpentSeconds: (t.timeSpentSeconds || 0) + elapsedSeconds }
          : t
      ));
      setActiveStopwatch(null);
      setStopwatchDisplay(0);
    } else {
      // אם יש סטופר פעיל אחר - עצור אותו קודם
      if (activeStopwatch) {
        const elapsedSeconds = Math.floor((Date.now() - activeStopwatch.startTime) / 1000);
        setTasks(prev => prev.map(t => 
          t.id === activeStopwatch.taskId 
            ? { ...t, timeSpentSeconds: (t.timeSpentSeconds || 0) + elapsedSeconds }
            : t
        ));
      }
      // התחל סטופר חדש
      setActiveStopwatch({ taskId, startTime: Date.now() });
    }
  };

  // עדכון תצוגת הסטופר כל שנייה
  useEffect(() => {
    if (!activeStopwatch) return;
    
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - activeStopwatch.startTime) / 1000);
      const task = tasks.find(t => t.id === activeStopwatch.taskId);
      const totalTime = (task?.timeSpentSeconds || 0) + elapsed;
      setStopwatchDisplay(totalTime);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [activeStopwatch, tasks]);

  // שמור סטופר פעיל ב-localStorage (להמשך אחרי רענון)
  useEffect(() => {
    if (activeStopwatch) {
      localStorage.setItem('activeStopwatch', JSON.stringify(activeStopwatch));
    } else {
      localStorage.removeItem('activeStopwatch');
    }
  }, [activeStopwatch]);

  // טען סטופר מ-localStorage בטעינה
  useEffect(() => {
    const saved = localStorage.getItem('activeStopwatch');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // וודא שהמשימה עדיין קיימת
        if (tasks.find(t => t.id === parsed.taskId)) {
          setActiveStopwatch(parsed);
        } else {
          localStorage.removeItem('activeStopwatch');
        }
      } catch (e) {
        localStorage.removeItem('activeStopwatch');
      }
    }
  }, [tasks.length]); // רק כשמשימות נטענות

  // חשב זמן כולל לפרויקט
  const getProjectTotalTime = (projectName) => {
    return tasks
      .filter(t => t.project === projectName)
      .reduce((total, t) => total + (t.timeSpentSeconds || 0), 0);
  };

  // ========== REWARDS FUNCTIONS - פונקציות תגמולים ==========
  
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [lastRewardAmount, setLastRewardAmount] = useState(0);

  // הוסף תגמול
  const addReward = (amount, reason) => {
    if (!userSettings.rewards?.enabled) return;
    
    setUserSettings(prev => ({
      ...prev,
      rewards: {
        ...prev.rewards,
        currentBalance: (prev.rewards?.currentBalance || 0) + amount,
        history: [
          { date: new Date().toISOString(), amount, reason },
          ...(prev.rewards?.history || []).slice(0, 99) // שמור 100 אחרונים
        ]
      }
    }));
    
    setLastRewardAmount(amount);
    setShowRewardPopup(true);
    setTimeout(() => setShowRewardPopup(false), 3000);
  };

  // חשב תגמול למשימה
  const calculateTaskReward = (task) => {
    const baseReward = userSettings.rewards?.ratePerTask || 5;
    let bonusReward = 0;
    
    // בונוס מהירות - אם הזמן בפועל פחות מהמוערך
    if (task.estimatedMinutes && task.timeSpentSeconds) {
      const actualMinutes = task.timeSpentSeconds / 60;
      const savedMinutes = task.estimatedMinutes - actualMinutes;
      if (savedMinutes > 0) {
        bonusReward = savedMinutes * (userSettings.rewards?.ratePerMinuteSaved || 0.5);
      }
    }
    
    return baseReward + bonusReward;
  };

  // עדכן מטבע לפי מיקום
  useEffect(() => {
    if (userLocation.currencySymbol && userSettings.rewards?.currency === '₪') {
      // אם המשתמש לא שינה את המטבע, עדכן לפי מיקום
      if (userLocation.currency && userLocation.currency !== 'ILS') {
        setUserSettings(prev => ({
          ...prev,
          rewards: {
            ...prev.rewards,
            currency: userLocation.currencySymbol
          }
        }));
      }
    }
  }, [userLocation]);

  // קבל משימות מסוננות לפי פרויקט
  const getFilteredTasks = () => {
    if (!selectedProjectFilter) return tasks;
    return tasks.filter(t => t.project === selectedProjectFilter);
  };

  // ========== LISTS FUNCTIONS - פונקציות רשימות ==========
  
  const addList = () => {
    if (!newListTitle.trim()) return;
    const newList = {
      id: Date.now(),
      title: newListTitle.trim(),
      items: [],
      createdAt: new Date().toISOString()
    };
    setLists([...lists, newList]);
    setNewListTitle('');
    showNotificationMessage(t('listCreated'), 'success');
  };

  const deleteList = (listId) => {
    if (window.confirm(t('deleteListConfirm'))) {
      setLists(lists.filter(l => l.id !== listId));
      setEditingList(null);
      showNotificationMessage(t('listDeleted'), 'info');
    }
  };

  const addListItem = (listId) => {
    if (!newListItem.content.trim() && !newListItem.url.trim()) return;
    
    setLists(lists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          items: [...list.items, {
            id: Date.now(),
            type: newListItem.type,
            content: newListItem.content.trim(),
            url: newListItem.url.trim(),
            createdAt: new Date().toISOString()
          }]
        };
      }
      return list;
    }));
    
    setNewListItem({ type: 'note', content: '', url: '' });
    showNotificationMessage(t('itemAdded'), 'success');
  };

  const deleteListItem = (listId, itemId) => {
    setLists(lists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          items: list.items.filter(item => item.id !== itemId)
        };
      }
      return list;
    }));
  };

  // ========== AI ASSISTANT FUNCTIONS - פונקציות עוזר AI ==========
  
  const processAiCommand = async (input) => {
    setIsAiProcessing(true);
    setAiResponse(null);
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `אתה עוזר AI בתוך אפליקציית ניהול משימות. המשתמש כתב: "${input}"

המידע הנוכחי:
- יש ${tasks.filter(t => t.status !== 'done').length} משימות פתוחות
- הפרויקטים: ${projects.join(', ') || 'אין פרויקטים'}
- היום: ${today}

זהה מה המשתמש רוצה לעשות והחזר JSON בפורמט הבא:
{
  "action": "create_task" | "list_tasks" | "info" | "help" | "unknown",
  "data": {
    "title": "כותרת המשימה (אם יוצר משימה)",
    "project": "שם הפרויקט (אם זוהה)",
    "date": "תאריך בפורמט YYYY-MM-DD (אם צוין)",
    "isQuick": true/false (אם זו משימה מהירה)
  },
  "response": "תשובה ידידותית בעברית למשתמש"
}

דוגמאות:
- "צור משימה לקנות חלב" → action: create_task, title: "לקנות חלב"
- "מה המשימות שלי?" → action: list_tasks
- "עזרה" → action: help

החזר רק JSON תקין, בלי טקסט נוסף.`
            }]
          }]
        })
      });
      
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // נקה את הטקסט מ-markdown
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      try {
        const result = JSON.parse(cleanText);
        setAiResponse(result);
        
        // בצע את הפעולה אם נדרש
        if (result.action === 'create_task' && result.data?.title) {
          // המתן לאישור המשתמש
        }
        
      } catch (e) {
        setAiResponse({
          action: 'info',
          response: text || 'לא הצלחתי להבין, נסה שוב'
        });
      }
      
    } catch (error) {
      console.error('AI Error:', error);
      setAiResponse({
        action: 'error',
        response: 'אירעה שגיאה, נסה שוב'
      });
    }
    
    setIsAiProcessing(false);
  };

  const executeAiAction = () => {
    if (!aiResponse || aiResponse.action !== 'create_task') return;
    
    const data = aiResponse.data;
    const newTask = {
      id: Date.now(),
      title: data.title,
      tab: data.isQuick ? 0 : 1,
      status: 'pending',
      date: data.date || today,
      description: '',
      project: data.project || null
    };
    
    setTasks([...tasks, newTask]);
    showNotificationMessage(t('taskCreated'), 'success');
    setAiResponse(null);
    setAiInput('');
    setShowAiAssistant(false);
  };

  // ========== VOICE ASSISTANT FUNCTIONS - מזכירה קולית ==========
  
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        await transcribeAudio(audioBlob);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      showNotificationMessage(t('recording'), 'info');
    } catch (error) {
      console.error('Error starting recording:', error);
      showNotificationMessage(t('microphoneError'), 'error');
    }
  };
  
  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const transcribeAudio = async (audioBlob) => {
    setIsTranscribing(true);
    setVoiceTranscript(t('transcribing'));
    
    try {
      // המר ל-base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result.split(',')[1];
        
        // שלח ל-Gemini לתמלול והבנה
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  inlineData: {
                    mimeType: 'audio/webm',
                    data: base64Audio
                  }
                },
                {
                  text: `תמלל את ההקלטה הזו (בעברית) והחזר JSON:
{
  "transcript": "הטקסט המתומלל",
  "action": "create_task" | "info" | "search",
  "taskTitle": "כותרת המשימה (אם זו יצירת משימה)",
  "project": "שם פרויקט (אם זוהה)",
  "isQuick": true/false
}

החזר רק JSON תקין.`
                }
              ]
            }]
          })
        });
        
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        try {
          const result = JSON.parse(cleanText);
          setVoiceTranscript(result.transcript || t('transcriptionError'));
          
          if (result.action === 'create_task' && result.taskTitle) {
            // יצירת משימה אוטומטית
            const newTask = {
              id: Date.now(),
              title: result.taskTitle,
              tab: result.isQuick ? 0 : 1,
              status: 'pending',
              date: today,
              description: '',
              project: result.project || null
            };
            setTasks([...tasks, newTask]);
            showNotificationMessage(t('taskCreated'), 'success');
          }
        } catch (e) {
          setVoiceTranscript(text || t('transcriptionError'));
        }
        
        setIsTranscribing(false);
      };
    } catch (error) {
      console.error('Transcription error:', error);
      setVoiceTranscript(t('transcriptionError'));
      setIsTranscribing(false);
    }
  };

  // ========== TIMELINE FUNCTIONS - פונקציות יומן ==========
  
  const getTimelineHours = () => {
    const hours = [];
    for (let i = 6; i <= 23; i++) {
      hours.push(i);
    }
    return hours;
  };
  
  const getTimelineTasks = () => {
    const dateStr = getLocalDateString(timelineDate);
    return tasks.filter(t => 
      t.date === dateStr && 
      t.status !== 'done' && 
      t.scheduledTime
    ).sort((a, b) => {
      const timeA = a.scheduledTime || '00:00';
      const timeB = b.scheduledTime || '00:00';
      return timeA.localeCompare(timeB);
    });
  };
  
  const getUnscheduledTasks = () => {
    const dateStr = getLocalDateString(timelineDate);
    return tasks.filter(t => 
      t.date === dateStr && 
      t.status !== 'done' && 
      !t.scheduledTime
    );
  };
  
  const calculateEventPosition = (time) => {
    if (!time) return { top: 0, height: 60 };
    const [hours, minutes] = time.split(':').map(Number);
    const startHour = 6; // התחלה מ-6 בבוקר
    const top = (hours - startHour) * 60 + minutes;
    return { top: Math.max(0, top), height: 60 };
  };
  
  const handleTimelineDrop = (hour) => {
    if (!draggedTimelineTask) return;
    
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
    setTasks(prev => prev.map(t => 
      t.id === draggedTimelineTask.id 
        ? { ...t, scheduledTime: timeStr }
        : t
    ));
    setDraggedTimelineTask(null);
    showNotificationMessage(`משימה תוזמנה ל-${timeStr}`, 'success');
  };
  
  const getCurrentTimePosition = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const startHour = 6;
    if (hours < startHour || hours > 23) return null;
    return (hours - startHour) * 60 + minutes;
  };

  const addTask = () => { 
    if (!newTaskTitle.trim()) return; 
    const parsed = parseTaskTitle(newTaskTitle);
    setTasks([...tasks, { 
      id: Date.now(), 
      title: parsed.title, 
      tab: activeTab, 
      status: 'pending', 
      date: today, 
      description: '', 
      reminderTime: null,
      project: parsed.project
    }]); 
    setNewTaskTitle(''); 
    showNotificationMessage(t('taskAdded'), 'success'); 
  };
  
  const updateTask = (updatedTask) => { 
    let newTasks = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    
    // אם זו משימת retrospective עם הערות, שמור את ההערות גם במשימה הראשית
    if (updatedTask.isRetrospective && updatedTask.retrospectiveNotes && updatedTask.parentTaskId) {
      newTasks = newTasks.map(t => 
        t.id === updatedTask.parentTaskId 
          ? { ...t, retrospectiveNotes: updatedTask.retrospectiveNotes, retrospectiveDate: new Date().toISOString() }
          : t
      );
    }
    
    setTasks(newTasks);
    closeModal(); 
  };
  
  // מחיקת משימה עם תתי-משימות
  const deleteTaskWithSubtasks = (taskId) => {
    // מצא את כל תתי-המשימות
    const subtaskIds = tasks.filter(t => t.parentTaskId === taskId).map(t => t.id);
    // מחק את המשימה וכל תתי-המשימות שלה
    setTasks(prev => prev.filter(t => t.id !== taskId && !subtaskIds.includes(t.id)));
    setDeleteConfirm(null);
    showNotificationMessage(t('taskDeleted'), 'info');
  };
  
  // בקשת אישור מחיקה (רק למשימות יומיות)
  const requestDeleteTask = (task, isDaily = false) => {
    if (isDaily) {
      // משימה יומית - הצג חלון אישור
      setDeleteConfirm({ task, isDaily });
    } else {
      // משימה מהירה - מחק ישירות
      deleteTaskWithSubtasks(task.id);
    }
  };
  
  const deleteTask = (taskId) => { setTasks(tasks.filter(t => t.id !== taskId)); closeModal(); showNotificationMessage(t('taskDeleted'), 'info'); };
  const closeModal = () => { setShowModal(null); setEditingTask(null); setPostponeDate(''); setShowPostpone(false); };
  
  // פונקציה לחישוב התאריך הבא לפי סוג החזרה
  const getNextRecurrenceDate = (currentDate, recurrence, customDays = null) => {
    const date = new Date(currentDate);
    switch (recurrence) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'biweekly':
        date.setDate(date.getDate() + 14);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
      case 'custom':
        date.setDate(date.getDate() + (customDays || 2));
        break;
      default:
        return null;
    }
    return getLocalDateString(date);
  };
  
  const handleTaskComplete = (task, action, newDate = null) => { 
    if (action === 'complete') { 
      const completedDate = getLocalDateString();
      
      // עצור סטופר אם רץ על המשימה הזו
      let finalTimeSpent = task.timeSpentSeconds || 0;
      if (activeStopwatch && activeStopwatch.taskId === task.id) {
        const elapsedSeconds = Math.floor((Date.now() - activeStopwatch.startTime) / 1000);
        finalTimeSpent += elapsedSeconds;
        setActiveStopwatch(null);
        setStopwatchDisplay(0);
      }
      
      let updatedTasks = tasks.map(t => t.id === task.id ? { 
        ...t, 
        status: 'done', 
        completedDate,
        timeSpentSeconds: finalTimeSpent
      } : t);
      
      // חשב והוסף תגמול
      if (userSettings.rewards?.enabled) {
        const reward = calculateTaskReward({ ...task, timeSpentSeconds: finalTimeSpent });
        addReward(reward, task.title);
      }
      
      // אם יש חזרה, צור משימה חדשה לתאריך הבא
      if (task.recurrence && task.recurrence !== 'none' && task.date) {
        const nextDate = getNextRecurrenceDate(task.date, task.recurrence, task.customRecurrenceDays);
        if (nextDate) {
          const newRecurringTask = {
            ...task,
            id: Date.now(),
            date: nextDate,
            status: 'pending',
            timeSpentSeconds: 0 // אפס זמן למשימה החדשה
          };
          updatedTasks = [...updatedTasks, newRecurringTask];
          showNotificationMessage(`משימה הושלמה! נוצרה משימה חדשה ל-${formatDateHebrew(nextDate)}`, 'success');
        }
      } else {
        showNotificationMessage(t('taskCompleted') + ' ✓', 'success');
      }
      
      setTasks(updatedTasks);
      // אם אנחנו בשלב 4 - אפס טיימר למשימה הבאה
      if (currentPhase === 4) { 
        // בדוק כמה משימות יומיות יישארו אחרי ההשלמה
        const remainingDailyTasks = updatedTasks.filter(t => t.tab === 1 && (t.date === null || t.date <= today) && t.status !== 'done' && !t.parentTaskId);
        if (remainingDailyTasks.length > 0) {
          // יש עוד משימות - אפס את הטיימר ל-30 דקות
          setTimerSeconds(1800);
          setTimerPaused(false);
          // אם האינדקס מחוץ לטווח, חזור להתחלה
          if (currentTaskIndex >= remainingDailyTasks.length) {
            setCurrentTaskIndex(0);
          }
        } else {
          // אין יותר משימות
          setCurrentTaskIndex(0);
        }
      } 
    } else if (action === 'postpone' && newDate) { 
      console.log('📅 Postpone action:', { taskId: task.id, taskTitle: task.title, newDate });
      const updatedTasks = tasks.map(t => t.id === task.id ? { ...t, date: newDate, status: 'pending' } : t);
      console.log('📅 Updated tasks:', updatedTasks.find(t => t.id === task.id));
      setTasks(updatedTasks); 
      showNotificationMessage(`משימה הועברה ל-${formatDateHebrew(newDate)}`, 'info');
      // אפס טיימר אם בשלב 4
      if (currentPhase === 4) {
        setTimerSeconds(1800);
        setTimerPaused(false);
      }
    } else if (action === 'sendToMain') {
      // שלח לראשי - הסר תאריך
      setTasks(tasks.map(t => t.id === task.id ? { ...t, date: null, status: 'pending' } : t)); 
      showNotificationMessage(t('taskMovedToMain'), 'info');
      // אפס טיימר אם בשלב 4
      if (currentPhase === 4) {
        setTimerSeconds(1800);
        setTimerPaused(false);
      }
    }
    closeModal(); 
  };

  const addDonation = () => { if (!newDonation.amount || !newDonation.purpose) return; setDonations([{ id: Date.now(), amount: parseFloat(newDonation.amount), purpose: newDonation.purpose, date: today, completed: false }, ...donations]); setNewDonation({ amount: '', purpose: '' }); showNotificationMessage(t('added'), 'success'); };
  const toggleDonation = (id) => setDonations(donations.map(d => d.id === id ? { ...d, completed: !d.completed } : d));
  const deleteDonation = (id) => { setDonations(donations.filter(d => d.id !== id)); showNotificationMessage(t('deleted'), 'info'); };

  const getDaysInMonth = (date) => { const year = date.getFullYear(), month = date.getMonth(); const firstDay = new Date(year, month, 1), lastDay = new Date(year, month + 1, 0); const days = []; for (let i = firstDay.getDay() - 1; i >= 0; i--) days.push({ date: new Date(year, month, -i), otherMonth: true }); for (let i = 1; i <= lastDay.getDate(); i++) days.push({ date: new Date(year, month, i), otherMonth: false }); const remaining = 42 - days.length; for (let i = 1; i <= remaining; i++) days.push({ date: new Date(year, month + 1, i), otherMonth: true }); return days; };
  
  // בדיקה אם משימה חוזרת מתוכננת לתאריך מסוים
  const isRecurringTaskOnDate = (task, checkDate) => {
    if (!task.recurrence || task.recurrence === 'none' || !task.date) return false;
    
    // פרסור תאריכים כמקומיים
    const taskDate = parseLocalDate(task.date);
    const targetDate = checkDate instanceof Date ? checkDate : parseLocalDate(checkDate);
    if (!taskDate || !targetDate) return false;
    
    taskDate.setHours(0,0,0,0);
    targetDate.setHours(0,0,0,0);
    
    // המשימה צריכה להיות לפני או באותו יום
    if (targetDate < taskDate) return false;
    
    // חשב את ההפרש בימים
    const diffTime = targetDate - taskDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // בדוק לפי סוג החזרה
    if (task.recurrence === 'custom' && task.customRecurrence) {
      const settings = task.customRecurrence;
      
      // בדוק סיום
      if (settings.endType === 'date' && settings.endDate) {
        const endDate = parseLocalDate(settings.endDate);
        endDate.setHours(0,0,0,0);
        if (targetDate > endDate) return false;
      }
      
      switch (settings.unit) {
        case 'day':
          return diffDays % settings.interval === 0;
        case 'week':
          // בדוק אם זה יום בשבוע הנכון
          const targetDayOfWeek = targetDate.getDay();
          if (!settings.weekDays || !settings.weekDays.includes(targetDayOfWeek)) return false;
          // בדוק אם זה השבוע הנכון (כל X שבועות)
          const diffWeeks = Math.floor(diffDays / 7);
          return diffWeeks % settings.interval === 0 || settings.interval === 1;
        case 'month':
          const monthsDiff = (targetDate.getFullYear() - taskDate.getFullYear()) * 12 + 
                            (targetDate.getMonth() - taskDate.getMonth());
          return monthsDiff % settings.interval === 0 && targetDate.getDate() === taskDate.getDate();
        case 'year':
          const yearsDiff = targetDate.getFullYear() - taskDate.getFullYear();
          return yearsDiff % settings.interval === 0 && 
                 targetDate.getMonth() === taskDate.getMonth() && 
                 targetDate.getDate() === taskDate.getDate();
        default:
          return false;
      }
    }
    
    // חזרות פשוטות
    switch (task.recurrence) {
      case 'daily':
        return true;
      case 'weekly':
        return diffDays % 7 === 0;
      case 'biweekly':
        return diffDays % 14 === 0;
      case 'monthly':
        return targetDate.getDate() === taskDate.getDate();
      case 'yearly':
        return targetDate.getMonth() === taskDate.getMonth() && 
               targetDate.getDate() === taskDate.getDate();
      default:
        return false;
    }
  };
  
  const getTasksForDate = (date) => {
    const dateStr = getLocalDateString(date);
    
    // משימות ישירות לתאריך זה
    const directTasks = tasks.filter(t => t.date === dateStr);
    
    // משימות חוזרות שמתוכננות לתאריך זה
    const recurringTasks = tasks.filter(t => {
      // רק משימות עם חזרה שלא כבר ביום הזה
      if (!t.recurrence || t.recurrence === 'none') return false;
      if (t.date === dateStr) return false; // כבר נכלל ב-directTasks
      
      return isRecurringTaskOnDate(t, date);
    });
    
    // החזר את שתי הרשימות ביחד, עם סימון למשימות חוזרות
    return [
      ...directTasks,
      ...recurringTasks.map(t => ({ ...t, isRecurringInstance: true, originalDate: t.date }))
    ];
  };


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 5: TIMER - טיימר ונקודות שלב                                        ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

  const renderHeader = (showBack = false, title = null) => {
    const todayDate = new Date();
    const hDate = gregorianToHebrew(todayDate);
    const gDateStr = todayDate.toLocaleDateString(isRTL() ? 'he-IL' : 'en-US', { day: 'numeric', month: 'numeric', year: 'numeric' });
    const firstName = user?.displayName?.split(' ')[0] || (isRTL() ? 'אורח' : 'Guest');
    
    // Debug log
    console.log('📅 [HEBREW DATE DEBUG]', {
      todayDate: todayDate.toISOString(),
      hDate,
      rawFormatter: new Intl.DateTimeFormat('he-IL-u-ca-hebrew', { day: 'numeric', month: 'long', year: 'numeric' }).format(todayDate)
    });
    
    return (
      <div className="header header-with-user">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {showBack && <button className="back-btn" onClick={() => setCurrentScreen('home')}>{isRTL() ? '←' : '→'}</button>}
          {title ? <div className="header-hebrew-date">{title}</div> : (
            <div>
              <div className="header-welcome">{firstName}, {t('welcome')}!</div>
              <div className="header-hebrew-date" style={{ fontSize: 14 }}>
                {isRTL() ? (
                  <>
                    <span>יום {hDate.dayOfWeek}</span>
                    <span> • </span>
                    <span>{hDate.gematriaDay} {hDate.monthName}</span>
                    <span> • </span>
                    <span>{gDateStr}</span>
                  </>
                ) : (
                  <>
                    <span>{gDateStr}</span>
                    <span> • </span>
                    <span>{hDate.gematriaDay} {hDate.monthName}</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* ===== WALLET DISPLAY ===== */}
          {userSettings.rewards?.enabled && !showBack && (
            <div 
              className="wallet-display"
              onClick={() => setCurrentScreen('settings')}
              title={isRTL() ? 'לחץ להגדרות תגמולים' : 'Click for rewards settings'}
            >
              <span className="wallet-icon">💰</span>
              <span className="wallet-amount">
                {userSettings.rewards?.currency || '₪'}{(userSettings.rewards?.currentBalance || 0).toFixed(2)}
              </span>
            </div>
          )}
          {user?.photoURL && !showBack && (
            <img 
              src={user.photoURL} 
              alt="" 
              className="header-user-avatar" 
              onClick={() => setCurrentScreen('settings')}
              style={{ cursor: 'pointer' }}
            />
          )}
        </div>
      </div>
    );
  };

  const renderTimer = () => (<div className="timer-container"><div className={`timer-display ${getTimerClass()}`}>{formatTime(timerSeconds)}</div><div className="timer-label">שלב {currentPhase} מתוך 4</div><div className="timer-controls"><button className="timer-btn timer-btn-pause" onClick={() => setTimerPaused(!timerPaused)}>{timerPaused ? '▶ המשך' : '⏸ השהה'}</button><button className="timer-btn timer-btn-skip" onClick={nextPhase}>דלג ←</button></div></div>);

  const renderPhaseNav = () => (<div className="phase-nav">{[1, 2, 3, 4].map(phase => (<div key={phase} className={`phase-dot ${phase === currentPhase ? 'active' : ''} ${phase < currentPhase ? 'completed' : ''}`} />))}</div>);


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 6: PHASE1 - שלב 1: שיעורים יומיים (דינמי)                           ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

  // אתחול state של שיעורים לפי הגדרות
  const initializeStudiesFromSettings = () => {
    const studyItems = userSettings.routineConfig.studyItems;
    const newStudies = {};
    studyItems.forEach(item => {
      if (!studies[item.id]) {
        newStudies[item.id] = null;
      }
    });
    if (Object.keys(newStudies).length > 0) {
      setStudies(prev => ({ ...prev, ...newStudies }));
    }
  };

  const renderPhase1 = () => {
    // אם שיעורים לא מופעלים - דלג לשלב הבא
    if (!userSettings.routineConfig.includeStudies) {
      return (
        <div className="study-list">
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <p>שיעורים יומיים מבוטלים</p>
            <button className="next-btn" style={{ marginTop: 20 }} onClick={nextPhase}>
              המשך לשלב הבא ←
            </button>
          </div>
        </div>
      );
    }

    const studyItems = userSettings.routineConfig.studyItems;
    const allDone = studyItems.every(item => studies[item.id] === 'done' || studies[item.id] === 'not_yet');

    return (
      <div className="study-list">
        <h3 style={{ marginBottom: 16, color: 'var(--text-secondary)' }}>שיעורים יומיים</h3>
        {studyItems.map(item => (
          <div key={item.id} className="study-item">
            <div className="study-item-header">
              <div className="study-item-title">
                <span className="study-item-icon">{item.icon}</span>
                {item.title}
              </div>
              <select 
                className={`study-select ${studies[item.id] === 'done' ? 'completed' : ''}`} 
                value={studies[item.id] || ''} 
                onChange={(e) => setStudies({ ...studies, [item.id]: e.target.value || null })}
              >
                <option value="">בחר סטטוס</option>
                <option value="not_yet">עדיין לא</option>
                <option value="done">למדתי ✓</option>
              </select>
            </div>
            {/* מונה - אם מוגדר */}
            {item.hasCounter && studies[item.id] === 'done' && (
              <div className="rambam-quantity">
                {Array.from({ length: item.maxCount || 3 }, (_, i) => i + 1).map(num => (
                  <button 
                    key={num} 
                    className={`rambam-btn ${studies[`${item.id}_count`] === num ? 'selected' : ''}`} 
                    onClick={() => setStudies({ ...studies, [`${item.id}_count`]: num })}
                  >
                    {num} {num === 1 ? t('chapter') : t('chapters')}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div className="next-btn-container">
          <button 
            className="next-btn" 
            disabled={!allDone} 
            onClick={nextPhase}
          >
            המשך לשלב הבא ←
          </button>
        </div>
      </div>
    );
  };


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 7: PHASE2 - שלב 2: תקשורת + סקירת משימות                            ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

  const renderPhase2 = () => {
    const quickTasks = tasks.filter(t => t.tab === 0 && (t.date === null || t.date <= today) && t.status !== 'done');
    const dailyTasks = tasks.filter(t => t.tab === 1 && (t.date === null || t.date <= today) && t.status !== 'done' && !t.parentTaskId);
    
    return (
      <>
        {/* סקירת מקורות */}
        <div className="section-header">
          <span className="section-header-icon">📥</span>
          <span>סקירת מקורות - צור משימות מההודעות</span>
        </div>
        
        <div className="comm-check">
          <div className={`comm-item whatsapp ${commChecks.whatsapp ? 'checked' : ''}`} onClick={() => setCommChecks({ ...commChecks, whatsapp: !commChecks.whatsapp })}>
            <span style={{ fontSize: 28 }}>💬</span>
            <span className="comm-item-label">וואטסאפ</span>
          </div>
          <div className={`comm-item email ${commChecks.email ? 'checked' : ''}`} onClick={() => setCommChecks({ ...commChecks, email: !commChecks.email })}>
            <span style={{ fontSize: 28 }}>📧</span>
            <span className="comm-item-label">אימייל</span>
          </div>
          <div className={`comm-item sms ${commChecks.sms ? 'checked' : ''}`} onClick={() => setCommChecks({ ...commChecks, sms: !commChecks.sms })}>
            <span style={{ fontSize: 28 }}>📱</span>
            <span className="comm-item-label">SMS</span>
          </div>
        </div>
        
        {/* טאבים למשימות */}
        <div className="phase2-tabs">
          <button 
            className={`phase2-tab ${phase2Tab === 0 ? 'active' : ''}`} 
            onClick={() => setPhase2Tab(0)}
          >
            <span className="phase2-tab-icon">⚡</span>
            <span>מהירות</span>
            <span className="phase2-tab-count">{quickTasks.length}</span>
          </button>
          <button 
            className={`phase2-tab ${phase2Tab === 1 ? 'active' : ''}`} 
            onClick={() => setPhase2Tab(1)}
          >
            <span className="phase2-tab-icon">📋</span>
            <span>יומיות</span>
            <span className="phase2-tab-count">{dailyTasks.length}</span>
          </button>
        </div>

        <div className="task-list" style={{ paddingTop: 8 }}>
          {(phase2Tab === 0 ? quickTasks : dailyTasks).length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <div className="empty-state-icon" style={{ fontSize: 40 }}>📝</div>
              <p style={{ marginTop: 12, fontWeight: 500 }}>{t('noTasks')} {phase2Tab === 0 ? t('quickTasks') : t('dailyTasks')}</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{isRTL() ? 'הוסף משימות מהמקורות למעלה' : 'Add tasks from sources above'}</p>
            </div>
          ) : (
            (phase2Tab === 0 ? quickTasks : dailyTasks).map(task => (
              <div 
                key={task.id} 
                className={`task-item ${task.status === 'done' ? 'done' : ''} ${task.date === null ? 'no-date' : ''}`}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, task)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, task)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, task)}
              >
                <span className="drag-handle">⋮⋮</span>
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
                  <div className="task-meta">
                    {task.project && <span className={`task-project color-${getProjectColor(task.project)}`}>{task.project}</span>}
                    {task.date === null && <span>{t('main')}</span>}
                  </div>
                </div>
                <button 
                  className="task-delete-btn"
                  onClick={(e) => { e.stopPropagation(); requestDeleteTask(task, phase2Tab === 1); }}
                  title={t('deleteTask')}
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
        
        {/* הוספת משימה */}
        <div className="add-task-bar">
          <input 
            type="text" 
            className="add-task-input" 
            placeholder={phase2Tab === 0 ? `➕ ${t('quickTask')}...` : `➕ ${t('newTaskPlaceholder')}`} 
            value={newTaskTitle} 
            onChange={(e) => setNewTaskTitle(e.target.value)} 
            onKeyPress={(e) => {
              if (e.key === 'Enter' && newTaskTitle.trim()) {
                const parsed = parseTaskTitle(newTaskTitle);
                const newTask = {
                  id: Date.now(),
                  title: parsed.title,
                  project: parsed.project,
                  status: 'pending',
                  tab: phase2Tab,
                  date: today,
                  createdAt: new Date().toISOString()
                };
                setTasks(prev => [...prev, newTask]);
                setNewTaskTitle('');
                showNotificationMessage(t('taskAdded'), 'success');
              }
            }} 
          />
          <button 
            className="add-task-btn" 
            onClick={() => {
              if (newTaskTitle.trim()) {
                const parsed = parseTaskTitle(newTaskTitle);
                const newTask = {
                  id: Date.now(),
                  title: parsed.title,
                  project: parsed.project,
                  status: 'pending',
                  tab: phase2Tab,
                  date: today,
                  createdAt: new Date().toISOString()
                };
                setTasks(prev => [...prev, newTask]);
                setNewTaskTitle('');
                showNotificationMessage(t('taskAdded'), 'success');
              }
            }}
          >
            {t('add')}
          </button>
        </div>
        
        <div style={{ padding: '16px' }}>
          <button 
            className={`btn ${canProceedPhase2() ? 'btn-primary' : 'btn-secondary'}`}
            style={{ 
              width: '100%', 
              padding: '16px',
              opacity: canProceedPhase2() ? 1 : 0.5,
              cursor: canProceedPhase2() ? 'pointer' : 'not-allowed'
            }}
            disabled={!canProceedPhase2()} 
            onClick={nextPhase}
          >
            <span>המשך לביצוע משימות</span>
            <span>←</span>
          </button>
          {!canProceedPhase2() && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
              סמן את כל המקורות כדי להמשיך
            </p>
          )}
        </div>
      </>
    );
  };


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 8: PHASE3 - שלב 3: ביצוע משימות מהירות (25 דקות)                    ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

  const renderPhase3 = () => {
    const quickTasks = tasks.filter(t => t.tab === 0 && (t.date === null || t.date <= today) && t.status !== 'done');
    
    return (
      <div className="task-list">
        <div style={{ 
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
          padding: 20, 
          borderRadius: 16, 
          marginBottom: 16,
          textAlign: 'center',
          border: '1px solid #fcd34d'
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⚡</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#92400e', marginBottom: 4 }}>
            משימות מהירות
          </div>
          <div style={{ fontSize: 13, color: '#a16207' }}>
            הריצו את כל המשימות הקצרות ב-25 דקות
          </div>
        </div>
        
        {quickTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎉</div>
            <p style={{ fontWeight: 500 }}>{t('allTasksCompleted')}</p>
            <button 
              className="btn btn-primary" 
              style={{ marginTop: 20, padding: '14px 28px' }} 
              onClick={nextPhase}
            >
              <span>{t('continueToDaily')}</span>
              <span>{isRTL() ? '←' : '→'}</span>
            </button>
          </div>
        ) : (
          <>
            {quickTasks.map((task, index) => (
              <div 
                key={task.id} 
                className={`task-item ${task.date === null ? 'no-date' : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, task)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, task)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, task)}
              >
                <span className="drag-handle">⋮⋮</span>
                <div 
                  className="task-checkbox" 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setTasks(prev => prev.map(t => 
                      t.id === task.id ? { ...t, status: 'done', completedAt: new Date().toISOString() } : t
                    ));
                    showNotificationMessage(t('taskCompleted') + ' ✓', 'success');
                  }}
                />
                <div className="task-content" onClick={() => { 
                  setEditingTask({...task}); 
                  setShowModal('editTask'); 
                }}>
                  <div className="task-title">{task.title}</div>
                  <div className="task-meta">
                    {task.project && <span className={`task-project color-${getProjectColor(task.project)}`}>{task.project}</span>}
                    {task.date === null && <span>ראשי</span>}
                  </div>
                </div>
                <button 
                  className="task-delete-btn"
                  onClick={(e) => { e.stopPropagation(); deleteTaskWithSubtasks(task.id); }}
                  title="מחק משימה"
                >
                  🗑️
                </button>
              </div>
            ))}
            
            <div style={{ 
              marginTop: 20, 
              padding: 16, 
              background: 'var(--bg-secondary)', 
              borderRadius: 12, 
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}>
              <span style={{ fontSize: 20 }}>💡</span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                לחץ על העיגול לסימון מהיר
              </span>
            </div>
            
            <div style={{ padding: '16px 0' }}>
              <button 
                className={`btn ${quickTasks.length === 0 ? 'btn-primary' : 'btn-secondary'}`}
                style={{ 
                  width: '100%', 
                  padding: '16px',
                  opacity: quickTasks.length === 0 ? 1 : 0.5,
                  cursor: quickTasks.length === 0 ? 'pointer' : 'not-allowed'
                }}
                disabled={quickTasks.length > 0}
                onClick={nextPhase}
              >
                <span>המשך למשימות יומיות</span>
                <span>←</span>
              </button>
              {quickTasks.length > 0 && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
                  השלם את כל המשימות המהירות כדי להמשיך ({quickTasks.length} נותרו)
                </p>
              )}
            </div>
          </>
        )}
      </div>
    );
  };


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 9: PHASE4 - שלב 4: משימות יומיות בפוקוס (30 דקות לכל משימה)         ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

  const renderPhase4 = () => {
    const dailyTasks = tasks.filter(t => t.tab === 1 && (t.date === null || t.date <= today) && t.status !== 'done' && !t.parentTaskId);
    const currentFocusTask = dailyTasks[currentTaskIndex] || null;
    
    // תתי-משימות של המשימה הנוכחית
    const subtasks = currentFocusTask 
      ? tasks.filter(t => t.parentTaskId === currentFocusTask.id)
      : [];
    const completedSubtasks = subtasks.filter(t => t.status === 'done').length;
    
    return (
      <div className="task-list">
        {dailyTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎉</div>
            <p>{t('allTasksCompleted')}</p>
            <button className="next-btn" style={{ marginTop: 20 }} onClick={nextPhase}>
              סיים רוטינה ←
            </button>
          </div>
        ) : currentFocusTask ? (
          <>
            {/* כרטיס משימה בפוקוס */}
            <div style={{ 
              background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', 
              padding: 20, 
              borderRadius: 16, 
              marginBottom: 16,
              color: 'white'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 12
              }}>
                <span style={{ fontSize: 12, opacity: 0.8 }}>
                  משימה {currentTaskIndex + 1} מתוך {dailyTasks.length}
                </span>
                <span style={{ fontSize: 12, opacity: 0.8 }}>
                  ⏱️ 30 דקות
                </span>
              </div>
              
              <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
                {currentFocusTask.title}
              </div>
              
              {currentFocusTask.project && (
                <div style={{ 
                  display: 'inline-block',
                  padding: '4px 12px', 
                  background: 'rgba(255,255,255,0.2)', 
                  borderRadius: 20,
                  fontSize: 12
                }}>
                  {currentFocusTask.project}
                </div>
              )}
              
              {currentFocusTask.description && (
                <div style={{ marginTop: 12, fontSize: 14, opacity: 0.9 }}>
                  {currentFocusTask.description}
                </div>
              )}
              
              {subtasks.length > 0 && (
                <div style={{ marginTop: 12, fontSize: 13 }}>
                  ✓ {completedSubtasks}/{subtasks.length} {t('subtasks')} {isRTL() ? 'הושלמו' : 'completed'}
                </div>
              )}
            </div>
            
            {/* כפתורי פעולה */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button 
                className="btn btn-primary"
                style={{ flex: 1, padding: '12px 16px' }}
                onClick={() => { setEditingTask({...currentFocusTask}); setShowModal('editTask'); }}
              >
                ✏️ עריכה
              </button>
              <button 
                className="btn btn-secondary"
                style={{ flex: 1, padding: '12px 16px' }}
                onClick={() => startAIBreakdown(currentFocusTask)}
              >
                ✨ פירוק AI
              </button>
            </div>
            
            {/* תתי-משימות */}
            {subtasks.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ marginBottom: 12, color: 'var(--text-secondary)', fontSize: 14 }}>
                  תתי-משימות:
                </h4>
                {subtasks.map(subtask => (
                  <div 
                    key={subtask.id} 
                    className={`task-item ${subtask.status === 'done' ? 'done' : ''}`}
                    style={{ padding: '12px 16px' }}
                  >
                    <div 
                      className={`task-checkbox ${subtask.status === 'done' ? 'checked' : ''}`}
                      onClick={() => {
                        setTasks(prev => prev.map(t => 
                          t.id === subtask.id 
                            ? { ...t, status: t.status === 'done' ? 'pending' : 'done', completedAt: t.status === 'done' ? null : new Date().toISOString() } 
                            : t
                        ));
                      }}
                    >
                      {subtask.status === 'done' && '✓'}
                    </div>
                    <div className="task-content">
                      <div className="task-title" style={{ textDecoration: subtask.status === 'done' ? 'line-through' : 'none' }}>
                        {subtask.title}
                      </div>
                      {subtask.link && (
                        <a 
                          href={subtask.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ fontSize: 12, color: 'var(--primary)' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          🔗 {subtask.linkText || t('link')}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* הוספת תת-משימה */}
            <div style={{ marginBottom: 16 }}>
              <div className="add-task-bar">
                <input 
                  type="text" 
                  className="add-task-input" 
                  placeholder="הוסף תת-משימה..." 
                  value={newSubtaskTitle} 
                  onChange={(e) => setNewSubtaskTitle(e.target.value)} 
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newSubtaskTitle.trim()) {
                      const newSubtask = {
                        id: Date.now(),
                        title: newSubtaskTitle.trim(),
                        status: 'pending',
                        parentTaskId: currentFocusTask.id,
                        tab: 1,
                        date: currentFocusTask.date,
                        createdAt: new Date().toISOString()
                      };
                      setTasks(prev => [...prev, newSubtask]);
                      setNewSubtaskTitle('');
                    }
                  }} 
                />
                <button 
                  className="add-task-btn" 
                  onClick={() => {
                    if (newSubtaskTitle.trim()) {
                      const newSubtask = {
                        id: Date.now(),
                        title: newSubtaskTitle.trim(),
                        status: 'pending',
                        parentTaskId: currentFocusTask.id,
                        tab: 1,
                        date: currentFocusTask.date,
                        createdAt: new Date().toISOString()
                      };
                      setTasks(prev => [...prev, newSubtask]);
                      setNewSubtaskTitle('');
                    }
                  }}
                >
                  +
                </button>
              </div>
            </div>
            
            {/* כפתורי ניווט */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                className="btn btn-success"
                style={{ flex: 2, padding: '14px 16px', fontSize: 16 }}
                onClick={() => {
                  // פתח את חלון ההשלמה עם 3 האפשרויות
                  setEditingTask({...currentFocusTask});
                  setShowModal('complete');
                }}
              >
                ✓ סיימתי משימה
              </button>
              
              {currentTaskIndex < dailyTasks.length - 1 && (
                <button 
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '14px 16px' }}
                  onClick={() => {
                    setCurrentTaskIndex(prev => prev + 1);
                    // אפס את הטיימר ל-30 דקות למשימה הבאה
                    setTimerSeconds(1800);
                    setTimerPaused(false);
                  }}
                >
                  דלג →
                </button>
              )}
            </div>
            
            {/* מעבר לסיום */}
            <div className="next-btn-container" style={{ marginTop: 16 }}>
              <button className="next-btn" onClick={nextPhase}>
                סיים רוטינה ←
              </button>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🎉</div>
            <p>{t('allTasksCompleted')}</p>
            <button className="next-btn" style={{ marginTop: 20 }} onClick={nextPhase}>
              סיים רוטינה ←
            </button>
          </div>
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
      <div className="kpi-card animate-slide-up" onClick={() => setCurrentScreen('openTasks')}>
        <div><div className="kpi-value">{openTasks}</div><div className="kpi-label">{t('openTasks')}</div></div>
        <div className="kpi-icon">📋</div>
      </div>
      
      {/* כפתורי פרויקטים */}
      {projects.length > 0 && (
        <div className="projects-bar animate-slide-up" style={{ animationDelay: '0.05s' }}>
          {projects.map(project => {
            const projectTasks = tasks.filter(t => t.project === project && t.status !== 'done');
            return (
              <button 
                key={project} 
                className={`project-btn ${selectedProject === project ? 'active' : ''}`}
                onClick={() => {
                  setSelectedProject(project);
                  setCurrentScreen('projectTasks');
                }}
              >
                <span className="project-count">{projectTasks.length}</span>
                {project}
              </button>
            );
          })}
        </div>
      )}
      
      <div className="calendar-widget animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="calendar-header">
          <div className="calendar-nav">
            <button className="calendar-nav-btn" onClick={() => {
              if (showHebrewCalendar) {
                // עבור לחודש עברי קודם (כ-30 יום אחורה)
                const newDate = new Date(calendarMonth);
                newDate.setDate(newDate.getDate() - 30);
                setCalendarMonth(newDate);
              } else {
                setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1));
              }
            }}>{isRTL() ? '→' : '←'}</button>
            <button className="calendar-nav-btn" onClick={() => {
              if (showHebrewCalendar) {
                // עבור לחודש עברי הבא (כ-30 יום קדימה)
                const newDate = new Date(calendarMonth);
                newDate.setDate(newDate.getDate() + 30);
                setCalendarMonth(newDate);
              } else {
                setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1));
              }
            }}>{isRTL() ? '←' : '→'}</button>
            <button className="calendar-nav-btn" onClick={() => setCalendarMonth(new Date())} title={t('today')}>⊙</button>
          </div>
          <div className="calendar-title">
            {showHebrewCalendar 
              ? (() => { 
                  // מצא את החודש העברי של היום הראשון שמוצג בלוח
                  const days = getHebrewMonthDays(calendarMonth);
                  const firstRealDay = days.find(d => !d.otherMonth);
                  if (firstRealDay) {
                    const h = gregorianToHebrew(firstRealDay.date);
                    return `${h.monthName} ${h.gematriaYear}`;
                  }
                  const h = gregorianToHebrew(calendarMonth);
                  return `${h.monthName} ${h.gematriaYear}`;
                })() 
              : calendarMonth.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}
          </div>
          <button className="calendar-nav-btn" onClick={() => setShowHebrewCalendar(!showHebrewCalendar)}>{showHebrewCalendar ? '📅' : '🔯'}</button>
        </div>
        <div className="calendar-grid">
          {[t('sun'), t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat')].map(day => <div key={day} className="calendar-day-header">{day}</div>)}
          {(showHebrewCalendar ? getHebrewMonthDays(calendarMonth) : getDaysInMonth(calendarMonth)).map((day, idx) => { 
            const dateStr = getLocalDateString(day.date); 
            const isToday = dateStr === today; 
            const dayTasks = getTasksForDate(day.date);
            const hasRecurring = dayTasks.some(t => t.isRecurringInstance || (t.recurrence && t.recurrence !== 'none'));
            const hDate = gregorianToHebrew(day.date); 
            return (
              <div 
                key={idx} 
                className={`calendar-day ${day.otherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${dayTasks.length > 0 ? 'has-tasks' : ''} ${hasRecurring ? 'has-recurring' : ''}`} 
                onClick={() => { if (dayTasks.length > 0) { setSelectedDate(day.date); setShowModal('dayTasks'); } }}
              >
                {showHebrewCalendar ? (
                  <>
                    <span>{hDate.gematriaDay}</span>
                    <span className="calendar-day-secondary">{day.date.getDate()}</span>
                  </>
                ) : (
                  <>
                    <span>{day.date.getDate()}</span>
                    <span className="calendar-day-secondary">{hDate.gematriaDay}</span>
                  </>
                )}
                {hasRecurring && <span className="recurring-dot">🔄</span>}
              </div>
            ); 
          })}
        </div>
      </div>
      {/* כפתורי מודולים - דינמי לפי הגדרות */}
      <div className="action-buttons">
        {userSettings.activeModules.routine && (
          <button className="action-btn action-btn-primary" onClick={startRoutine}>
            <span className="action-btn-icon">▶️</span>{t('startRoutine')}
          </button>
        )}
        {userSettings.activeModules.tasks && (
          <button className="action-btn action-btn-secondary" onClick={() => setCurrentScreen('tasks')}>
            <span className="action-btn-icon">📋</span>{t('manageTasks')}
          </button>
        )}
        {userSettings.activeModules.donations && (
          <button className="action-btn action-btn-secondary" onClick={() => setCurrentScreen('donations')}>
            <span className="action-btn-icon">💝</span>{t('donations')}
            {pendingDonations.length > 0 && (
              <span style={{ background: 'var(--danger)', color: 'white', padding: '2px 6px', borderRadius: 10, fontSize: 11, marginRight: isRTL() ? 4 : 0, marginLeft: isRTL() ? 0 : 4 }}>
                {pendingDonations.length}
              </span>
            )}
          </button>
        )}
        {userSettings.activeModules.history && (
          <button className="action-btn action-btn-secondary" onClick={() => setCurrentScreen('history')}>
            <span className="action-btn-icon">📊</span>{t('history')}
          </button>
        )}
        {userSettings.activeModules.lists && (
          <button className="action-btn action-btn-secondary" onClick={() => setCurrentScreen('lists')}>
            <span className="action-btn-icon">📚</span>{t('lists')}
            {lists.length > 0 && (
              <span className="action-btn-badge">{lists.length}</span>
            )}
          </button>
        )}
        <button 
          className="action-btn action-btn-secondary" 
          onClick={() => setCurrentScreen('settings')} 
        >
          <span className="action-btn-icon">⚙️</span>{t('settings')}
        </button>
      </div>
    </>
  );


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 11: TASKS_SCREEN - מסך ניהול משימות                                 ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

  const renderTasksScreen = () => {
    // סידור משימות: משימות ראשיות ואחריהן תתי-המשימות שלהן
    const getOrderedTasks = () => {
      let tabTasks = tasks.filter(t => t.tab === activeTab);
      
      // סינון לפי פרויקט
      if (selectedProjectFilter) {
        tabTasks = tabTasks.filter(t => t.project === selectedProjectFilter);
      }
      
      const mainTasks = tabTasks.filter(t => !t.parentTaskId);
      const result = [];
      
      mainTasks.forEach(mainTask => {
        result.push(mainTask);
        // הוסף תתי-משימות רק אם לא מכווץ
        if (!collapsedTasks[mainTask.id]) {
          const subtasks = tabTasks.filter(t => t.parentTaskId === mainTask.id);
          result.push(...subtasks);
        }
      });
      
      // הוסף תתי-משימות יתומות (שהמשימה הראשית נמחקה)
      const orphanSubtasks = tabTasks.filter(t => t.parentTaskId && !mainTasks.find(m => m.id === t.parentTaskId));
      result.push(...orphanSubtasks);
      
      return result;
    };
    
    return (
      <>
        {renderHeader(true, t('manageTasks'))}
        
        {/* ===== PROJECT FILTER CHIPS ===== */}
        {projects.length > 0 && (
          <div className="project-filter-bar">
            <div 
              className={`project-chip ${!selectedProjectFilter ? 'active' : ''}`}
              onClick={() => setSelectedProjectFilter(null)}
            >
              {t('all')}
              <span className="project-chip-count">{tasks.filter(task => task.tab === activeTab && task.status !== 'done').length}</span>
            </div>
            {projects.map(project => {
              const count = tasks.filter(task => task.project === project && task.tab === activeTab && task.status !== 'done').length;
              return (
                <div 
                  key={project}
                  className={`project-chip ${selectedProjectFilter === project ? 'active' : ''}`}
                  onClick={() => setSelectedProjectFilter(selectedProjectFilter === project ? null : project)}
                >
                  {project}
                  <span className="project-chip-count">{count}</span>
                </div>
              );
            })}
          </div>
        )}
        
        {/* ===== PROJECT TIME SUMMARY ===== */}
        {selectedProjectFilter && (
          <div className="project-summary">
            <div>
              <div className="project-summary-title">📊 {selectedProjectFilter}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('totalTime')}</div>
            </div>
            <div className="project-summary-time">
              {formatStopwatchTime(getProjectTotalTime(selectedProjectFilter))}
            </div>
          </div>
        )}
        
        <div className="task-tabs">
          <button className={`task-tab ${activeTab === 0 ? 'active' : ''}`} onClick={() => setActiveTab(0)}>
            <span className="task-tab-count">{tasks.filter(task => task.tab === 0 && task.status !== 'done').length}</span>{t('quickTasks')}
          </button>
          <button className={`task-tab ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}>
            <span className="task-tab-count">{tasks.filter(task => task.tab === 1 && task.status !== 'done').length}</span>{t('dailyTasks')}
          </button>
        </div>
        <div className="task-list">
          {getOrderedTasks().map(task => {
            const isSubtask = !!task.parentTaskId;
            const parentTitle = getParentTaskTitle(task);
            const taskHasSubtasks = !isSubtask && hasSubtasks(task.id);
            const isCollapsed = collapsedTasks[task.id];
            const isStopwatchRunning = activeStopwatch && activeStopwatch.taskId === task.id;
            const taskTotalTime = isStopwatchRunning 
              ? stopwatchDisplay 
              : (task.timeSpentSeconds || 0);
            
            return (
              <React.Fragment key={task.id}>
                <div 
                  className={`task-item ${task.status === 'done' ? 'done' : ''} ${task.date === null ? 'no-date' : ''} ${isSubtask ? 'subtask' : ''}`}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, task)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, task)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, task)}
                >
                  {/* ===== STOPWATCH BUTTON ===== */}
                  {task.status !== 'done' && (
                    <button 
                      className={`stopwatch-btn ${isStopwatchRunning ? 'pause' : 'play'}`}
                      onClick={(e) => { e.stopPropagation(); toggleStopwatch(task.id); }}
                      title={isStopwatchRunning ? t('stopTimer') : t('startTimer')}
                    >
                      {isStopwatchRunning ? '⏸' : '▶'}
                    </button>
                  )}
                  
                  <span className="drag-handle">⋮⋮</span>
                  {/* חץ הצגה/הסתרה לתתי-משימות */}
                  {taskHasSubtasks ? (
                    <button 
                      className="collapse-btn"
                      onClick={(e) => { e.stopPropagation(); toggleTaskCollapse(task.id); }}
                    >
                      {isCollapsed ? '◀' : '▼'}
                    </button>
                  ) : !isSubtask && (
                    <span className="collapse-placeholder"></span>
                  )}
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
                    <div className="task-title">
                      {task.title}
                      {taskHasSubtasks && <span className="subtask-count">({tasks.filter(t => t.parentTaskId === task.id).length})</span>}
                    </div>
                    <div className="task-meta">
                      {task.project && <span className={`task-project color-${getProjectColor(task.project)}`}>{task.project}</span>}
                      {isSubtask && parentTitle && <span className="subtask-badge">{t('from')}: {parentTitle}</span>}
                      <span>{formatTaskDate(task)}</span>
                      {/* תצוגת זמן שהושקע */}
                      {taskTotalTime > 0 && (
                        <span className={`task-time-spent ${taskTotalTime > 0 ? 'has-time' : ''}`}>
                          ⏱ {formatStopwatchTime(taskTotalTime)}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* כפתור הוספת תת-משימה בתוך התיבה */}
                  {!isSubtask && task.status !== 'done' && activeTab === 1 && (
                    <button 
                      className="add-subtask-inline-btn"
                      onClick={(e) => { e.stopPropagation(); setAddingSubtaskTo(task.id); }}
                      title={t('addSubtask')}
                    >
                      +
                    </button>
                  )}
                  {/* כפתור מחיקה */}
                  <button 
                    className="task-delete-btn"
                    onClick={(e) => { e.stopPropagation(); requestDeleteTask(task, activeTab === 1); }}
                    title={t('deleteTask')}
                  >
                    🗑️
                  </button>
                </div>
                
                {/* שדה הוספת תת-משימה */}
                {addingSubtaskTo === task.id && (
                  <div style={{ display: 'flex', gap: 8, marginRight: 24, marginBottom: 8, marginTop: 4 }}>
                    <input
                      type="text"
                      className="form-input"
                      style={{ flex: 1, padding: 8 }}
                      placeholder={t('newSubtask')}
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSubtask(task)}
                      autoFocus
                    />
                    <button className="timer-btn" onClick={() => addSubtask(task)}>+</button>
                    <button className="timer-btn" onClick={() => { setAddingSubtaskTo(null); setNewSubtaskTitle(''); }}>✕</button>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
        <div className="add-task-bar"><input type="text" className="add-task-input" placeholder={t('newTaskPlaceholder')} value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addTask()} /><button className="add-task-btn" onClick={addTask}>+ {t('add')}</button></div>
      </>
    );
  };


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 11.1: OPEN_TASKS_SCREEN - מסך משימות פתוחות                         ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

  const renderOpenTasksScreen = () => {
    const allOpenTasks = tasks.filter(t => t.status !== 'done' && (t.date === null || t.date <= today) && !t.parentTaskId);
    const noDateTasks = allOpenTasks.filter(t => t.date === null);
    const datedTasks = allOpenTasks.filter(t => t.date !== null);
    
    const renderTaskItem = (task) => {
      const isDaily = task.tab === 1;
      const subtaskCount = tasks.filter(t => t.parentTaskId === task.id).length;
      
      return (
        <div key={task.id} className={`task-item ${task.date === null ? 'no-date' : ''}`}>
          <div className="task-checkbox" onClick={(e) => { e.stopPropagation(); setEditingTask({...task}); setTimeout(() => setShowModal('complete'), 0); }}></div>
          <div className="task-content" onClick={() => { setEditingTask({...task}); setShowModal('editTask'); }}>
            <div className="task-title">{task.title}</div>
            <div className="task-meta">
              {task.project && <span className={`task-project color-${getProjectColor(task.project)}`}>{task.project}</span>}
              <span>{isDaily ? t('dailyTask') : t('quickTask')}</span>
              {subtaskCount > 0 && <span>📎 {subtaskCount}</span>}
            </div>
          </div>
          <button 
            className="task-delete-btn"
            onClick={(e) => { e.stopPropagation(); requestDeleteTask(task, isDaily); }}
            title={t('deleteTask')}
          >
            🗑️
          </button>
        </div>
      );
    };
    
    return (
      <>
        {renderHeader(true, t('openTasks'))}
        <div className="task-list">
          {noDateTasks.length > 0 && (
            <>
              <h3 style={{ marginBottom: 12, color: 'var(--warning)' }}>📌 {t('noDateTasks')}</h3>
              {noDateTasks.map(task => renderTaskItem(task))}
            </>
          )}
          
          {datedTasks.length > 0 && (
            <>
              <h3 style={{ marginBottom: 12, marginTop: noDateTasks.length > 0 ? 24 : 0, color: 'var(--text-secondary)' }}>📅 {t('withDate')}</h3>
              {datedTasks.map(task => renderTaskItem(task))}
            </>
          )}
          
          {allOpenTasks.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">🎉</div>
              <p>{t('noOpenTasks')}</p>
            </div>
          )}
        </div>
      </>
    );
  };


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 11.2: PROJECT_TASKS_SCREEN - מסך משימות פרויקט                      ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

  const renderProjectTasksScreen = () => {
    const projectTasks = tasks.filter(t => t.project === selectedProject);
    const openProjectTasks = projectTasks.filter(t => t.status !== 'done');
    const doneProjectTasks = projectTasks.filter(t => t.status === 'done');
    
    return (
      <>
        {renderHeader(true, `פרויקט: ${selectedProject}`)}
        <div className="task-list">
          {openProjectTasks.length > 0 && (
            <>
              <h3 style={{ marginBottom: 12, color: 'var(--text-secondary)' }}>פתוחות ({openProjectTasks.length})</h3>
              {openProjectTasks.map(task => (
                <div key={task.id} className={`task-item ${task.date === null ? 'no-date' : ''}`}>
                  <div className="task-checkbox" onClick={(e) => { e.stopPropagation(); setEditingTask({...task}); setTimeout(() => setShowModal('complete'), 0); }}></div>
                  <div className="task-content" onClick={() => { setEditingTask({...task}); setShowModal('editTask'); }}>
                    <div className="task-title">{task.title}</div>
                    <div className="task-meta">
                      <span>{formatTaskDate(task)}</span>
                      <span>{task.tab === 0 ? t('quickTask') : t('dailyTask')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
          
          {doneProjectTasks.length > 0 && (
            <>
              <h3 style={{ marginBottom: 12, marginTop: 24, color: 'var(--success)' }}>{isRTL() ? 'הושלמו' : 'Completed'} ({doneProjectTasks.length})</h3>
              {doneProjectTasks.map(task => (
                <div key={task.id} className="task-item done">
                  <div className="task-checkbox">✓</div>
                  <div className="task-content" onClick={() => { setEditingTask({...task}); setShowModal('editTask'); }}>
                    <div className="task-title">{task.title}</div>
                  </div>
                </div>
              ))}
            </>
          )}
          
          {projectTasks.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📁</div>
              <p>אין משימות בפרויקט זה</p>
            </div>
          )}
        </div>
      </>
    );
  };


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 12: DONATIONS_SCREEN - מסך צדקה                                     ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

  const renderDonationsScreen = () => (
    <>
      {renderHeader(true, t('donationsTitle'))}
      <div className="donations-container">
        <div className="add-donation-form">
          <div className="form-row" style={{ marginBottom: 12 }}>
            <input type="number" className="form-input" placeholder={`${t('amount')} ₪`} value={newDonation.amount} onChange={(e) => setNewDonation({ ...newDonation, amount: e.target.value })} />
            <input type="text" className="form-input" placeholder={t('purpose')} value={newDonation.purpose} onChange={(e) => setNewDonation({ ...newDonation, purpose: e.target.value })} />
          </div>
          <button className="next-btn" onClick={addDonation}>+ {t('addDonation')}</button>
        </div>
        {donations.map(donation => (
          <div key={donation.id} className={`donation-item ${donation.completed ? 'completed' : ''}`}>
            <div className="donation-checkbox" onClick={() => toggleDonation(donation.id)}>{donation.completed && '✓'}</div>
            <div className="donation-content">
              <div className="donation-amount">₪{donation.amount}</div>
              <div className="donation-purpose">{donation.purpose}</div>
              <div className="donation-date">{formatDateHebrew(donation.date)}</div>
            </div>
            <button className="donation-delete" onClick={() => deleteDonation(donation.id)}>🗑️</button>
          </div>
        ))}
      </div>
    </>
  );


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 13: HISTORY_SCREEN - מסך היסטוריה                                   ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

  // פונקציה לפורמט זמן בשניות לטקסט קריא
  const formatDuration = (seconds) => {
    if (!seconds) return '-';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  };

  // פונקציה ליצירת דוח
  const generateReport = (days = 7) => {
    const reportData = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = getLocalDateString(date);
      const dayHistory = dailyHistory[dateStr];
      const dayTasks = tasks.filter(t => t.date === dateStr);
      const completed = dayTasks.filter(t => t.status === 'done').length;
      
      reportData.push({
        date: dateStr,
        hebrewDate: gregorianToHebrew(date),
        dayName: date.toLocaleDateString('he-IL', { weekday: 'long' }),
        history: dayHistory,
        tasks: { total: dayTasks.length, completed },
        productivity: dayTasks.length > 0 ? Math.round((completed / dayTasks.length) * 100) : 0
      });
    }
    return reportData;
  };

  // פונקציה להורדת דוח כטקסט
  const downloadReport = () => {
    const report = generateReport(30);
    let text = '📊 דוח פרודוקטיביות - 30 יום אחרונים\n';
    text += '=' .repeat(50) + '\n\n';
    
    report.forEach(day => {
      text += `📅 ${day.dayName}, ${day.date} (${day.hebrewDate.gematriaDay} ${day.hebrewDate.monthName})\n`;
      text += '-'.repeat(40) + '\n';
      
      if (day.history) {
        const startTime = day.history.routineStartTime ? new Date(day.history.routineStartTime).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) : '-';
        text += `⏰ התחלת רוטינה: ${startTime}\n`;
        text += `⏱️ זמן כולל: ${formatDuration(day.history.totalDuration)}\n`;
        
        if (day.history.studies) {
          text += '\n📚 שיעורים יומיים:\n';
          const s = day.history.studies;
          text += `   • חומש: ${s.chumash === 'done' ? '✓' : s.chumash === 'partial' ? 'חלקי' : '-'}\n`;
          text += `   • תניא: ${s.tanya === 'done' ? '✓' : s.tanya === 'partial' ? 'חלקי' : '-'}\n`;
          text += `   • רמב"ם: ${s.rambam === 'done' ? `✓ (${s.rambamCount || '-'} פרקים)` : s.rambam === 'partial' ? 'חלקי' : '-'}\n`;
          text += `   • היום יום: ${s.hayomYom === 'done' ? '✓' : '-'}\n`;
        }
        
        text += '\n⏱️ זמני שלבים:\n';
        Object.entries(day.history.phases || {}).forEach(([phase, data]) => {
          const phaseName = phase === '1' ? 'שיעורים' : phase === '2' ? 'תקשורת' : phase === '3' ? 'משימות מהירות' : 'משימות יום';
          text += `   • שלב ${phase} (${phaseName}): ${formatDuration(data.duration)}\n`;
        });
      } else {
        text += '❌ לא בוצעה רוטינה\n';
      }
      
      text += `\n📋 משימות: ${day.tasks.completed}/${day.tasks.total} (${day.productivity}%)\n`;
      text += '\n';
    });
    
    // סיכום כללי
    const totalDays = report.filter(d => d.history).length;
    const avgProductivity = Math.round(report.reduce((sum, d) => sum + d.productivity, 0) / report.length);
    const totalRoutineTime = report.reduce((sum, d) => sum + (d.history?.totalDuration || 0), 0);
    
    text += '\n' + '='.repeat(50) + '\n';
    text += '📈 סיכום:\n';
    text += `   • ימים עם רוטינה: ${totalDays}/30\n`;
    text += `   • פרודוקטיביות ממוצעת: ${avgProductivity}%\n`;
    text += `   • זמן רוטינה כולל: ${formatDuration(totalRoutineTime)}\n`;
    
    // הורדה כקובץ
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `productivity-report-${today}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotificationMessage(t('reportDownloaded') + ' 📊', 'success');
  };

  const renderHistoryScreen = () => {
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date;
    });

    return (
      <>
        {renderHeader(true, t('historyTitle'))}
        <div className="settings-container">
          {/* כפתור הורדת דוח */}
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', marginBottom: 20, padding: '12px 20px', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            onClick={downloadReport}
          >
            📊 {t('downloadReport')}
          </button>

          {last7Days.map(date => {
            const dateStr = getLocalDateString(date);
            const dayHistory = dailyHistory[dateStr];
            const dayTasks = tasks.filter(task => task.date === dateStr);
            const completed = dayTasks.filter(task => task.status === 'done').length;
            const hDate = gregorianToHebrew(date);
            const productivity = dayTasks.length > 0 ? Math.round((completed / dayTasks.length) * 100) : 0;

            return (
              <div key={dateStr} className="history-item" style={{ padding: 16 }}>
                <div className="history-date" style={{ marginBottom: 12 }}>
                  📅 {date.toLocaleDateString(isRTL() ? 'he-IL' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: isRTL() ? 8 : 0, marginLeft: isRTL() ? 0 : 8 }}>
                    ({hDate.gematriaDay} {hDate.monthName})
                  </span>
                </div>

                {/* מידע על הרוטינה */}
                {dayHistory ? (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
                      <span style={{ fontSize: 14 }}>
                        ⏰ {isRTL() ? 'התחלה' : 'Start'}: {dayHistory.routineStartTime ? new Date(dayHistory.routineStartTime).toLocaleTimeString(isRTL() ? 'he-IL' : 'en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </span>
                      <span style={{ fontSize: 14 }}>
                        ⏱️ {isRTL() ? 'משך' : 'Duration'}: {formatDuration(dayHistory.totalDuration)}
                      </span>
                    </div>

                    {/* שיעורים יומיים */}
                    {dayHistory.studies && (
                      <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 12, marginTop: 8 }}>
                        <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>📚 {t('studies')}:</div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 13 }}>
                          <span style={{ padding: '4px 8px', borderRadius: 4, background: dayHistory.studies.chumash === 'done' ? 'var(--success)' : dayHistory.studies.chumash === 'partial' ? 'var(--warning)' : 'var(--bg-card)', color: dayHistory.studies.chumash ? 'white' : 'inherit' }}>
                            {t('chumash')} {dayHistory.studies.chumash === 'done' ? '✓' : dayHistory.studies.chumash === 'partial' ? '½' : '-'}
                          </span>
                          <span style={{ padding: '4px 8px', borderRadius: 4, background: dayHistory.studies.tanya === 'done' ? 'var(--success)' : dayHistory.studies.tanya === 'partial' ? 'var(--warning)' : 'var(--bg-card)', color: dayHistory.studies.tanya ? 'white' : 'inherit' }}>
                            {t('tanya')} {dayHistory.studies.tanya === 'done' ? '✓' : dayHistory.studies.tanya === 'partial' ? '½' : '-'}
                          </span>
                          <span style={{ padding: '4px 8px', borderRadius: 4, background: dayHistory.studies.rambam === 'done' ? 'var(--success)' : dayHistory.studies.rambam === 'partial' ? 'var(--warning)' : 'var(--bg-card)', color: dayHistory.studies.rambam ? 'white' : 'inherit' }}>
                            {t('rambam')} {dayHistory.studies.rambam === 'done' ? `✓ (${dayHistory.studies.rambamCount || ''})` : dayHistory.studies.rambam === 'partial' ? '½' : '-'}
                          </span>
                          <span style={{ padding: '4px 8px', borderRadius: 4, background: dayHistory.studies.hayomYom === 'done' ? 'var(--success)' : 'var(--bg-card)', color: dayHistory.studies.hayomYom === 'done' ? 'white' : 'inherit' }}>
                            {t('hayomYom')} {dayHistory.studies.hayomYom === 'done' ? '✓' : '-'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* זמני שלבים */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                      {Object.entries(dayHistory.phases || {}).map(([phase, data]) => (
                        <span key={phase} style={{ padding: '2px 6px', background: 'var(--bg-secondary)', borderRadius: 4 }}>
                          {t('phase')} {phase}: {formatDuration(data.duration)}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 8 }}>
                    ❌ {t('noRoutine')}
                  </div>
                )}

                {/* סטטיסטיקת משימות */}
                <div className="history-stats" style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 8 }}>
                  <span>✓ {completed} {isRTL() ? 'הושלמו' : 'completed'}</span>
                  <span>📋 {dayTasks.length} סה"כ</span>
                  <span style={{ 
                    padding: '2px 8px', 
                    borderRadius: 12, 
                    fontSize: 12,
                    background: productivity >= 80 ? 'var(--success)' : productivity >= 50 ? 'var(--warning)' : 'var(--danger)',
                    color: 'white'
                  }}>
                    {productivity}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 13.5: LISTS_SCREEN - מסך רשימות                                     ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

  const renderListsScreen = () => {
    // אם עורכים רשימה ספציפית
    if (editingList) {
      const list = lists.find(l => l.id === editingList);
      if (!list) {
        setEditingList(null);
        return null;
      }
      
      return (
        <>
          {renderHeader(true, list.title, () => setEditingList(null))}
          <div className="lists-container">
            {/* טופס הוספת פריט */}
            <div className="add-list-item-form">
              <div className="list-item-type-selector">
                <button 
                  className={`list-item-type-btn ${newListItem.type === 'note' ? 'active' : ''}`}
                  onClick={() => setNewListItem({ ...newListItem, type: 'note' })}
                >
                  📝 {t('note')}
                </button>
                <button 
                  className={`list-item-type-btn ${newListItem.type === 'link' ? 'active' : ''}`}
                  onClick={() => setNewListItem({ ...newListItem, type: 'link' })}
                >
                  🔗 {t('link')}
                </button>
                <button 
                  className={`list-item-type-btn ${newListItem.type === 'idea' ? 'active' : ''}`}
                  onClick={() => setNewListItem({ ...newListItem, type: 'idea' })}
                >
                  💡 {t('idea')}
                </button>
              </div>
              
              <input
                type="text"
                className="form-input"
                placeholder={newListItem.type === 'link' ? (isRTL() ? 'כותרת הקישור' : 'Link title') : (isRTL() ? 'תוכן...' : 'Content...')}
                value={newListItem.content}
                onChange={(e) => setNewListItem({ ...newListItem, content: e.target.value })}
              />
              
              {newListItem.type === 'link' && (
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://..."
                  value={newListItem.url}
                  onChange={(e) => setNewListItem({ ...newListItem, url: e.target.value })}
                />
              )}
              
              <button 
                className="btn btn-primary"
                onClick={() => addListItem(list.id)}
                disabled={!newListItem.content.trim() && !newListItem.url.trim()}
              >
                + {t('addItem')}
              </button>
            </div>
            
            {/* רשימת פריטים */}
            {list.items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                <div>{t('emptyList')}</div>
                <div style={{ fontSize: 13 }}>{t('addItemsAbove')}</div>
              </div>
            ) : (
              list.items.map(item => (
                <div key={item.id} className="list-item">
                  <div className="list-item-icon">
                    {item.type === 'note' ? '📝' : item.type === 'link' ? '🔗' : '💡'}
                  </div>
                  <div className="list-item-content">
                    <div className="list-item-title">{item.content}</div>
                    {item.url && (
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="list-item-url"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {item.url}
                      </a>
                    )}
                  </div>
                  <button 
                    className="list-item-delete"
                    onClick={() => deleteListItem(list.id, item.id)}
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
            
            {/* כפתור מחיקת רשימה */}
            <button 
              className="btn"
              style={{ 
                width: '100%', 
                marginTop: 20, 
                background: 'var(--danger-light)', 
                color: 'var(--danger)',
                border: '1px solid var(--danger)'
              }}
              onClick={() => deleteList(list.id)}
            >
              🗑️ {t('deleteList')}
            </button>
          </div>
        </>
      );
    }
    
    // מסך ראשי של רשימות
    return (
      <>
        {renderHeader(true, t('lists'))}
        <div className="lists-container">
          {/* טופס יצירת רשימה חדשה */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <input
              type="text"
              className="form-input"
              style={{ flex: 1 }}
              placeholder={isRTL() ? 'שם הרשימה החדשה...' : 'New list name...'}
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addList()}
            />
            <button className="btn btn-primary" onClick={addList}>
              + {t('createList')}
            </button>
          </div>
          
          {/* רשימת הרשימות */}
          {lists.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>📚</div>
              <div style={{ fontSize: 18, marginBottom: 8 }}>{t('noListsYet')}</div>
              <div style={{ fontSize: 14 }}>{t('createFirstList')}</div>
            </div>
          ) : (
            lists.map(list => (
              <div 
                key={list.id} 
                className="list-card"
                onClick={() => setEditingList(list.id)}
              >
                <div className="list-card-header">
                  <div className="list-card-title">
                    📋 {list.title}
                  </div>
                  <div className="list-card-count">
                    {list.items.length} {t('items')}
                  </div>
                </div>
                {list.items.length > 0 && (
                  <div className="list-items-preview">
                    {list.items.slice(0, 3).map(item => item.content).join(' • ')}
                    {list.items.length > 3 && ' ...'}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </>
    );
  };


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 13.6: TIMELINE_SCREEN - מסך יומן Timeline                           ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

  const renderTimelineScreen = () => {
    const hours = getTimelineHours();
    const scheduledTasks = getTimelineTasks();
    const unscheduledTasks = getUnscheduledTasks();
    const nowPosition = getCurrentTimePosition();
    const isToday = getLocalDateString(timelineDate) === today;
    
    return (
      <>
        {renderHeader(true, t('timeline'))}
        <div className="timeline-container">
          {/* Navigation Header */}
          <div className="timeline-header">
            <div className="timeline-date-nav">
              <button 
                className="timeline-date-btn"
                onClick={() => {
                  const newDate = new Date(timelineDate);
                  newDate.setDate(newDate.getDate() + (isRTL() ? 1 : -1));
                  setTimelineDate(newDate);
                }}
              >
                ←
              </button>
              <button 
                className="timeline-date-btn"
                onClick={() => setTimelineDate(new Date())}
                title={t('today')}
              >
                ⊙
              </button>
              <button 
                className="timeline-date-btn"
                onClick={() => {
                  const newDate = new Date(timelineDate);
                  newDate.setDate(newDate.getDate() + (isRTL() ? -1 : 1));
                  setTimelineDate(newDate);
                }}
              >
                →
              </button>
            </div>
            <div className="timeline-date-title">
              {timelineDate.toLocaleDateString(isRTL() ? 'he-IL' : 'en-US', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </div>
          </div>
          
          {/* Timeline Grid */}
          <div className="timeline-grid">
            {/* Hours column */}
            <div className="timeline-hours">
              {hours.map(hour => (
                <div key={hour} className="timeline-hour">
                  {hour.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>
            
            {/* Events area */}
            <div className="timeline-events">
              {/* Drop zones */}
              {hours.map(hour => (
                <div
                  key={`drop-${hour}`}
                  className={`timeline-drop-zone ${draggedTimelineTask ? 'active' : ''}`}
                  style={{ top: (hour - 6) * 60 }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleTimelineDrop(hour)}
                />
              ))}
              
              {/* Current time line */}
              {isToday && nowPosition !== null && (
                <div 
                  className="timeline-now-line"
                  style={{ top: nowPosition }}
                />
              )}
              
              {/* Scheduled tasks */}
              {scheduledTasks.map(task => {
                const pos = calculateEventPosition(task.scheduledTime);
                return (
                  <div
                    key={task.id}
                    className={`timeline-event ${draggedTimelineTask?.id === task.id ? 'dragging' : ''}`}
                    style={{ 
                      top: pos.top, 
                      height: task.estimatedMinutes || 60,
                      minHeight: 40
                    }}
                    draggable
                    onDragStart={() => setDraggedTimelineTask(task)}
                    onDragEnd={() => setDraggedTimelineTask(null)}
                    onClick={() => {
                      setEditingTask({...task});
                      setShowModal('editTask');
                    }}
                  >
                    <div className="timeline-event-title">{task.title}</div>
                    <div className="timeline-event-time">
                      {task.scheduledTime}
                      {task.estimatedMinutes && ` • ${task.estimatedMinutes} ${isRTL() ? "דק'" : 'min'}`}
                    </div>
                    {task.project && (
                      <div className="timeline-event-project">{task.project}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Unscheduled tasks */}
          {unscheduledTasks.length > 0 && (
            <div className="timeline-unscheduled">
              <div className="timeline-unscheduled-title">
                📋 {t('unscheduledTasks')} ({unscheduledTasks.length})
              </div>
              <div className="timeline-unscheduled-list">
                {unscheduledTasks.map(task => (
                  <div
                    key={task.id}
                    className={`timeline-unscheduled-item ${draggedTimelineTask?.id === task.id ? 'dragging' : ''}`}
                    draggable
                    onDragStart={() => setDraggedTimelineTask(task)}
                    onDragEnd={() => setDraggedTimelineTask(null)}
                  >
                    {task.title}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                💡 {t('dragToSchedule')}
              </div>
            </div>
          )}
        </div>
      </>
    );
  };


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 14: SETTINGS_SCREEN - מסך הגדרות משופר                              ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

  // פונקציות עזר להגדרות
  const updateUserSettings = (path, value) => {
    setUserSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current = newSettings;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const addStudyItem = () => {
    if (!newStudyItem.title.trim()) return;
    const newItem = {
      id: Date.now().toString(),
      ...newStudyItem
    };
    setUserSettings(prev => ({
      ...prev,
      routineConfig: {
        ...prev.routineConfig,
        studyItems: [...prev.routineConfig.studyItems, newItem]
      }
    }));
    setNewStudyItem({ title: '', icon: '📖', hasCounter: false, maxCount: 1 });
    showNotificationMessage(t('studyAdded'), 'success');
  };

  const removeStudyItem = (id) => {
    setUserSettings(prev => ({
      ...prev,
      routineConfig: {
        ...prev.routineConfig,
        studyItems: prev.routineConfig.studyItems.filter(item => item.id !== id)
      }
    }));
  };

  const updateStudyItem = (id, updates) => {
    setUserSettings(prev => ({
      ...prev,
      routineConfig: {
        ...prev.routineConfig,
        studyItems: prev.routineConfig.studyItems.map(item => 
          item.id === id ? { ...item, ...updates } : item
        )
      }
    }));
  };

  const renderSettingsScreen = () => (
    <>
      {renderHeader(true, t('settingsTitle'))}
      <div className="settings-container">
        {/* פרטי משתמש */}
        {user && (
          <div className="user-info">
            {user.photoURL && <img src={user.photoURL} alt="" className="user-avatar" />}
            <div className="user-details">
              <div className="user-name">{user.displayName}</div>
              <div className="user-email">{user.email}</div>
            </div>
            <button className="signout-btn" onClick={handleSignOut}>{t('logout')}</button>
          </div>
        )}
        
        {/* ===== שפה ===== */}
        <div className="settings-section">
          <div className="settings-section-header">
            <span className="settings-section-icon">🌐</span>
            {t('language')}
          </div>
          <div className="settings-section-content">
            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-title">{t('language')}</div>
                <div className="settings-row-desc">
                  {getCurrentLanguage() === 'he' ? 'Hebrew (עברית)' : 'English'}
                </div>
              </div>
              <select 
                className="settings-select"
                value={userSettings.language || 'auto'}
                onChange={(e) => updateUserSettings('language', e.target.value === 'auto' ? null : e.target.value)}
              >
                <option value="auto">🌍 Auto</option>
                <option value="he">🇮🇱 {t('hebrew')}</option>
                <option value="en">🇺🇸 {t('english')}</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* ===== מודולים פעילים ===== */}
        <div className="settings-section">
          <div className="settings-section-header">
            <span className="settings-section-icon">📱</span>
            {t('modules')}
          </div>
          <div className="settings-section-content">
            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-title">📋 {t('tasks')}</div>
                <div className="settings-row-desc">{t('tasksDesc')}</div>
              </div>
              <div 
                className={`settings-toggle ${userSettings.activeModules.tasks ? 'active' : ''}`}
                onClick={() => updateUserSettings('activeModules.tasks', !userSettings.activeModules.tasks)}
              />
            </div>
            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-title">⏰ {t('routine')}</div>
                <div className="settings-row-desc">{t('routineDesc')}</div>
              </div>
              <div 
                className={`settings-toggle ${userSettings.activeModules.routine ? 'active' : ''}`}
                onClick={() => updateUserSettings('activeModules.routine', !userSettings.activeModules.routine)}
              />
            </div>
            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-title">💝 {t('donations')}</div>
                <div className="settings-row-desc">{t('donationsDesc')}</div>
              </div>
              <div 
                className={`settings-toggle ${userSettings.activeModules.donations ? 'active' : ''}`}
                onClick={() => updateUserSettings('activeModules.donations', !userSettings.activeModules.donations)}
              />
            </div>
            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-title">📊 {t('history')}</div>
                <div className="settings-row-desc">{t('historyDesc')}</div>
              </div>
              <div 
                className={`settings-toggle ${userSettings.activeModules.history ? 'active' : ''}`}
                onClick={() => updateUserSettings('activeModules.history', !userSettings.activeModules.history)}
              />
            </div>
            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-title">📚 {t('lists')}</div>
                <div className="settings-row-desc">{t('listsDesc')}</div>
              </div>
              <div 
                className={`settings-toggle ${userSettings.activeModules.lists ? 'active' : ''}`}
                onClick={() => updateUserSettings('activeModules.lists', !userSettings.activeModules.lists)}
              />
            </div>
          </div>
        </div>

        {/* ===== הגדרות רוטינה ===== */}
        <div className="settings-section">
          <div className="settings-section-header">
            <span className="settings-section-icon">⏰</span>
            {t('routineSettings')}
          </div>
          <div className="settings-section-content">
            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-title">{t('includeStudies')}</div>
                <div className="settings-row-desc">{t('showStudiesPhase')}</div>
              </div>
              <div 
                className={`settings-toggle ${userSettings.routineConfig.includeStudies ? 'active' : ''}`}
                onClick={() => updateUserSettings('routineConfig.includeStudies', !userSettings.routineConfig.includeStudies)}
              />
            </div>
            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-title">{t('enableQuickTasks')}</div>
                <div className="settings-row-desc">{t('showQuickTasksPhase')}</div>
              </div>
              <div 
                className={`settings-toggle ${userSettings.routineConfig.enableQuickTasks ? 'active' : ''}`}
                onClick={() => updateUserSettings('routineConfig.enableQuickTasks', !userSettings.routineConfig.enableQuickTasks)}
              />
            </div>
          </div>
        </div>

        {/* ===== זמני טיימר ===== */}
        <div className="settings-section">
          <div className="settings-section-header">
            <span className="settings-section-icon">⏱️</span>
            {t('timerSettings')}
          </div>
          <div className="settings-section-content">
            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-title">{t('studies')}</div>
              </div>
              <input 
                type="number" 
                className="settings-number-input"
                value={userSettings.routineConfig.timers.studies}
                onChange={(e) => updateUserSettings('routineConfig.timers.studies', parseInt(e.target.value) || 2)}
                min="1"
                max="30"
              />
            </div>
            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-title">{t('quickTasks')}</div>
              </div>
              <input 
                type="number" 
                className="settings-number-input"
                value={userSettings.routineConfig.timers.quickTasks}
                onChange={(e) => updateUserSettings('routineConfig.timers.quickTasks', parseInt(e.target.value) || 15)}
                min="5"
                max="60"
              />
            </div>
            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-title">{t('dailyTasks')}</div>
              </div>
              <input 
                type="number" 
                className="settings-number-input"
                value={userSettings.routineConfig.timers.dailyTasks}
                onChange={(e) => updateUserSettings('routineConfig.timers.dailyTasks', parseInt(e.target.value) || 30)}
                min="10"
                max="120"
              />
            </div>
          </div>
        </div>

        {/* ===== ניהול שיעורים ===== */}
        <div className="settings-section">
          <div className="settings-section-header">
            <span className="settings-section-icon">📚</span>
            {t('manageStudies')}
          </div>
          <div className="settings-section-content">
            <div className="study-items-list">
              {userSettings.routineConfig.studyItems.map(item => (
                <div key={item.id} className="study-item-row">
                  <span className="study-item-icon">{item.icon}</span>
                  <input 
                    type="text" 
                    className="study-item-title-input"
                    value={item.title}
                    onChange={(e) => updateStudyItem(item.id, { title: e.target.value })}
                  />
                  <div className="study-item-counter">
                    <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input 
                        type="checkbox" 
                        checked={item.hasCounter}
                        onChange={(e) => updateStudyItem(item.id, { hasCounter: e.target.checked })}
                      />
                      {t('counter')}
                    </label>
                    {item.hasCounter && (
                      <input 
                        type="number"
                        style={{ width: 50, padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)' }}
                        value={item.maxCount || 1}
                        onChange={(e) => updateStudyItem(item.id, { maxCount: parseInt(e.target.value) || 1 })}
                        min="1"
                        max="10"
                      />
                    )}
                  </div>
                  <button 
                    className="study-item-delete"
                    onClick={() => removeStudyItem(item.id)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
            
            {/* הוספת שיעור חדש */}
            <div className="study-item-row" style={{ marginTop: 12, background: 'var(--bg-primary)' }}>
              <select 
                value={newStudyItem.icon}
                onChange={(e) => setNewStudyItem({ ...newStudyItem, icon: e.target.value })}
                style={{ padding: '8px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 20 }}
              >
                <option value="📖">📖</option>
                <option value="📚">📚</option>
                <option value="📕">📕</option>
                <option value="📗">📗</option>
                <option value="📘">📘</option>
                <option value="📙">📙</option>
                <option value="📅">📅</option>
                <option value="🕯️">🕯️</option>
                <option value="✡️">✡️</option>
              </select>
              <input 
                type="text" 
                className="study-item-title-input"
                placeholder={t('studyName')}
                value={newStudyItem.title}
                onChange={(e) => setNewStudyItem({ ...newStudyItem, title: e.target.value })}
              />
              <button 
                className="btn btn-primary"
                style={{ padding: '8px 16px' }}
                onClick={addStudyItem}
                disabled={!newStudyItem.title.trim()}
              >
                {t('addStudy')}
              </button>
            </div>
          </div>
        </div>

        {/* ===== הגדרות כלליות ===== */}
        <div className="settings-section">
          <div className="settings-section-header">
            <span className="settings-section-icon">⚙️</span>
            {t('generalSettings')}
          </div>
          <div className="settings-section-content">
            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-title">{t('endOfDay')}</div>
                <div className="settings-row-desc">{isRTL() ? 'תזכורת תישלח 20 דקות לפני' : 'Reminder sent 20 minutes before'}</div>
              </div>
              <input 
                type="time" 
                className="settings-number-input" 
                style={{ width: 100 }}
                value={userSettings.general.endOfDayTime} 
                onChange={(e) => updateUserSettings('general.endOfDayTime', e.target.value)} 
              />
            </div>
            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-title">{t('unfinishedPolicy')}</div>
                <div className="settings-row-desc">{isRTL() ? 'מה לעשות עם משימות שלא הושלמו?' : 'What to do with uncompleted tasks?'}</div>
              </div>
              <select 
                className="settings-select"
                value={userSettings.general.unfinishedTasksPolicy}
                onChange={(e) => updateUserSettings('general.unfinishedTasksPolicy', e.target.value)}
              >
                <option value="rollover">{t('rollover')}</option>
                <option value="backlog">{t('backlog')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* ===== מערכת תגמולים ===== */}
        <div className="settings-section">
          <div className="settings-section-header">
            <span className="settings-section-icon">🏆</span>
            {t('rewardsSystem')}
          </div>
          <div className="settings-section-content">
            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-title">{t('enableRewards')}</div>
                <div className="settings-row-desc">{t('enableRewardsDesc')}</div>
              </div>
              <div 
                className={`settings-toggle ${userSettings.rewards?.enabled ? 'active' : ''}`}
                onClick={() => updateUserSettings('rewards.enabled', !userSettings.rewards?.enabled)}
              />
            </div>
            
            {userSettings.rewards?.enabled && (
              <>
                <div className="settings-row">
                  <div className="settings-row-info">
                    <div className="settings-row-title">{t('currency')}</div>
                  </div>
                  <select 
                    className="settings-select"
                    value={userSettings.rewards?.currency || '₪'}
                    onChange={(e) => updateUserSettings('rewards.currency', e.target.value)}
                  >
                    <option value="₪">₪ {isRTL() ? 'שקל' : 'Shekel'}</option>
                    <option value="$">$ {isRTL() ? 'דולר' : 'Dollar'}</option>
                    <option value="€">€ {isRTL() ? 'יורו' : 'Euro'}</option>
                    <option value="£">£ {isRTL() ? 'פאונד' : 'Pound'}</option>
                  </select>
                </div>
                
                <div className="settings-row">
                  <div className="settings-row-info">
                    <div className="settings-row-title">{t('rewardPerTask')}</div>
                    <div className="settings-row-desc">{isRTL() ? 'סכום בסיס לכל משימה שהושלמה' : 'Base amount for each completed task'}</div>
                  </div>
                  <input 
                    type="number" 
                    className="settings-number-input"
                    value={userSettings.rewards?.ratePerTask || 5}
                    onChange={(e) => updateUserSettings('rewards.ratePerTask', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.5"
                  />
                </div>
                
                <div className="settings-row">
                  <div className="settings-row-info">
                    <div className="settings-row-title">{t('speedBonus')}</div>
                    <div className="settings-row-desc">{t('speedBonusDesc')}</div>
                  </div>
                  <input 
                    type="number" 
                    className="settings-number-input"
                    value={userSettings.rewards?.ratePerMinuteSaved || 0.5}
                    onChange={(e) => updateUserSettings('rewards.ratePerMinuteSaved', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.1"
                  />
                </div>
                
                {/* יתרה נוכחית */}
                <div className="rewards-settings-card" style={{ marginTop: 16 }}>
                  <div className="rewards-settings-title">💰 {t('currentBalance')}</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#f59e0b', textAlign: 'center' }}>
                    {userSettings.rewards?.currency || '₪'}{(userSettings.rewards?.currentBalance || 0).toFixed(2)}
                  </div>
                  
                  {/* הגדרת יעד */}
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>🎯 {t('target')}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input 
                        type="text" 
                        className="form-input"
                        placeholder={t('targetPlaceholder')}
                        value={userSettings.rewards?.targetName || ''}
                        onChange={(e) => updateUserSettings('rewards.targetName', e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <input 
                        type="number" 
                        className="settings-number-input"
                        placeholder="סכום"
                        value={userSettings.rewards?.targetAmount || ''}
                        onChange={(e) => updateUserSettings('rewards.targetAmount', parseFloat(e.target.value) || 0)}
                        min="0"
                        style={{ width: 80 }}
                      />
                    </div>
                    
                    {/* פס התקדמות */}
                    {(userSettings.rewards?.targetAmount || 0) > 0 && (
                      <div className="reward-progress" style={{ marginTop: 12 }}>
                        <div className="reward-progress-bar">
                          <div 
                            className="reward-progress-fill" 
                            style={{ width: `${Math.min(((userSettings.rewards?.currentBalance || 0) / (userSettings.rewards?.targetAmount || 1)) * 100, 100)}%` }}
                          />
                        </div>
                        <div className="reward-progress-label">
                          {(userSettings.rewards?.currentBalance || 0).toFixed(2)} / {userSettings.rewards?.targetAmount || 0} {userSettings.rewards?.currency || '₪'}
                          {userSettings.rewards?.targetName && ` ל${userSettings.rewards.targetName}`}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* איפוס יתרה */}
                  <button 
                    className="btn"
                    style={{ marginTop: 16, background: 'var(--bg-secondary)', color: 'var(--text-muted)', width: '100%' }}
                    onClick={() => {
                      if (window.confirm(isRTL() ? 'האם לאפס את היתרה?' : 'Reset balance?')) {
                        updateUserSettings('rewards.currentBalance', 0);
                        showNotificationMessage(isRTL() ? 'היתרה אופסה' : 'Balance reset', 'info');
                      }
                    }}
                  >
                    {t('resetBalance')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* ===== חיבורי Google ===== */}
        <div className="settings-section">
          <div className="settings-section-header">
            <span className="settings-section-icon">🔗</span>
            {isRTL() ? 'חיבורי Google' : 'Google Connections'}
          </div>
          <div className="settings-section-content">
            <div className="permission-card" style={{ margin: '8px 0', ...(googlePermissions.gmail && { borderColor: 'var(--success)', background: 'rgba(34, 197, 94, 0.1)' }) }}>
              <div className="permission-icon">📧</div>
              <div className="permission-info">
                <div className="permission-name">Gmail</div>
                <div className="permission-desc">{isRTL() ? 'חיפוש אימיילים למשימות' : 'Search emails for tasks'}</div>
              </div>
              {googlePermissions.gmail ? (
                <button className="permission-btn disconnect" onClick={() => handleRevokePermission('gmail')}>{isRTL() ? 'נתק' : 'Disconnect'}</button>
              ) : (
                <button className="permission-btn connect" onClick={() => handleRequestPermission('gmail')}>{isRTL() ? 'חבר' : 'Connect'}</button>
              )}
            </div>
            
            <div className="permission-card" style={{ margin: '8px 0', ...(googlePermissions.drive && { borderColor: 'var(--success)', background: 'rgba(34, 197, 94, 0.1)' }) }}>
              <div className="permission-icon">📁</div>
              <div className="permission-info">
                <div className="permission-name">Drive</div>
                <div className="permission-desc">{isRTL() ? 'חיפוש מסמכים' : 'Search documents'}</div>
              </div>
              {googlePermissions.drive ? (
                <button className="permission-btn disconnect" onClick={() => handleRevokePermission('drive')}>{isRTL() ? 'נתק' : 'Disconnect'}</button>
              ) : (
                <button className="permission-btn connect" onClick={() => handleRequestPermission('drive')}>{isRTL() ? 'חבר' : 'Connect'}</button>
              )}
            </div>
          </div>
        </div>

        {/* ===== מיקום ואיפוס ===== */}
        <div className="settings-section">
          <div className="settings-section-header">
            <span className="settings-section-icon">📍</span>
            מיקום ונתונים
          </div>
          <div className="settings-section-content">
            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-title">מיקום זוהה</div>
                <div className="settings-row-desc">{userLocation.city ? `${userLocation.city}, ${userLocation.country}` : userLocation.country} ({userLocation.currencySymbol})</div>
              </div>
            </div>
            <div className="settings-row">
              <div className="settings-row-info">
                <div className="settings-row-title" style={{ color: 'var(--danger)' }}>{isRTL() ? 'איפוס נתונים' : 'Reset Data'}</div>
                <div className="settings-row-desc">{isRTL() ? 'מחיקת כל המשימות והנתונים' : 'Delete all tasks and data'}</div>
              </div>
              <button 
                className="btn" 
                style={{ background: 'var(--danger)', color: 'white', padding: '8px 16px' }}
                onClick={() => { 
                  if (window.confirm(t('deleteDataConfirm'))) { 
                    setTasks([]); 
                    setDonations([]); 
                    showNotificationMessage(t('dataDeleted'), 'info'); 
                  } 
                }}
              >
                {isRTL() ? 'אפס' : 'Reset'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // ===== ONBOARDING COMPONENT =====
  const renderOnboarding = () => {
    const modules = [
      { key: 'tasks', icon: '📋', name: t('tasks'), desc: t('tasksDesc') },
      { key: 'routine', icon: '⏰', name: t('routine'), desc: t('routineDesc') },
      { key: 'donations', icon: '💝', name: t('donationsTitle'), desc: t('donationsDesc') },
      { key: 'history', icon: '📊', name: t('history'), desc: t('historyDesc') }
    ];

    const handleStartApp = () => {
      setUserSettings(prev => ({
        ...prev,
        isOnboarded: true,
        activeModules: onboardingModules
      }));
      setShowOnboarding(false);
      showNotificationMessage(t('welcome') + '! 🎉', 'success');
    };

    return (
      <div className="onboarding-overlay">
        <div className="onboarding-card">
          <div className="onboarding-icon">👋</div>
          <div className="onboarding-title">{t('onboardingTitle')}</div>
          <div className="onboarding-subtitle">
            {t('onboardingSubtitle')}
          </div>
          
          <div className="onboarding-modules">
            {modules.map(mod => (
              <div 
                key={mod.key}
                className={`onboarding-module ${onboardingModules[mod.key] ? 'selected' : ''}`}
                onClick={() => setOnboardingModules(prev => ({ ...prev, [mod.key]: !prev[mod.key] }))}
              >
                <div className="onboarding-module-icon">{mod.icon}</div>
                <div className="onboarding-module-info">
                  <div className="onboarding-module-name">{mod.name}</div>
                  <div className="onboarding-module-desc">{mod.desc}</div>
                </div>
                <div className="onboarding-module-check">
                  {onboardingModules[mod.key] && '✓'}
                </div>
              </div>
            ))}
          </div>
          
          <div className="onboarding-note">
            💡 אל דאגה, תוכל לשנות את ההגדרות בכל עת דרך מסך ההגדרות
          </div>
          
          <button className="onboarding-start-btn" onClick={handleStartApp}>
            התחל! 🚀
          </button>
        </div>
      </div>
    );
  };


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 15: MODALS - חלונות עריכה והשלמה                                    ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

  const renderEditTaskModal = () => {
    if (!editingTask) return null;
    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-title">{t('editTask')}</div>
            <button className="modal-close" onClick={closeModal}>✕</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">{t('title')}</label>
              <input 
                type="text" 
                className="form-input" 
                value={editingTask.title || ''} 
                onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })} 
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    saveTask();
                  }
                }}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">{t('description')}</label>
              <textarea className="form-input form-textarea" value={editingTask.description || ''} onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })} placeholder={isRTL() ? 'תיאור המשימה...' : 'Task description...'} />
            </div>
            
            {/* קישור מ-AI */}
            {editingTask.link && (
              <div className="form-group">
                <label className="form-label">🔗 {t('link')}</label>
                <a 
                  href={editingTask.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="task-link-btn"
                  onClick={(e) => e.stopPropagation()}
                >
                  {editingTask.linkText || (isRTL() ? 'פתח קישור' : 'Open link')} →
                </a>
              </div>
            )}
            
            {/* שדה הערות לפעם הבאה - למשימות retrospective */}
            {editingTask.isRetrospective && (
              <div className="form-group" style={{ background: 'var(--primary-light)', padding: 16, borderRadius: 8, marginBottom: 16 }}>
                <label className="form-label">📝 {isRTL() ? 'הערות לפעם הבאה' : 'Notes for next time'}</label>
                <textarea 
                  className="form-input form-textarea" 
                  value={editingTask.retrospectiveNotes || ''} 
                  onChange={(e) => setEditingTask({ ...editingTask, retrospectiveNotes: e.target.value })} 
                  placeholder={isRTL() ? 'מה למדת? מה כדאי לזכור? מה היית עושה אחרת?' : 'What did you learn? What to remember? What would you do differently?'}
                  style={{ minHeight: 100 }}
                />
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                  💡 {isRTL() ? 'ההערות האלה יוצגו אוטומטית בפעם הבאה שתיצור משימה דומה' : 'These notes will appear automatically next time you create a similar task'}
                </div>
              </div>
            )}
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('date')}</label>
                <input type="date" className="form-input" value={editingTask.date || ''} onChange={(e) => setEditingTask({ ...editingTask, date: e.target.value || null })} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('project')}</label>
                <input type="text" className="form-input" value={editingTask.project || ''} onChange={(e) => setEditingTask({ ...editingTask, project: e.target.value || null })} placeholder={t('projectName')} />
              </div>
            </div>
            
            {/* Timeline fields */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">🕐 {t('scheduledTime')}</label>
                <input 
                  type="time" 
                  className="form-input" 
                  value={editingTask.scheduledTime || ''} 
                  onChange={(e) => setEditingTask({ ...editingTask, scheduledTime: e.target.value || null })} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">⏱️ {t('duration')}</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={editingTask.estimatedMinutes || ''} 
                  onChange={(e) => setEditingTask({ ...editingTask, estimatedMinutes: parseInt(e.target.value) || null })} 
                  placeholder="60"
                  min="5"
                  max="480"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">{t('taskType')}</label>
              <select className="form-input" value={editingTask.tab || 0} onChange={(e) => setEditingTask({ ...editingTask, tab: parseInt(e.target.value) })}>
                <option value={0}>{t('quickTask')}</option>
                <option value={1}>{t('dailyTask')}</option>
              </select>
            </div>
            
            {/* תזכורת */}
            <div className="form-section">
              <label className="form-label">🔔 {t('reminder')}</label>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <input 
                    type="time" 
                    className="form-input" 
                    value={editingTask.reminderTime || ''} 
                    onChange={(e) => setEditingTask({ ...editingTask, reminderTime: e.target.value || null })} 
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <select 
                    className="form-input" 
                    value={editingTask.reminderBefore || '0'} 
                    onChange={(e) => setEditingTask({ ...editingTask, reminderBefore: e.target.value })}
                  >
                    <option value="0">{t('atTaskTime')}</option>
                    <option value="5">{isRTL() ? '5 דקות לפני' : '5 min before'}</option>
                    <option value="10">{isRTL() ? '10 דקות לפני' : '10 min before'}</option>
                    <option value="15">{isRTL() ? '15 דקות לפני' : '15 min before'}</option>
                    <option value="30">{isRTL() ? '30 דקות לפני' : '30 min before'}</option>
                    <option value="60">{t('hourBefore')}</option>
                    <option value="1440">{isRTL() ? 'יום לפני' : '1 day before'}</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* חזרה */}
            <div className="form-section">
              <label className="form-label">🔄 {t('recurrence')}</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select 
                  className="form-input" 
                  style={{ flex: 1 }}
                  value={editingTask.recurrence || 'none'} 
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      // פתח חלון מותאם אישית
                      setShowRecurrenceModal(true);
                    } else {
                      setEditingTask({ ...editingTask, recurrence: e.target.value, customRecurrence: null });
                    }
                  }}
                >
                  <option value="none">{t('noRecurrence')}</option>
                  <option value="daily">{t('daily')}</option>
                  <option value="weekly">{t('weekly')}</option>
                  <option value="biweekly">{t('biweekly')}</option>
                  <option value="monthly">{t('monthly')}</option>
                  <option value="yearly">{t('yearly')}</option>
                  <option value="custom">{t('custom')}...</option>
                </select>
              </div>
              
              {/* תצוגת הגדרות מותאמות */}
              {editingTask.recurrence === 'custom' && editingTask.customRecurrence && (
                <div 
                  style={{ 
                    marginTop: 12, 
                    padding: 12, 
                    background: 'var(--primary-light)', 
                    borderRadius: 8,
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowRecurrenceModal(true)}
                >
                  {getRecurrenceDescription(editingTask.customRecurrence)}
                  <span style={{ marginRight: 8, color: 'var(--primary)' }}>✏️ {isRTL() ? 'ערוך' : 'Edit'}</span>
                </div>
              )}
            </div>
            
            {/* כפתור פירוק עם Gemini - רק במשימות יומיות ולא בתתי-משימות */}
            {editingTask.status !== 'done' && editingTask.tab === 1 && !editingTask.parentTaskId && (
              <button 
                className={`gemini-btn ${isBreakingDown ? 'loading' : ''}`}
                onClick={() => startAIBreakdown(editingTask)}
                disabled={isBreakingDown}
              >
                {isBreakingDown ? (isRTL() ? '⏳ מפרק משימה...' : '⏳ Breaking down...') : (isRTL() ? '🤖 פרק לתתי-משימות עם AI' : '🤖 Break into subtasks with AI')}
              </button>
            )}
            
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button className="next-btn" style={{ flex: 1 }} onClick={() => updateTask(editingTask)}>{t('save')}</button>
              <button className="timer-btn" style={{ background: 'var(--danger)' }} onClick={() => deleteTask(editingTask.id)}>🗑️</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // AI Breakdown Modal
  const renderAIBreakdownModal = () => {
    if (!aiTaskContext) return null;
    
    return (
      <div className="modal-overlay" onClick={closeAIModal}>
        <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
          <div className="modal-header">
            <div className="modal-title">🤖 פירוק משימה עם AI</div>
            <button className="modal-close" onClick={closeAIModal}>✕</button>
          </div>
          <div className="ai-modal-body">
            <div style={{ marginBottom: 16, padding: 12, background: 'var(--primary-light)', borderRadius: 8 }}>
              <strong>{aiTaskContext.title}</strong>
            </div>
            
            {isBreakingDown && (
              <div className="ai-loading">
                <div className="ai-loading-spinner">🤖</div>
                <div style={{ marginTop: 12 }}>AI חושב...</div>
              </div>
            )}
            
            {/* שלב 1: שאלות */}
            {aiStep === 'questions' && !isBreakingDown && aiQuestions.length > 0 && (
              <>
                <p style={{ marginBottom: 16, color: 'var(--text-secondary)' }}>
                  כדי לעזור לך בצורה הכי טובה, יש לי כמה שאלות:
                </p>
                {aiQuestions.map(q => (
                  <div key={q.id} className="ai-question">
                    <div className="ai-question-text">{q.text}</div>
                    <input
                      type="text"
                      className="ai-answer-input"
                      placeholder="התשובה שלך..."
                      value={aiAnswers[q.id] || ''}
                      onChange={(e) => setAiAnswers({ ...aiAnswers, [q.id]: e.target.value })}
                    />
                  </div>
                ))}
                <button 
                  className="next-btn" 
                  style={{ marginTop: 16 }}
                  onClick={() => generateAISuggestions(aiTaskContext, aiAnswers)}
                >
                  המשך להצעות ←
                </button>
              </>
            )}
            
            {/* שלב 2: הצעות */}
            {aiStep === 'suggestions' && !isBreakingDown && aiSuggestions.length > 0 && (
              <>
                <p style={{ marginBottom: 16, color: 'var(--text-secondary)' }}>
                  בחר את תתי-המשימות שאתה רוצה להוסיף:
                </p>
                <div className="ai-suggestions-list">
                  {aiSuggestions.map(suggestion => (
                    <div 
                      key={suggestion.id}
                      className={`ai-suggestion-item ${selectedSuggestions.includes(suggestion.id) ? 'selected' : ''}`}
                      onClick={() => toggleSuggestionSelection(suggestion.id)}
                    >
                      <div className="ai-suggestion-checkbox">
                        {selectedSuggestions.includes(suggestion.id) && '✓'}
                      </div>
                      <div className="ai-suggestion-content">
                        <div className="ai-suggestion-title">{suggestion.title}</div>
                        {suggestion.description && (
                          <div className="ai-suggestion-desc">{suggestion.description}</div>
                        )}
                        {suggestion.link && (
                          <a 
                            href={suggestion.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ai-suggestion-link"
                            onClick={(e) => e.stopPropagation()}
                          >
                            🔗 {suggestion.linkText || t('link')}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* אימיילים וקבצים שנמצאו */}
                {isSearchingGoogle && (
                  <div className="searching-indicator">
                    <span>🔍</span> מחפש אימיילים וקבצים רלוונטיים...
                  </div>
                )}
                
                {foundEmails.length > 0 && (
                  <div className="found-items-section">
                    <div className="found-items-title">📧 אימיילים רלוונטיים שנמצאו</div>
                    {foundEmails.map(email => (
                      <div 
                        key={`email_${email.id}`}
                        className={`found-item ${selectedSuggestions.includes(`email_${email.id}`) ? 'selected' : ''}`}
                        onClick={() => toggleSuggestionSelection(`email_${email.id}`)}
                      >
                        <div className={`found-item-checkbox ${selectedSuggestions.includes(`email_${email.id}`) ? 'checked' : ''}`}>
                          {selectedSuggestions.includes(`email_${email.id}`) && '✓'}
                        </div>
                        <div className="found-item-info">
                          <div className="found-item-title">{email.subject}</div>
                          <div className="found-item-meta">מ: {email.from}</div>
                          <div className="found-item-snippet">{email.snippet}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {foundFiles.length > 0 && (
                  <div className="found-items-section">
                    <div className="found-items-title">📁 קבצים רלוונטיים מ-Drive</div>
                    {foundFiles.map(file => (
                      <div 
                        key={`file_${file.id}`}
                        className={`found-item ${selectedSuggestions.includes(`file_${file.id}`) ? 'selected' : ''}`}
                        onClick={() => toggleSuggestionSelection(`file_${file.id}`)}
                      >
                        <div className={`found-item-checkbox ${selectedSuggestions.includes(`file_${file.id}`) ? 'checked' : ''}`}>
                          {selectedSuggestions.includes(`file_${file.id}`) && '✓'}
                        </div>
                        <div className="found-item-info">
                          <div className="found-item-title">{file.name}</div>
                          <div className="found-item-meta">עודכן: {new Date(file.modifiedTime).toLocaleDateString('he-IL')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* הצעה להתחבר אם אין הרשאות */}
                {!googlePermissions.gmail && !googlePermissions.drive && (
                  <div style={{ marginTop: 16, padding: 12, background: 'var(--bg-secondary)', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                      💡 חבר את Gmail ו-Drive כדי למצוא אימיילים וקבצים רלוונטיים
                    </div>
                    <button 
                      className="timer-btn" 
                      style={{ fontSize: 12 }}
                      onClick={() => { closeAIModal(); setCurrentScreen('settings'); }}
                    >
                      הגדרות חיבורים
                    </button>
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                  <button 
                    className="next-btn" 
                    style={{ flex: 1 }}
                    onClick={addSelectedSubtasks}
                    disabled={selectedSuggestions.length === 0}
                  >
                    הוסף {selectedSuggestions.length} פריטים ✓
                  </button>
                  <button 
                    className="timer-btn"
                    onClick={() => {
                      const allIds = [
                        ...aiSuggestions.map(s => s.id),
                        ...foundEmails.map(e => `email_${e.id}`),
                        ...foundFiles.map(f => `file_${f.id}`)
                      ];
                      setSelectedSuggestions(allIds);
                    }}
                  >
                    בחר הכל
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCompletionModal = () => {
    if (!editingTask || !editingTask.id) return null;
    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-title">סיום משימה</div>
            <button className="modal-close" onClick={closeModal}>✕</button>
          </div>
          <div className="modal-body">
            <p style={{ marginBottom: 20, color: 'var(--text-secondary)' }}>מה הסטטוס של המשימה "<strong>{editingTask.title}</strong>"?</p>
            <div className="completion-options">
              <button className="completion-btn success" onClick={() => handleTaskComplete(editingTask, 'complete')}>
                <div className="completion-btn-icon">✓</div>
                <div><div style={{ fontWeight: 600 }}>הושלם בהצלחה</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>סמן את המשימה כמבוצעת</div></div>
              </button>
              <button className="completion-btn postpone" onClick={() => setShowPostpone(!showPostpone)}>
                <div className="completion-btn-icon">📅</div>
                <div><div style={{ fontWeight: 600 }}>המשך טיפול</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>העבר לתאריך אחר</div></div>
              </button>
              {showPostpone && (
                <div className="date-picker-container" style={{ padding: 16, background: 'var(--bg-primary)', borderRadius: 12, marginTop: -8 }}>
                  {/* כפתורים מהירים */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ flex: 1, padding: '10px 12px', fontSize: 13 }}
                      onClick={() => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        const tomorrowStr = getLocalDateString(tomorrow);
                        handleTaskComplete(editingTask, 'postpone', tomorrowStr);
                      }}
                    >
                      מחר
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      style={{ flex: 1, padding: '10px 12px', fontSize: 13 }}
                      onClick={() => {
                        const nextWeek = new Date();
                        nextWeek.setDate(nextWeek.getDate() + 7);
                        const nextWeekStr = getLocalDateString(nextWeek);
                        handleTaskComplete(editingTask, 'postpone', nextWeekStr);
                      }}
                    >
                      עוד שבוע
                    </button>
                  </div>
                  {/* בחירת תאריך ידנית */}
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>או בחר תאריך:</div>
                  <input type="date" className="form-input" value={postponeDate} onChange={(e) => setPostponeDate(e.target.value)} min={today} />
                  <button 
                    className="btn btn-primary" 
                    style={{ marginTop: 8, width: '100%' }} 
                    onClick={() => { 
                      if (postponeDate) {
                        console.log('📅 Postponing task to:', postponeDate);
                        handleTaskComplete(editingTask, 'postpone', postponeDate); 
                      }
                    }} 
                    disabled={!postponeDate}
                  >
                    העבר לתאריך זה
                  </button>
                </div>
              )}
              <button className="completion-btn cancel" onClick={() => handleTaskComplete(editingTask, 'sendToMain')}>
                <div className="completion-btn-icon">📌</div>
                <div><div style={{ fontWeight: 600 }}>שלח לראשי</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>הסר תאריך - יופיע במשימות פתוחות</div></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDayTasksModal = () => {
    if (!selectedDate) return null;
    const dayTasks = getTasksForDate(selectedDate);
    const hDate = gregorianToHebrew(selectedDate);
    const closeModalAndReset = () => { setShowModal(null); setSelectedDate(null); };
    
    return (
      <div className="modal-overlay" onClick={closeModalAndReset}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-title">
              📅 {selectedDate.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
              <div style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-secondary)', marginTop: 4 }}>
                {hDate.gematriaDay} {hDate.monthName} {hDate.gematriaYear}
              </div>
            </div>
            <button className="modal-close" onClick={closeModalAndReset}>✕</button>
          </div>
          <div className="modal-body">
            {dayTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <p>אין משימות ליום זה</p>
              </div>
            ) : (
              dayTasks.map(task => (
                <div 
                  key={task.isRecurringInstance ? `${task.id}-recurring` : task.id} 
                  className={`task-item ${task.status === 'done' ? 'done' : ''}`}
                  onClick={() => { 
                    if (!task.isRecurringInstance) {
                      setSelectedDate(null); 
                      setEditingTask({...task}); 
                      setShowModal('editTask'); 
                    }
                  }}
                >
                  <div 
                    className="task-checkbox" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (task.status !== 'done' && !task.isRecurringInstance) {
                        setSelectedDate(null);
                        setEditingTask({...task}); 
                        setShowModal('complete'); 
                      }
                    }}
                  >
                    {task.status === 'done' && '✓'}
                  </div>
                  <div className="task-content">
                    <div className="task-title">
                      {task.isRecurringInstance && <span style={{ marginLeft: 6 }}>🔄</span>}
                      {task.title}
                    </div>
                    <div className="task-meta">
                      {task.project && <span className={`task-project color-${getProjectColor(task.project)}`}>{task.project}</span>}
                      <span>{task.tab === 0 ? t('quickTask') : t('dailyTask')}</span>
                      {task.reminderTime && <span>🔔 {task.reminderTime}</span>}
                      {task.isRecurringInstance && <span style={{ color: 'var(--primary)' }}>חוזרת</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderRoutineScreen = () => (<><div className="header"><button className="back-btn" onClick={() => setCurrentScreen('home')}>✕</button><div className="header-hebrew-date">{t('dailyRoutine')}</div><div className="header-date">{gregorianDate}</div></div>{renderPhaseNav()}{renderTimer()}{currentPhase === 1 && renderPhase1()}{currentPhase === 2 && renderPhase2()}{currentPhase === 3 && renderPhase3()}{currentPhase === 4 && renderPhase4()}</>);

  const renderLoadingScreen = () => (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
      <div className="loading-text">{t('loading')}</div>
    </div>
  );

  const renderLoginScreen = () => (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-icon">📋</div>
        <h1 className="login-title">{t('loginTitle')}</h1>
        <p className="login-subtitle">{t('loginSubtitle')}</p>
        <button className="google-signin-btn" onClick={handleGoogleSignIn}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {t('loginWithGoogle')}
        </button>
      </div>
    </div>
  );


// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  SECTION 16: MAIN_RENDER - רנדור ראשי                                        ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

  // אם לא מחובר - הצג מסך התחברות
  if (!user) {
    return (
      <>
        <style>{styles}</style>
        <div className="app-container">
          {renderLoginScreen()}
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <style>{styles}</style>
        <div className="app-container">
          {renderLoadingScreen()}
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className={`app-container ${!isRTL() ? 'ltr' : ''}`}>
        {/* Sync indicator - click to force refresh */}
        <div 
          className={`sync-indicator ${isSyncing ? 'syncing' : ''} ${isOffline ? 'offline' : ''}`}
          onClick={!isOffline ? forceRefreshFromServer : undefined}
          title={isOffline ? (isRTL() ? 'אופליין' : 'Offline') : (isRTL() ? 'לחץ לרענון' : 'Click to refresh')}
          style={{ cursor: isOffline ? 'default' : 'pointer' }}
        >
          {isOffline ? '📴' : isSyncing ? '🔄' : '☁️'}
        </div>
        {currentScreen === 'home' && renderHomeScreen()}
        {currentScreen === 'routine' && renderRoutineScreen()}
        {currentScreen === 'tasks' && renderTasksScreen()}
        {currentScreen === 'openTasks' && renderOpenTasksScreen()}
        {currentScreen === 'projectTasks' && renderProjectTasksScreen()}
        {currentScreen === 'donations' && renderDonationsScreen()}
        {currentScreen === 'history' && renderHistoryScreen()}
        {currentScreen === 'lists' && renderListsScreen()}
        {currentScreen === 'timeline' && renderTimelineScreen()}
        {currentScreen === 'settings' && renderSettingsScreen()}
        {showModal === 'editTask' && renderEditTaskModal()}
        {showModal === 'complete' && renderCompletionModal()}
        {showModal === 'dayTasks' && renderDayTasksModal()}
        {showModal === 'aiBreakdown' && renderAIBreakdownModal()}
        
        {/* חלון אישור מחיקה */}
        {deleteConfirm && (
          <div className="confirm-modal-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
              <div className="confirm-modal-icon">🗑️</div>
              <div className="confirm-modal-title">{t('deleteTask')}</div>
              <div className="confirm-modal-message">
                {t('deleteTaskConfirm')}
                <br />
                <strong>"{deleteConfirm.task.title}"</strong>
                {tasks.filter(t => t.parentTaskId === deleteConfirm.task.id).length > 0 && (
                  <>
                    <br />
                    <span style={{ color: 'var(--danger)', fontSize: 13 }}>
                      ⚠️ {t('includingSubtasks', { count: tasks.filter(task => task.parentTaskId === deleteConfirm.task.id).length })}
                    </span>
                  </>
                )}
              </div>
              <div className="confirm-modal-buttons">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setDeleteConfirm(null)}
                >
                  {t('cancel')}
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => deleteTaskWithSubtasks(deleteConfirm.task.id)}
                >
                  🗑️ {t('delete')}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* חלון חזרה מותאמת אישית */}
        {showRecurrenceModal && (
          <div className="confirm-modal-overlay" onClick={() => setShowRecurrenceModal(false)}>
            <div className="recurrence-modal" onClick={(e) => e.stopPropagation()}>
              <div className="recurrence-modal-title">🔄 חזרה מותאמת אישית</div>
              
              {/* חזור כל X */}
              <div className="recurrence-row">
                <label>חזור כל</label>
                <input 
                  type="number" 
                  className="recurrence-number-input"
                  min="1"
                  value={recurrenceSettings.interval}
                  onChange={(e) => setRecurrenceSettings({
                    ...recurrenceSettings,
                    interval: parseInt(e.target.value) || 1
                  })}
                />
                <select 
                  className="recurrence-select"
                  value={recurrenceSettings.unit}
                  onChange={(e) => setRecurrenceSettings({
                    ...recurrenceSettings,
                    unit: e.target.value
                  })}
                >
                  <option value="day">יום</option>
                  <option value="week">שבוע</option>
                  <option value="month">חודש</option>
                  <option value="year">שנה</option>
                </select>
              </div>
              
              {/* ימים בשבוע - רק אם בחרו שבוע */}
              {recurrenceSettings.unit === 'week' && (
                <div className="recurrence-section">
                  <div className="recurrence-section-title">חזור בימים</div>
                  <div className="recurrence-days">
                    {['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'].map((day, index) => (
                      <div 
                        key={index}
                        className={`recurrence-day ${recurrenceSettings.weekDays.includes(index) ? 'selected' : ''}`}
                        onClick={() => {
                          const newDays = recurrenceSettings.weekDays.includes(index)
                            ? recurrenceSettings.weekDays.filter(d => d !== index)
                            : [...recurrenceSettings.weekDays, index];
                          setRecurrenceSettings({
                            ...recurrenceSettings,
                            weekDays: newDays.length > 0 ? newDays : [index] // לפחות יום אחד
                          });
                        }}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* סיום */}
              <div className="recurrence-section">
                <div className="recurrence-section-title">מסתיים</div>
                
                <div 
                  className="recurrence-end-option"
                  onClick={() => setRecurrenceSettings({ ...recurrenceSettings, endType: 'never' })}
                >
                  <div className={`recurrence-radio ${recurrenceSettings.endType === 'never' ? 'selected' : ''}`} />
                  <span className="recurrence-end-label">אף פעם</span>
                </div>
                
                <div 
                  className="recurrence-end-option"
                  onClick={() => setRecurrenceSettings({ ...recurrenceSettings, endType: 'date' })}
                >
                  <div className={`recurrence-radio ${recurrenceSettings.endType === 'date' ? 'selected' : ''}`} />
                  <span className="recurrence-end-label">בתאריך</span>
                  <input 
                    type="date"
                    className="recurrence-end-input"
                    value={recurrenceSettings.endDate}
                    disabled={recurrenceSettings.endType !== 'date'}
                    onChange={(e) => setRecurrenceSettings({ ...recurrenceSettings, endDate: e.target.value })}
                  />
                </div>
                
                <div 
                  className="recurrence-end-option"
                  onClick={() => setRecurrenceSettings({ ...recurrenceSettings, endType: 'count' })}
                >
                  <div className={`recurrence-radio ${recurrenceSettings.endType === 'count' ? 'selected' : ''}`} />
                  <span className="recurrence-end-label">אחרי</span>
                  <input 
                    type="number"
                    className="recurrence-end-input"
                    style={{ width: 80 }}
                    min="1"
                    value={recurrenceSettings.endCount}
                    disabled={recurrenceSettings.endType !== 'count'}
                    onChange={(e) => setRecurrenceSettings({ ...recurrenceSettings, endCount: parseInt(e.target.value) || 1 })}
                  />
                  <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>פעמים</span>
                </div>
              </div>
              
              {/* כפתורים */}
              <div className="recurrence-modal-buttons">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowRecurrenceModal(false)}
                >
                  ביטול
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    // שמור את ההגדרות במשימה
                    setEditingTask({
                      ...editingTask,
                      recurrence: 'custom',
                      customRecurrence: { ...recurrenceSettings }
                    });
                    setShowRecurrenceModal(false);
                  }}
                >
                  סיום
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Onboarding למשתמשים חדשים */}
        {showOnboarding && renderOnboarding()}
        
        {/* ===== REWARD POPUP ===== */}
        {showRewardPopup && (
          <>
            <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowRewardPopup(false)} />
            <div className="reward-popup">
              <div className="reward-popup-icon">🎉</div>
              <div className="reward-popup-title">מצוין!</div>
              <div className="reward-popup-amount">
                +{userSettings.rewards?.currency || '₪'}{lastRewardAmount.toFixed(2)}
              </div>
              {(userSettings.rewards?.targetAmount || 0) > 0 && userSettings.rewards?.targetName && (
                <div className="reward-progress" style={{ marginTop: 16, minWidth: 200 }}>
                  <div className="reward-progress-bar">
                    <div 
                      className="reward-progress-fill" 
                      style={{ width: `${Math.min(((userSettings.rewards?.currentBalance || 0) / (userSettings.rewards?.targetAmount || 1)) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="reward-progress-label">
                    {(userSettings.rewards?.currentBalance || 0).toFixed(2)} / {userSettings.rewards?.targetAmount || 0} ל{userSettings.rewards?.targetName || ''}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        
        {/* ===== AI ASSISTANT FAB ===== */}
        {currentScreen !== 'routine' && (
          <button 
            className={`ai-fab ${showAiAssistant ? 'active' : ''}`}
            onClick={() => setShowAiAssistant(!showAiAssistant)}
          >
            {showAiAssistant ? '✕' : '🤖'}
          </button>
        )}
        
        {/* ===== AI ASSISTANT MODAL ===== */}
        {showAiAssistant && (
          <div className="ai-assistant-modal">
            <div className="ai-assistant-header">
              <div className="ai-assistant-title">
                🤖 {t('aiAssistant')}
              </div>
              <button 
                className="ai-assistant-close"
                onClick={() => setShowAiAssistant(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="ai-assistant-body">
              {isAiProcessing ? (
                <div className="ai-processing">
                  <span className="loading-spinner"></span>
                  <span>{isRTL() ? 'חושב...' : 'Thinking...'}</span>
                </div>
              ) : aiResponse ? (
                <div className="ai-response">
                  <div className="ai-response-title">
                    {aiResponse.action === 'create_task' && `✨ ${t('newTask')}`}
                    {aiResponse.action === 'list_tasks' && `📋 ${t('tasks')}`}
                    {aiResponse.action === 'help' && `❓ ${isRTL() ? 'עזרה' : 'Help'}`}
                    {aiResponse.action === 'info' && `💡 ${isRTL() ? 'מידע' : 'Info'}`}
                    {aiResponse.action === 'error' && `⚠️ ${isRTL() ? 'שגיאה' : 'Error'}`}
                  </div>
                  <div className="ai-response-content">
                    {aiResponse.response}
                  </div>
                  
                  {aiResponse.action === 'create_task' && aiResponse.data?.title && (
                    <div className="ai-action-buttons">
                      <button 
                        className="ai-action-btn"
                        onClick={executeAiAction}
                      >
                        ✓ {t('createTask')}
                      </button>
                      <button 
                        className="ai-action-btn"
                        style={{ background: 'transparent', color: 'var(--text-muted)' }}
                        onClick={() => setAiResponse(null)}
                      >
                        {t('cancel')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 12 }}>
                    💬 {t('howCanIHelp')}
                  </div>
                  
                  {/* Voice transcript display */}
                  {voiceTranscript && (
                    <div className={`voice-transcript ${isTranscribing ? 'transcribing' : ''}`}>
                      {voiceTranscript}
                    </div>
                  )}
                  
                  <div className="ai-suggestions">
                    <div className="ai-suggestion-chip" onClick={() => setAiInput(isRTL() ? 'צור משימה חדשה' : 'Create a new task')}>
                      ✨ {t('createTask')}
                    </div>
                    <div className="ai-suggestion-chip" onClick={() => setAiInput(isRTL() ? 'מה המשימות שלי להיום?' : "What are my tasks for today?")}>
                      📋 {t('todayTasks')}
                    </div>
                    <div className="ai-suggestion-chip" onClick={() => setAiInput(isRTL() ? 'מה הכי דחוף?' : "What's most urgent?")}>
                      🔥 {t('mostUrgent')}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="ai-assistant-input-container">
              {/* Voice button */}
              <button 
                className={`voice-btn ${isRecording ? 'recording' : ''}`}
                onClick={() => {
                  if (isRecording) {
                    stopVoiceRecording();
                  } else {
                    startVoiceRecording();
                  }
                }}
                disabled={isTranscribing}
                title={isRecording ? (isRTL() ? 'עצור הקלטה' : 'Stop recording') : (isRTL() ? 'התחל הקלטה קולית' : 'Start voice recording')}
              >
                {isRecording ? '⏹️' : '🎤'}
              </button>
              
              <input
                type="text"
                className="ai-assistant-input"
                placeholder={t('writeMessage')}
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && aiInput.trim()) {
                    processAiCommand(aiInput);
                  }
                }}
              />
              <button 
                className="ai-assistant-send"
                onClick={() => {
                  if (aiInput.trim()) {
                    processAiCommand(aiInput);
                  }
                }}
                disabled={!aiInput.trim() || isAiProcessing}
              >
                ➤
              </button>
            </div>
          </div>
        )}
        
        {/* ===== TIMELINE TOGGLE FAB ===== */}
        {currentScreen !== 'routine' && currentScreen !== 'timeline' && (
          <button 
            className="timeline-toggle-btn"
            onClick={() => setCurrentScreen('timeline')}
            title="יומן Timeline"
          >
            📅
          </button>
        )}
        
        {notification && <div className={`notification ${notification.type}`}>{notification.message}</div>}
        <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1s" />
      </div>
    </>
  );
};

export default DailyRoutineManager;
