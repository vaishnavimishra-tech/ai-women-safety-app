// services/smsService.js
// Twilio SMS gateway (Week 1 + Week 3).
//  - Builds the SOS payload message (User, Coordinates, Link)
//  - Normalises phone numbers to E.164 (Twilio rejects "98765 43210")
//  - Sends to every contact in parallel, so one failure never blocks the rest
//  - Falls back to DEMO mode if Twilio credentials are missing or SMS_MODE=demo
const twilio = require("twilio");

const DEFAULT_COUNTRY_CODE = process.env.DEFAULT_COUNTRY_CODE || "+91";
const SEND_TIMEOUT_MS = Number(process.env.SMS_TIMEOUT_MS || 10000);

let client = null;
function getClient() {
    if (client) return client;
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) return null;
    client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    return client;
}

function isDemoMode() {
    return (
        process.env.SMS_MODE === "demo" ||
        !getClient() ||
        !process.env.TWILIO_PHONE_NUMBER
    );
}

// "+91 98765 43210" -> "+919876543210", "9876543210" -> "+919876543210"
function normalizePhone(raw) {
    if (!raw) return null;
    let p = String(raw).trim().replace(/[\s\-().]/g, "");
    if (p.startsWith("00")) p = "+" + p.slice(2);
    if (!p.startsWith("+")) {
        p = p.replace(/^0+/, "");
        p = DEFAULT_COUNTRY_CODE + p;
    }
    return /^\+[1-9]\d{7,14}$/.test(p) ? p : null;
}

// SOS payload -> message text
function buildSosMessage({ userName, latitude, longitude, mapsLink }) {
    return (
        `SOS ALERT! ${userName} needs help.\n` +
        `Location: ${Number(latitude).toFixed(5)}, ${Number(longitude).toFixed(5)}\n` +
        `Map: ${mapsLink}\n` +
        `Time: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`
    );
}

function withTimeout(promise, ms) {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error("SMS gateway timeout")), ms)
        )
    ]);
}

// Send one SMS. Never throws - always returns a delivery record.
async function sendOne(contact, body) {
    const base = { contactId: contact._id, name: contact.name, phone: contact.phone };
    const to = normalizePhone(contact.phone);

    if (!to) {
        return { ...base, status: "failed", error: "Invalid phone number format" };
    }
    if (isDemoMode()) {
        console.log(`[DEMO SMS] to ${to}:\n${body}`);
        return { ...base, phone: to, status: "demo" };
    }
    try {
        const msg = await withTimeout(
            getClient().messages.create({
                body,
                from: process.env.TWILIO_PHONE_NUMBER,
                to
            }),
            SEND_TIMEOUT_MS
        );
        return { ...base, phone: to, status: "sent", sid: msg.sid };
    } catch (err) {
        // 21608 = Twilio trial account: number not verified
        const hint =
            err.code === 21608
                ? "Twilio trial: verify this number in the Twilio console"
                : err.message;
        console.error(`SMS to ${to} failed:`, err.code || "", err.message);
        return { ...base, phone: to, status: "failed", error: hint };
    }
}

// Broadcast to all contacts in parallel.
async function broadcastSms(contacts, body) {
    return Promise.all(contacts.map((c) => sendOne(c, body)));
}

module.exports = { broadcastSms, buildSosMessage, normalizePhone, isDemoMode };
