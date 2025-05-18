CREATE DATABASE IF NOT EXISTS personnel_app;
USE personnel_app;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100),
  password VARCHAR(255)
);

CREATE TABLE personnels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100),
  prenoms VARCHAR(100),
  phone VARCHAR(20),
  genre VARCHAR(10),
  profession VARCHAR(100),
  departement VARCHAR(100),
  salaire DECIMAL(10, 2),
  date_embauche DATE,
  nombre_enfant INT,
  situation_matrimoniale VARCHAR(50),
  user_id INT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
