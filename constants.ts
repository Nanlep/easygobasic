import { UserRole } from './types';

export const APP_NAME = "EasygoPharm";

export const MOCK_USERS = [
  { id: '1', username: 'admin', password: 'password', role: UserRole.SUPER_ADMIN, name: 'System Administrator' },
  { id: '2', username: 'doctor', password: 'password', role: UserRole.DOCTOR, name: 'Dr. Sarah Bennett' },
  { id: '3', username: 'pharm', password: 'password', role: UserRole.PHARMACIST, name: 'James Wilson, RPh' },
];

export const TERMS_TEXT = `
1. Acceptance of Terms: By accessing EasygoPharm, you agree to be bound by these Terms of Use.
2. No Medical Advice: The EasygoPharm platform connects patients with drugs and professionals. We do NOT provide direct medical advice, diagnosis, or treatment. All consultations are provided by independent certified experts.
3. Rare Drug Sourcing: We facilitate the logistics of rare drug procurement. Timelines are estimates.
4. Compliance: Users agree to provide accurate medical history for safety audits.
`;

export const PRIVACY_TEXT = `
**Security Whitepaper & Privacy Policy**

**1. Executive Summary**
EasygoPharm operates a zero-trust architecture designed to meet the rigorous standards of SOC 2 Type 2 and ISO 27001. Our platform ensures the confidentiality, integrity, and availability of sensitive patient health information (PHI) and pharmaceutical logistics data.

**2. Data Encryption Standards**
*   **Data at Rest:** All databases and storage volumes are encrypted using AES-256 (Advanced Encryption Standard). Keys are managed via a FIPS 140-2 Level 3 Hardware Security Module (HSM).
*   **Data in Transit:** All network communications adhere to TLS 1.3 standards. We employ certificate pinning for mobile clients and strict HSTS policies for web clients.

**3. Access Control & Authentication**
*   **Role-Based Access Control (RBAC):** Strict separation of duties between Administrators, Doctors, and Pharmacists.
*   **Multi-Factor Authentication (MFA):** Mandatory for all administrative access.
*   **Session Management:** Short-lived JWTs with automatic revocation upon suspicious activity detection.

**4. Infrastructure & Compliance**
*   **Hosting:** Deployed on AWS/GCP regions certified for health data processing.
*   **Audit Trails:** Immutable logs capture every record access, modification, and export event (ISO 27001 A.12.4).
*   **Penetration Testing:** Conducted quarterly by independent third-party security firms.

**5. Privacy & Data Handling**
*   We collect only the minimum necessary PII to facilitate drug sourcing and consultations.
*   Data is never sold to advertisers.
*   Patients retain the right to request data deletion (Right to be Forgotten) in accordance with GDPR and CCPA.
`;