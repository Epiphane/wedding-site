import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm"
import KoaRouter from 'koa-router';
import Guest from "./model/guest";
import { SwaggerRouter } from "koa-swagger-decorator";
import GuestController from "./controller/guest";
import { ValidationError } from "class-validator";

const router = new SwaggerRouter();
// router.get('/guests', GuestController.getGuests);

router.use(async (ctx, next) => {
  try {
    await next();
  } catch (err: ValidationError[] | any) {
    if (Array.isArray(err) && err[0] instanceof ValidationError) {
      ctx.status = 400;
      ctx.body = err.map((e: ValidationError) => e.toString()).join();
    }
    else {
      throw err;
    }
  }
});
router.swagger({
  title: "node-typescript-koa-rest",
  description: "Wedding Website API",
  swaggerHtmlEndpoint: '/swagger',
  swaggerJsonEndpoint: '/swagger.json',
});
router.mapDir(__dirname, { doValidation: false });

export default router;
