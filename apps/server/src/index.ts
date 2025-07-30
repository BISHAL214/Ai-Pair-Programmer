import { Hono } from "hono";
import { users } from "@ai_pair_programmer/db/schema";
const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

export default app;
