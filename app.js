const express = require("express");
const app = express();
const { getTopics, getEndpoints } = require("./controllers/controller");

app.get("/api/", getEndpoints);

app.get("/api/topics", getTopics);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "no endpoint found" });
});

module.exports = app;
