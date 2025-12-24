# EasygoPharm (EGP)

EasygoPharm is a high-performance, SOC 2 compliant pharmaceutical logistics and medical triage platform. It leverages Google Gemini AI for drug intelligence and Supabase for secure, scalable data persistence. The platform is designed to streamline the procurement of rare (orphan) medications and facilitate expert medical consultations through a zero-trust architecture.

---

## 🚀 Key Features

- **Rare Drug Sourcing**: Automated intake for orphan drug requests with AI-powered logistics analysis.
- **Medical Triage**: Seamless scheduling for medical consultations with encrypted document handling.
- **AI-Driven Insights**: Utilizes Gemini 3 Flash and Google Search grounding for real-time pharmaceutical intelligence.
- **Live Voice Assistant**: Real-time voice interaction using Gemini Live API for patient intake and triage.
- **Easygo Command**: A robust administrative dashboard with RBAC (Role-Based Access Control) and performance analytics.
- **SOC 2 & ISO 27001 Alignment**: Security-first design featuring immutable audit logs and AES-256 data encryption.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Bundler**: Vite
- **AI Engine**: Google Gemini API (@google/genai)
- **Backend/Database**: Supabase
- **Visualization**: Recharts
- **Icons**: Lucide React

---

## 💻 Local Testing & Development

### 1. Prerequisites
- Node.js (v18+)
- npm or yarn
- A Supabase Project
- A Google Gemini API Key

### 2. Installation
```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory or configure your environment with the following keys:

```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
```

*Note: In the current development build, Supabase credentials are pre-configured in `services/supabaseClient.ts` for immediate local testing.*

### 4. Running the App
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

---

## 🌍 Live Deployment

### Production Build
To generate a production-ready static build:
```bash
npm run build
```
The output will be in the `dist/` directory.

### Deployment Steps
1. **Static Hosting**: Upload the contents of `dist/` to your preferred provider (Vercel, Netlify, AWS S3, or Nginx).
2. **SPA Routing**: Ensure your host is configured to redirect all 404 requests to `index.html` to support client-side routing.
3. **Environment Variables**: Set the `GEMINI_API_KEY` in your CI/CD pipeline or hosting dashboard.
4. **SSL/TLS**: HTTPS is strictly required for SOC 2 compliance and for the browser to allow Microphone/Camera access for the Live Assistant.

---

## 🛡️ Security & Compliance

EasygoPharm implements a **Zero-Trust Architecture**:
- **Authentication**: Secure staff login with session management.
- **Data Integrity**: All drug requests and audit logs are stored in Supabase with row-level security (RLS).
- **Audit Trails**: Every administrative action is logged with an immutable timestamp and integrity hash.
- **Encrypted Storage**: Attachments (prescriptions/files) are handled with high-entropy encryption before storage.

---

## 📞 Support & Contact
For technical inquiries or security whitepaper requests, contact the engineering team at `info@easygopharm.com`.

&copy; 2025 EasygoPharm Inc. All rights reserved.