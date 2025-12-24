import { validateOrReject } from "class-validator";
import { SwaggerRouter } from "koa-swagger-decorator";
import { Not, Equal } from "typeorm";
import Guest from "../model/guest";

const GuestAdminRouter = new SwaggerRouter({ prefix: '/guests' });

GuestAdminRouter.get('/', async (ctx) => {
  ctx.status = 200;
  ctx.body = await Guest.find();
});

GuestAdminRouter.get('/:id', async (ctx) => {
  const guest = await Guest.findOneBy({ id: +ctx.params.id });
  if (guest) {
    ctx.status = 200;
    ctx.body = guest.toJSON();
    ctx.body.people = await guest.people;
  } else {
    ctx.status = 404;
    ctx.body = "Guest not found";
  }
});

GuestAdminRouter.post('/', async ctx => {
  const guest = Guest.create(ctx.request.body as Guest);
  await validateOrReject(guest, { whitelist: true });

  guest.plusOneAllowed = guest.partnerId === null;

  ctx.status = 201;
  ctx.body = await guest.save();

  if (guest.partnerId !== null) {
    const newPartner = await Guest.findOneByOrFail({ id: guest.partnerId });
    newPartner.partnerId = guest.id;
    newPartner.plusOneAllowed = false;
    await newPartner.save();
  }

  ctx.status = 201;
  ctx.body = await guest.save();
});

GuestAdminRouter.put('/:id', async ctx => {
  const guest = await Guest.findOneByOrFail({ id: +ctx.params.id });
  const oldPartnerId = guest.partnerId;
  const request = Guest.create<Guest>(ctx.request.body as Partial<Guest>);
  await validateOrReject(request, { skipNullProperties: true, skipUndefinedProperties: true, skipMissingProperties: true, whitelist: true });
  Object.assign(guest, request);
  await validateOrReject(guest);

  if (guest.partnerId !== oldPartnerId) {
    if (oldPartnerId !== null) {
      const oldPartner = await Guest.findOneByOrFail({ id: oldPartnerId });
      oldPartner.partnerId = null;
      await oldPartner.save();
    }

    if (guest.partnerId !== null) {
      const newPartner = await Guest.findOneByOrFail({ id: guest.partnerId });
      newPartner.partnerId = guest.id;
      newPartner.plusOneAllowed = false;
      await newPartner.save();
    }

    guest.plusOneAllowed = guest.partnerId === null;
  }

  if (await Guest.findOneBy({ id: Not(Equal(guest.id)), email: guest.email })) {
    ctx.status = 400;
    ctx.body = "The specified e-mail address already exists";
  } else {
    ctx.status = 201;
    ctx.body = await guest.save();
  }
});

GuestAdminRouter.delete('/:id', async ctx => {
  const guest = await Guest.findOneByOrFail({ id: +ctx.params.id });
  if (!guest) {
    ctx.status = 404;
    ctx.body = "The guest you are trying to delete doesn't exist in the db";
  } else {
    if (guest.partnerId) {
      const oldPartner = await Guest.findOneByOrFail({ id: guest.partnerId });
      oldPartner.partnerId = null;
      await oldPartner.save();
    }

    await guest.remove();
    ctx.status = 204;
  }
});

export default GuestAdminRouter;
