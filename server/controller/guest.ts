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
    guest.response = rsvp;

    await guest.save();
    return rsvp;
  }

  public static async getStickers(guest: Guest): Promise<Sticker[]> {
    return guest.stickers;
  }

  public static async addSticker(guestId: Guest["id"], info: Partial<Sticker>): Promise<Sticker> {
    const sticker = Sticker.create<Sticker>(info);
    await validateOrReject(sticker, { whitelist: true });

    sticker.ownerId = guestId;
    return sticker.save();
  }

  public static async updateSticker(guestId: Guest["id"], info: Partial<Sticker>): Promise<Sticker> {
    const stickerId = { ownerId: guestId, id: info.id };
    const partial = Sticker.create<Sticker>(info);
    await validateOrReject(partial, { skipMissingProperties: true, whitelist: true });
    await Sticker.update(stickerId, partial);
    return Sticker.findOneByOrFail(stickerId);
  }
}
