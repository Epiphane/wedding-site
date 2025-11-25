import { Context } from "koa";
import { Not, Equal } from "typeorm";
import { validateOrReject } from "class-validator";
import { request, summary, path, body, responsesAll, tagsAll, prefix } from "koa-swagger-decorator";
import Guest from "../model/guest";

export default class GuestController {
}
