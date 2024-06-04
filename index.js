import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Shivang",
  password: "cpd.postgres",
  port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

var errorNumber = 0;

app.get("/", async (req, res) => {
  //Write your code here.

  const result = await db.query("SELECT country_code FROM visited_countries");
  var countryList = [];

  result.rows.forEach((country) => {
    countryList.push(country.country_code);
  });

  console.log(countryList);

  if (errorNumber === 1) {
    let error = "Country does not exist, try again";
    res.render("index.ejs", {
      countries: countryList,
      total: countryList.length,
      error: error,
    });
  } else if (errorNumber === 2) {
    let error = "Country has already been added, try again";
    res.render("index.ejs", {
      countries: countryList,
      total: countryList.length,
      error: error,
    });
  } else {
    res.render("index.ejs", {
      countries: countryList,
      total: countryList.length,
    });
  }

  errorNumber = 0;

  // db.end();
});

app.post("/add", async (req, res) => {
  const input = req.body.country;

  try{
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%'",[input.toLowerCase()]
    );
    var countrycode = result.rows[0].country_code;
  
    try {
      await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [
        countrycode,
      ]);
      res.redirect("/");
    } catch (err) {
      errorNumber = 2;
      res.redirect("/");
    }
  } catch (err) {
    errorNumber = 1;
    res.redirect("/");
  }

  // db.end();
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
