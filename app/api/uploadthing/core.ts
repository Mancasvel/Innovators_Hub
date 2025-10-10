import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isOrganizerOrAdmin } from "@/lib/permissions";

const f = createUploadthing();

/**
 * Uploadthing file router
 * Defines upload endpoints and their configurations
 */
export const ourFileRouter = {
  /**
   * Event image uploader
   * Allows organizers and admins to upload event images
   */
  eventImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      // Authentication check
      const session = await getServerSession(authOptions);
      
      if (!session?.user) {
        throw new Error("Unauthorized");
      }

      // Authorization check (organizer or admin only)
      if (!isOrganizerOrAdmin(session)) {
        throw new Error("Only organizers and admins can upload event images");
      }

      // Return metadata to be available in onUploadComplete
      return { 
        userId: (session.user as any).id,
        userName: session.user.name,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Log upload for auditing
      console.log("✅ Event image uploaded:", file.url, "by", metadata.userName);

      // Return data to client
      return { 
        url: file.url,
        uploadedBy: metadata.userId,
      };
    }),

  /**
   * User profile image uploader
   * Allows any authenticated user to upload profile pictures
   */
  profileImage: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await getServerSession(authOptions);
      
      if (!session?.user) {
        throw new Error("Unauthorized");
      }

      return { 
        userId: (session.user as any).id,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("✅ Profile image uploaded:", file.url, "by", metadata.userId);
      
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

