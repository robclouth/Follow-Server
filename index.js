const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

app.set("port", process.env.PORT || 3000);
app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res) {
  res.sendfile("index.html");
});

io.on("connection", function(client) {
  console.log("a user connected");

  client.on("cursorMove", function(data) {
    client.url &&
      io.to(client.url).emit("cursorMove", {
        clientId: client.id,
        x: data.x,
        y: data.y,
        url: client.url
      });
    console.log("cursorMove:" + JSON.stringify(data));
  });

  client.on("urlChange", function(newUrl) {
    io.to(client.url).emit("cursorLeave", {
      clientId: client.id,
      fromUrl: client.url,
      toUrl: newUrl
    });

    client.leave(client.url);

    client.join(newUrl);

    io.to(newUrl).emit("cursorEnter", {
      clientId: client.id,
      fromUrl: client.url,
      toUrl: newUrl
    });

    client.url = newUrl;

    console.log("urlChange:" + newUrl);
  });

  client.on("disconnect", function() {
    io.to(client.url).emit("clientDisconnect", {
      clientId: client.id
    });
  });
});

http.listen(app.get("port"), function() {
  console.log("Running on port " + app.get("port"));
});
