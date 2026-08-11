import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import heroImage from '../assets/about/hero_image.png';

const Hero = () => {
  // Configured Social Links (Modify these here if needed)
  const LINKEDIN_URL = "https://www.linkedin.com/in/v-deepak-4988032b6";

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out'
    });
  }, []);

  return (
    <section id="home" className="relative w-full min-h-screen overflow-hidden bg-[#ff2a2a] flex items-end">
      
      {/* Subtle tech background patterns */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden opacity-[0.05]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
            <pattern id="dots" width="25" height="25" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <rect width="100%" height="100%" fill="url(#dots)" opacity="0.6" />
          
          {/* Faint tech connections */}
          <g stroke="white" strokeWidth="1" strokeDasharray="4,4" opacity="0.5">
            <line x1="10%" y1="20%" x2="25%" y2="35%" />
            <line x1="25%" y1="35%" x2="45%" y2="25%" />
            <line x1="70%" y1="40%" x2="85%" y2="25%" />
            <line x1="85%" y1="25%" x2="95%" y2="45%" />
          </g>
          
          <g fill="white" opacity="0.6">
            <circle cx="10%" cy="20%" r="4" />
            <circle cx="25%" cy="35%" r="4" />
            <circle cx="45%" cy="25%" r="4" />
            <circle cx="70%" cy="40%" r="4" />
            <circle cx="85%" cy="25%" r="4" />
            <circle cx="95%" cy="45%" r="4" />
          </g>
        </svg>
      </div>

      {/* Content Container */}
      <div className="relative z-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-left w-full h-full pt-28 md:pt-16 md:h-screen">
        
        {/* Left Side: Text and Buttons */}
        <div className="flex flex-col items-start text-left max-w-lg lg:max-w-xl w-full pb-12 md:pb-0 md:pr-8 relative z-20">
          
          {/* Main Heading */}
          <h1 
            data-aos="fade-up"
            data-aos-delay="50"
            className="text-white text-4xl sm:text-5xl md:text-6xl mb-5 tracking-tight font-extrabold leading-[1.05]"
          >
            Hi, I’m <br /> 
            <span className="font-extrabold relative text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/95 drop-shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
              V.DEEPAK
            </span>
          </h1>

          {/* Subheading */}
          <p 
            data-aos="fade-up"
            data-aos-delay="200"
            className="text-white/90 text-sm md:text-base lg:text-lg mb-8 max-w-sm md:max-w-md leading-relaxed drop-shadow-sm"
          >
            A motivated CSE student specializing in Artificial Intelligence and Machine Learning. I build intelligent solutions using Python, React, Node.js, and Generative AI.
          </p>

          {/* Buttons */}
          <div 
            data-aos="fade-up"
            data-aos-delay="400"
            className="flex flex-row items-center gap-4 w-full"
          >
            {/* Primary Button */}
            <a 
              href="#projects" 
              className="px-6 py-2.5 md:px-7 md:py-3 text-xs md:text-sm rounded-full bg-white text-black hover:bg-neutral-100 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg inline-block text-center"
            >
              View My Work
            </a>
            
            {/* Secondary Button */}
            <a 
              href="#contact" 
              className="px-6 py-2.5 md:px-7 md:py-3 text-xs md:text-sm rounded-full bg-black/10 border border-white text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-md transform hover:-translate-y-0.5 inline-block text-center"
            >
              Contact Me
            </a>
          </div>

          {/* Social Icons Row */}
          <div 
            data-aos="fade-up"
            data-aos-delay="500"
            className="flex flex-row items-center gap-6 mt-[28px] w-full"
          >
            <a 
              href={LINKEDIN_URL}
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              title="LinkedIn"
              className="text-white/80 hover:text-white transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>

            <a 
              href="mailto:v.deepak332100@gmail.com" 
              aria-label="Email"
              title="Email"
              className="text-white/80 hover:text-white transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </a>

            <a 
              href="tel:+919483272589" 
              aria-label="Phone"
              title="Phone"
              className="text-white/80 hover:text-white transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
            </a>

            <a 
              href="https://github.com/Deepakch0wdary" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="GitHub"
              title="GitHub"
              className="text-white/80 hover:text-white transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Right Side: Image matching original red background design */}
        <div 
          data-aos="fade-up"
          data-aos-delay="300"
          className="w-full md:w-[45%] lg:w-[50%] h-[350px] md:h-full flex items-end justify-center self-end relative z-10"
        >
          {/* Subtle radial studio light/glow behind the portrait to create depth */}
          <div 
            className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[85%] h-[85%] pointer-events-none z-0 filter blur-2xl" 
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(0,0,0,0.22) 50%, transparent 100%)'
            }}
          />
          
          <img 
            src={heroImage} 
            alt="V.DEEPAK" 
            className="w-full h-full max-h-[85vh] object-contain object-bottom select-none pointer-events-none relative z-10"
            style={{
              maskImage: 'radial-gradient(ellipse at bottom, black 90%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(ellipse at bottom, black 90%, transparent 100%)',
              opacity: 1,
              filter: 'none'
            }}
          />
        </div>

      </div>

      {/* Scroll Indicator */}
      <div 
        data-aos="fade-up"
        data-aos-delay="800"
        className="hidden md:block absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none"
      >
        <div className="animate-bounce">
          <svg 
            className="w-5 h-5 text-white opacity-70" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2.5" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>
    </section>
  );
};

export default Hero;