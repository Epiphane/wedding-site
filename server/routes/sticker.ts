import { Context } from "koa";
import Router from "koa-router";
import Guest from "../model/guest";
import { SwaggerRouter } from "koa-swagger-decorator";
import RSVPController from "../controller/rsvp";
import RSVP from "../model/rsvp";
import { validateOrReject } from "class-validator";

const StickerRouter = new SwaggerRouter<Guest>({ prefix: '/stickers' })

StickerRouter.use(async (ctx, next) => {
  if (!ctx.state) { throw new Error("Error retrieving user"); }
  return next();
})

StickerRouter.get('/', async (ctx, next) => {
  const guest = ctx.state;
})

StickerRouter.post('/', async (ctx, next) => {
  const guest = ctx.state;
  const rsvp = RSVP.create(ctx.request.body as RSVP);
  await validateOrReject(rsvp, { whitelist: true });

  rsvp.guest = guest;
  rsvp.responseTime = new Date();
  guest.response = rsvp;

  await guest.save();

  ctx.status = 201;
  ctx.body = rsvp;
})

export default StickerRouter;
