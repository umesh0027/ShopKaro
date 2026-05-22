// About.js
import React from 'react';
import { FiTarget, FiHeart, FiUsers, FiAward } from 'react-icons/fi';

const About = () => (
  <div className="pt-20 pb-16">
    {/* Hero */}
    <div className="bg-gradient-to-br from-pink-200 to-yellow-500 text-white py-20">
      <div className="page-container text-center">
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">About ShopKaro</h1>
        <p className="text-primary-200 text-lg max-w-2xl mx-auto">India's trusted online shopping destination, bringing quality products to your doorstep since 2020.</p>
      </div>
    </div>
    <div className="page-container py-16">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        {[
          { value: '10,000+', label: 'Products' },
          { value: '50,000+', label: 'Happy Customers' },
          { value: '500+', label: 'Brands' },
          { value: '4.8/5', label: 'Avg Rating' },
        ].map(stat => (
          <div key={stat.label} className="card text-center">
            <p className="font-display text-3xl font-bold text-accent-600">{stat.value}</p>
            <p className="text-gray-600 text-sm mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
      {/* Mission */}
      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 className="font-display text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed mb-4">At ShopKaro, we believe everyone deserves access to quality products at fair prices. We've built a platform that connects customers with the best products from trusted sellers across India.</p>
          <p className="text-gray-600 leading-relaxed">Our team works tirelessly to ensure every product on our platform meets our strict quality standards, and every customer experience is seamless and satisfying.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: FiTarget, title: 'Our Goal', desc: 'Make online shopping accessible, affordable, and enjoyable for everyone in India.' },
            { icon: FiHeart, title: 'Our Values', desc: 'Trust, transparency, and customer satisfaction are at the core of everything we do.' },
            { icon: FiUsers, title: 'Our Team', desc: 'A passionate team of 50+ professionals dedicated to improving your shopping experience.' },
            { icon: FiAward, title: 'Our Promise', desc: 'Genuine products, secure payments, fast delivery, and easy returns — always.' },
          ].map(item => (
            <div key={item.title} className="card">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-yellow-500 rounded-xl flex items-center justify-center mb-3">
                <item.icon className="text-white" size={18} />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default About;
