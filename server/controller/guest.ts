import { Context } from "koa";
import { Not, Equal } from "typeorm";
import { validateOrReject } from "class-validator";
import { request, summary, path, body, responsesAll, tagsAll, prefix } from "koa-swagger-decorator";
import Guest from "../model/guest";

const guestId = {
  id: { type: "number", required: true, description: "id of guest" }
};

const guestSchema = {
  name: { type: "string", required: true, example: "Thomas" },
  email: { type: "string", required: true, example: "thomasteinke@gmail.com" }
};


@prefix('/guests')
@responsesAll({ 200: { description: "success" }, 400: { description: "bad request" }, 401: { description: "unauthorized" } })
@tagsAll(['Guest'])
export default class GuestController {
  @request("get", "/")
  @summary("Find all guests")
  public static async getGuests(ctx: Context): Promise<void> {
    // get a guest repository to perform operations with guest
    const guests = await Guest.find();

    // return OK status code and loaded guests array
    ctx.status = 200;
    ctx.body = guests;
  }

  @request("get", "/{id}")
  @summary("Find guest by id")
  @path(guestId)
  public static async getGuest(ctx: Context): Promise<void> {
    const guest = await Guest.findOneBy({
      id: ctx.params.id
    });

    if (guest) {
      ctx.status = 200;
      ctx.body = guest;
    } else {
      ctx.status = 400;
      ctx.body = "Guest not found";
    }
  }

  @request("post", "/")
  @summary("Create a guest")
  @body(guestSchema)
  public static async createGuest(ctx: Context) {
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
  }

  @request("put", "/{id}")
  @summary("Update a guest")
  @path(guestId)
  @body(guestSchema)
  public static async updateGuest(ctx: Context): Promise<void> {
    const guest: Guest = await Guest.findOneByOrFail({ id: ctx.params.id });
    guest.name = (ctx.request.body as any).name;
    guest.email = (ctx.request.body as any).email;
    await validateOrReject(guest);

    if (!await Guest.findOneBy({ id: guest.id })) {
      ctx.status = 404;
      ctx.body = "The guest you are trying to update doesn't exist in the db";
    } else if (await Guest.findOneBy({ id: Not(Equal(guest.id)), email: guest.email })) {
      ctx.status = 400;
      ctx.body = "The specified e-mail address already exists";
    } else {
      ctx.status = 201;
      ctx.body = await guest.save();
    }
  }

  @request("delete", "/{id}")
  @summary("Delete guest by id")
  @path(guestId)
  public static async deleteGuest(ctx: Context): Promise<void> {
    const guestToRemove: Guest = await Guest.findOneByOrFail({ id: ctx.params.id });
    if (!guestToRemove) {
      ctx.status = 404;
      ctx.body = "The guest you are trying to delete doesn't exist in the db";
    } else {
      await guestToRemove.remove();
      ctx.status = 204;
    }
  }
}
