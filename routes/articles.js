const express = require("express");
const {
  getArticles,
  getArticleById,
  patchArticleById,
  postComment,
  getComments,
} = require("../controllers/controller.js");

const router = express.Router();

router.get("/", getArticles);
router.get("/:article_id", getArticleById);
router.patch("/:article_id", patchArticleById);
router.get("/:article_id/comments", getComments);
router.post("/:article_id/comments", postComment);

module.exports = router;
