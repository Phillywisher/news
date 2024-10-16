const app = require("../app.js");
const request = require("supertest");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data");
const endpoints = require("../endpoints.json");
const _ = require("lodash");
const toBeSorted = require("jest-sorted");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("/api/topics", () => {
  test("GET:200, an array of topic objects, each of which should have a 'slug' and a 'description' property", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        expect(response.body.topics).toEqual(expect.any(Array));
        expect(Object.keys(response.body.topics[0].length === 2));
        response.body.topics.forEach((topic) => {
          expect(typeof topic.description).toBe("string");
          expect(typeof topic.slug).toBe("string");
        });
      });
  });
});
describe("/api", () => {
  test("shows all the available endpoints of the api", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body.endpoints).toEqual(endpoints);
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("200: should respond with 200 status code, with 1 article from my articles DB.", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        const article = body.article;
        const expectedOutput = {
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 100,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        };
        expect(article).toMatchObject(expectedOutput);
      });
  });
  test("GET 400: responds with an error message when given an invalid article_id", () => {
    return request(app)
      .get("/api/articles/article_id")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("404: should return a 404 code if passed an endpoint which is valid datatype, which it responds with no results.", () => {
    return request(app)
      .get("/api/articles/999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("article does not exist");
      });
  });
});

describe("GET /api/articles", () => {
  test("GET: 200 Should respond with 200 status code and all current articles with their comment counts.", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.articles)).toBe(true);
        expect(body.articles.length).toBeGreaterThan(0);
        body.articles.forEach((article) => {
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(String || Number),
          });
          expect(article).not.toHaveProperty("body");
        });
      });
  });
  test("GET: 200 articles should be ordered by date in desending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const articles = body.articles;
        const sortExpected = _.orderBy(articles, ["date"], ["desc"]);
        expect(articles).toEqual(sortExpected);
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200: Should respond with an array of all comments for given article ID", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        const comments = body.comments;
        expect(Array.isArray(comments)).toBe(true);
        expect(comments.length).toBeGreaterThan(0);
        comments.forEach((comment) => {
          expect(comment).toMatchObject({
            body: expect.any(String),
            votes: expect.any(Number),
            author: expect.any(String),
            article_id: expect.any(Number),
            created_at: expect.any(String),
          });
          expect(comment).toHaveProperty("body");
        });
      });
  });
  test("200: comments should be returned sorted by most recent comments first", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        const articleComments = body.comments;
        expect(articleComments).toBeSorted({
          key: "created_at",
          descending: true,
        });
      });
  });
  test("200: should return an empty array when passed an article that does exist but doesnt have any comments", () => {
    return request(app)
      .get("/api/articles/13/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments.length).toBe(0);
      });
  });
  test("400: to be 400 error code and message if endpoint is of wrong type or formatted incorrectly.", () => {
    return request(app)
      .get("/api/articles/not/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("404: should return 404 error code and message if  endpoint is the correct type but doesnt have any results.", () => {
    return request(app)
      .get("/api/articles/5000/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("article does not exist");
      });
  });
});
describe("POST /api/articles/:article_id/comments", () => {
  test("200: should post a new comment to the comments table with the endpoint of article_id and respond with the comment object upon completion.", () => {
    return request(app)
      .post("/api/articles/2/comments")
      .send({
        username: "rogersop",
        body: "maybe i should go and touch some grass",
      })
      .expect(200)
      .then(({ body }) => {
        const comment = body.comment;
        expect(typeof comment.body).toEqual("string");
        expect(typeof comment.votes).toEqual("number");
        expect(typeof comment.author).toEqual("string");
        expect(typeof comment.article_id).toEqual("number");
        expect(typeof comment.created_at).toEqual("string");
      });
  });
  test("400: should return an error and message if a user who doesnt exist.", () => {
    return request(app)
      .post("/api/articles/2/comments")
      .send({ username: "Imposter", body: "Syndrome" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("400: should return an error and message if a end point of an article is a invalid type.", () => {
    return request(app)
      .post("/api/articles/wrong/comments")
      .send({ username: "Imposter", body: "Syndrome" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("404: should return an error and message if the end point is a valid type, however no article exists for the comment to be on.", () => {
    return request(app)
      .post("/api/articles/619/comments")
      .send({ username: "Imposter", body: "Syndrome" })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("article does not exist");
      });
  });
});
describe("PATCH /api/articles/:article_id", () => {
  test("200: should patch the article from articleID, increasing its votes property by the amount passed", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 5 })
      .expect(200)
      .then(({ body }) => {
        const article = body.article;
        expect(article.votes).toBe(105);
      });
  });
  test("200: should patch the article from articleID, decreasing its votes by the amount passed in", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: -10 })
      .expect(200)
      .then(({ body }) => {
        const article = body.article;
        expect(article.votes).toBe(90);
      });
  });
  test("400: should give an error if an invalid value is passed into our inc_votes property", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: "no lookin good brev" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("400: should give an error if an invalid value type is passed into our endpoint for article_id", () => {
    return request(app)
      .patch("/api/articles/nope")
      .send({ inc_votes: 10 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("404: should give an error if a valid type is passed into our endpoint for article_id but it doesnt match any existing article which then will be giving us a bad request message", () => {
    return request(app)
      .patch("/api/articles/100")
      .send({ inc_votes: 10 })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not found");
      });
  });
});
