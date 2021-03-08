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
