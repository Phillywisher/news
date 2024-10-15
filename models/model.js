const db = require("../db/connection.js");
const fs = require("fs/promises");
const format = require("pg-format");

exports.selectTopics = () => {
  return db.query("SELECT * FROM topics;").then((result) => {
    return result.rows;
  });
};
exports.fetchEndpoints = () => {
  return fs.readFile("endpoints.json", "utf-8").then((endpoints) => {
    return JSON.parse(endpoints);
  });
};
exports.fetchArticles = () => {
  return db
    .query(
      `SELECT 
    articles.article_id, articles.title, articles.topic, articles.author, articles.created_at, articles.article_img_url, articles.votes,
    COUNT(comments.comment_id) AS comment_count 
    FROM articles
    LEFT JOIN comments
    on articles.article_id = comments.article_id
    GROUP BY articles.article_id, articles.title,articles.topic, articles.author, articles.created_at, articles.article_img_url
    ORDER BY created_at DESC;`
    )
    .then((articles) => {
      if (articles.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not found" });
      }
      return articles.rows;
    });
};
exports.fetchComments = (articleId) => {
  return db
    .query(
      `SELECT * FROM comments
        WHERE article_id = $1
        ORDER BY created_at DESC`,
      [articleId]
    )
    .then((comments) => {
      if (comments.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not found" });
      }

      return comments.rows;
    });
};
exports.selectArticleById = (article_id) => {
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
exports.createComment = (id, body) => {
  const bodyArr = [body.body, 0, body.username, id];
  const comment = format(
    `INSERT INTO comments
    (body, votes, author, article_id)
    VALUES %L
    RETURNING *;
    `,
    [bodyArr]
  );
  return db.query(comment).then((comment) => {
    return comment.rows[0];
  });
};
