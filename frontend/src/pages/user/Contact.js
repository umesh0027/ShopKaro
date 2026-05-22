import React, { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend, FiClock } from 'react-icons/fi';
import { contactAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactAPI.submit(form);
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      toast.success('Message sent successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally { setLoading(false); }
  };

  return (
    <div className="pt-20 pb-16">
      {/* Hero */}
      <div className="bg-gradient-to-br from-pink-200 to-yellow-500 text-white py-16">
        <div className="page-container text-center">
          <h1 className="font-display text-4xl font-bold mb-3">Get in Touch</h1>
          <p className="text-primary-200">We'd love to hear from you. Send us a message!</p>
        </div>
      </div>

      <div className="page-container py-16">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Contact Info */}
          <div className="space-y-6">
            <h2 className="font-display text-xl font-bold text-gray-900">Contact Information</h2>
            {[
              { icon: FiMapPin, title: 'Address', lines: ['123 Commerce Street', 'Connaught Place, New Delhi - 110001'] },
              { icon: FiPhone, title: 'Phone', lines: ['+91 12345 67890', '+91 98765 43210'] },
              { icon: FiMail, title: 'Email', lines: ['support@shopkaro.com', 'orders@shopkaro.com'] },
              { icon: FiClock, title: 'Working Hours', lines: ['Mon–Sat: 9AM – 8PM', 'Sun: 10AM – 6PM'] },
            ].map(item => (
              <div key={item.title} className="flex gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-yellow-500 rounded-xl flex items-center justify-center shrink-0">
                  <item.icon className="text-white" size={18} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{item.title}</p>
                  {item.lines.map((l, i) => <p key={i} className="text-sm text-gray-600">{l}</p>)}
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {submitted ? (
              <div className="card text-center py-16 animate-fade-in">
                <p className="text-6xl mb-4">✅</p>
                <h3 className="font-display text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-gray-500 mb-6">We'll get back to you within 24 hours.</p>
                <button onClick={() => setSubmitted(false)} className="btn-primary">Send Another Message</button>
              </div>
            ) : (
              <div className="card">
                <h2 className="font-display text-xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
                      <input required value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="Your name" className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                      <input type="email" required value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} placeholder="your@email.com" className="input-field" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                      <input value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} placeholder="Your phone number" className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject *</label>
                      <select required value={form.subject} onChange={e => setForm(p => ({...p, subject: e.target.value}))} className="input-field">
                        <option value="">Select subject</option>
                        {['Order Issue', 'Payment Problem', 'Product Query', 'Return/Refund', 'Account Issue', 'Other'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Message *</label>
                    <textarea required rows={5} value={form.message} onChange={e => setForm(p => ({...p, message: e.target.value}))} placeholder="Describe your issue or question..." className="input-field resize-none" />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSend size={16} />}
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
