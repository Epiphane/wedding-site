import { security, SwaggerRouter } from "koa-swagger-decorator";
import { ValidationError } from "class-validator";
import GuestRouter from "./routes/guest";
import { Context, Middleware } from "koa";
import Guest from "./model/guest";
import auth from "basic-auth";
import GuestAdminRouter from "./routes/guest-admin";

const router = new SwaggerRouter({ prefix: "/api" });

// Catch validation errors
router.use(async (ctx, next) => {
  try {
    await next();
  } catch (err: ValidationError[] | any) {
    if (Array.isArray(err) && err[0] instanceof ValidationError) {
      ctx.status = 400;
      console.log(err.toString());
      ctx.body = err.map((e: ValidationError) => e.toString(false, true, '', true)).join('');
    }
    else {
      throw err;
    }
  }
});

const GuestFromHeader: Middleware<Guest> = async (ctx, next) => {
  const authHeader = auth(ctx.request);
  if (!authHeader) {
    ctx.status = 401;
    ctx.body = "I'm not sure who you are!";
    return;
  }

  const guest = await Guest.findByName(authHeader.name);
  if (!guest) {
    ctx.status = 404;
    ctx.body = `Could not find guest ${authHeader.name}`;
    return;
  }

  ctx.state = guest;
  return next();
}

router.use('/guests/me', GuestFromHeader, GuestRouter.routes(), GuestRouter.allowedMethods());
router.use(GuestAdminRouter.routes(), GuestAdminRouter.allowedMethods());
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
