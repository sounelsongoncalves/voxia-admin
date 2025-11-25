#!/bin/bash

# Test Database Trigger Script
# This script inserts a new trip directly into the database via SQL.
# This verifies that the Postgres Trigger 'on_trip_created_notify' fires and calls the Edge Function.

PROJECT_ID="vbkxwglvsydofbqiswya"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZia3h3Z2x2c3lkb2ZicWlzd3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDcwMDgsImV4cCI6MjA3OTMyMzAwOH0.yi-0cs_KfHHWQk-q02f2eEwWcj46hpaUWXTmBVxaIbo"
SUPABASE_URL="https://${PROJECT_ID}.supabase.co"
DRIVER_ID="7e733c51-eaff-4ec9-b725-da9944505735"

echo "Inserting test trip into database to trigger notification..."

# We use the REST API to insert a row, which will trigger the Postgres function
curl -i -X POST "${SUPABASE_URL}/rest/v1/trips" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "{
    \"driver_id\": \"$DRIVER_ID\",
    \"origin\": \"Trigger Test Origin\",
    \"destination\": \"Trigger Test Destination\",
    \"status\": \"planned\",
    \"job_description\": \"Trigger Auto Test\"
  }"

echo ""
echo "Insertion completed. Check Edge Function logs for execution."
