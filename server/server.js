require("dotenv").config();

const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const twilio = require("twilio");

const User = require("./models/user");
const Contact = require("./models/contact");

const app = express();

const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);
//commit
app.use(express.json());

console.log("MONGO_URI loaded:", !!process.env.MONGO_URI);
console.log("Twilio account loaded:", !!process.env.TWILIO_ACCOUNT_SID);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");
    })
    .catch((error) => {
        console.log("MongoDB connection failed:", error.message);
    });

// Test route
app.get("/", (req, res) => {
    res.send("Backend is running!");
});

// Signup API
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

// Login API
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

// Add Emergency Contact
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

// SOS Alert API
app.post("/api/sos", async (req, res) => {
    try {
        const { userId, latitude, longitude } = req.body;

        // Check required data
        if (!userId || latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                message: "User ID and location are required"
            });
        }

        // Find the user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Find emergency contacts
        const contacts = await Contact.find({ userId });

        if (contacts.length === 0) {
            return res.status(404).json({
                message: "No emergency contacts found"
            });
        }

        // Create Google Maps location link
        const locationLink =
            `https://maps.google.com/?q=${latitude},${longitude}`;

        // Send SMS to every emergency contact
        for (const contact of contacts) {
            await twilioClient.messages.create({
                body: "sms_appointment_reminders",
                from: process.env.TWILIO_PHONE_NUMBER,
                to: process.env.TWILIO_TO_PHONE_NUMBER,
            });

            console.log(`SOS SMS sent to ${contact.name}`);
        }

        // Send response after SMS is sent
        res.status(200).json({
            message: "SOS alert sent successfully",
            location: {
                latitude,
                longitude
            },
            contactsNotified: contacts.length
        });

    } catch (error) {
        console.log("SOS error:", error);

        res.status(500).json({
            message: "Failed to send SOS alert"
        });
    }
});

// Start server
app.listen(5000, () => {
    console.log("Server running on http://127.0.0.1:5000");
});





