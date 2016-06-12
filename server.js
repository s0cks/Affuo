var express = require("express"),
    app = express(),
    port = process.env.PORT || 8080,
    bodyParser = require("body-parser");

app.use(bodyParser.json());

app.use("/", express.static("dist"));

app.listen(port);