# Quick Setup: Email Notifications with Resend

## What's Happening
When someone submits an order, Supabase will automatically send an email to `mjolnariclan@gmail.com` with all the order details using Resend.

## 3-Step Setup

### Step 1: Deploy Edge Function (Terminal)

```bash
# Navigate to project
cd /workspaces/kloakinvoice

# Install Supabase CLI (if not already installed)
npm install -g supabase
# or on Mac: brew install supabase/tap/supabase

# Login to Supabase
supabase login

# Link your project (when prompted, use your password)
supabase link --project-ref dhzrhgyjpqotoujfwdwl

# Add your Resend API key as a secret
supabase secrets set RESEND_API_KEY=re_dAUypSYf_85S3smTvFwExL4ikM5Jg5VF1

# Deploy the email function
supabase functions deploy send-order-email
```

**Expected output:** `✓ Function send-order-email deployed successfully`

---

### Step 2: Create Database Trigger (Supabase Console)

1. Go to: https://app.supabase.com/project/dhzrhgyjpqotoujfwdwl/sql/new
2. Copy and paste **all** the SQL from: `supabase/trigger-email-setup.sql`
3. Click "Run" button

**What this does:**
- Enables the `pg_net` extension (lets database make HTTP requests)
- Creates a trigger function that fires when an order is inserted
- Calls your Edge Function with the order data

---

### Step 3: Test It!

1. Go to your order form: http://localhost:8000/order.html
2. Fill out and submit an order
3. Check `mjolnariclan@gmail.com` for the email

---

## Troubleshooting

**"Function not found" error in logs?**
- Make sure step 1 completed with ✓
- Check that function name is `send-order-email` (with hyphen)

**No email received after order?**
- Check Supabase function logs:
  - Go to: https://app.supabase.com/project/dhzrhgyjpqotoujfwdwl/functions
  - Click `send-order-email` → Logs tab
  - Look for errors

**"Extension not found" error in SQL?**
- Run this in SQL editor first:
  ```sql
  CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
  ```

---

## Notes

- The email sender shows as `Kloak 3D Prints <onboarding@resend.dev>`
- Replies go to your customer's email (set via `reply_to`)
- Each order creates one email automatically
- API key is stored securely in Supabase secrets (not in code!)
