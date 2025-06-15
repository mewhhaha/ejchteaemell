import { routes } from "../app/routes.mjs";
import { Router } from "@mewhhaha/fx-router";

const router = Router(routes);
const handler: ExportedHandler<Cloudflare.Env> = {
  fetch: router.handle,
};

export default handler;
