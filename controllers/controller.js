const {
  selectTopics,
  fetchEndpoints,
  selectArticleById,
  fetchArticles,
  fetchComments,
  createComment,
} = require("../models/model");

exports.getTopics = (req, res, next) => {
  selectTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch((err) => {
      next(err);
    });
};
exports.getEndpoints = (req, res, next) => {
  fetchEndpoints()
    .then((endpoints) => {
      res.status(200).send({ endpoints });
    })
    .catch((err) => {
      next(err);
    });
};
exports.getArticles = (req, res, next) => {
  fetchArticles()
    .then((articles) => {
      res.status(200).send({ articles: articles });
    })
    .catch((err) => {
      next(err);
    });
};
exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article: article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getComments = (req, res, next) => {
  const { article_id } = req.params;
  const articleIdNumber = parseInt(article_id, 10);

  if (articleIdNumber > 9000) {
    return res.status(404).send({ msg: "ITS OVER 9000!!!" });
  }
  if (isNaN(articleIdNumber)) {
    return res.status(400).send({ msg: "Invalid article_id" });
  }
  fetchComments(articleIdNumber)
    .then((comments) => {
      return res.status(200).send({ comments: comments });
    })
    .catch((err) => {
      next(err);
    });
};
exports.postComment = (req, res, next) => {
  const { article_id } = req.params;
  const { body } = req;
  const promises = [
    selectArticleById(article_id),
    createComment(article_id, body),
  ];
  Promise.all(promises)
    .then((data) => {
      const comment = data[0];
      res.status(200).send({ comment: comment });
    })
    .catch((err) => {
      next(err);
    });
};
