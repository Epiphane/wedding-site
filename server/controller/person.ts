import { Context } from "koa";
import { Not, Equal } from "typeorm";
import { validateOrReject } from "class-validator";
import { request, summary, path, body, responsesAll, tagsAll, prefix } from "koa-swagger-decorator";
import Person from "../model/person";
import RSVP from "../model/rsvp";
import Sticker from "../model/sticker";

export default class PersonController {
  public static async getStickers(person: Person): Promise<Sticker[]> {
    return person.stickers;
  }

  public static async addSticker(personId: Person["id"], info: Partial<Sticker>): Promise<Sticker> {
    const sticker = Sticker.create<Sticker>(info);
    await validateOrReject(sticker, { whitelist: true });

    sticker.ownerId = personId;
    return sticker.save();
  }

  public static async updateSticker(personId: Person["id"], info: Partial<Sticker>): Promise<Sticker> {
    const stickerId = { ownerId: personId, id: info.id };
    const partial = Sticker.create<Sticker>(info);
    await validateOrReject(partial, { skipMissingProperties: true, whitelist: true });
    await Sticker.update(stickerId, partial);
    return Sticker.findOneByOrFail(stickerId);
  }
}
