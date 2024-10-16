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
      return comments.rows;
    });
};
exports.selectArticleById = (article_id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1;", [article_id])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "article does not exist" });
      }
      return result.rows[0];
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
exports.patchArticleVotes = (article_id, votes) => {
  return db
    .query(
      `UPDATE articles 
       SET votes = votes + $1 
       WHERE article_id = $2 
       RETURNING *;`,
      [votes, article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not found" });
      }
      return rows[0];
    });
};

exports.removeComments = (comment) => {
  return db
    .query(`DELETE FROM comments WHERE comment_id = $1;`, [comment])
    .then(() => {
      return { msg: "successfully deleted" };
    });
};
