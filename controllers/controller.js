const { selectTopics } = require("../models/model");

exports.getTopics = (req, res, next) => {
  selectTopics().then((topics) => {
    res.status(200).send({ topics });
  });
};
