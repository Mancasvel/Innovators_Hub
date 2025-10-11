import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

/**
 * Uploadthing route handler
 * Exposes GET and POST endpoints for file uploads
 * 
 * Authentication:
 * - New mode: Uses UPLOADTHING_TOKEN environment variable
 * - Legacy mode: Uses UPLOADTHING_SECRET + UPLOADTHING_APP_ID
 * 
 * UploadThing automatically detects which mode to use based on available env vars
 */
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});

