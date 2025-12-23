import React, { useState } from 'react';
import { StorageService } from '../services/storageService';
import { Link } from 'react-router-dom';
import { CalendarCheck, Clock } from 'lucide-react';

export const ConsultationForm: React.FC = () => {
  const [formData, setFormData] = useState({
    patientName: '',
    contactEmail: '',
    preferredDate: '',
    reason: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.addConsultation(formData as any);
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
            <CalendarCheck size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Consultation Scheduled</h2>
          <p className="text-slate-600 mb-8">
            Your appointment request for <strong>{formData.preferredDate}</strong> has been received. A doctor will confirm shortly via email.
          </p>
          <Link to="/" className="text-red-700 font-medium hover:underline">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 px-8 py-6">
            <h1 className="text-2xl font-bold text-white">Book a Free Consultation</h1>
            <p className="text-slate-400 mt-1">Speak with a certified expert about your medication needs.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Patient Name</label>
              <input required name="patientName" type="text" className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
              <input required name="contactEmail" type="email" className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Date & Time</label>
              <div className="relative">
                <input required name="preferredDate" type="datetime-local" className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border pl-10" onChange={handleChange} />
                <Clock className="absolute left-3 top-2.5 text-slate-400" size={18} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Consultation</label>
              <textarea required name="reason" rows={4} className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" placeholder="Briefly describe your medical inquiry..." onChange={handleChange}></textarea>
            </div>

            <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-800 border border-blue-100">
              <strong>Note:</strong> This consultation is for informational purposes regarding rare drug sourcing and general interactions. It does not replace your primary care physician.
            </div>

             <div className="flex items-start gap-3 pt-4 border-t border-slate-100">
              <input required type="checkbox" id="terms-consult" className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              <label htmlFor="terms-consult" className="text-sm text-slate-600">
                I agree to the <Link to="/legal/terms" target="_blank" className="text-blue-700 hover:underline">Terms of Use</Link> and <Link to="/legal/privacy" target="_blank" className="text-blue-700 hover:underline">Privacy Policy</Link>.
              </label>
            </div>

            <div className="pt-4">
              <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Schedule Appointment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};