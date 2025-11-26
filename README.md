# סדר יום - Daily Routine Manager

אפליקציה לניהול סדר יום ורוטינה יומית

## התקנה מהירה

### שלב 1: התקנת Node.js
אם אין לך Node.js, הורד מ: https://nodejs.org (גרסת LTS)

### שלב 2: התקנת התלויות
פתח Terminal/CMD בתיקיית הפרויקט והרץ:
```bash
npm install
```

### שלב 3: הרצה מקומית
```bash
npm start
```
האפליקציה תיפתח ב: http://localhost:3000

## העלאה ל-Vercel (חינם)

### אפשרות א: דרך GitHub
1. צור חשבון ב-GitHub: https://github.com
2. צור repository חדש
3. העלה את הקבצים ל-repository
4. לך ל-https://vercel.com והתחבר עם GitHub
5. לחץ "New Project" ובחר את ה-repository
6. לחץ "Deploy"
7. תקבל לינק לאפליקציה!

### אפשרות ב: דרך Vercel CLI
```bash
npm install -g vercel
vercel login
vercel
```

## מבנה הפרויקט
```
daily-routine/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── App.js          # הקוד הראשי
│   └── index.js
├── package.json
└── README.md
```

## פיצ'רים
- ✅ ניהול משימות (מהירות + יומיות)
- ✅ רוטינה יומית ב-4 שלבים
- ✅ לוח שנה עברי/לועזי
- ✅ מעקב צדקה
- ✅ טיימר לכל שלב
- ✅ שמירה אוטומטית (LocalStorage)
- ✅ תמיכה מלאה בעברית (RTL)
