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
  
  -- Prepare headers
  headers := jsonb_build_object(
    'Content-Type', 'application/json'
  );
  
  -- Prepare order data
  payload := jsonb_build_object(
    'id', NEW.id::TEXT,
    'name', NEW.name,
    'email', NEW.email,
    'phone', COALESCE(NEW.phone, ''),
    'service', NEW.service,
    'deadline', COALESCE(NEW.deadline, ''),
    'notes', COALESCE(NEW.notes, ''),
    'venmo_handle', COALESCE(NEW.venmo_handle, ''),
    'source_link', COALESCE(NEW.source_link, ''),
    'selected_colors', COALESCE(NEW.selected_colors, ARRAY[]::TEXT[]),
    'file_names', COALESCE(NEW.file_names, ARRAY[]::TEXT[])
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
