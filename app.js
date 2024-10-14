const express = require("express");
const app = express();
const {
  getTopics,
  getEndpoints,
  getArticleById,
} = require("./controllers/controller");

app.get("/api/", getEndpoints);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);

app.use((req, res) => {
  res.status(404).send({ msg: "The requested endpoint does not exist." });
});

app.all("*", (req, res) => {
  res.status(404).send({ msg: "no endpoint found" });
});

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad request" });
  }
  next(err);
});

app.use((err, req, res, next) => {
  console.log(err);
  if (err.status && err.msg) res.status(err.status).send({ msg: err.msg });
  next(err);
});

app.use((err, req, res, next) => {
  res.status(500).send({ msg: "Internal server error" });
});

module.exports = app;
