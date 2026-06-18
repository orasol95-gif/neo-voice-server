require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { AccessToken } = require('livekit-server-sdk');

const app = express();

app.use(cors());
app.use(express.json());

const LIVEKIT_API_KEY = "APIdQLyaAxhJBig";
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET; 

app.get('/api/token', (req, res) => {
    const { uid, name, role } = req.query;

    if (!uid || !name) {
        return res.status(400).json({ error: "بيانات العضو ناقصة (uid أو name مفقود)" });
    }

    try {
        if (!LIVEKIT_API_SECRET) {
            throw new Error("مفتاح LIVEKIT_API_SECRET غير موجود في إعدادات البيئة");
        }

        const tokenInstance = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
            identity: uid,
            name: name,
        });

        const userRole = role || 'speaker';

        if (userRole === 'speaker') {
            tokenInstance.addGrant({
                roomJoin: true,
                room: "neo_live_room",
                canPublish: true,   
                canSubscribe: true, 
            });
        } else {
            tokenInstance.addGrant({
                roomJoin: true,
                room: "neo_live_room",
                canPublish: false,  
                canSubscribe: true, 
            });
        }

        const generatedToken = tokenInstance.toJwt();
        res.json({ token: generatedToken });

    } catch (error) {
        console.error("خطأ في معالجة التوكن:", error);
        res.status(500).json({ error: "فشل السيرفر في معالجة التوكن: " + error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 السيرفر يعمل الآن بنجاح على منفذ رقم: ${PORT}`);
});
