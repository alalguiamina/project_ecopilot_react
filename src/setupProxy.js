const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    ["/user", "/token", "/core", "/user/sites/"], // adapt paths you need proxied
    createProxyMiddleware({
      target: "https://overmuch-pileous-merissa.ngrok-free.dev",
      changeOrigin: true,
      secure: false,
    }),
  );
};
