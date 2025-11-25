import { validateOrReject } from "class-validator";
import { SwaggerRouter } from "koa-swagger-decorator";
import { Not, Equal } from "typeorm";
import Guest from "../model/guest";
import RSVP from "../model/rsvp";
import Sticker from "../model/sticker";

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
  const guest = ctx.state;
  if (!guest.response) {
    ctx.status = 404;
    ctx.body = `No RSVP yet`;
  }
  else {
    ctx.status = 200;
    ctx.body = guest.response;
  }
})

GuestRouter.post('/rsvp', async ctx => {
  const guest = ctx.state;
  const rsvp = RSVP.create(ctx.request.body as RSVP);
  await validateOrReject(rsvp, { whitelist: true });

  rsvp.guest = guest;
  rsvp.responseTime = new Date();
  guest.response = rsvp;

  await guest.save();

  ctx.status = 201;
  ctx.body = rsvp;
});

GuestRouter.get('/stickers', async ctx => {
  ctx.status = 200;
  ctx.body = ctx.state.stickers;
})

GuestRouter.post('/stickers', async ctx => {
  const guest = ctx.state;
  const sticker = Sticker.create(ctx.request.body as Sticker);
  await validateOrReject(sticker, { whitelist: true });

  sticker.owner = guest;
  await sticker.save();

  ctx.status = 201;
  ctx.body = sticker;
})

export default GuestRouter;
