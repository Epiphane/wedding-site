import { security, SwaggerRouter } from "koa-swagger-decorator";
import { ValidationError } from "class-validator";
import GuestController from "./controller/guest";
import RSVPController from "./controller/rsvp";
import { Context } from "koa";
import Guest from "./model/guest";
import auth from "basic-auth";

const router = new SwaggerRouter({ prefix: "/api" });

// Catch validation errors
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

// const RSVPRouter = new SwaggerRouter({ prefix: "/rsvp" });
// RSVPRouter.use((ctx: Context, next) => {
//   const authHeader = auth(ctx.request);
//   if (!authHeader) {
//     ctx.status = 401;
//     ctx.body = "I'm not sure who you are!";
//     return;
//   }

//   ctx.guest = Guest.findOneByOrFail({ id: authHeader.name });
// });
// RSVPRouter.map(RSVPController, { doValidation: false })
// RSVPRouter.swagger({
//   swaggerOptions: {
//     security: [{ basic_auth: [] }]
//   }
// })

// router.map(RSVPRouter, { doValidation: false });
// router.map(GuestController, { doValidation: false })
// router.mapDir(__dirname, { doValidation: false });
router.swagger({
  title: "node-typescript-koa-rest",
  description: "Wedding Website API",
  swaggerHtmlEndpoint: '/swagger',
  swaggerJsonEndpoint: '/swagger.json',
  swaggerOptions: {
    securityDefinitions: {
      basic_auth: {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
      },
    },
  },
});

export default router;
