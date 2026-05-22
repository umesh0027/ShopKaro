import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiYoutube } from 'react-icons/fi';
import { MdStore } from 'react-icons/md';
import { BsShop } from 'react-icons/bs';
import { HiSparkles } from 'react-icons/hi2';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="page-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-pink-400 to-yellow-500 rounded-xl flex items-center justify-center">
                <BsShop className="text-white text-lg" />
              </div>
               <span className="font-display font-bold text-2xl text-white">
              Shop<span className="text-accent-600 text-xl font-bold">Karo</span>
            </span>
              {/* <span className="font-display font-bold text-xl text-white">Shop<span className="text-primary-400">Karo</span></span> */}
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              India's trusted online shopping destination. Quality products, great prices, and fast delivery right to your doorstep.
            </p>
            <div className="flex gap-3">
              {[FiFacebook, FiTwitter, FiInstagram, FiYoutube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-gradient-to-br from-pink-400 to-yellow-500 flex items-center justify-center transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { to: '/', label: 'Home' },
                { to: '/products', label: 'All Products' },
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact' },
                { to: '/track-order', label: 'Track Order' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-gray-400 hover:text-white transition-colors hover:pl-1 inline-block transition-all duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">Customer Service</h3>
            <ul className="space-y-3">
              {[
                { to: '/my-orders', label: 'My Orders' },
                { to: '/profile', label: 'My Account' },
                { to: '/wishlist', label: 'Wishlist' },
                { to: '/terms', label: 'Terms & Conditions' },
                { to: '/contact', label: 'Help & Support' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-gray-400 hover:text-white transition-colors hover:pl-1 inline-block transition-all duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">Get in Touch</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <FiMapPin size={16} className="text-accent-400 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-400">123 Commerce Street, Connaught Place, New Delhi - 110001</span>
              </li>
              <li className="flex items-center gap-3">
                <FiPhone size={16} className="text-accent-400 shrink-0" />
                <a href="tel:+911234567890" className="text-sm text-gray-400 hover:text-white transition-colors">+91 12345 67890</a>
              </li>
              <li className="flex items-center gap-3">
                <FiMail size={16} className="text-accent-400 shrink-0" />
                <a href="mailto:support@shopkaro.com" className="text-sm text-gray-400 hover:text-white transition-colors">support@shopkaro.com</a>
              </li>
            </ul>

            {/* Payment Logos */}
            <div className="mt-6">
              <p className="text-xs text-gray-500 mb-3">Secure Payments</p>
              <div className="flex gap-2 flex-wrap">
                {['Visa', 'Mastercard', 'UPI', 'Razorpay'].map(p => (
                  <span key={p} className="px-2.5 py-1 bg-gray-800 rounded-lg text-xs text-gray-400 border border-gray-700">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} ShopKaro. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/terms" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Terms</Link>
            <Link to="/terms" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
