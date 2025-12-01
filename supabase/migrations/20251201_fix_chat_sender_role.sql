-- Fix for Chat Message Sending Error (Code 42703)
-- The trigger on chat_messages is trying to access 'sender_role' which doesn't exist.

-- Run this SQL in your Supabase SQL Editor to fix the issue.

-- 1. Add the missing column
ALTER TABLE public.chat_messages 
ADD COLUMN IF NOT EXISTS sender_role TEXT DEFAULT 'admin';

-- 2. (Optional) Update existing messages to have a role
UPDATE public.chat_messages 
SET sender_role = 'admin' 
WHERE sender_admin_id IS NOT NULL;

UPDATE public.chat_messages 
SET sender_role = 'driver' 
WHERE sender_driver_id IS NOT NULL;
