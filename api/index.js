import app from "../server.ts";

export default function handler(req, res) {
  return app(req, res);
}