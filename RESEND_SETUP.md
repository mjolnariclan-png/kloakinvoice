# Resend Email Setup Guide

## Overview
This guide walks you through setting up Resend email notifications for order submissions using Supabase Edge Functions.

## Step 1: Deploy the Edge Function

1. Open terminal and navigate to your project:
   ```bash
   cd /workspaces/kloakinvoice
   ```

2. Make sure you have Supabase CLI installed:
   ```bash
   brew install supabase/tap/supabase
   # or
   npm install -g supabase
   ```

3. Log in to Supabase (if not already):
   ```bash
   supabase login
   ```

4. Link your project:
   ```bash
   supabase link --project-ref dhzrhgyjpqotoujfwdwl
   ```

5. Set the Resend API key as a secret:
   ```bash
   supabase secrets set RESEND_API_KEY=re_dAUypSYf_85S3smTvFwExL4ikM5Jg5VF1
   ```

6. Deploy the function:
   ```bash
   supabase functions deploy send-order-email
   ```

## Step 2: Create Database Trigger (in Supabase SQL Editor)

Go to your Supabase project → SQL Editor and run this SQL:

```sql
-- Create the trigger function
CREATE OR REPLACE FUNCTION public.trigger_send_order_email()
RETURNS TRIGGER AS $$
DECLARE
  function_url TEXT;
BEGIN
  function_url := 'https://dhzrhgyjpqotoujfwdwl.supabase.co/functions/v1/send-order-email';
  
  -- Make HTTP POST request to the edge function
  PERFORM
    net.http_post(
      function_url,
      jsonb_build_object(
        'id', NEW.id,
        'name', NEW.name,
        'email', NEW.email,
        'phone', NEW.phone,
        'service', NEW.service,
        'deadline', NEW.deadline,
        'notes', NEW.notes,
        'venmo_handle', NEW.venmo_handle,
        'source_link', NEW.source_link,
        'selected_colors', NEW.selected_colors,
        'file_names', NEW.file_names
      ),
      'application/json'
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS on_order_created ON public.orders;

-- Create the trigger on orders table
CREATE TRIGGER on_order_created
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_send_order_email();

-- Enable pg_net extension (needed for HTTP requests)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA net TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION net.http_post TO postgres, anon, authenticated, service_role;
```

## Step 3: Verify Everything Works

1. Test by submitting an order through your order form
2. Check your email at mjolnariclan@gmail.com for the order notification
3. The email will include:
   - Customer name, email, phone
   - Service type and deadline
   - Colors selected
   - Files uploaded
   - Customer notes
   - Source link (if provided)

## Troubleshooting

**Edge function didn't deploy?**
- Check that Supabase CLI is installed correctly
- Make sure you're logged in: `supabase projects list`

**Email not sending?**
- Verify the Resend API key is set as a secret in Supabase
- Check Supabase function logs: Go to Functions → send-order-email → Logs
- Ensure pg_net extension is enabled in your database

**Trigger not firing?**
- Make sure the trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'on_order_created';`
- Check database logs in Supabase console

## Email Sender Note

Currently using Resend's default domain (`onboarding@resend.dev`). To send from your own domain:
1. Add your domain to Resend (https://resend.com/domains)
2. Update the `from` field in `supabase/functions/send-order-email/index.ts`
3. Redeploy: `supabase functions deploy send-order-email`
