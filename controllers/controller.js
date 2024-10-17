const {
  selectTopics,
  fetchEndpoints,
  selectArticleById,
  fetchArticles,
  fetchComments,
  createComment,
  patchArticleVotes,
  removeCommentbyId,
  selectUsers,
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

exports.getUsers = (req, res, next) => {
  selectUsers()
    .then((users) => {
      res.status(200).send({ users });
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
  const { sort_by, order_by, topic } = req.query;
  fetchArticles({ sort_by, order_by, topic })
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
  selectArticleById(article_id)
    .then(() => {
      return fetchComments(article_id);
    })
    .then((comments) => {
      return res.status(200).send({ comments });
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
exports.patchArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  if (isNaN(inc_votes)) {
    return res.status(400).send({ msg: "Bad request" });
  }
  patchArticleVotes(article_id, inc_votes)
    .then((updatedArticle) => {
      res.status(200).send({ article: updatedArticle });
    })
    .catch((err) => {
      next(err);
    });
};
exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  if (isNaN(comment_id)) {
    return res.status(400).send({ msg: "Bad request" });
  }
  removeCommentbyId(comment_id)
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => {
      next(err);
    });
};
