DROP TABLE IF EXISTS recipes;

CREATE TABLE IF NOT EXISTS recipes (
  id SERIAL PRIMARY KEY,
  userName VARCHAR(255),
  label VARCHAR(255),
  image VARCHAR(255),
  ingredientLines TEXT,
  calories VARCHAR(255),
  fat VARCHAR(255),
  Carbs VARCHAR(255),
  Protein VARCHAR(255),
  Cholesterol VARCHAR(255)
);

 psql -f data/recipe.sql -d foodita