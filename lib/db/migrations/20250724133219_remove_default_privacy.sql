-- Remove 'default' from lists privacy enum
ALTER TABLE lists 
DROP CONSTRAINT IF EXISTS lists_privacy_check;

ALTER TABLE lists 
ADD CONSTRAINT lists_privacy_check 
CHECK (privacy IN ('private', 'public'));
