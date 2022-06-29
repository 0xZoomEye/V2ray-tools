const http = require("http");
const https = require("https");
const { URL } = require("url");

const request = async (url_string, method = "GET", postData = null) => {
  const url = new URL(url_string);
  const lib = url.protocol === "https:" ? https : http;
  return new Promise((resolve, reject) => {
    const req = lib.request(url_string, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`Status Code: ${res.statusCode}`));
      }
      const data = [];
      res.on("data", (chunk) => {
        data.push(chunk);
      });
      res.on("end", () => resolve(Buffer.concat(data).toString()));
    });
    req.on("error", reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
};

module.exports = request;
