import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

/**
 * Uploadthing route handler
 * Exposes GET and POST endpoints for file uploads
 */
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});

