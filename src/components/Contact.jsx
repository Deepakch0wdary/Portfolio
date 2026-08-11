import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const Contact = () => {
  const ref = useRef(null);
  
  // React Form State tracking
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    message: '',
    permission: false,
    website: '' // Honeypot field
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('idle'); // 'idle' | 'success' | 'error'
  const [statusMessage, setStatusMessage] = useState('');

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  // Parallax translation for the big text
  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "30%"]);

  // Handle input changes dynamically
  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    
    // Enforce digit-only inputs and max 10 character length for mobile
    if (id === 'mobile') {
      const digitsOnly = value.replace(/\D/g, '');
      setFormData((prev) => ({
        ...prev,
        mobile: digitsOnly.slice(0, 10)
      }));
      if (errors.mobile) {
        setErrors((prev) => ({ ...prev, mobile: '' }));
      }
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));

    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: '' }));
    }
  };

  // Checkbox keyboard event handler
  const handleCheckboxKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setFormData(prev => ({ ...prev, permission: !prev.permission }));
      if (errors.permission) {
        setErrors(prev => ({ ...prev, permission: '' }));
      }
    }
  };

  // Perform client-side validation
  const validateForm = () => {
    const newErrors = {};

    const trimmedFirstName = formData.firstName.trim();
    if (!trimmedFirstName) {
      newErrors.firstName = "First Name is required.";
    } else if (trimmedFirstName.length < 2) {
      newErrors.firstName = "First Name must be at least 2 characters.";
    }

    const trimmedLastName = formData.lastName.trim();
    if (!trimmedLastName) {
      newErrors.lastName = "Last Name is required.";
    } else if (trimmedLastName.length < 2) {
      newErrors.lastName = "Last Name must be at least 2 characters.";
    }

    const trimmedEmail = formData.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.mobile) {
      newErrors.mobile = "Mobile number is required.";
    } else if (formData.mobile.length !== 10) {
      newErrors.mobile = "Mobile number must be exactly 10 digits.";
    }

    const trimmedMessage = formData.message.trim();
    if (!trimmedMessage) {
      newErrors.message = "Message is required.";
    } else if (trimmedMessage.length < 5) {
      newErrors.message = "Message must be at least 5 characters.";
    } else if (trimmedMessage.length > 2000) {
      newErrors.message = "Message cannot exceed 2000 characters.";
    }

    if (!formData.permission) {
      newErrors.permission = "You must give permission to contact you.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission logic
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validations
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setStatusMessage('');

    try {
      let response;
      try {
        response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email.trim(),
            mobile: formData.mobile,
            message: formData.message.trim(),
            permission: formData.permission,
            website: formData.website // Honeypot pass-through
          })
        });
      } catch (fetchErr) {
        console.error("Contact API network connection failed:", fetchErr);
        setSubmitStatus('error');
        setStatusMessage("Unable to connect. Please check your internet connection and try again.");
        setIsSubmitting(false);
        return;
      }

      // Safely parse JSON response
      let result = null;
      try {
        const text = await response.text();
        result = text ? JSON.parse(text) : {};
      } catch (parseErr) {
        console.error("Failed to parse API response as JSON:", parseErr);
        result = { success: false, message: "Invalid response from server" };
      }

      // Development logging
      console.log(`Contact API URL: /api/contact\nResponse status: ${response.status}\nResponse body:`, result);

      if (response.ok && result?.success) {
        setSubmitStatus('success');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          mobile: '',
          message: '',
          permission: false,
          website: ''
        });
        setErrors({});
      } else {
        setSubmitStatus('error');
        if (response.status === 429) {
          setStatusMessage("Too many requests. Please try again later.");
        } else if (response.status === 400) {
          setStatusMessage("Please check your details and try again.");
        } else {
          // Server / Twilio / Resend Error
          setStatusMessage("Unable to send your message right now. Please try again.");
        }
      }
    } catch (unexpectedError) {
      console.error("Unexpected form submission error:", unexpectedError);
      setSubmitStatus('error');
      setStatusMessage("Unable to send your message right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section ref={ref} id="contact" className="bg-[#0a0a0a] w-full min-h-screen relative overflow-hidden flex items-end pt-32 pb-0 md:pb-0 border-t border-gray-900">
      
      {/* Huge Background Text */}
      <motion.div 
        style={{ y }}
        className="absolute top-0 left-0 w-full h-full flex flex-col justify-start items-center overflow-hidden pointer-events-none z-0 pt-16 md:pt-12"
      >
        <h1 
          className="text-[15vw] md:text-[12vw] leading-[0.8] text-white/15 uppercase tracking-tighter select-none origin-top font-black"
        >
          Contact
        </h1>
      </motion.div>

      {/* Form Card Overlay */}
      <div className="relative z-10 w-full flex justify-end items-end">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-[#ff2a2a] w-full md:w-[85%] lg:w-[75%] p-8 md:p-16 text-white flex flex-col justify-between"
        >
          <div className="text-xs tracking-[0.2em] mb-12 md:mb-20 uppercase opacity-90 font-medium">
            Reach Us
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-12 md:gap-16 w-full" noValidate autoComplete="off">
            
            {/* Hidden Spam protection honeypot */}
            <div style={{ display: 'none' }} aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input 
                type="text" 
                id="website" 
                name="website" 
                value={formData.website} 
                onChange={handleChange} 
                tabIndex={-1} 
                autoComplete="off" 
              />
            </div>

            <div className="flex flex-col md:flex-row gap-12 md:gap-20 w-full">
              
              {/* Left Column */}
              <div className="flex-1 flex flex-col gap-10">
                <div className="relative">
                  <label htmlFor="firstName" className="sr-only">First Name</label>
                  <input 
                    type="text" 
                    id="firstName" 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First Name" 
                    required
                    autoComplete="off"
                    aria-invalid={errors.firstName ? "true" : "false"}
                    aria-describedby={errors.firstName ? "firstName-error" : undefined}
                    className="w-full bg-transparent border-b border-white/40 pb-3 text-lg text-white focus:outline-none focus:border-white transition-colors placeholder-white/80 rounded-none shadow-none"
                  />
                  {errors.firstName && (
                    <span id="firstName-error" className="text-xs text-white/90 mt-1 block font-medium" role="alert">
                      {errors.firstName}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <label htmlFor="lastName" className="sr-only">Last Name</label>
                  <input 
                    type="text" 
                    id="lastName" 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last Name" 
                    required
                    autoComplete="off"
                    aria-invalid={errors.lastName ? "true" : "false"}
                    aria-describedby={errors.lastName ? "lastName-error" : undefined}
                    className="w-full bg-transparent border-b border-white/40 pb-3 text-lg text-white focus:outline-none focus:border-white transition-colors placeholder-white/80 rounded-none shadow-none"
                  />
                  {errors.lastName && (
                    <span id="lastName-error" className="text-xs text-white/90 mt-1 block font-medium" role="alert">
                      {errors.lastName}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <label htmlFor="email" className="sr-only">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email" 
                    required
                    autoComplete="off"
                    aria-invalid={errors.email ? "true" : "false"}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className="w-full bg-transparent border-b border-white/40 pb-3 text-lg text-white focus:outline-none focus:border-white transition-colors placeholder-white/80 rounded-none shadow-none"
                  />
                  {errors.email && (
                    <span id="email-error" className="text-xs text-white/90 mt-1 block font-medium" role="alert">
                      {errors.email}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <label htmlFor="mobile" className="sr-only">Mobile No (10 digits)</label>
                  <input 
                    type="tel" 
                    id="mobile" 
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="Mobile No (10 digits)" 
                    maxLength="10"
                    required
                    autoComplete="off"
                    aria-invalid={errors.mobile ? "true" : "false"}
                    aria-describedby={errors.mobile ? "mobile-error" : undefined}
                    className="w-full bg-transparent border-b border-white/40 pb-3 text-lg text-white focus:outline-none focus:border-white transition-colors placeholder-white/80 rounded-none shadow-none"
                  />
                  {errors.mobile && (
                    <span id="mobile-error" className="text-xs text-white/90 mt-1 block font-medium" role="alert">
                      {errors.mobile}
                    </span>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="flex-1 flex flex-col">
                <div className="relative h-full flex flex-col">
                  <label htmlFor="message" className="sr-only">Type your message here</label>
                  <textarea 
                    id="message" 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Type your message here" 
                    required
                    autoComplete="off"
                    aria-invalid={errors.message ? "true" : "false"}
                    aria-describedby={errors.message ? "message-error" : undefined}
                    className="w-full h-full min-h-[120px] bg-transparent border-b border-white/40 pb-3 text-lg text-white focus:outline-none focus:border-white transition-colors placeholder-white/80 resize-none rounded-none shadow-none"
                  ></textarea>
                  {errors.message && (
                    <span id="message-error" className="text-xs text-white/90 mt-1 block font-medium" role="alert">
                      {errors.message}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="flex flex-col md:flex-row gap-12 mt-4">
              {/* Left text */}
              <div className="flex-1 flex flex-col gap-2">
                <div 
                  className="flex items-start gap-4 text-sm text-white/90 cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-white focus:outline-none rounded"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, permission: !prev.permission }));
                    if (errors.permission) {
                      setErrors(prev => ({ ...prev, permission: '' }));
                    }
                  }}
                  role="checkbox"
                  aria-checked={formData.permission}
                  tabIndex={0}
                  onKeyDown={handleCheckboxKeyDown}
                >
                  <div className={`mt-0.5 w-6 h-6 md:w-5 md:h-5 rounded-sm border-2 flex items-center justify-center shrink-0 transition-colors ${formData.permission ? 'bg-white border-white' : 'border-white/60 bg-transparent'}`}>
                    {formData.permission && (
                      <svg className="w-4 h-4 text-[#ff2a2a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="max-w-[280px] leading-snug pointer-events-none">
                    I give permission to contact me at this email address.
                  </span>
                </div>
                {errors.permission && (
                  <span className="text-xs text-white/90 mt-1 block font-medium" role="alert">
                    {errors.permission}
                  </span>
                )}
              </div>

              {/* Right text & button */}
              <div className="flex-1 flex flex-col gap-8 text-xs text-white/70 justify-end">
                <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center gap-6 h-full">
                  
                  {/* Status Feedback Messages */}
                  {submitStatus === 'success' && (
                    <div className="text-sm font-semibold text-white bg-white/10 px-4 py-2 rounded border border-white/20 self-start sm:self-auto" role="status">
                      ✓ Message sent successfully
                    </div>
                  )}
                  {submitStatus === 'error' && (
                    <div className="text-sm font-semibold text-white bg-black/20 px-4 py-2 rounded border border-white/20 self-start sm:self-auto" role="alert">
                      {statusMessage}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={`px-8 py-3 rounded-full border border-white/40 text-white flex items-center justify-center gap-3 transition-all duration-300 group whitespace-nowrap self-start sm:self-auto ${
                      isSubmitting ? 'opacity-65 cursor-not-allowed' : 'hover:bg-white hover:text-[#ff2a2a]'
                    }`}
                  >
                    {isSubmitting ? 'Sending...' : 'Send'}
                    {!isSubmitting && (
                      <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>

        </motion.div>
      </div>
    </section>
  );
};

export default Contact;