DROP TABLE IF EXISTS recipesOption;

CREATE TABLE IF NOT EXISTS recipesOption(
  id SERIAL PRIMARY KEY,
  userId VARCHAR(255),
  title VARCHAR(255),
  image VARCHAR(255),
  instructions TEXT,
  summary TEXT
);

--  psql -f data/recipesOption.sql -d fodita
-- 337cb69caacc46f8a208b52edd1a748c