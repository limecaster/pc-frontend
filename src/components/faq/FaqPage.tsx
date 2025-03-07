"use client";

import { useState } from 'react';
import styles from './FaqPage.module.css';

// FAQ data
const faqItems = [
  {
    id: 1,
    question: "What services do you offer?",
    answer: "We offer a wide range of computer services including hardware repairs, software installation, network setup, and IT consulting."
  },
  {
    id: 2,
    question: "How long does a typical repair take?",
    answer: "Most repairs are completed within 1-3 business days, depending on the issue complexity and parts availability."
  },
  {
    id: 3,
    question: "Do you offer on-site support?",
    answer: "Yes, we offer on-site support for businesses and residential customers within a 25-mile radius."
  },
  {
    id: 4,
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, bank transfers, and cash for in-store services."
  },
  {
    id: 5,
    question: "Do you offer any warranty on repairs?",
    answer: "Yes, all our repairs come with a 90-day warranty on both parts and labor."
  },
];

const FaqPage = () => {
  const [openItem, setOpenItem] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const toggleAccordion = (id: number) => {
    setOpenItem(openItem === id ? null : id);
  };
  
  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement your email sending logic here
    console.log("Form submitted:", contactForm);
    
    // Reset form and show success message
    setContactForm({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
    setFormSubmitted(true);
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      setFormSubmitted(false);
    }, 5000);
  };

  return (
    <div className='bg-gray-100 text-gray-800'>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-10">Frequently Asked Questions</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* FAQ Column */}
        <div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Common Questions</h2>
            
            <div className="space-y-3">
              {faqItems.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-md overflow-hidden">
                  <button 
                    className="w-full text-left bg-gray-50 hover:bg-gray-100 p-4 flex justify-between items-center focus:outline-none"
                    onClick={() => toggleAccordion(item.id)}
                    aria-expanded={openItem === item.id}
                  >
                    <span className="font-medium">{item.question}</span>
                    <span className="text-xl font-bold">{openItem === item.id ? '−' : '+'}</span>
                  </button>
                  
                  {openItem === item.id && (
                    <div className="p-4 border-t border-gray-200 bg-white">
                      <p className="text-gray-700">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Form Column */}
        <div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Still Have Questions?</h2>
            <p className="text-gray-600 mb-6">
              Send us a message and we'll get back to you as soon as possible.
            </p>

            {formSubmitted && (
              <div className="bg-green-100 text-green-800 p-4 rounded-md mb-4">
                <p>Thank you for your message! We'll respond shortly.</p>
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Your Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={contactForm.name}
                  onChange={handleContactChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={contactForm.email}
                  onChange={handleContactChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">Subject</label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={contactForm.subject}
                  onChange={handleContactChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Your Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={contactForm.message}
                  onChange={handleContactChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  required
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-300"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default FaqPage;
