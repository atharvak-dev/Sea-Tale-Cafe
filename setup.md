# Sea Tale Restaurant Setup Guide

## 1. Install Dependencies
```bash
npm install
```

## 2. Supabase Database Setup

### Step 1: Go to your Supabase project dashboard
- URL: https://supabase.com/dashboard/project/pzbwb8iocccp7im-dujlkg-kg2rhm55

### Step 2: Run the database schema
1. Go to SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `supabase-schema.sql`
3. Click "Run" to create all tables and policies

### Step 3: Verify tables created
Check that these tables exist:
- `dishes`
- `orders` 
- `tables`
- `tax_config`
- `system_config`

## 3. Start Development Server
```bash
npm run dev
```

## 4. Access the Application
- **Home**: http://localhost:3000
- **Customer Menu**: http://localhost:3000/customer
- **Staff Login**: http://localhost:3000/receptionist/login

## 5. First Time Setup

### Register as Receptionist:
1. Go to http://localhost:3000/receptionist/login
2. Enter your mobile number
3. You'll be registered as the first receptionist
4. Use OTP: `1234` (mock implementation)

### Add Sample Data:
1. Login as receptionist
2. Go to "Dishes" tab and add some dishes
3. Go to "Tables" tab and add tables (T1, T2, etc.)
4. QR codes will be generated automatically

## 6. Test the System

### Customer Flow:
1. Scan QR code or visit customer page
2. Add dishes to cart
3. Enter mobile number and place order

### Receptionist Flow:
1. View pending orders
2. Remove dishes if needed
3. Configure taxes in settings
4. Approve orders and send bills

## Troubleshooting

If you get errors:
1. Check `.env.local` has correct Supabase credentials
2. Ensure database schema is properly executed
3. Verify all npm packages are installed
4. Check browser console for any JavaScript errors