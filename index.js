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
    client.mget(['header', 'left', 'right', 'article', 'footer'],
      function (err, values) {
        const data = {
          header: Number(values[0]),
          left: Number(values[1]),
          right: Number(values[2]),
          article: Number(values[3]),
          footer: Number(values[4])
        };
        err ? reject(null) : resolve(data);
      }
    );
  });
}

app.get("/data", function (req, res) {
  data().then((data) => {
    console.log(data);
    res.send(data);
  });
});

app.get("/update/:key/:value", function (req, res) {
  const key = req.params.key;
  let value = Number(req.params.value);

  client.get(key, function (err, reply) {
    value = Number(reply) + value;
    client.set(key, value);

    data()
      .then(data => {
        console.log(data);
        res.send(data);
      });
  });
});




app.listen(3000, () => {
  console.log("Running on 3000");
});

process.on("exit", function () {
  client.quit();
});
