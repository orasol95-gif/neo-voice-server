/**
 * 🌌 NEO NEXUS CENTRAL CORE ENGINE - v1.2.0 (2026)
 * المرجعية البرمجية الموحدة والنهائية لربط الحسابات والعمليات اللحظية عبر [ Supabase Cloud ]
 */

// إعدادات الاتصال الحية والمباشرة بقاعدتك
const SUPABASE_URL = "https://zozjcsytcghmmwtzjfzx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpvempjc3l0Y2dobW13dHpqZnp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3Nzg0OTgsImV4cCI6MjA5NzM1NDQ5OH0.fAYsBsjVZTDiixE0SrjuEbKmH1db32S-lIL3h-rhPqY";

if (!window.supabase) {
    console.error("❌ مكتبة Supabase غير مستدعاة! تأكد من وجود وسم الـ script للمكتبة في الـ HTML.");
}
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- 🛠️ وحدة المساعدات العامة والأمن المركزي ---
window.NEO_CORE = {
    formatCurrency: function(amount) {
        return parseFloat(amount || 0).toLocaleString('ar-IQ') + " د.ع";
    },

    setupRouteGuard: function(onUserActive, onUserBannedOrLoggedOut) {
        window.supabaseClient.auth.onAuthStateChange(async (event, session) => {
            if (session && session.user) {
                const user = session.user;
                
                const { data: profile } = await window.supabaseClient
                    .from('users')
                    .select('*')
                    .eq('uid', user.id)
                    .single();

                if (profile) {
                    if (profile.account_status === 'BANNED') {
                        alert("⚠️ هذا الحساب محظور كلياً من قبل الإدارة العليا لمخالفة الشروط.");
                        await window.supabaseClient.auth.signOut();
                        if (onUserBannedOrLoggedOut) onUserBannedOrLoggedOut();
                    } else {
                        if (onUserActive) onUserActive(profile, user);
                    }
                } else {
                    let defaultProfile = {
                        uid: user.id,
                        full_name: user.user_metadata.full_name || "مستثمر جديد",
                        email: user.email,
                        phone: user.phone || "",
                        wallet_credits: 0,
                        account_status: "ACTIVE",
                        created_at: new Date().toISOString()
                    };
                    await window.supabaseClient.from('users').insert([defaultProfile]);
                    if (onUserActive) onUserActive(defaultProfile, user);
                }
            } else {
                if (onUserBannedOrLoggedOut) onUserBannedOrLoggedOut();
            }
        });
    }
};

// --- 📋 وحدة إدارة الغرفة الصوتية والمقاعد الـ 12 اللحظية ---
window.NEO_ROOM = {
    subscribeToSeats: function(callback) {
        window.supabaseClient.from('active_speakers').select('*').order('id', { ascending: true })
        .then(({ data }) => { if (data && callback) callback(this._mapSeats(data)); });

        window.supabaseClient
            .channel('public:active_speakers')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'active_speakers' }, async () => {
                const { data } = await window.supabaseClient.from('active_speakers').select('*').order('id', { ascending: true });
                if (data && callback) callback(this._mapSeats(data));
            })
            .subscribe();
    },

    _mapSeats: function(dbRows) {
        let fullSeats = [];
        for (let i = 1; i <= 12; i++) {
            let found = dbRows.find(r => r.id === i);
            fullSeats.push(found || { id: i, occupied: false, username: `مقعد ${i}`, uid: null, earnings: 0, is_throne: i <= 3 });
        }
        return fullSeats;
    },

    claimSeatOrBid: async function(seatId, userProfile, bidAmount = 0) {
        const { data, error } = await window.supabaseClient.rpc('handle_seat_claim_or_bid', {
            p_seat_id: parseInt(seatId),
            p_user_uid: userProfile.uid,
            p_username: userProfile.full_name,
            p_bid_amount: parseFloat(bidAmount)
        });
        if (error) { alert("❌ عذراً: " + error.message); return false; }
        return data;
    },

    leaveSeat: async function(seatId) {
        return await window.supabaseClient.from('active_speakers').delete().eq('id', seatId);
    }
};

// --- 💵 وحدة المعاملات المالية واستمارات التدقيق الإداري ---
window.NEO_FINANCE = {
    createDeposit: async function(uid, username, gateway, amount, receiptImgUrl) {
        return await window.supabaseClient.from('deposits').insert([
            { uid: uid, name: username, gateway: gateway, amount: parseFloat(amount), receipt_img: receiptImgUrl || "", status: "معلق" }
        ]);
    },

    createWithdrawal: async function(uid, username, gateway, walletAddress, amount) {
        const { data, error } = await window.supabaseClient.rpc('process_withdrawal_request', {
            p_user_uid: uid,
            p_username: username,
            p_gateway: gateway,
            p_address: walletAddress,
            p_amount: parseFloat(amount)
        });
        if (error) throw error;
        return data;
    }
};

// --- 🔔 وحدة الإشعارات، الشريط الماركي، ومحادثات الدعم الفني اللحظي ---
window.NEO_NOTIFY = {
    subscribeToMarquee: function(callback) {
        window.supabaseClient.from('marquee_config').select('text').eq('id', 1).single()
        .then(({ data }) => { if (data && callback) callback(data.text); });

        window.supabaseClient
            .channel('public:marquee_config')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'marquee_config' }, payload => {
                if (callback) callback(payload.new.text);
            })
            .subscribe();
    },

    subscribeToSupportChat: function(uid, callback) {
        window.supabaseClient.from('support_threads').select('*').eq('user_uid', uid).order('created_at', { ascending: true })
        .then(({ data }) => { if (data && callback) callback(data); });

        window.supabaseClient
            .channel(`public:support_threads:user:${uid}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_threads' }, async () => {
                const { data } = await window.supabaseClient.from('support_threads').select('*').eq('user_uid', uid).order('created_at', { ascending: true });
                if (data && callback) callback(data);
            })
            .subscribe();
    },

    sendMessageToSupport: async function(uid, messageText) {
        return await window.supabaseClient.from('support_threads').insert([
            { user_uid: uid, sender: "user", text: messageText }
        ]);
    }
};

// --- ⚙️ وحدة فحص قيود وضع الصيانة السحابي الفوري ---
window.NEO_SYSTEM = {
    monitorMaintenanceMode: function(onMaintenanceActive, onNormalMode) {
        window.supabaseClient.from('maintenance_config').select('*').eq('id', 1).single()
        .then(({ data }) => {
            if (data && data.active && onMaintenanceActive) onMaintenanceActive(data);
            if (data && !data.active && onNormalMode) onNormalMode();
        });

        window.supabaseClient
            .channel('public:maintenance_config')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'maintenance_config' }, payload => {
                if (payload.new.active && onMaintenanceActive) onMaintenanceActive(payload.new);
                if (!payload.new.active && onNormalMode) onNormalMode();
            })
            .subscribe();
    }
};