import { Context } from "koa";
import RSVP from "../model/rsvp";
import Guest from "../model/guest";

export default class RSVPController {
  public static async getStatus(guest: Guest, ctx: Context): Promise<void> {
    if (!guest.response) {
      ctx.status = 404;
      ctx.body = `No RSVP yet`;
    }
    else {
      ctx.status = 200;
      ctx.body = guest.response;
    }
  }
}
