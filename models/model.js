const db = require("../db/connection.js");
const fs = require("fs/promises");

exports.selectTopics = () => {
  return db.query("SELECT * FROM topics;").then((result) => {
    return result.rows;
  });
};

exports.fetchEndpoints = () => {
  return fs.readFile("endpoints.json", "utf-8").then((endpoints) => {
    console.log(endpoints);
    return JSON.parse(endpoints);
  });
};

exports.selectArticleById = (article_id) => {
  console.log("from model");
  return db
    .query("SELECT * FROM articles WHERE article_id = $1;", [article_id])
    .then((result) => {
      const article = result.rows[0];
      if (article === undefined) {
        return Promise.reject({ status: 404, msg: "article does not exist" });
      }
      return article;
    });
};
