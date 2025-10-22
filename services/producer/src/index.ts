import { logger } from "@shared/logger";
import Koa from "koa";
import Router from "@koa/router";
import multer from "@koa/multer";
import { producer } from "./producer";

const app = new Koa();
const router = new Router();
const upload = multer();
const port = Number(process.env.PORT);

router.post("/process", upload.single("file"), async (ctx) => {
  if (!ctx.file) {
    ctx.status = 400;
    ctx.body = { message: "No file uploaded" };
    return;
  }

  producer(ctx.file.buffer).catch((error) => logger().error(error));

  ctx.status = 202;
  ctx.body = {
    message: "File accepted and will be processed",
    filename: ctx.file.originalname,
  };
});

router.get("/health", async (ctx) => {
  ctx.body = {
    message: "Ok",
  };
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(port, "0.0.0.0", () => {
  logger().info(`Koa server running on port ${port}`);
});
