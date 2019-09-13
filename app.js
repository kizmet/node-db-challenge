const Knex = require("knex");
const morgan = require("morgan");
const express = require("express");
const bodyParser = require("body-parser");
const promiseRouter = require("express-promise-router");
const knexConfig = require("./knexfile");
const registerApi = require("./api");
const { Model } = require("objection");

const knex = Knex(knexConfig.development);

Model.knex(knex);

const router = promiseRouter();
const app = express()
  .use(bodyParser.json())
  .use(morgan("dev"))
  .use(router)
  .set("json spaces", 2);

registerApi(router);

app.use((err, req, res, next) => {
  if (err) {
    res
      .status(err.statusCode || err.status || 500)
      .send(err.data || err.message || {});
  } else {
    next();
  }
});

app.get("/", (req, res) => {
  res.json({ message: "API is up and running!" });
});

const server = app.listen(8641, () => {
  console.log("Example app listening at port %s", server.address().port);
});
