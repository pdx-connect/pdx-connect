pdx-connect
===========================================

[![Build Status](https://travis-ci.com/idavidgeo/pdx-connect.svg?token=Xw69C3ppNdAkCSetcdxG&branch=master)](https://travis-ci.com/idavidgeo/pdx-connect)

> A capstone project by **Team-Connect** to create a responsive web platform to connect the community of [Portland State University](https://www.pdx.edu/).

Installation
------------------------------

```shell
$ npm run setup
```

This command will use NPM to install Yarn and then use Yarn to install the project.

Configuration
------------------------------

The server must be configured to access a MySQL database. Create a file `server/config/db.json` with the following format:
```json
{
  "hostname": "localhost",
  "database": "DATABASE",
  "username": "USERNAME",
  "password": "PASSWORD"
}
```

Building and Running (for development)
------------------------------

```shell
$ npm run dev
```

This will build the project in development mode (source maps enabled, etc) and start the application in development mode.

Deployment (for production)
---------------------------

```shell
$ npm run deploy
```

This will build the project in production mode (minification) and automatically start the application.
