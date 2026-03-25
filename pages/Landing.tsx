import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Pill, Calendar, Shield, Search, ArrowRight, Activity, Globe, 
  Truck, Stethoscope, Lock, Server, FileText, ShieldCheck 
} from 'lucide-react';

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const scaleUpVariant = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
};

export const Landing: React.FC = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-slate-900 py-24 lg:py-36 overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2070')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-red-900/40"></div>
        
        <motion.div 
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUpVariant} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-900/30 border border-red-700/50 text-red-100 text-sm font-medium mb-8 backdrop-blur-sm shadow-xl shadow-red-900/20">
            <Shield size={16} className="text-red-500" />
            <span>ISO 27001 & SOC 2 Type 2 Compliant Platform</span>
          </motion.div>
          
          <motion.h1 variants={fadeUpVariant} className="text-4xl md:text-7xl font-extrabold text-white tracking-tight mb-8 leading-tight">
            Bridging the gap in <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600">Global Medical Logistics</span>
          </motion.h1>
          
          <motion.p variants={fadeUpVariant} className="max-w-2xl mx-auto text-xl text-slate-300 mb-12 leading-relaxed">
            EasygoPharm creates a seamless digital ecosystem for sourcing rare therapeutics and connecting patients with certified specialists. Precision, privacy, and care in every interaction.
          </motion.p>
          
          <motion.div variants={fadeUpVariant} className="flex flex-col sm:flex-row justify-center gap-6">
            <Link to="/request-drug" className="group inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-red-700 hover:bg-red-800 shadow-xl shadow-red-900/30 transition-all transform hover:-translate-y-1">
              <Pill className="mr-3 -rotate-45 group-hover:rotate-0 transition-transform duration-300" size={24} />
              Request Medication
            </Link>
            <Link to="/book-consult" className="group inline-flex items-center justify-center px-8 py-4 border border-slate-600 backdrop-blur-sm bg-slate-800/50 text-lg font-semibold rounded-xl text-white hover:bg-slate-700 hover:border-slate-500 shadow-xl shadow-slate-900/30 transition-all transform hover:-translate-y-1">
              <Calendar className="mr-3 group-hover:text-red-400 transition-colors" size={24} />
              Book Expert Consult
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* The Medical Value Chain Process */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-200 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.h2 variants={fadeUpVariant} className="text-base font-bold text-red-700 uppercase tracking-wide mb-2">Our Workflow</motion.h2>
            <motion.h3 variants={fadeUpVariant} className="text-3xl md:text-4xl font-extrabold text-slate-900">Optimized Medical Value Chain</motion.h3>
            <motion.p variants={fadeUpVariant} className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              From request to fulfillment, our platform streamlines the complex journey of rare drug acquisition.
            </motion.p>
          </motion.div>

          <div className="relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {[
                { icon: Search, title: "1. Request", desc: "Clinics or patients submit specific rare drug requirements securely." },
                { icon: Globe, title: "2. Global Sourcing", desc: "We query our international network of verified pharmaceutical suppliers." },
                { icon: Stethoscope, title: "3. Expert Review", desc: "Medical safety checks and patient consultations with certified doctors." },
                { icon: Truck, title: "4. Secure Delivery", desc: "Cold-chain compliant logistics ensure the integrity of delivery." }
              ].map((step, idx) => (
                <motion.div key={idx} variants={scaleUpVariant} className="group flex flex-col items-center text-center bg-white p-6 rounded-3xl hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 transform hover:-translate-y-2 border border-transparent hover:border-slate-100">
                  <div className="w-20 h-20 bg-slate-50 border-2 border-slate-100 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:border-red-200 group-hover:bg-red-50 transition-all duration-500">
                    <step.icon className="text-slate-400 group-hover:text-red-700 transition-colors duration-500" size={32} />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h4>
                  <p className="text-sm text-slate-500">{step.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats/Trust Section */}
      <section className="py-20 bg-slate-900 border-y border-slate-800">
        <motion.div 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-800">
              {[
                { stat: "24/7", label: "Support" },
                { stat: "50+", label: "Countries" },
                { stat: "100%", label: "Compliance" },
                { stat: "SOC 2", label: "Type II Certified" }
              ].map((item, idx) => (
                <motion.div key={idx} variants={fadeUpVariant} className="p-4">
                   <div className="text-4xl font-extrabold text-white mb-2">{item.stat}</div>
                   <div className="text-sm font-medium text-red-500 uppercase tracking-wider">{item.label}</div>
                </motion.div>
              ))}
           </div>
        </motion.div>
      </section>

      {/* Security Architecture / Whitepaper Preview */}
      <section className="py-24 bg-slate-50 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="mb-16 text-center"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.h2 variants={fadeUpVariant} className="text-base font-bold text-red-700 uppercase tracking-wide mb-2">Security Architecture</motion.h2>
            <motion.h3 variants={fadeUpVariant} className="text-3xl md:text-4xl font-extrabold text-slate-900">Defense-in-Depth Strategy</motion.h3>
            <motion.p variants={fadeUpVariant} className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Our security posture goes beyond compliance checklists. We engineer trust into every layer of the application stack.
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {[
              { icon: Lock, title: "AES-256 Encryption", desc: "Patient data is encrypted at rest using industry-standard AES-256 algorithms. Data in transit is secured via TLS 1.3, ensuring immunity to eavesdropping." },
              { icon: ShieldCheck, title: "RBAC & MFA", desc: "Strict Role-Based Access Control limits data exposure. Multi-Factor Authentication is enforced for all staff, preventing unauthorized account takeover.", primary: true },
              { icon: FileText, title: "Immutable Audit Logs", desc: "Every interaction with PHI is cryptographically signed and logged. Our audit trails are immutable, satisfying ISO 27001 A.12.4 requirements." },
              { icon: Server, title: "Sovereign Infrastructure", desc: "Hosted in SOC 2 Type 2 certified data centers with biological access controls, redundant power, and automated disaster recovery protocols." },
              { icon: Activity, title: "Continuous Monitoring", desc: "Automated vulnerability scanning and 24/7 intrusion detection systems (IDS) monitor the platform for suspicious behavioral patterns." }
            ].map((card, idx) => (
              <motion.div key={idx} variants={scaleUpVariant} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-inner transition-colors duration-300 ${card.primary ? 'bg-red-700 text-white shadow-red-900/20' : 'bg-slate-900 text-white shadow-slate-900/20 group-hover:bg-red-700'}`}>
                  <card.icon size={24} />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">{card.title}</h4>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {card.desc}
                </p>
              </motion.div>
            ))}

            {/* CTA to Whitepaper */}
            <motion.div variants={scaleUpVariant} className="bg-slate-900 p-8 rounded-3xl shadow-xl flex flex-col justify-center items-center text-center overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-16 h-16 bg-red-700 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-red-900/50 relative z-10 group-hover:scale-110 transition-transform duration-500">
                <FileText className="text-white" size={32} />
              </div>
              <h4 className="text-xl font-bold text-white mb-2 relative z-10">Technical Whitepaper</h4>
              <p className="text-slate-400 mb-6 text-sm relative z-10">
                Download our full security specifications and compliance report.
              </p>
              <Link to="/legal/privacy" className="inline-flex items-center text-white font-semibold hover:text-red-400 transition-colors group/link relative z-10">
                Read Full Report <ArrowRight size={18} className="ml-2 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};