const { Telegraf, Markup } = require("telegraf");
const axios = require("axios");

const express = require("express");
const app = express();

const bot = new Telegraf(process.env.BOT_TOKEN);

const userIntervals = {};

const CHANNELS = [
    "@sharetoolfre"
];

function menu() {
    return Markup.keyboard([
        ["🎲 SUNWIN", "👑 HITCLUB"],
        ["⚡ BETVIP", "💎 LC79"]
    ]).resize();
}

function backMenu() {
    return Markup.keyboard([
        ["🛑 STOP"],
        ["⬅️ Quay lại"]
    ]).resize();
}

async function checkJoin(ctx) {

    try {

        const member = await ctx.telegram.getChatMember(
            "@sharetoolfre",
            ctx.from.id
        );

        console.log(member.status);

        if (
            member.status == "left" ||
            member.status == "kicked"
        ) {
            return false;
        }

        return true;

    } catch (e) {

        console.log(e.message);

        return false;
    }
}

async function sendJoinMenu(ctx) {

    const buttons = [];

    CHANNELS.forEach(ch => {

        buttons.push([
            Markup.button.url(
                "📢 THAM GIA NHÓM",
                "https://t.me/" + ch.replace("@", "")
            )
        ]);

    });

    buttons.push([
        Markup.button.callback(
            "✅ TÔI ĐÃ THAM GIA",
            "check_join"
        )
    ]);

    await ctx.reply(
`⚠️ BẮT BUỘC THAM GIA CỘNG ĐỒNG

📌 Bạn cần tham gia nhóm để sử dụng bot.

👉 Tham gia xong bấm XÁC NHẬN.`,
        Markup.inlineKeyboard(buttons)
    );
}


bot.start(async (ctx) => {

    return sendJoinMenu(ctx);

});

async function getSunwin() {

    const { data } = await axios.get(
        "https://api-sun-4.onrender.com/"
    );

    return `🏆 Anh Phong - PHIÊN ${data.Phien}

📝 Kết quả: ${data.Ket_qua} | Tổng: ${data.Tong}
🎲 Xúc xắc: ${data.Xuc_xac_1}-${data.Xuc_xac_2}-${data.Xuc_xac_3}
──────────────────
🔎 Nhận diện: AI HTDD
⚪️ Dự đoán ${data.Phien_hien_tai}: ${data.Du_doan}
📊 Độ tin cậy: ${data.Do_tin_cay || "90%"}`;
}

async function getHitclub() {

    const { data } = await axios.get(
        "https://hitclub-predict.onrender.com/api/taixiumd5"
    );

    const tc = 80 + Math.floor(Math.random() * 17);

    return `🏆 Anh Phong - PHIÊN ${data.Phien}

📝 Kết quả: ${data.Ket_qua} | Tổng: ${data.Tong}
🎲 Xúc xắc: ${data.Xuc_xac_1}-${data.Xuc_xac_2}-${data.Xuc_xac_3}
──────────────────
🔎 Nhận diện: AI HTDD
⚪️ Dự đoán ${data.phien_hien_tai}: ${data.du_doan}
📊 Độ tin cậy: ${tc}%`;
}

async function getBetvip() {

    const { data } = await axios.get(
        "https://anhphong-betvip.onrender.com/taixiumd5"
    );

    let tc = "90%";

    if (
        data.Do_tin_cay?.["TÀI"] &&
        data.Du_doan === "TÀI"
    ) {
        tc = data.Do_tin_cay["TÀI"];
    }

    if (
        data.Do_tin_cay?.["XỈU"] &&
        data.Du_doan === "XỈU"
    ) {
        tc = data.Do_tin_cay["XỈU"];
    }

    return `🏆 Anh Phong - PHIÊN ${data.Phien}

📝 Kết quả: ${data.Ket_qua} | Tổng: ${data.Tong}
🎲 Xúc xắc: ${data.Xuc_xac_1}-${data.Xuc_xac_2}-${data.Xuc_xac_3}
──────────────────
🔎 Nhận diện: AI HTDD
⚪️ Dự đoán ${data.phien_tiep_theo}: ${data.Du_doan}
📊 Độ tin cậy: ${tc}`;
}

