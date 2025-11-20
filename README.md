# 🌊 Sea Tale Restaurant Management System

A scalable, mobile-first restaurant management system built with modern web technologies and maritime branding.

## Tech Stack

- **Frontend**: Next.js 14 (React) with TypeScript
- **Styling**: Tailwind CSS with maritime theme
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **QR Codes**: qrcode library

## Features

### Customer Interface (Mobile-First)
- 📱 Responsive dish catalog with maritime design
- 🛒 Intuitive cart and ordering system
- 🌶️ Spice level indicators and dynamic tags
- 📞 Quick mobile registration
- 🔗 QR code table linking

### Receptionist Interface (Minimal UI)
- 🍽️ CRUD operations for dish management
- 📋 Real-time order tracking and approval
- 🏷️ Dynamic tag assignment (Best Seller, Chef Recommended)
- 📱 QR code generation for tables
- 💰 Billing and payment approval

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Supabase**:
   - Create a Supabase project
   - Run the SQL schema from `supabase-schema.sql`
   - Update `.env.local` with your Supabase credentials

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   - Landing page: `http://localhost:3000`
   - Customer interface: `http://localhost:3000/customer`
   - Staff portal: `http://localhost:3000/receptionist`

## Architecture Principles

- **Customer Obsession**: Mobile-first design for seamless customer experience
- **Bias for Action**: Minimal receptionist UI for quick staff onboarding
- **Ownership**: Decoupled interfaces for independent scaling
- **Deliver Results**: End-to-end order flow with real-time updates

## Maritime Branding

The Sea Tale theme includes:
- Ocean color palette (blues, corals)
- Nautical typography (Merriweather serif)
- Wave patterns and maritime icons
- Responsive design optimized for mobile devices