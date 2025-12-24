
import React, { useState } from 'react';
import { StorageService } from '../services/storageService';
import { EmailService } from '../services/emailService';
import { Link } from 'react-router-dom';
import { CalendarCheck, Clock, Phone, Mail, User as UserIcon, AlertCircle, Upload, CheckCircle, X } from 'lucide-react';

export const ConsultationForm: React.FC = () => {
  const [formData, setFormData] = useState({
    patientName: '',
    contactEmail: '',
    contactPhone: '',
    preferredDate: '',
    reason: '',
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
      const payload = {
        ...formData,
        attachment: attachment || undefined
      };

      // 1. Save to DB (Primary)
      await StorageService.addConsultation(payload);

      // 2. Notify (Secondary)
      try {
        await Promise.allSettled([
          EmailService.sendUserConfirmation(formData.contactEmail, formData.patientName, formData, 'APPOINTMENT'),
          EmailService.sendAdminNotification('APPOINTMENT', payload)
        ]);
      } catch (notifErr) {
        console.warn("Notification system alert:", notifErr);
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error("Scheduling Error:", err);
      setErrorMsg(err.message || "Scheduling failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-100">
          <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
            <CalendarCheck size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Appointment Scheduled</h2>
          <p className="text-slate-600 mb-6">
            Your consultation request has been secured. Confirmation emails have been sent to our medical board.
          </p>
          <Link to="/" className="text-slate-900 font-bold hover:underline">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 px-8 py-10 text-white flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Medical Expert Triage</h1>
              <p className="text-slate-400 mt-1">Certified consultation for therapeutic inquiries.</p>
            </div>
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Clock size={24} />
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 font-medium">
                <AlertCircle size={20} />
                {errorMsg}
              </div>
            )}

            <div className="space-y-6">
              <div className="relative">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Patient Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-3.5 text-slate-300" size={18} />
                  <input required name="patientName" type="text" className="w-full rounded-2xl border-slate-100 bg-slate-50 p-3 pl-12 border font-bold text-slate-900" placeholder="John Doe" onChange={handleChange} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                  <input required name="contactEmail" type="email" className="w-full rounded-2xl border-slate-100 bg-slate-50 p-3 border font-bold text-slate-900" placeholder="jane@example.com" onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Phone</label>
                  <input required name="contactPhone" type="tel" className="w-full rounded-2xl border-slate-100 bg-slate-50 p-3 border font-bold text-slate-900" placeholder="+1..." onChange={handleChange} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Preferred Window</label>
                <input required name="preferredDate" type="datetime-local" className="w-full rounded-2xl border-slate-100 bg-slate-50 p-3 border font-bold text-slate-900" onChange={handleChange} />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Inquiry Focus</label>
                <textarea required name="reason" rows={4} className="w-full rounded-2xl border-slate-100 bg-slate-50 p-4 border font-bold text-slate-900" placeholder="Describe your context..." onChange={handleChange}></textarea>
              </div>

              <div className="pt-4">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Medical Files (Optional)</label>
                <div className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${attachment ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
                  {!attachment ? (
                    <label className="cursor-pointer text-blue-600 font-bold hover:text-blue-700 text-sm">
                      <span>Upload Documents</span>
                      <input type="file" className="sr-only" onChange={handleFileChange} />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-blue-200">
                      <span className="text-xs font-bold">{attachment.fileName}</span>
                      <button type="button" onClick={() => setAttachment(null)} className="text-slate-400"><X size={16} /></button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Securing Session...' : 'Confirm Consultation Booking'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
