const mongoose = require("mongoose");

const locationHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    accuracy: { type: Number },
    mapsLink: { type: String },
    triggeredBy: {
        type: String,
        enum: ["manual", "sos", "background"],
        default: "manual"
    },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("LocationHistory", locationHistorySchema);