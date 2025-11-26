import { SwaggerRouter } from "koa-swagger-decorator";
import Guest from "../model/guest";
import RSVP from "../model/rsvp";
import Sticker from "../model/sticker";
import GuestController from "../controller/guest";

const GuestRouter = new SwaggerRouter<Guest>();

GuestRouter.use(async (ctx, next) => {
  if (!ctx.state) { throw new Error("Error retrieving user"); }
  return next();
})

GuestRouter.get('/', async (ctx) => {
  ctx.status = 200;
  ctx.body = ctx.state;
});

GuestRouter.get('/rsvp', async ctx => {
  ctx.status = 200;
  ctx.body = await GuestController.getResponse(ctx.state);
  if (!ctx.body) {
    ctx.status = 404;
    ctx.body = `No RSVP yet`;
  }
});

GuestRouter.post('/rsvp', async ctx => {
  ctx.status = 201;
  ctx.body = await GuestController.setResponse(ctx.state, ctx.request.body as RSVP);
});

GuestRouter.get('/stickers', async ctx => {
  ctx.status = 200;
  ctx.body = await GuestController.getStickers(ctx.state);
})

GuestRouter.post('/stickers', async ctx => {
  ctx.status = 201;
  ctx.body = await GuestController.addSticker(ctx.state, ctx.request.body as Sticker);
})

GuestRouter.put('/stickers/:id', async ctx => {
  ctx.status = 201;
  const payload: Partial<Sticker> = {
    ...ctx.request.body as Sticker,
    id: +ctx.params.id,
  }
  ctx.body = await GuestController.updateSticker(ctx.state.id, payload);
})

export default GuestRouter;
