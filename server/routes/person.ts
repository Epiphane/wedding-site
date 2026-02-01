import { SwaggerRouter } from "koa-swagger-decorator";
import Person from "../model/person";
import Sticker from "../model/sticker";
import PersonController from "../controller/person";

const PersonRouter = new SwaggerRouter<Person>();

PersonRouter.use(async (ctx, next) => {
  if (!ctx.state) { throw new Error("Error retrieving user"); }
  return next();
})

PersonRouter.get('/', async (ctx) => {
  ctx.status = 200;
  ctx.body = ctx.state;
});

PersonRouter.get('/stickers', async ctx => {
  ctx.status = 200;
  ctx.body = await PersonController.getStickers(ctx.state);
})

PersonRouter.post('/stickers', async ctx => {
  ctx.status = 201;
  ctx.body = await PersonController.addSticker(ctx.state.id, ctx.request.body as Sticker);
})

PersonRouter.put('/stickers/:id', async ctx => {
  ctx.status = 201;
  const payload: Partial<Sticker> = {
    ...ctx.request.body as Sticker,
    id: +ctx.params.id,
  }
  ctx.body = await PersonController.updateSticker(ctx.state.id, payload);
})

export default PersonRouter;
