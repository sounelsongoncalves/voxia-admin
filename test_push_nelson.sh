#!/bin/bash

# Test Push Notification Script for Nelson
# This script manually invokes the push-notification Edge Function to test if it's reachable and working for the specific driver Nelson.

PROJECT_ID="vbkxwglvsydofbqiswya"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZia3h3Z2x2c3lkb2ZicWlzd3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDcwMDgsImV4cCI6MjA3OTMyMzAwOH0.yi-0cs_KfHHWQk-q02f2eEwWcj46hpaUWXTmBVxaIbo"
FUNCTION_URL="https://${PROJECT_ID}.supabase.co/functions/v1/push-notification"

# Driver ID for Nelson
DRIVER_ID="7e733c51-eaff-4ec9-b725-da9944505735"

echo "Testing Push Notification for Nelson..."
echo "Target Driver ID: $DRIVER_ID"
echo "Function URL: $FUNCTION_URL"

curl -i -X POST "$FUNCTION_URL" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"driver_id\": \"$DRIVER_ID\",
    \"trip_id\": \"test_trip_nelson_$(date +%s)\",
    \"title\": \"Teste Manual de Push para Nelson\",
    \"message\": \"Esta é uma notificação de teste para verificar o recebimento.\",
    \"data\": { \"type\": \"TEST\", \"timestamp\": \"$(date)\" }
  }"

echo ""
echo "Test completed."
