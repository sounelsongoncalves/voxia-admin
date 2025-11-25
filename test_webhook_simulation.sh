#!/bin/bash

# Test Webhook Payload Script
# This script simulates the payload that Supabase sends to the Edge Function when a new trip is inserted.
# This verifies that the "Database Webhook" flow will work once configured in the Dashboard.

PROJECT_ID="vbkxwglvsydofbqiswya"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZia3h3Z2x2c3lkb2ZicWlzd3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDcwMDgsImV4cCI6MjA3OTMyMzAwOH0.yi-0cs_KfHHWQk-q02f2eEwWcj46hpaUWXTmBVxaIbo"
FUNCTION_URL="https://${PROJECT_ID}.supabase.co/functions/v1/push-notification"

# Driver ID for Nelson
DRIVER_ID="7e733c51-eaff-4ec9-b725-da9944505735"

echo "Simulating Database Webhook for Nelson..."

curl -i -X POST "$FUNCTION_URL" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"INSERT\",
    \"table\": \"trips\",
    \"schema\": \"public\",
    \"record\": {
        \"id\": \"trip_webhook_test_$(date +%s)\",
        \"driver_id\": \"$DRIVER_ID\",
        \"origin\": \"Lisboa (Webhook)\",
        \"destination\": \"Porto (Webhook)\",
        \"status\": \"planned\"
    },
    \"old_record\": null
  }"

echo ""
echo "Webhook simulation completed."
