import { Context } from "koa";
import { Not, Equal } from "typeorm";
import { validateOrReject } from "class-validator";
import { request, summary, path, body, responsesAll, tagsAll, prefix } from "koa-swagger-decorator";
import Guest from "../model/guest";
import RSVP from "../model/rsvp";
import Sticker from "../model/sticker";

export default class GuestController {
  public static async getResponse(guest: Guest): Promise<RSVP> {
    return guest.response;
  }

  public static async setResponse(guest: Guest, response: Partial<RSVP>) {
    const rsvp = RSVP.create<RSVP>(response);
    await validateOrReject(rsvp, { whitelist: true });

    rsvp.guest = guest;
    rsvp.responseTime = new Date();
    // if the payload includes onsite flag, it will be set via create above
    guest.response = rsvp;

    await guest.save();
    return rsvp;
  }
}
