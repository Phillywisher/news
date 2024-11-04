const express = require("express");
const apiRouter = require("./routes/index");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);

// app.all("*", (req, res) => {
//   res.status(404).send({ msg: "No endpoint found" });
// });

app.use((err, req, res, next) => {
  if (err.code === "22P02" || err.code === "23503") {
    return res.status(400).send({ msg: "Bad request" });
  }
  next(err);
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    return res.status(err.status).send({ msg: err.msg });
  }
  next(err);
});

app.use((err, req, res, next) => {
  res.status(500).send({ msg: "Internal server error" });
});

module.exports = app;
