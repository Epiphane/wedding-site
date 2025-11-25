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
    ctx.body = guest;
  } else {
    ctx.status = 404;
    ctx.body = "Guest not found";
  }
});

GuestAdminRouter.post('/', async ctx => {
  const guest = Guest.create(ctx.request.body as Guest);
  await validateOrReject(guest, { whitelist: true });

  if (await Guest.findOneBy({ email: guest.email })) {
    // return BAD REQUEST status code and email already exists error
    ctx.status = 400;
    ctx.body = "The specified e-mail address already exists";
  } else {
    // save the guest contained in the POST body
    ctx.status = 201;
    ctx.body = await guest.save();
  }
});

GuestAdminRouter.put('/:id', async ctx => {
  const guest = await Guest.findOneByOrFail({ id: +ctx.params.id });
  const { firstName, lastName, email } = ctx.request.body as any;
  guest.firstName = firstName;
  guest.lastName = lastName;
  guest.email = email;
  await validateOrReject(guest);

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
    await guest.remove();
    ctx.status = 204;
  }
});

export default GuestAdminRouter;
