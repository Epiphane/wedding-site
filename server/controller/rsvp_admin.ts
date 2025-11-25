import auth from "basic-auth";
import { prefix, securityAll, middlewaresAll, security, summary, request, Context, tagsAll } from "koa-swagger-decorator";
import Guest from "../model/guest";
import RSVPController from "./rsvp";


@prefix('/guest/{id}/rsvp')
@securityAll([{ basic_auth: [] }])
@tagsAll(['RSVP'])
export default class AdminRSVPController extends RSVPController {
  @request("get", "/")
  @summary("Get RSVP status")
  public static async getStatus(ctx: Context): Promise<void> {
    console.log('hi');
    return RSVPController.getStatus(ctx);
  }
}
