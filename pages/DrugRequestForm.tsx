import React, { useState } from 'react';
import { StorageService } from '../services/storageService';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle } from 'lucide-react';

export const DrugRequestForm: React.FC = () => {
  const [formData, setFormData] = useState({
    requesterName: '',
    requesterType: 'PATIENT',
    contactEmail: '',
    drugName: '',
    quantity: '',
    urgency: 'NORMAL',
    notes: '',
    agreedToTerms: false
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.addRequest(formData as any);
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Request Received</h2>
          <p className="text-slate-600 mb-8">
            Your request for <strong>{formData.drugName}</strong> has been securely logged. Our pharmacists will review it shortly.
          </p>
          <Link to="/" className="text-red-700 font-medium hover:underline">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-red-700 px-8 py-6">
            <h1 className="text-2xl font-bold text-white">Drug Request Form</h1>
            <p className="text-red-100 mt-1">Submit a request for rare or hard-to-find medication.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Requester Name</label>
                <input required name="requesterName" type="text" className="w-full rounded-md border-slate-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border" onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select name="requesterType" className="w-full rounded-md border-slate-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border" onChange={handleChange}>
                  <option value="PATIENT">Patient</option>
                  <option value="CLINIC">Clinic/Hospital</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
              <input required name="contactEmail" type="email" className="w-full rounded-md border-slate-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border" onChange={handleChange} />
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <AlertCircle size={16} /> Medication Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Drug Name (Generic/Brand)</label>
                  <input required name="drugName" type="text" className="w-full rounded-md border-slate-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border" onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantity/Dosage</label>
                  <input required name="quantity" type="text" placeholder="e.g. 30 tablets, 10mg" className="w-full rounded-md border-slate-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border" onChange={handleChange} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Urgency</label>
                <select name="urgency" className="w-full rounded-md border-slate-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border" onChange={handleChange}>
                  <option value="NORMAL">Normal (Standard Delivery)</option>
                  <option value="HIGH">High (Urgent Need)</option>
                  <option value="CRITICAL">Critical (Life Sustaining)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Additional Notes / Clinical Context</label>
              <textarea name="notes" rows={4} className="w-full rounded-md border-slate-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border" placeholder="Please provide any relevant details that aid in sourcing..." onChange={handleChange}></textarea>
            </div>

            <div className="flex items-start gap-3 pt-4 border-t border-slate-100">
              <input required type="checkbox" id="terms" className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" />
              <label htmlFor="terms" className="text-sm text-slate-600">
                I agree to the <Link to="/legal/terms" target="_blank" className="text-red-700 hover:underline">Terms of Use</Link> and <Link to="/legal/privacy" target="_blank" className="text-red-700 hover:underline">Privacy Policy</Link>. I understand that EasygoPharm is a logistics facilitator and this request does not constitute a doctor's prescription.
              </label>
            </div>

            <div className="pt-4">
              <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900">
                Submit Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};