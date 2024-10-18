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
        console.log(body);
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
  test("200: responds with an article, including the comment count as a number NOT A STRING!", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toHaveProperty("article_id", 1);
        expect(body.article).toHaveProperty("title");
        expect(body.article).toHaveProperty("topic");
        expect(body.article).toHaveProperty("author");
        expect(body.article).toHaveProperty("body");
        expect(body.article).toHaveProperty("created_at");
        expect(body.article).toHaveProperty("article_img_url");
        expect(body.article).toHaveProperty("votes");
        expect(body.article).toHaveProperty("comment_count");
        expect(typeof body.article.comment_count).toBe("number");
      });
  });

  test("404: responds with a 404 error if the article is not found", () => {
    return request(app)
      .get("/api/articles/99999")
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
  test("200: Should sort articles by created_at in descending order by default", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const articles = body.articles;
        expect(articles).toBeSorted({ key: "created_at", descending: true });
      });
  });
  test("200: should return articles by sort_by in acesdening order", () => {
    return request(app)
      .get("/api/articles?sort_by=author&order=asc")
      .expect(200)
      .then(({ body }) => {
        const articles = body.articles;
        const sortExpected = _.orderBy(articles, ["sort_by"], ["asc"]);
        expect(articles).toEqual(sortExpected);
      });
  });
  test("200: should return articles by sort_by in acesdening order", () => {
    return request(app)
      .get("/api/articles?sort_by=author&order=asc")
      .expect(200)
      .then(({ body }) => {
        const articles = body.articles;
        const sortExpected = _.orderBy(articles, ["sort_by"], ["asc"]);
        expect(articles).toEqual(sortExpected);
      });
  });
  describe("BREAK UP TESTS WITH THIS BLOCK /////////////////////////", () => {
    test("400: should return with a 400 status code and an error message if a valid topic data type is filtered as parameter but it does not match any related topics.", () => {
      return request(app)
        .get("/api/articles?topic=notopic")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Not found");
        });
    });

    test("400: should respond with a 400 status code if either or both of the query parameters do not do not coincide with what is allowed in the valid columns", () => {
      return request(app)
        .get("/api/articles?sort_by=author&order_by=incorrectOrder")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid order query");
        });
    });
    test("400: should respond with a 400 status code if either or both of the query parameters do not coincide with what is allowed in the valid columns", () => {
      return request(app)
        .get("/api/articles?sort_by=incorrect&order_by=asc")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid sort_by column");
        });
    });
    //topics queries
    test("200: should return articles by topic in acesdening order", () => {
      return request(app)
        .get("/api/articles?topic=mitch")
        .expect(200)
        .then(({ body }) => {
          const articles = body.articles;
          const sortExpected = _.orderBy(articles, ["topic"], ["asc"]);
          expect(articles).toEqual(sortExpected);
        });
    });
    test("200: should return articles by topic in decsending order", () => {
      return request(app)
        .get("/api/articles?topic=mitch&order_by=desc")
        .expect(200)
        .then(({ body }) => {
          const articles = body.articles;
          const sortExpected = _.orderBy(articles, ["topic"], ["desc"]);
          expect(articles).toEqual(sortExpected);
        });
    });
    //////
    test("both querys can be used in tandom", () => {
      return request(app)
        .get("/api/articles?topic=mitch&author=icellusedkars")
        .expect(200)
        .then(({ body }) => {
          const articles = body.articles;
          expect(articles[0].author).toEqual("icellusedkars");
          expect(articles[0].topic).toEqual("mitch");
        });
    });
    //////////////
    test("both querys can be used in tandom testing out edgecases", () => {
      return request(app)
        .get("/api/articles?topic=mitch")
        .expect(200)
        .then(({ body }) => {
          const articles = body.articles;
          expect(articles[0].topic).toEqual("mitch");
        });
    });
    test("should return a 404 error if given a topic that doesnt exist", () => {
      return request(app)
        .get("/api/articles?topic=Will")
        .expect(404)
        .then((body) => {
          expect(body.status).toEqual(404);
        });
    });
    test("should return an empty array if given a topic with no articles", () => {
      return request(app)
        .get("/api/articles?topic=paper")
        .expect(200)
        .then((response) => {
          expect(response.body.articles).toEqual([]);
        });
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
describe("/api/comments/:comment_id", () => {
  test("204: delete the specified comment", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
      .then((res) => {
        expect(res.statusCode).toBe(204);
      });
  });
  test("404: responds with an appropriate error message when given a non-existent comment_id", () => {
    return request(app)
      .delete("/api/comments/99999")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("no endpoint found");
      });
  });
  test("400: responds with an appropriate error message when given a invalid comment_id", () => {
    return request(app)
      .delete("/api/comments/not-a-comment")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
});
describe("/api/users", () => {
  test("GET:200, an array of objects, each of which should have a username, name and avatar_url", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then((response) => {
        expect(response.body.users).toEqual(expect.any(Array));
        expect(response.body.users).not.toHaveLength(0);
        response.body.users.forEach((user) => {
          expect(Object.keys(user)).toEqual(
            expect.arrayContaining(["username", "name", "avatar_url"])
          );
        });
      });
  });
});
