DROP TABLE IF EXISTS contactUs;

CREATE TABLE IF NOT EXISTS contactUs (
  id SERIAL PRIMARY KEY,
  firstName VARCHAR(255),
  lastName VARCHAR(255),
  email VARCHAR(255),
  comments TEXT
);
-- psql -f data/contactUs.sql -d foodita