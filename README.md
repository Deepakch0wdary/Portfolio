# V.DEEPAK — Personal Portfolio

A modern, responsive portfolio website built with React, Vite, and Tailwind CSS, featuring serverless contact form integration with real-time **Twilio WhatsApp** and **Resend Email** notifications.

## Features

- **Hero Section**: High-impact editorial design with customized portrait blending, background tech grid textures, and quick-access social links.
- **Projects & Experience**: Showcase of AI, Machine Learning, and Full-Stack development projects.
- **Contact Form (Reach Us)**: Serverless contact endpoint (`/api/contact`) with:
  - Parallel **Twilio WhatsApp** alert dispatch to mobile.
  - Parallel **Resend Email** notification dispatch to inbox.
  - Rate limiting, honeypot spam protection, and input sanitization.
- **Resume Viewer**: Direct browser PDF viewer integration.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS v4, Framer Motion, AOS
- **Backend / Serverless**: Vercel Serverless Functions, Twilio Node SDK, Resend Node SDK

## Setup & Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Deepakch0wdary/Portfolio.git
   cd Portfolio
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local` and add your API credentials:
   ```env
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
   MY_WHATSAPP_NUMBER=whatsapp:+919483272589

   RESEND_API_KEY=re_your_resend_api_key
   EMAIL_FROM=onboarding@resend.dev
   CONTACT_EMAIL=v.deepak332100@gmail.com
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

5. **Build for Production**:
   ```bash
   npm run build
   ```
