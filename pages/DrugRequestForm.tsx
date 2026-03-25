
import React, { useState } from 'react';
import { StorageService } from '../services/storageService';
import { EmailService } from '../services/emailService';
import { useToast } from '../components/Toast';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Upload, X, Info, Plus, Trash2, Pill } from 'lucide-react';

interface DrugEntry {
  genericName: string;
  brandName: string;
  dosageStrength: string;
  quantity: string;
  urgency: 'NORMAL' | 'HIGH' | 'CRITICAL';
}

const emptyDrug = (): DrugEntry => ({
  genericName: '',
  brandName: '',
  dosageStrength: '',
  quantity: '',
  urgency: 'NORMAL',
});

export const DrugRequestForm: React.FC = () => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    requesterName: '',
    requesterType: 'PATIENT',
    requesterTypeOther: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    notes: '',
    agreedToTerms: false
  });
  const [drugs, setDrugs] = useState<DrugEntry[]>([emptyDrug()]);
  const [attachment, setAttachment] = useState<{ fileName: string; data: string; mimeType: string; } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const addDrug = () => setDrugs(prev => [...prev, emptyDrug()]);
  const removeDrug = (index: number) => {
    if (drugs.length <= 1) return;
    setDrugs(prev => prev.filter((_, i) => i !== index));
  };
  const updateDrug = (index: number, field: keyof DrugEntry, value: string) => {
    setDrugs(prev => prev.map((drug, i) => i === index ? { ...drug, [field]: value } : drug));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreedToTerms) {
      setErrorMsg("You must agree to the terms and privacy policy to proceed.");
      return;
    }

    // Validate all drugs have required fields
    for (let i = 0; i < drugs.length; i++) {
      if (!drugs[i].genericName || !drugs[i].dosageStrength || !drugs[i].quantity) {
        setErrorMsg(`Drug #${i + 1}: Generic name, dosage, and quantity are required.`);
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const finalRequesterType = formData.requesterType === 'OTHER' 
        ? (formData.requesterTypeOther || 'OTHER') 
        : formData.requesterType;

      const submittedAt = new Date().toISOString();
      const firstDrug = drugs[0];

      const requestPayload = { 
        requesterName: formData.requesterName,
        requesterType: finalRequesterType,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        address: formData.address,
        // Legacy fields from first drug for backward compat
        genericName: firstDrug.genericName,
        brandName: firstDrug.brandName,
        dosageStrength: firstDrug.dosageStrength,
        quantity: firstDrug.quantity,
        urgency: firstDrug.urgency as 'NORMAL' | 'HIGH' | 'CRITICAL',
        // Full drugs array
        drugs,
        notes: formData.notes,
        prescription: attachment || undefined,
        submittedAt,
      };

      // 1. Save to Database (Primary)
      await StorageService.addRequest(requestPayload);

      // 2. Trigger Notifications (Non-blocking)
      try {
        const emailData = {
          ...formData,
          drugs,
          drugsSummary: drugs.map((d, i) => `Drug ${i+1}: ${d.genericName} (${d.dosageStrength}, Qty: ${d.quantity}, ${d.urgency})`).join(' | '),
        };
        await Promise.allSettled([
          EmailService.sendUserConfirmation(formData.contactEmail, formData.requesterName, emailData, 'REQUEST'),
          EmailService.sendAdminNotification('REQUEST', { ...requestPayload, drugsSummary: drugs.map((d, i) => `Drug ${i+1}: ${d.genericName} (${d.dosageStrength}, Qty: ${d.quantity}, ${d.urgency})`).join(' | ') })
        ]);
      } catch (notifErr) {
        console.warn("Notification system alert:", notifErr);
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error("Submission Error:", err);
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("File size exceeds 5MB limit. Please upload a smaller file.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachment({
        fileName: file.name,
        data: reader.result as string,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Request Received</h2>
          <p className="text-slate-600 mb-4">
            Your request for <strong>{drugs.length} medication{drugs.length > 1 ? 's' : ''}</strong> has been securely logged. Confirmation emails have been sent to our logistics team.
          </p>
          <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-500 mb-4 border border-slate-100 text-left">
            {drugs.map((d, i) => (
              <div key={i} className="flex items-center gap-2 py-1">
                <Pill size={14} className="text-red-500 -rotate-45 shrink-0" />
                <span className="font-bold">{d.genericName}</span>
                <span className="text-slate-400">— {d.dosageStrength}, Qty: {d.quantity}</span>
              </div>
            ))}
          </div>
          <div className="text-xs text-slate-400 mb-8">Submitted: {new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'full', timeStyle: 'short' })} WAT</div>
          <Link to="/" className="text-red-700 font-bold hover:underline">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="bg-slate-900 px-8 py-10 text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <AlertCircle size={120} />
            </div>
            <h1 className="text-3xl font-bold">Rare Drug Sourcing</h1>
            <p className="text-slate-400 mt-2 max-w-lg">Our global network and Gemini AI intelligence work in tandem to locate orphan therapeutics. You can order multiple drugs in a single request.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 font-medium">
                <AlertCircle size={20} />
                {errorMsg}
              </div>
            )}

            {/* Section 01: Requester Info */}
            <section className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b pb-4">
                <span className="w-8 h-8 bg-red-100 text-red-700 rounded-lg flex items-center justify-center text-sm">01</span>
                Requester Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Full Name / Entity</label>
                  <input required name="requesterName" type="text" className="w-full rounded-xl border-slate-200 p-3 border font-medium focus:ring-red-500 focus:border-red-500" placeholder="e.g. St. Jude Children's Research" onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Requester Type</label>
                  <select name="requesterType" className="w-full rounded-xl border-slate-200 p-3 border font-bold text-slate-700" onChange={handleChange} value={formData.requesterType}>
                    <option value="PATIENT">Individual Patient</option>
                    <option value="CLINIC">Certified Clinic</option>
                    <option value="HOSPITAL">Public/Private Hospital</option>
                    <option value="OTHER">Other Institution</option>
                  </select>
                </div>
                {formData.requesterType === 'OTHER' && (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Specify Institution Type</label>
                    <input required name="requesterTypeOther" type="text" className="w-full rounded-xl border-slate-200 p-3 border font-medium" onChange={handleChange} />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                  <input required name="contactEmail" type="email" className="w-full rounded-xl border-slate-200 p-3 border font-medium" placeholder="notifications@example.com" onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Phone Number</label>
                  <input required name="contactPhone" type="tel" className="w-full rounded-xl border-slate-200 p-3 border font-medium" placeholder="+1 (555) 000-0000" onChange={handleChange} />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Full Address</label>
                <textarea required name="address" rows={2} className="w-full rounded-xl border-slate-200 p-3 border font-medium focus:ring-red-500 focus:border-red-500" placeholder="Street address, city, state, postal code, country" onChange={handleChange} value={formData.address}></textarea>
              </div>
            </section>

            {/* Section 02: Medications (Multi-Drug) */}
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-8 h-8 bg-red-100 text-red-700 rounded-lg flex items-center justify-center text-sm">02</span>
                  Medications
                  <span className="ml-2 text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">{drugs.length} drug{drugs.length > 1 ? 's' : ''}</span>
                </h3>
                <button
                  type="button"
                  onClick={addDrug}
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-red-700 hover:text-red-800 uppercase tracking-widest bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors"
                >
                  <Plus size={14} /> Add Drug
                </button>
              </div>

              <div className="space-y-6">
                <AnimatePresence>
                  {drugs.map((drug, index) => (
                    <motion.div 
                      key={index} // Need unique ID ideally, but using index for now if no sorts happen
                      layout
                      initial={{ opacity: 0, scale: 0.95, y: -20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, height: 0, overflow: 'hidden' }}
                      transition={{ duration: 0.3 }}
                      className="relative bg-slate-50 rounded-2xl p-6 border border-slate-200 group"
                    >
                      {/* Drug header */}
                      <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-red-700 text-white rounded-lg flex items-center justify-center text-[10px] font-bold">
                          <Pill size={14} className="-rotate-45" />
                        </div>
                        <span className="text-sm font-extrabold text-slate-700">Drug #{index + 1}</span>
                      </div>
                      {drugs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDrug(index)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Remove this drug"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Generic Name *</label>
                        <input
                          required
                          type="text"
                          className="w-full rounded-xl border-slate-200 bg-white p-3 border font-medium focus:ring-red-500 focus:border-red-500"
                          placeholder="e.g. Imatinib"
                          value={drug.genericName}
                          onChange={(e) => updateDrug(index, 'genericName', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Brand Name (Optional)</label>
                        <input
                          type="text"
                          className="w-full rounded-xl border-slate-200 bg-white p-3 border font-medium"
                          placeholder="e.g. Gleevec"
                          value={drug.brandName}
                          onChange={(e) => updateDrug(index, 'brandName', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Dosage Strength *</label>
                        <input
                          required
                          type="text"
                          className="w-full rounded-xl border-slate-200 bg-white p-3 border font-medium"
                          placeholder="e.g. 400mg tablets"
                          value={drug.dosageStrength}
                          onChange={(e) => updateDrug(index, 'dosageStrength', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Quantity *</label>
                        <input
                          required
                          type="text"
                          className="w-full rounded-xl border-slate-200 bg-white p-3 border font-medium"
                          placeholder="e.g. 3 months supply"
                          value={drug.quantity}
                          onChange={(e) => updateDrug(index, 'quantity', e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Urgency Tier</label>
                        <div className="grid grid-cols-3 gap-3">
                          {(['NORMAL', 'HIGH', 'CRITICAL'] as const).map((tier) => (
                            <button
                              key={tier}
                              type="button"
                              onClick={() => updateDrug(index, 'urgency', tier)}
                              className={`py-2.5 rounded-xl border-2 font-bold text-xs transition-all ${
                                drug.urgency === tier 
                                  ? tier === 'CRITICAL' ? 'bg-red-600 border-red-600 text-white' : 'bg-slate-900 border-slate-900 text-white'
                                  : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                              }`}
                            >
                              {tier}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                </AnimatePresence>
              </div>

              {/* Add another drug button (bottom) */}
              {drugs.length >= 1 && (
                <button
                  type="button"
                  onClick={addDrug}
                  className="w-full py-3 border-2 border-dashed border-slate-200 hover:border-red-300 text-slate-400 hover:text-red-600 rounded-2xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Add Another Medication
                </button>
              )}

              {/* Prescription Upload */}
              <div className="pt-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Clinical Documentation (Prescription)</label>
                <div className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${attachment ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                  {!attachment ? (
                    <>
                      <Upload className="mx-auto h-10 w-10 text-slate-400 mb-4" />
                      <div className="flex flex-col gap-1">
                        <label className="cursor-pointer text-red-700 font-bold hover:text-red-800">
                          <span>Choose Secure File</span>
                          <input type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
                        </label>
                        <p className="text-xs text-slate-500">PDF, JPG up to 5MB. Encrypted on upload.</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-red-200">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="text-emerald-500" size={20} />
                        <span className="text-sm font-bold text-slate-700">{attachment.fileName}</span>
                      </div>
                      <button type="button" onClick={() => setAttachment(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                        <X size={20} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Section 03: Clinical Context */}
            <section className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b pb-4">
                <span className="w-8 h-8 bg-red-100 text-red-700 rounded-lg flex items-center justify-center text-sm">03</span>
                Clinical Context
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Additional Notes</label>
                  <textarea name="notes" rows={4} className="w-full rounded-xl border-slate-200 p-4 border font-medium focus:ring-red-500" placeholder="Mention known allergies, previous sourcing attempts..." onChange={handleChange}></textarea>
                </div>
                
                <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <input 
                    id="agreedToTerms" 
                    name="agreedToTerms" 
                    type="checkbox" 
                    checked={formData.agreedToTerms}
                    onChange={handleChange}
                    className="mt-1 h-5 w-5 text-red-600 border-slate-300 rounded focus:ring-red-500"
                  />
                  <label htmlFor="agreedToTerms" className="text-sm text-slate-600 leading-tight">
                    I confirm that the information provided is accurate and I agree to the <Link to="/legal/terms" className="text-red-700 font-bold hover:underline">Terms of Use</Link> and <Link to="/legal/privacy" className="text-red-700 font-bold hover:underline">Privacy Policy</Link>.
                  </label>
                </div>
              </div>
            </section>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isSubmitting && <Info className="animate-spin" />}
              {isSubmitting ? 'Securing Data...' : `Submit ${drugs.length} Medication${drugs.length > 1 ? 's' : ''}`}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
