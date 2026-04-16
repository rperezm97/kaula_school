import { SUBSCRIPTION_TIERS, hasAccessToTier, type SubscriptionTierKey, type SubscriptionTier } from "@shared/types";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import * as auth from "./auth";
import * as stripeService from "./stripe";
import { sendWelcomeEmail, sendPasswordResetEmail, sendAdminNotification } from "./email";

const slugSchema = z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format");
const positiveIntSchema = z.number().int().positive();
const optionalUrlSchema = z.string().url().optional();

export const appRouter = router({
  system: systemRouter,

  // ─── Auth ────────────────────────────────────────────────────────
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),

    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await auth.registerUser(input.email, input.password, input.name);
        if ("error" in result) throw new TRPCError({ code: "BAD_REQUEST", message: result.error });

        auth.setSessionCookieOnContext(ctx, result.token, ctx.runtimeEnv);

        // Send welcome email and admin notification (fire and forget)
        sendWelcomeEmail(input.email, input.name).catch(console.error);
        sendAdminNotification(
          "New Registration",
          `<p>New user registered: <strong>${input.email}</strong>${input.name ? ` (${input.name})` : ""}</p>`
        ).catch(console.error);

        return { success: true, user: result.user };
      }),

    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await auth.loginUser(input.email, input.password);
        if ("error" in result) throw new TRPCError({ code: "UNAUTHORIZED", message: result.error });

        auth.setSessionCookieOnContext(ctx, result.token, ctx.runtimeEnv);
        return { success: true, user: result.user };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      auth.clearSessionCookieOnContext(ctx, ctx.runtimeEnv);
      return { success: true } as const;
    }),

    changePassword: protectedProcedure
      .input(z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await auth.changePassword(ctx.user.id, input.currentPassword, input.newPassword);
        if (!result.success) throw new TRPCError({ code: "BAD_REQUEST", message: result.error });
        return { success: true };
      }),

    requestPasswordReset: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input, ctx }) => {
        const result = await auth.generateResetToken(input.email);
        if ("token" in result) {
          const resetUrl = `${ctx.runtimeEnv.appOrigin}/reset-password?token=${result.token}`;
          if (ctx.runtimeEnv.nodeEnv !== "production") {
            console.log("[DEV PASSWORD RESET URL]", resetUrl);
          }
          await sendPasswordResetEmail(input.email, resetUrl);
        }
        // Always return success to prevent email enumeration
        return { success: true, message: "If an account exists with this email, a reset link has been sent." };
      }),

    resetPassword: publicProcedure
      .input(z.object({
        token: z.string(),
        newPassword: z.string().min(8),
      }))
      .mutation(async ({ input }) => {
        const result = await auth.resetPassword(input.token, input.newPassword);
        if (!result.success) throw new TRPCError({ code: "BAD_REQUEST", message: result.error });
        return { success: true };
      }),
  }),

  // ─── Subscription ───────────────────────────────────────────────
  subscription: router({
    tiers: publicProcedure.query(() => {
      return Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => ({
        key,
        ...tier,
      }));
    }),

    createCheckout: protectedProcedure
      .input(z.object({
        tier: z.enum(["lower", "mid", "premium"]),
        contractAccepted: z.boolean(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!input.contractAccepted) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "You must accept the contract terms to proceed." });
        }

        // Save contract acceptance
        await db.updateUser(ctx.user.id, { contractAcceptedAt: new Date() });

        const result = await stripeService.createCheckoutSession(
          ctx.user.id,
          ctx.user.email!,
          input.tier,
          ctx.runtimeEnv
        );
        if ("error" in result) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error });
        return result;
      }),

    createPortal: protectedProcedure
      .input(z.object({}).optional())
      .mutation(async ({ ctx }) => {
        if (!ctx.user.stripeCustomerId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "No subscription found" });
        }
        const result = await stripeService.createPortalSession(ctx.user.stripeCustomerId, ctx.runtimeEnv);
        if ("error" in result) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error });
        return result;
      }),

    status: protectedProcedure.query(({ ctx }) => ({
      tier: ctx.user.subscriptionTier,
      status: ctx.user.subscriptionStatus,
      hasAccess: ctx.user.subscriptionStatus === "active" || ctx.user.role === "admin",
    })),
  }),

  // ─── Courses ────────────────────────────────────────────────────
  courses: router({
    sections: publicProcedure.query(async () => {
      const allSections = await db.getAllSections();
      return allSections.filter(s => s.isVisible);
    }),

    sectionBySlug: publicProcedure
      .input(z.object({ slug: slugSchema }))
      .query(async ({ input }) => {
        return db.getSectionBySlug(input.slug);
      }),

    videosBySection: protectedProcedure
      .input(z.object({ sectionId: positiveIntSchema }))
      .query(async ({ input, ctx }) => {
        const vids = await db.getVideosBySectionId(input.sectionId);
        // Filter by visibility for non-admins
        if (ctx.user.role !== "admin") {
          return vids.filter(v => v.isVisible);
        }
        return vids;
      }),

    videoBySlug: protectedProcedure
      .input(z.object({ slug: slugSchema }))
      .query(async ({ input, ctx }) => {
        const video = await db.getVideoBySlug(input.slug);
        if (!video) throw new TRPCError({ code: "NOT_FOUND", message: "Video not found" });
        const parentSection = video.sectionId ? await db.getSectionById(video.sectionId) : undefined;

        // Check tier access
        if (ctx.user.role !== "admin" && video.requiredTier !== "none") {
          const userTier = ctx.user.subscriptionTier as SubscriptionTier;
          if (!hasAccessToTier(userTier, video.requiredTier as SubscriptionTier)) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Upgrade your subscription to access this content" });
          }
        }

        // Get related videos
        let relatedVideos: any[] = [];
        if (video.relatedVideoIds && Array.isArray(video.relatedVideoIds)) {
          const promises = (video.relatedVideoIds as number[]).map(id => db.getVideoById(id));
          relatedVideos = (await Promise.all(promises)).filter(Boolean);
        }

        // Get attached resources
        const videoResources = await db.getResourcesByVideoId(video.id);

        return { ...video, sectionSlug: parentSection?.slug ?? null, relatedVideos, resources: videoResources };
      }),

    resourcesBySection: protectedProcedure
      .input(z.object({ sectionId: positiveIntSchema }))
      .query(async ({ input }) => {
        return db.getResourcesBySectionId(input.sectionId);
      }),

    search: protectedProcedure
      .input(z.object({ query: z.string().min(2) }))
      .query(async ({ input }) => {
        const [videoResults, resourceResults] = await Promise.all([
          db.searchVideos(input.query),
          db.searchResources(input.query),
        ]);
        return { videos: videoResults, resources: resourceResults };
      }),
  }),

  // ─── Notes ──────────────────────────────────────────────────────────
  notes: router({
    byVideo: protectedProcedure
      .input(z.object({ videoId: positiveIntSchema }))
      .query(async ({ input, ctx }) => {
        return db.getNotesByVideoAndUser(ctx.user.id, input.videoId);
      }),

    all: protectedProcedure.query(async ({ ctx }) => {
      return db.getAllNotesByUser(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        videoId: positiveIntSchema,
        content: z.string().min(1).max(5000),
        timestampSeconds: z.number().int().nonnegative().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createNote({ userId: ctx.user.id, videoId: input.videoId, content: input.content, timestampSeconds: input.timestampSeconds ?? null });
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({ id: positiveIntSchema, content: z.string().min(1).max(5000) }))
      .mutation(async ({ input, ctx }) => {
        await db.updateNote(input.id, ctx.user.id, input.content);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: positiveIntSchema }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteNote(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ─── Progress ───────────────────────────────────────────────────
  progress: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserProgress(ctx.user.id);
    }),

    update: protectedProcedure
      .input(z.object({
        videoId: positiveIntSchema,
        watchedSeconds: z.number().min(0),
        completed: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.upsertProgress(ctx.user.id, input.videoId, input.watchedSeconds, input.completed ?? false);
        return { success: true };
      }),

    recent: protectedProcedure
      .input(z.object({ limit: z.number().int().positive().max(10).optional() }).optional())
      .query(async ({ input, ctx }) => {
        return db.getRecentProgress(ctx.user.id, input?.limit ?? 5);
      }),

    videoProgress: protectedProcedure
      .input(z.object({ videoId: positiveIntSchema }))
      .query(async ({ input, ctx }) => {
        const progress = await db.getVideoProgress(ctx.user.id, input.videoId);
        return progress || { userId: ctx.user.id, videoId: input.videoId, watchedSeconds: 0, completed: false, createdAt: new Date(), updatedAt: new Date() };
      }),
  }),

  // ─── Bookmarks ─────────────────────────────────────────────────
  bookmarks: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const bms = await db.getUserBookmarks(ctx.user.id);
      // Fetch video details for each bookmark
      const videosData = await Promise.all(bms.map(b => db.getVideoById(b.videoId)));
      return bms.map((b, i) => ({ ...b, video: videosData[i] }));
    }),

    toggle: protectedProcedure
      .input(z.object({ videoId: positiveIntSchema }))
      .mutation(async ({ input, ctx }) => {
        const isBookmarked = await db.toggleBookmark(ctx.user.id, input.videoId);
        return { isBookmarked };
      }),
  }),

  // ─── Admin ──────────────────────────────────────────────────────
  admin: router({
    // Users
    users: adminProcedure.query(async () => {
      return db.getAllUsers();
    }),

    updateUserRole: adminProcedure
      .input(z.object({ userId: positiveIntSchema, role: z.enum(["user", "admin"]) }))
      .mutation(async ({ input }) => {
        await db.updateUser(input.userId, { role: input.role });
        return { success: true };
      }),

    // Sections
    sections: adminProcedure.query(async () => {
      return db.getAllSections();
    }),

    createSection: adminProcedure
      .input(z.object({
        title: z.string(),
        slug: slugSchema,
        description: z.string().optional(),
        sortOrder: z.number().optional(),
        parentId: positiveIntSchema.nullable().optional(),
        iconName: z.string().optional(),
        requiredTier: z.enum(["none", "lower", "mid", "premium"]).optional(),
        isVisible: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createSection(input as any);
        return { success: true };
      }),

    updateSection: adminProcedure
      .input(z.object({
        id: positiveIntSchema,
        title: z.string().optional(),
        slug: slugSchema.optional(),
        description: z.string().optional(),
        sortOrder: z.number().optional(),
        parentId: positiveIntSchema.nullable().optional(),
        iconName: z.string().optional(),
        requiredTier: z.enum(["none", "lower", "mid", "premium"]).optional(),
        isVisible: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateSection(id, data as any);
        return { success: true };
      }),

    deleteSection: adminProcedure
      .input(z.object({ id: positiveIntSchema }))
      .mutation(async ({ input }) => {
        await db.deleteSection(input.id);
        return { success: true };
      }),

    // Videos
    videos: adminProcedure.query(async () => {
      return db.getAllVideos();
    }),

    createVideo: adminProcedure
      .input(z.object({
        sectionId: positiveIntSchema,
        title: z.string(),
        slug: slugSchema,
        description: z.string().optional(),
        googleDriveFileId: z.string().optional(),
        googleDriveUrl: optionalUrlSchema,
        cloudflareStreamId: z.string().optional(),
        subtitleUrl: optionalUrlSchema,
        thumbnailUrl: optionalUrlSchema,
        durationSeconds: z.number().optional(),
        sortOrder: z.number().optional(),
        requiredTier: z.enum(["none", "lower", "mid", "premium"]).optional(),
        isVisible: z.boolean().optional(),
        relatedVideoIds: z.array(positiveIntSchema).optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createVideo(input as any);
        return { success: true };
      }),

    updateVideo: adminProcedure
      .input(z.object({
        id: positiveIntSchema,
        sectionId: positiveIntSchema.optional(),
        title: z.string().optional(),
        slug: slugSchema.optional(),
        description: z.string().optional(),
        googleDriveFileId: z.string().optional(),
        googleDriveUrl: optionalUrlSchema,
        cloudflareStreamId: z.string().optional(),
        streamStatus: z.string().optional(),
        subtitleUrl: optionalUrlSchema,
        thumbnailUrl: optionalUrlSchema,
        durationSeconds: z.number().optional(),
        sortOrder: z.number().optional(),
        requiredTier: z.enum(["none", "lower", "mid", "premium"]).optional(),
        isVisible: z.boolean().optional(),
        relatedVideoIds: z.array(positiveIntSchema).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateVideo(id, data as any);
        return { success: true };
      }),

    deleteVideo: adminProcedure
      .input(z.object({ id: positiveIntSchema }))
      .mutation(async ({ input }) => {
        await db.deleteVideo(input.id);
        return { success: true };
      }),

    // Resources
    resources: adminProcedure.query(async () => {
      return db.getAllResources();
    }),

    createResource: adminProcedure
      .input(z.object({
        sectionId: positiveIntSchema.nullable().optional(),
        videoId: positiveIntSchema.nullable().optional(),
        title: z.string(),
        description: z.string().optional(),
        fileUrl: z.string().url(),
        fileType: z.string(),
        fileSize: z.number().nonnegative().optional(),
        requiredTier: z.enum(["none", "lower", "mid", "premium"]).optional(),
        isVisible: z.boolean().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createResource(input as any);
        return { success: true };
      }),

    updateResource: adminProcedure
      .input(z.object({
        id: positiveIntSchema,
        title: z.string().optional(),
        description: z.string().optional(),
        fileUrl: z.string().url().optional(),
        fileType: z.string().optional(),
        requiredTier: z.enum(["none", "lower", "mid", "premium"]).optional(),
        isVisible: z.boolean().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateResource(id, data as any);
        return { success: true };
      }),

    deleteResource: adminProcedure
      .input(z.object({ id: positiveIntSchema }))
      .mutation(async ({ input }) => {
        await db.deleteResource(input.id);
        return { success: true };
      }),

    // Invoices
    invoices: adminProcedure
      .input(z.object({ limit: z.number().int().positive().max(200).optional() }).optional())
      .query(async ({ input }) => {
        return stripeService.getAllInvoices(input?.limit ?? 50);
      }),

    // Email logs
    emailLogs: adminProcedure
      .input(z.object({ limit: z.number().int().positive().max(200).optional() }).optional())
      .query(async ({ input }) => {
        return db.getEmailLogs(input?.limit ?? 50);
      }),

    // Newsletter
    newsletterSubscribers: adminProcedure.query(async () => {
      return db.getAllNewsletterSubscribers();
    }),

    removeNewsletterSubscriber: adminProcedure
      .input(z.object({ id: positiveIntSchema }))
      .mutation(async ({ input }) => {
        await db.removeNewsletterSubscriber(input.id);
        return { success: true };
      }),

    // Programs
    programs: adminProcedure.query(async () => {
      return db.getAllPrograms();
    }),

    // Stats
    stats: adminProcedure.query(async () => {
      const allUsers = await db.getAllUsers();
      const activeSubscribers = allUsers.filter(u => u.subscriptionStatus === "active");
      const newsletters = await db.getAllNewsletterSubscribers();
      return {
        totalUsers: allUsers.length,
        activeSubscribers: activeSubscribers.length,
        newsletterSubscribers: newsletters.filter(n => n.isActive).length,
        tierBreakdown: {
          lower: activeSubscribers.filter(u => u.subscriptionTier === "lower").length,
          mid: activeSubscribers.filter(u => u.subscriptionTier === "mid").length,
          premium: activeSubscribers.filter(u => u.subscriptionTier === "premium").length,
        },
      };
    }),
  }),

  // ─── Stream (Cloudflare) ────────────────────────────────────────────
  stream: router({
    token: protectedProcedure
      .input(z.object({ videoId: positiveIntSchema }))
      .query(async ({ input, ctx }) => {
        const video = await db.getVideoById(input.videoId);
        if (!video?.cloudflareStreamId) throw new TRPCError({ code: "NOT_FOUND", message: "No stream configured for this video" });

        const accountId = ctx.runtimeEnv.cloudflareAccountId;
        const apiToken = ctx.runtimeEnv.cloudflareStreamApiToken;
        if (!accountId || !apiToken) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Cloudflare Stream not configured" });

        // Generate signed token via Cloudflare Stream API
        const expiresAt = Math.floor(Date.now() / 1000) + 3600; // 1 hour
        const response = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${video.cloudflareStreamId}/token`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({ exp: expiresAt }),
          }
        );
        if (!response.ok) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to generate stream token" });
        const data = await response.json() as { result: { token: string } };
        return { token: data.result.token, cloudflareStreamId: video.cloudflareStreamId };
      }),

    uploadUrl: adminProcedure.mutation(async ({ ctx }) => {
      const accountId = ctx.runtimeEnv.cloudflareAccountId;
      const apiToken = ctx.runtimeEnv.cloudflareStreamApiToken;
      if (!accountId || !apiToken) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Cloudflare Stream not configured" });

      // Get a TUS upload URL valid for 6 hours
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream?direct_user=true`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Tus-Resumable": "1.0.0",
            "Upload-Length": "0",
            "Upload-Metadata": `maxDurationSeconds ${btoa("21600")}`,
          },
        }
      );
      if (!response.ok) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to get upload URL" });
      const uploadUrl = response.headers.get("Location");
      const streamId = response.headers.get("stream-media-id");
      return { uploadUrl, streamId };
    }),
  }),

  // ─── Newsletter (public) ───────────────────────────────────────
  newsletter: router({
    subscribe: publicProcedure
      .input(z.object({ email: z.string().email(), name: z.string().optional() }))
      .mutation(async ({ input }) => {
        await db.addNewsletterSubscriber(input.email, input.name);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
