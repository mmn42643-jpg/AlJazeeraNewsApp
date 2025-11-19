// ===== ملف server.js الكامل =====

// استدعاء الحزم المطلوبة
import express from "express";
import path from "path";
import dotenv from "dotenv";

dotenv.config(); // تحميل المتغيرات من ملف .env

// إنشاء تطبيق Express
const app = express();

// إعداد المجلدات الثابتة للواجهة الأمامية
app.use(express.static("assets")); // ملفات JS و CSS
app.use(express.static("img"));    // الصور

// إرسال index.html عند زيارة الصفحة الرئيسية
app.get("/", (req, res) => {
  res.sendFile(path.resolve("index.html"));
});

// مثال لإرسال صفحات أخرى إذا أردت
// app.get("/politics", (req, res) => {
//   res.sendFile(path.resolve("politics.html"));
// });

// يمكنك إضافة أي route آخر حسب الحاجة

// تشغيل السيرفر على المنفذ الموجود في .env أو 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// ===== نهاية ملف server.js =====
