const db = require("../db/connection.js");
const fs = require("fs/promises");
const { zip } = require("lodash");
const format = require("pg-format");

exports.selectTopics = () => {
  return db.query("SELECT * FROM topics;").then((result) => {
    return result.rows;
  });
};

exports.selectUsers = () => {
  return db.query(`SELECT * FROM users;`).then((result) => {
    return result.rows;
  });
};
exports.fetchEndpoints = () => {
  return fs.readFile("endpoints.json", "utf-8").then((endpoints) => {
    return JSON.parse(endpoints);
  });
};

exports.fetchArticles = (query) => {
  const sortBy = query.sort_by || "created_at";
  const order = query.order_by || "desc";
  const topic = query.topic;
  const validSortByColumns = [
    "article_id",
    "title",
    "topic",
    "author",
    "created_at",
    "article_img_url",
    "votes",
    "comment_count",
  ];
  const validOrder = ["desc", "asc"];

  if (!validSortByColumns.includes(sortBy)) {
    return Promise.reject({ status: 400, msg: "Invalid sort_by column" });
  }

  if (!validOrder.includes(order.toLowerCase())) {
    return Promise.reject({ status: 400, msg: "Invalid order query" });
  }

  let queryStr = `
    SELECT 
      articles.article_id, 
      articles.title, 
      articles.topic, 
      articles.author, 
      articles.created_at, 
      articles.article_img_url, 
      articles.votes,
      COUNT(comments.comment_id) AS comment_count 
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
  `;

  let queryValues = [];

  if (topic) {
    queryStr += ` WHERE articles.topic = $1`;
    queryValues.push(topic);
  }

  queryStr += ` GROUP BY articles.article_id ORDER BY ${sortBy} ${order.toUpperCase()}`;

  return db.query(queryStr, queryValues).then((result) => {
    const articles = result.rows;
    if (articles.length === 0 && topic) {
      return db
        .query(`SELECT * FROM topics WHERE slug = $1`, [topic])
        .then(({ rows }) => {
          if (rows.length === 0) {
            return Promise.reject({ status: 404, msg: "Not found" });
          } else {
            return [];
          }
        });
    }
    return articles;
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

exports.removeCommentbyId = (comment_id) => {
  return db
    .query(
      `DELETE FROM comments
        WHERE comment_id = $1
        RETURNING *;`,
      [comment_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "no endpoint found",
        });
      }
    });
};
