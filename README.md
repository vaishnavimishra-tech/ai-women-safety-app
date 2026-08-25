# AI Women Safety Web Application

An emergency-response web application designed for women's safety featuring one-click SOS alerts, continuous live GPS location tracking, voice-activated emergency phrase detection, and an emergency contacts management system.

---

## 📌 Project Overview
The AI Women Safety App provides a quick, accessible, and explainable safety mechanism for women during emergency situations. Built with a modular architecture, the system integrates a responsive user interface with backend alert dispatchers, real-time geolocation services, and voice phrase detection.

### Key Capabilities
- **Quick-Action SOS:** Single-click emergency trigger that dispatches instant alert notifications/SMS to pre-saved emergency contacts.
- **Live GPS Tracking:** Continuous browser-based location fetching, dynamic Google Maps link generation, and location history logging.
- **Voice-Activated Trigger:** Speech recognition to detect emergency trigger phrases (e.g., "Help") and trigger the SOS pipeline hands-free.
- **User & Contact Management:** Secure authentication system with protected routes to manage personal details and emergency contacts.
- **Cloud Deployment:** Hosted with a live demo link for academic evaluation and real-device testing.

---

## 👥 Team Members & Work Distribution

| Member Name | Registration No. | Role / Module | Core Responsibilities |
| :--- | :--- | :--- | :--- |
| **Vaishnavi Mishra** | **25BCE10943** | **Team Leader & Frontend** | UI layout design, React components, Tailwind styling, REST API integration |
| **Princy Mahajan** | **25BCE10376** | **Backend (Auth & Users)** | User registration, login system, password hashing, emergency contacts database |
| **Aastha** | **25BCE10812** | **Backend (SOS Alerts)** | SOS button handler, SMS/notification dispatch, alert logs management |
| **Pragati Sachdeva** | **25BCE10811** | **Backend (Location)** | Live GPS coordinates fetching, Google Maps link generation, location history |
| **Siya Julka** | **25BCE10477** | **Voice AI & Deployment** | Emergency voice phrase detection, AI feature integration, cloud deployment |

---

## 🛠️ Technology Stack

- **Frontend:** React, HTML5, CSS3, JavaScript, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB / MySQL
- **APIs & Tools:** Browser Geolocation API, Web Speech API, Twilio SMS API, Axios, Git
- **Hosting:** Firebase Hosting

---

## 🗓️ 5-Week Implementation Roadmap

- **Week 1: Setup & Planning:** Initialize shared Git repository, define database schemas, set up React and Express skeletons, test basic Geolocation/Speech APIs.
- **Week 2: Core Feature Building (Part 1):** Build UI auth/home screens, create Login/Signup/Contact APIs, implement basic SOS route, and verify coordinate fetching.
- **Week 3: Core Feature Building (Part 2) & Integration:** Connect frontend forms to backend routes, enable multi-contact SOS dispatch, build location history view, and link voice trigger.
- **Week 4: System Integration & Testing:** End-to-end testing across devices, mobile responsiveness check, error handling, permission prompts, and initial cloud deployment.
- **Week 5: Code Optimization & Demo Preparation:** Code commenting, edge case bug fixes, final Firebase live link validation, and presentation viva prep.

---

## 🚀 Setup & Local Execution

### Prerequisites
- Node.js (v18 or higher)
- Git

### 1. Clone Repository
```bash
git clone [https://github.com/](https://github.com/)<your-github-username>/ai-women-safety-app.git
cd ai-women-safety-app
