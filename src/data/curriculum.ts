import data from './curriculum.json';
export const chapters = data;
export const lessons = chapters.flatMap(c=>c.lessons);
export const publishedLessons = lessons.filter(l=>l.status==='published');
export const publishedChapters = chapters.filter(c=>c.lessons.some(l=>l.status==='published'));
export const sectionNames = ['現象と疑問','予想と仮説','高校物理による説明','数式の導出','数値計算','大学レベルの発展的解析','キック技術への応用','理解度チェックと参考文献'];
export const sectionIds = ['phenomenon','hypothesis','physics','derivation','calculation','advanced','application','check'];
