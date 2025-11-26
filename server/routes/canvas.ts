import Guest from "../model/guest";
import { SwaggerRouter } from "koa-swagger-decorator";
import { validateOrReject } from "class-validator";
import Sticker from "../model/sticker";

const CanvasRouter = new SwaggerRouter<Guest>({ prefix: '/canvas' });

// CanvasRouter.use(async (ctx, next) => {
//   if (!ctx.state) { throw new Error("Error retrieving user"); }
//   return next();
// })

CanvasRouter.get('/', async ctx => {
  ctx.status = 200;
  ctx.body = await Sticker.find();
})

export default CanvasRouter;
