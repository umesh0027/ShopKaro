// TermsConditions.js
import React from 'react';

const sections = [
  { title: '1. Acceptance of Terms', content: 'By accessing and using ShopKaro, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.' },
  { title: '2. Account Registration', content: 'You must register for an account to place orders. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.' },
  { title: '3. Products & Pricing', content: 'We strive to provide accurate product descriptions and pricing. Prices are subject to change without notice. We reserve the right to refuse or cancel orders at any time for any reason.' },
  { title: '4. Payment', content: 'We accept payments via Razorpay (Credit/Debit Cards, UPI, Net Banking) and Cash on Delivery. All online transactions are secured with 256-bit SSL encryption.' },
  { title: '5. Shipping & Delivery', content: 'We deliver across India. Estimated delivery is 3-7 business days. Free shipping on orders above ₹499. Delivery times may vary based on location.' },
  { title: '6. Returns & Refunds', content: 'We offer a 7-day return policy for most products. Items must be unused and in original packaging. Refunds are processed within 5-7 business days after receiving the returned item.' },
  { title: '7. Privacy Policy', content: 'We collect and use your personal information to provide and improve our services. We do not sell your personal information to third parties. Please review our full Privacy Policy for more details.' },
  { title: '8. Intellectual Property', content: 'All content on ShopKaro, including text, images, logos, and software, is the property of ShopKaro and protected by applicable intellectual property laws.' },
  { title: '9. Limitation of Liability', content: 'ShopKaro shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services or products purchased.' },
  { title: '10. Contact Us', content: 'For any questions regarding these Terms and Conditions, please contact us at legal@shopkaro.com or call us at +91 12345 67890.' },
];

const TermsConditions = () => (
  <div className="pt-20 pb-16">
    <div className="bg-gradient-to-br from-pink-500 to-yellow-500 text-white py-16">
      <div className="page-container text-center">
        <h1 className="font-display text-4xl font-bold mb-3">Terms & Conditions</h1>
        <p className="text-primary-200">Last updated: January 2024</p>
      </div>
    </div>
    <div className="page-container py-12 max-w-4xl">
      <div className="card">
        <p className="text-gray-600 mb-8 leading-relaxed border-l-4 border-primary-500 pl-4 bg-primary-50 py-3 pr-3 rounded-r-xl">
          Please read these Terms and Conditions carefully before using ShopKaro. By using our platform, you agree to comply with and be bound by these terms.
        </p>
        <div className="space-y-8">
          {sections.map(s => (
            <div key={s.title}>
              <h2 className="font-display text-lg font-bold text-gray-900 mb-2">{s.title}</h2>
              <p className="text-gray-600 leading-relaxed text-sm">{s.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default TermsConditions;
