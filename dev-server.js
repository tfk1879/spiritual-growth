const http = require("http");
const fs = require("fs");
const path = require("path");

const host = "127.0.0.1";
const port = Number(process.env.PORT) || 3000;
const root = __dirname;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8"
};

function send(res, statusCode, body, contentType) {
  res.writeHead(statusCode, { "Content-Type": contentType });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const requestPath = req.url === "/" ? "/index.html" : req.url;
  const filePath = path.normalize(path.join(root, decodeURIComponent(requestPath)));

  if (!filePath.startsWith(root)) {
    send(res, 403, "Forbidden", "text/plain; charset=utf-8");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      if (error.code === "ENOENT") {
        send(res, 404, "Not Found", "text/plain; charset=utf-8");
        return;
      }

      send(res, 500, "Server Error", "text/plain; charset=utf-8");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extension] || "application/octet-stream";
    send(res, 200, data, contentType);
  });
});

server.listen(port, host, () => {
  console.log(`Dev server running at http://${host}:${port}`);
});
