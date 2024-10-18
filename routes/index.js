const apiRouter = require("express").Router();
const articlesRouter = require("./articles");
const usersRouter = require("./users");
const commentsRouter = require("./comments");
const { getTopics } = require("../controllers/controller");
const endpoints = require("../endpoints.json");

apiRouter.use("/articles", articlesRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/comments", commentsRouter);
apiRouter.get("/topics", getTopics);

apiRouter.get("/", (req, res) => {
  return res.status(200).send({ endpoints: endpoints });
});

module.exports = apiRouter;
