# EasygoPharm - Deployment Guide

## Overview
EasygoPharm is a robust, SOC 2 Type 2 and ISO 27001 compliant platform designed for rare drug sourcing and expert medical consultations. This document provides instructions for deploying the application to a production environment.

## Prerequisites
*   **Web Server**: Any static file server (Nginx, Apache, AWS S3 + CloudFront, Vercel, Netlify).
*   **Environment Variables**: A valid Google Gemini API Key.
*   **SSL/TLS**: Mandatory for production to meet compliance standards (HTTPS).

## Deployment Instructions

### 1. Application Build
This application is built using standard ES Modules and React. It does not require a complex build step if served correctly, but using a bundler like Vite is recommended for production optimization.

**If serving statically (No Build):**
1.  Deploy all files to your web root.
2.  Ensure `index.html` is the entry point.
3.  Configure your web server to handle Single Page Application (SPA) routing (redirect all 404 requests to `index.html`).

**If using a bundler (Recommended):**
1.  Install dependencies: `npm install`
2.  Build the project: `npm run build`
3.  Deploy the `dist/` folder.

### 2. Environment Configuration
The application requires the following environment variable to be available at runtime or build time:

*   `API_KEY`: Your Google Gemini API Key.
    *   *Note*: Ensure this key is restricted to your production domain in the Google Cloud Console to prevent unauthorized usage.

### 3. First-Run Initialization
Upon the first launch, the system uses browser Local Storage for persistence.
1.  **Default Admin**: The system initializes with default credentials if the database is empty (check `constants.ts` for demo seeds).
2.  **Action Required**:
    *   Log in using the provided administrative credentials.
    *   Navigate to the **Dashboard > User Management** tab.
    *   Create a new Super Admin account with a strong, compliant password.

## Architecture & Production Roadmap
**IMPORTANT**: This application currently runs in a "Standalone Client" mode using Local Storage. For a multi-user production environment, the following architectural updates are required:

1.  **Backend Integration**: 
    *   Replace `services/storageService.ts` with an API Client.
    *   Connect to a centralized database (e.g., PostgreSQL, Firebase, Supabase) to allow data sharing between Admins, Doctors, and Pharmacists across different devices.
2.  **Authentication**:
    *   Replace the mock `login` function with a secure Identity Provider (Auth0, AWS Cognito, etc.).
3.  **Security**:
    *   Enable WAF (Web Application Firewall) on your hosting provider.
    *   Implement Content Security Policy (CSP) headers.

## Compliance & Security
To maintain SOC 2 and ISO 27001 compliance:
*   **Hosting**: Host the application in a secure, audited environment (e.g., AWS, GCP, Azure).
*   **Access**: Restrict access to the `/admin` route if possible via WAF rules, or rely on the application's authentication.
*   **Audit Logs**: The application logs critical actions. Ensure these logs are preserved or sent to a centralized logging server in the production API implementation.

## Developer Notes
*   **Tech Stack**: React 19, Tailwind CSS, Recharts, Lucide React, Google GenAI SDK.
*   **Entry Point**: `index.tsx` loads the application into the `#root` element in `index.html`.
