require("dotenv").config();
const path = require("path");

const User = require("./models/user");
const Contact = require("./models/contact");
const LocationHistory = require("./models/locationHistory");
const SosAlert = require("./models/sosAlert");
const { broadcastSms, buildSosMessage, isDemoMode } = require("./services/smsService");
const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");


const app = express();

const cors = require("cors");
app.use(cors());
app.use(express.json());

console.log("MONGO_URI loaded:", !!process.env.MONGO_URI);
console.log("SMS mode:", isDemoMode() ? "DEMO (no real SMS)" : "LIVE (Twilio)");

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");
    })
    .catch((error) => {
        console.log("MongoDB connection failed:", error.message);
    });

// Test route - disabled now that frontend is served at "/"
// app.get("/", (req, res) => {
//     res.send("Backend is running!");
// });

// POST /signup
// Registers a new user after validating input.
// Password is hashed with bcrypt before being stored in MongoDB.
app.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            return res.status(400).json({
                message: "Invalid email format"
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });
        await newUser.save();
        res.status(201).json({
            message: "Signup successful!",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

// POST /login
// Authenticates a user using email and password.
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Compare password with stored bcrypt hash
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Login successful
        res.status(200).json({
            message: "Login successful!",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

// POST /api/contacts
// Adds an emergency contact for an existing user.
app.post("/api/contacts", async (req, res) => {
    try {
        const { userId, name, phone, relationship } = req.body;

        // Check required fields
        if (!userId || !name || !phone || !relationship) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Check if user exists
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Create emergency contact
        const contact = new Contact({
            userId,
            name,
            phone,
            relationship
        });

        await contact.save();

        res.status(201).json({
            message: "Emergency contact added successfully",
            contact
        });

    } catch (error) {
        console.log("Add contact error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});
// GET /api/contacts/:userId
// Retrieves emergency contacts belonging to a specific user.
app.get("/api/contacts/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const contacts = await Contact.find({ userId });

        res.status(200).json({
            message: "Emergency contacts fetched successfully",
            contacts
        });

    } catch (error) {
        console.log("View contacts error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


// POST /api/location
// Saves the user's location data in MongoDB.
app.post("/api/location", async (req, res) => {
    try {
        const { userId, latitude, longitude, accuracy, mapsLink } = req.body;

        if (!userId || latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                message: "User ID and location are required"
            });
        }

        const newLocation = new LocationHistory({
            userId,
            latitude,
            longitude,
            accuracy,
            mapsLink,
            triggeredBy: "manual"
        });

        await newLocation.save();

        res.status(201).json({
            message: "Location saved successfully",
            data: newLocation
        });

    } catch (error) {
        console.log("Save location error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

// GET /api/location/history/:userId
// Retrieves the location history of a specific user.
app.get("/api/location/history/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const history = await LocationHistory.find({ userId }).sort({ timestamp: -1 });

        res.status(200).json({
            message: "Location history fetched successfully",
            history
        });

    } catch (error) {
        console.log("Fetch history error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

// POST /api/sos
// SOS flow (viva walk-through):
//   1. Frontend (SOS button / shake / voice) sends { userId, latitude, longitude, triggerSource }
//   2. Validate input + check the user exists
//   3. Fetch the user's saved emergency contacts from MongoDB
//   4. No contacts -> save a "no_contacts" alert and tell the user to add some
//   5. Build the SOS message (User + Coordinates + Google Maps link)
//   6. Send SMS to ALL contacts in parallel through Twilio
//   7. Save alert history (timestamp, per-contact delivery result) in MongoDB
//   8. Respond with how many contacts were actually notified
app.post("/api/sos", async (req, res) => {
    try {
        const { userId, triggerSource = "MANUAL" } = req.body;
        const latitude = Number(req.body.latitude);
        const longitude = Number(req.body.longitude);

        // 2. Validate
        if (!userId || !mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ message: "A valid user ID is required" });
        }
        if (
            !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
            latitude < -90 || latitude > 90 ||
            longitude < -180 || longitude > 180
        ) {
            return res.status(400).json({ message: "Valid latitude and longitude are required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;

        // 3. Fetch contacts dynamically
        const contacts = await Contact.find({ userId });

        // 4. Edge case: no contacts saved
        if (contacts.length === 0) {
            await SosAlert.create({
                userId, latitude, longitude, mapsLink, triggerSource,
                status: "no_contacts", contactsTotal: 0, contactsNotified: 0, deliveries: []
            });
            return res.status(404).json({
                code: "NO_CONTACTS",
                message: "No emergency contacts saved. Please add at least one contact so SOS alerts can be delivered."
            });
        }

        // 5 + 6. Build message and dispatch to every contact
        const body = buildSosMessage({ userName: user.name, latitude, longitude, mapsLink });
        const deliveries = await broadcastSms(contacts, body);

        const notified = deliveries.filter((d) => d.status === "sent" || d.status === "demo").length;
        const demo = deliveries.some((d) => d.status === "demo");
        const status =
            notified === 0 ? "failed" :
            demo ? "demo" :
            notified === deliveries.length ? "sent" : "partial";

        // 7. Alert history
        const alert = await SosAlert.create({
            userId, latitude, longitude, mapsLink, triggerSource, status,
            contactsTotal: contacts.length,
            contactsNotified: notified,
            deliveries
        });

        // 8. Respond
        if (notified === 0) {
            return res.status(502).json({
                code: "SMS_FAILED",
                message: "SOS was recorded but no SMS could be delivered. Check phone numbers / SMS gateway.",
                alertId: alert._id,
                deliveries
            });
        }

        res.status(200).json({
            message: demo
                ? "SOS processed in DEMO mode (no real SMS sent)"
                : "SOS alert sent successfully",
            alertId: alert._id,
            status,
            mode: demo ? "demo" : "live",
            location: { latitude, longitude, mapsLink },
            contactsTotal: contacts.length,
            contactsNotified: notified,
            deliveries
        });
    } catch (error) {
        console.log("SOS error:", error);
        res.status(500).json({ message: "Failed to send SOS alert" });
    }
});

// GET /api/sos/history/:userId
// Returns the user's past SOS alerts (newest first) with timestamps.
app.get("/api/sos/history/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        const alerts = await SosAlert.find({ userId }).sort({ timestamp: -1 }).limit(50);
        res.status(200).json({ message: "SOS history fetched successfully", alerts });
    } catch (error) {
        console.log("SOS history error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
// Serve the React frontend build
app.use(express.static(path.join(__dirname, "../client/dist")));

app.get("/*splat", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

app.listen(PORT, () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
});
