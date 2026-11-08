// Cloudflare Worker: serves the static export (out/) and the label API.
// Deployed by `npx wrangler deploy` with wrangler.jsonc. Only /api/* reaches this code (run_worker_first),
// everything else is served straight from the static assets.
import { onRequest, type Env as LabelsEnv } from "./labels";

type Env = LabelsEnv & { ASSETS: { fetch(request: Request): Promise<Response> } };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (new URL(request.url).pathname === "/api/labels") return onRequest({ request, env });
    return env.ASSETS.fetch(request);
  },
};
