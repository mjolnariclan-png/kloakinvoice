-- ============================================
-- EMAIL TRIGGER SETUP FOR RESEND
-- ============================================
-- Run this in your Supabase SQL Editor

-- First, enable the pg_net extension (needed for HTTP requests from database)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create the trigger function that will call our Edge Function
CREATE OR REPLACE FUNCTION public.trigger_send_order_email()
RETURNS TRIGGER AS $$
DECLARE
  function_url TEXT;
  headers JSONB;
  payload JSONB;
BEGIN
  -- Supabase function URL
  function_url := 'https://dhzrhgyjpqotoujfwdwl.supabase.co/functions/v1/send-order-email';
  
  -- Prepare headers with authorization
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer ' || current_setting('request.jwt.claim.sub', true)
  );
  
  -- Prepare order data as JSON object (not nested in another field)
  payload := jsonb_build_object(
    'id', NEW.id::TEXT,
    'name', NEW.name::TEXT,
    'email', NEW.email::TEXT,
    'phone', COALESCE(NEW.phone::TEXT, ''),
    'service', NEW.service::TEXT,
    'deadline', COALESCE(NEW.deadline::TEXT, ''),
    'notes', COALESCE(NEW.notes::TEXT, ''),
    'venmo_handle', COALESCE(NEW.venmo_handle::TEXT, ''),
    'source_link', COALESCE(NEW.source_link::TEXT, ''),
    'selected_colors', COALESCE(NEW.selected_colors::TEXT[], ARRAY[]::TEXT[]),
    'file_names', COALESCE(NEW.file_names::TEXT[], ARRAY[]::TEXT[])
  );
  
  -- Make async HTTP POST request to edge function
  PERFORM net.http_post(
    function_url,
    payload,
    headers
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_order_created ON public.orders;

-- Create trigger on INSERT
CREATE TRIGGER on_order_created
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_send_order_email();

-- Verify the trigger is created
-- SELECT * FROM pg_trigger WHERE tgname = 'on_order_created';
