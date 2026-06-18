require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { AccessToken } = require('livekit-server-sdk');

const app = express();

// تفعيل الـ CORS لمنع أي حظر أمني بين موقعك والسيرفر
app.use(cors());

// قراءة المفاتيح من المتغيرات البيئية لـ Hugging Face للحفاظ على أمان مشروعك
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || "APIdQLyaAxhJBig";
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET; 

// رابط جلب التوكن المطور المربوط بنظام تسجيل الدخول لواجهتك
app.get('/api/token', async (req, res) => {
  try {
    // قراءة البيانات القادمة من كود الداشبورد الخاص بك (تم إصلاح علامات || هنا)
    const participantName = req.query.name || "مستخدم مجهول";
    const participantUid = req.query.uid || "uid_" + Math.floor(Math.random() * 1000);
    const roomName = "neo-voice-room"; 

    // صناعة كرت الدخول (Token) بالهوية الحقيقية للمستخدم
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: participantUid, 
      name: participantName     
    });

    // إعطاء صلاحيات المايك الكاملة وسماع الآخرين داخل الغرفة الصوتية
    at.addGrant({ 
      roomJoin: true, 
      room: roomName, 
      canPublish: true, 
      canSubscribe: true 
    });

    const tokenResult = await at.toJwt();
    res.json({ token: tokenResult });

  } catch (error) {
    console.error("خطأ في السيرفر الصوتي:", error);
    res.status(500).json({ error: "فشل توليد التوكن الصوتي" });
  }
});

// تعديل المنفذ ليتوافق مع منصة Hugging Face ليصبح 7860 بدلاً من 3000
const PORT = process.env.PORT || 7860;
app.listen(PORT, () => {
  console.log(`📡 سيرفر NEO العالمي والمحمي يعمل بنجاح على المنفذ: ${PORT}`);
});
