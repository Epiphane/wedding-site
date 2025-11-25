import { Context, Middleware } from "koa";
import { Not, Equal } from "typeorm";
import { validateOrReject } from "class-validator";
import { request, summary, path, body, tagsAll, prefix, middlewaresAll, securityAll, security } from "koa-swagger-decorator";
import Guest from "../model/guest";
import auth from "basic-auth";

const guestSchema = {
  attending: { type: "boolean", required: true, example: true },
  plusOne: { type: "boolean", required: true, example: false }
};

@prefix('/rsvp')
@tagsAll(['RSVP'])
@middlewaresAll([async (ctx: Context, next: Function) => {
  console.log(ctx);
  const authHeader = auth(ctx.request);
  if (!authHeader) {
    ctx.status = 401;
    ctx.body = "I'm not sure who you are!";
    return;
  }

  ctx.guest = Guest.findOneByOrFail({ id: authHeader.name });
  await next();
}])
export default class RSVPController {
  @request("get", "/")
  @security([{ basic_auth: [] }])
  @summary("Get RSVP status")
  public static async getStatus(ctx: Context): Promise<void> {
    // get a guest repository to perform operations with guest
    const guests = await Guest.find();

    // return OK status code and loaded guests array
    ctx.status = 200;
    ctx.body = guests;
  }
}
