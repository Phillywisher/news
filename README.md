# **The-News-Manc-Times**

## Check out my linkedIn

Click it i dare ya --> [LinkedIn](https://www.linkedin.com/in/phillywisher/)

## Hosted Version

Visit the live version of the project [here](https://the-news-manc-times.onrender.com/api)

---

## Project Summary

This project is a RESTful API that allows users to interact with a database of articles and comments. Users can filter and sort articles based on different queries, retrieve individual article details, and more. This project demonstrates a typical backend setup using Node.js, Express, and PostgreSQL, with a test-driven approach to ensure reliability.

---

## Getting Started

Below is a small guide on cloning this repo, setting up, and seeding.

### Prerequisites

- **Node.js**: Minimum version required is `v14.x.x`
- **PostgreSQL**: Minimum version required is `v12.x`

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/Phillywisher/news.git
cd BE-NC-NEWS
```

2. **Install dependencies**

```bash
npm install
```

### Setting Up the Environment

You will need to create two `.env` files to configure your local development and test databases.

- **.env.development**: Configure this file with the following:
  ```
  PGDATABASE=your_database_name
  ```
- **.env.test**: Configure this file with the following:
  ```
  PGDATABASE=your_test_database_name
  ```

Make sure that the names of the databases match what you have set up in PostgreSQL.

### Setting Up the Databases

1. **Create databases**:

## Please note that if you are using macOS that the commands will still match in your terminal which your are most likley using called Zsh

```bash
npm run setup-dbs
```

2. **Seed the development database**:

```bash
npm run seed
```

### Running Tests

To run the test suite, execute:

```bash
npm test
```

This will run all tests, including integration and unit tests, ensuring the functionality of the endpoints.

---

## Minimum Versions

- **Node.js**: `14.x.x` or above
- **PostgreSQL**: `12.x.x` or above

---

By following this guide, you should be able to run the project locally, install dependencies, seed the database, and run the test suite. Enjoy exploring the code and features, feel free to reach out to me on linkedIn!!!!
