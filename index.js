var express = require("express");
var app = express();

const redis = require('redis');
const client = redis.createClient();

app.use(express.static("public"));

client.on('connect', function () {
  console.log('Connected to Redis');
  client.mset('header', 0, 'left', 0, 'article', 0, 'right', 0, 'footer', 0, function (err, reply) {
    if (err) {
      console.error(err);
    } else {
      console.log('Initial values set:', reply);
    }
  });
});

function data() {
  return new Promise((resolve, reject) => {
    client.mget('header', 'left', 'right', 'article', 'footer', function (err, values) {
      if (err) {
        reject(err);
      } else {
        resolve({
          header: values[0],
          left: values[1],
          right: values[2],
          article: values[3],
          footer: values[4]
        });
      }
    });
  });
}

app.get("/update/:key/:value", function (req, res) {
  const key = req.params.key;
  let value = Number(req.params.value);

  client.set(key, value, function (err, reply) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(reply);
    }
  });
});

app.get("/data", function (req, res) {
  data().then((data) => {
    console.log(data);
    res.send(data);
  });
});

app.listen(3000, () => {
  console.log("Running on 3000");
});

process.on("exit", function () {
  client.quit();
});
