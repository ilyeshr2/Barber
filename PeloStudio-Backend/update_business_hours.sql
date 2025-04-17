-- SQL script to update business hours
-- This script is meant to be run directly against the database

-- Direct SQL fix for business hours

-- Part 1: Update the BusinessHours table based on current UI state
-- Day 0 (Sunday) = closed
UPDATE "BusinessHours" 
SET "is_open" = false,
    "open_time" = '09:00:00',
    "close_time" = '18:00:00',
    "updated_at" = CURRENT_TIMESTAMP
WHERE "day_of_week" = 0;

-- Day 1 (Monday) = closed
UPDATE "BusinessHours" 
SET "is_open" = false,
    "open_time" = '09:00:00',
    "close_time" = '18:00:00',
    "updated_at" = CURRENT_TIMESTAMP
WHERE "day_of_week" = 1;

-- Day 2 (Tuesday) = open
UPDATE "BusinessHours" 
SET "is_open" = true,
    "open_time" = '09:00:00',
    "close_time" = '18:00:00',
    "updated_at" = CURRENT_TIMESTAMP
WHERE "day_of_week" = 2;

-- Day 3 (Wednesday) = open
UPDATE "BusinessHours" 
SET "is_open" = true,
    "open_time" = '09:00:00',
    "close_time" = '18:00:00',
    "updated_at" = CURRENT_TIMESTAMP
WHERE "day_of_week" = 3;

-- Day 4 (Thursday) = open
UPDATE "BusinessHours" 
SET "is_open" = true,
    "open_time" = '09:00:00',
    "close_time" = '18:00:00',
    "updated_at" = CURRENT_TIMESTAMP
WHERE "day_of_week" = 4;

-- Day 5 (Friday) = open
UPDATE "BusinessHours" 
SET "is_open" = true,
    "open_time" = '09:00:00',
    "close_time" = '18:00:00',
    "updated_at" = CURRENT_TIMESTAMP
WHERE "day_of_week" = 5;

-- Day 6 (Saturday) = open
UPDATE "BusinessHours" 
SET "is_open" = true,
    "open_time" = '10:00:00',
    "close_time" = '17:00:00',
    "updated_at" = CURRENT_TIMESTAMP
WHERE "day_of_week" = 6;

-- Part 2: Update the JSON in the Salon table
-- Create a JSON array with all business hours data
WITH business_hours_json AS (
  SELECT json_agg(
    json_build_object(
      'day_of_week', "day_of_week",
      'is_open', "is_open",
      'open_time', TO_CHAR("open_time", 'HH24:MI'),
      'close_time', TO_CHAR("close_time", 'HH24:MI')
    )
  ) AS hours_data
  FROM "BusinessHours"
  WHERE "salon_id" = 1
  ORDER BY "day_of_week"
)
UPDATE "Salons"
SET "business_hours" = hours_data,
    "updated_at" = CURRENT_TIMESTAMP
FROM business_hours_json
WHERE "Salons"."id" = 1;

-- Part 3: Verify data in both tables
SELECT 'BusinessHours Table:' AS info;
SELECT * FROM "BusinessHours" ORDER BY "day_of_week";

SELECT 'Salon Table Business Hours JSON:' AS info;
SELECT "id", "name", "business_hours" FROM "Salons" WHERE "id" = 1; 