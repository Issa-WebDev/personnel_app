const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const path = require("path");
const db = require("./database");
const dotenv = require("dotenv");

dotenv.config();

const PORT = 5000;

const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("dist"));

app.use(
  session({
    secret: "secretkey",
    resave: false,
    saveUninitialized: false,
  })
);

// Auth Middleware
function isAuthenticated(req, res, next) {
  if (req.session.userId) next();
  else res.redirect("/login");
}

// Routes
app.get("/", (req, res) => res.redirect("/login"));
app.get("/register", (req, res) => res.render("register"));
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.send("Erreur lors de la vérification");

      if (results.length > 0) {
        return res.send(
          "Cet utilisateur existe déjà. <a href='/register'>Réessayer avec un autre email</a>"
        );
      }

      const hashed = await bcrypt.hash(password, 10);
      db.query(
        "INSERT INTO users (email, password) VALUES (?, ?)",
        [email, hashed],
        (err) => {
          if (err) return res.send("Erreur lors de l'inscription");
          res.redirect("/login");
        }
      );
    }
  );
});

app.get("/login", (req, res) => res.render("login"));
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (
        results.length &&
        (await bcrypt.compare(password, results[0].password))
      ) {
        req.session.userId = results[0].id;
        res.redirect("/dashboard");
      } else {
        res.send("Identifiants invalides");
      }
    }
  );
});

app.get("/dashboard", isAuthenticated, (req, res) => {
  db.query(
    "SELECT * FROM personnels WHERE user_id = ?",
    [req.session.userId],
    (err, personnels) => {
      res.render("dashboard", { personnels });
    }
  );
});

app.get("/add-personnel", isAuthenticated, (req, res) => {
  res.render("add-personnel");
});

app.post("/add-personnel", isAuthenticated, (req, res) => {
  const {
    nom,
    prenoms,
    phone,
    genre,
    profession,
    departement,
    salaire,
    date_embauche,
    nombre_enfant,
    situation_matrimoniale,
  } = req.body;

  db.query(
    `INSERT INTO personnels (nom, prenoms, phone, genre, profession, departement, salaire, date_embauche, nombre_enfant, situation_matrimoniale, user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      nom,
      prenoms,
      phone,
      genre,
      profession,
      departement,
      salaire,
      date_embauche,
      nombre_enfant,
      situation_matrimoniale,
      req.session.userId,
    ],
    () => res.redirect("/dashboard")
  );
});

app.listen(PORT, () =>
  console.log(`Serveur lancé sur http://localhost:${PORT}`)
);
