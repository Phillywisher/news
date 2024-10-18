const app = require("./app.js");

const port = process.env.PORT || 4000;
app.listen(port, (err) => {
  if (err) {
    console.log(err);
  } else console.log(`listening on port ${port}`);
});
