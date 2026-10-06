// models/sosAlert.js
// Alert history: one document per SOS trigger (Week 3 - "Log alert history with timestamp").
const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema(
    {
        contactId: { type: mongoose.Schema.Types.ObjectId, ref: "Contact" },
        name: String,
        phone: String,
        status: {
            type: String,
            enum: ["sent", "failed", "demo"],
            required: true
        },
        sid: String,          // Twilio message SID (when sent)
        error: String         // Twilio / validation error text (when failed)
    },
    { _id: false }
);

const sosAlertSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    mapsLink: { type: String },
    // Where the SOS came from: button, shake, voice ...
    triggerSource: { type: String, default: "MANUAL" },
    status: {
        type: String,
        enum: ["sent", "partial", "failed", "no_contacts", "demo"],
        required: true
    },
    contactsTotal: { type: Number, default: 0 },
    contactsNotified: { type: Number, default: 0 },
    deliveries: [deliverySchema],
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SosAlert", sosAlertSchema);