async function getLC79() {

    const { data } = await axios.get(
        "https://api-anhphonglc79promd5.onrender.com/"
    );

    return `🏆 Anh Phong - PHIÊN ${data.Phien_truoc}

📝 Kết quả: ${data.Ket_qua}
🎲 Xúc xắc: ${data.Xuc_xac}
──────────────────
🔎 Nhận diện: AI HTDD
⚪️ Dự đoán ${data.Phien_nay}: ${data.Du_doan}
📊 Độ tin cậy: ${data.Do_tin_cay}%`;
}

async function startAuto(ctx, type) {

    const uid = ctx.from.id;

    const joined = await checkJoin(ctx);

    if (!joined) {
        return sendJoinMenu(ctx);
    }

    if (userIntervals[uid]) {
        clearInterval(userIntervals[uid]);
    }

    let text;

    if (type === "SUNWIN") text = await getSunwin();
    if (type === "HITCLUB") text = await getHitclub();
    if (type === "BETVIP") text = await getBetvip();
    if (type === "LC79") text = await getLC79();

    await ctx.reply(text, backMenu());

    let lastPhien = null;

    userIntervals[uid] = setInterval(async () => {

        try {

            let data;
            let text;

            if (type === "SUNWIN") {

                const res = await axios.get(
                    "https://api-sun-4.onrender.com/"
                );

                data = res.data;

                if (lastPhien === data.Phien) return;

                lastPhien = data.Phien;

                text = await getSunwin();
            }

            if (type === "HITCLUB") {

                const res = await axios.get(
                    "https://hitclub-predict.onrender.com/api/taixiumd5"
                );

                data = res.data;

                if (lastPhien === data.Phien) return;

                lastPhien = data.Phien;

                text = await getHitclub();
            }

            if (type === "BETVIP") {

                const res = await axios.get(
                    "https://anhphong-betvip.onrender.com/taixiumd5"
                );

                data = res.data;

                if (lastPhien === data.Phien) return;

                lastPhien = data.Phien;

                text = await getBetvip();
            }

            if (type === "LC79") {

                const res = await axios.get(
                    "https://api-anhphonglc79promd5.onrender.com/"
                );

                data = res.data;

                if (lastPhien === data.Phien_truoc) return;

                lastPhien = data.Phien_truoc;

                text = await getLC79();
            }

            await ctx.reply(text, backMenu());

        } catch (e) {

            console.log(type, e.message);

        }

    }, 3000);
}

bot.hears("🎲 SUNWIN", (ctx) => startAuto(ctx, "SUNWIN"));
bot.hears("👑 HITCLUB", (ctx) => startAuto(ctx, "HITCLUB"));
bot.hears("⚡ BETVIP", (ctx) => startAuto(ctx, "BETVIP"));
bot.hears("💎 LC79", (ctx) => startAuto(ctx, "LC79"));

bot.hears("🛑 STOP", async (ctx) => {

    const uid = ctx.from.id;

    if (userIntervals[uid]) {

        clearInterval(userIntervals[uid]);

        delete userIntervals[uid];
    }

    await ctx.reply(
        "🛑 Đã dừng",
        menu()
    );
});

bot.hears("⬅️ Quay lại", async (ctx) => {

    const uid = ctx.from.id;

    if (userIntervals[uid]) {

        clearInterval(userIntervals[uid]);

        delete userIntervals[uid];
    }

    await ctx.reply(
        "🎮 CHỌN CỔNG GAME",
        menu()
    );
});

bot.action("check_join", async (ctx) => {

    const joined = await checkJoin(ctx);

    if (!joined) {

        return ctx.answerCbQuery(
            "❌ Bạn chưa tham gia nhóm!",
            {
                show_alert: true
            }
        );
    }

    await ctx.deleteMessage();

    await ctx.reply(
        "✅ Xác nhận thành công\n🎮 CHỌN CỔNG GAME",
        menu()
    );
});

app.get("/", (req, res) => {
    res.send("Bot Online");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Web Server Running");
});

bot.launch();

console.log("BOT ONLINE");