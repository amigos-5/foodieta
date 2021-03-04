DROP TABLE IF EXISTS userInfo;

CREATE TABLE IF NOT EXISTS userInfo (
  id SERIAL PRIMARY KEY,
  userName VARCHAR(255),
  userEmail VARCHAR(255),
  userPass VARCHAR(255)
  
);

INSERT INTO userInfo (userName, userEmail, userPass) VALUES (
  'Farhan Ayyash',
  'Farhanayyash16@yahoo.com',
  '123456'
);

INSERT INTO userInfo (userName, userEmail, userPass) VALUES (
  'Ayyash',
  'Farhan@yahoo.com',
  '123'
);