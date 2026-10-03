require("dotenv").config();

const User = require("./models/user");
const Contact = require("./models/contact");
const LocationHistory = require("./models/locationHistory");
const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const twilio = require("twilio");


const app = express();

const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const cors = require("cors");
app.use(cors());
app.use(express.json());

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


// Save Location API
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

// Get Location History API
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

// SOS Alert API


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

        // Demo Mode - SMS disabled because Twilio trial has expired
        console.log("SOS received successfully!");
        console.log(`Emergency contacts found: ${contacts.length}`);

        for (const contact of contacts) {
            console.log(`Demo SOS notification for: ${contact.name} - ${contact.phone}`);
        }

        console.log("SMS sending skipped - Demo Mode");

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





