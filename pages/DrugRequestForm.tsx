
import React, { useState } from 'react';
import { StorageService } from '../services/storageService';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle, Upload, X, Info } from 'lucide-react';

export const DrugRequestForm: React.FC = () => {
  const [formData, setFormData] = useState({
    requesterName: '',
    requesterType: 'PATIENT',
    requesterTypeOther: '',
    contactEmail: '',
    contactPhone: '',
    genericName: '',
    brandName: '',
    dosageStrength: '',
    quantity: '',
    urgency: 'NORMAL',
    notes: '',
    agreedToTerms: false
  });
  const [attachment, setAttachment] = useState<{ fileName: string; data: string; mimeType: string; } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // Map 'OTHER' requester type to the specified type
      const submissionData = { ...formData };
      if (submissionData.requesterType === 'OTHER') {
        submissionData.requesterType = submissionData.requesterTypeOther || 'OTHER';
      }

      // Fix: Cast urgency to the required union type to resolve type mismatch on line 39
      await StorageService.addRequest({ 
        ...submissionData, 
        urgency: submissionData.urgency as 'NORMAL' | 'HIGH' | 'CRITICAL',
        prescription: attachment || undefined 
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error("Submission Error:", err);
      setErrorMsg(err.message || "An unexpected error occurred. Please check your network and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit.");
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
            Your request for <strong>{formData.genericName}</strong> has been securely logged in our global sourcing network.
          </p>
          <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-500 mb-8 border border-slate-100">
            You will receive a confirmation via Email and WhatsApp shortly.
          </div>
          <Link to="/" className="text-red-700 font-bold hover:underline">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 px-8 py-10 text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <AlertCircle size={120} />
            </div>
            <h1 className="text-3xl font-bold">Rare Drug Sourcing</h1>
            <p className="text-slate-400 mt-2 max-w-lg">Our global network and Gemini AI intelligence work in tandem to locate orphan therapeutics and manage specialized logistics.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 font-medium">
                <AlertCircle size={20} />
                {errorMsg}
              </div>
            )}

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
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Phone Number (WhatsApp Ready)</label>
                  <input required name="contactPhone" type="tel" className="w-full rounded-xl border-slate-200 p-3 border font-medium" placeholder="+1 (555) 000-0000" onChange={handleChange} />
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b pb-4">
                <span className="w-8 h-8 bg-red-100 text-red-700 rounded-lg flex items-center justify-center text-sm">02</span>
                Medication Intelligence
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Generic Name</label>
                  <input required name="genericName" type="text" className="w-full rounded-xl border-slate-200 p-3 border font-medium" placeholder="e.g. Imatinib" onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Brand Name (Optional)</label>
                  <input name="brandName" type="text" className="w-full rounded-xl border-slate-200 p-3 border font-medium" placeholder="e.g. Gleevec" onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Dosage Strength</label>
                  <input required name="dosageStrength" type="text" className="w-full rounded-xl border-slate-200 p-3 border font-medium" placeholder="e.g. 400mg tablets" onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Quantity Requested</label>
                  <input required name="quantity" type="text" className="w-full rounded-xl border-slate-200 p-3 border font-medium" placeholder="e.g. 3 months supply" onChange={handleChange} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Urgency Tier</label>
                  <div className="grid grid-cols-3 gap-4">
                    {['NORMAL', 'HIGH', 'CRITICAL'].map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, urgency: tier as any }))}
                        className={`py-3 rounded-xl border-2 font-bold text-xs transition-all ${
                          formData.urgency === tier 
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

            <section className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b pb-4">
                <span className="w-8 h-8 bg-red-100 text-red-700 rounded-lg flex items-center justify-center text-sm">03</span>
                Clinical Context
              </h3>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Additional Notes</label>
                <textarea name="notes" rows={4} className="w-full rounded-xl border-slate-200 p-4 border font-medium focus:ring-red-500" placeholder="Mention known allergies, previous sourcing attempts, or specific manufacturing requirements..." onChange={handleChange}></textarea>
              </div>
            </section>

            <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <input required type="checkbox" id="terms" className="mt-1 h-5 w-5 text-red-600 border-slate-300 rounded focus:ring-red-500" />
              <label htmlFor="terms" className="text-sm text-slate-600 leading-relaxed">
                I authorize EasygoPharm to process this data for sourcing purposes. I acknowledge that all PHI is handled according to SOC 2 Type II privacy standards.
              </label>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isSubmitting ? <Info className="animate-spin" /> : null}
              {isSubmitting ? 'Securing Data...' : 'Submit Sourcing Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
