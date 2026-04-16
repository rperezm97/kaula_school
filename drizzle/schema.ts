import { integer, pgEnum, pgTable, text, timestamp, varchar, boolean, json, serial } from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const subscriptionTierEnum = pgEnum("subscription_tier", ["none", "lower", "mid", "premium"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["none", "active", "past_due", "canceled", "trialing"]);
export const requiredTierEnum = pgEnum("required_tier", ["none", "lower", "mid", "premium"]);
export const emailStatusEnum = pgEnum("email_status", ["sent", "failed", "pending"]);

// ─── Users ───────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  subscriptionTier: subscriptionTierEnum("subscriptionTier").default("none").notNull(),
  subscriptionStatus: subscriptionStatusEnum("subscriptionStatus").default("none").notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  contractAcceptedAt: timestamp("contractAcceptedAt"),
  resetToken: varchar("resetToken", { length: 255 }),
  resetTokenExpiresAt: timestamp("resetTokenExpiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Course Sections ─────────────────────────────────────────────────
export const sections = pgTable("sections", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  sortOrder: integer("sortOrder").default(0).notNull(),
  parentId: integer("parentId"),
  iconName: varchar("iconName", { length: 64 }),
  requiredTier: requiredTierEnum("requiredTier").default("none").notNull(),
  isVisible: boolean("isVisible").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Section = typeof sections.$inferSelect;
export type InsertSection = typeof sections.$inferInsert;

// ─── Videos / Lessons ────────────────────────────────────────────────
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  sectionId: integer("sectionId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  googleDriveFileId: varchar("googleDriveFileId", { length: 255 }),
  googleDriveUrl: text("googleDriveUrl"),
  cloudflareStreamId: varchar("cloudflareStreamId", { length: 255 }),
  streamStatus: varchar("streamStatus", { length: 64 }),
  subtitleUrl: text("subtitleUrl"),
  thumbnailUrl: text("thumbnailUrl"),
  durationSeconds: integer("durationSeconds"),
  sortOrder: integer("sortOrder").default(0).notNull(),
  requiredTier: requiredTierEnum("requiredTier").default("none").notNull(),
  isVisible: boolean("isVisible").default(true).notNull(),
  relatedVideoIds: json("relatedVideoIds").$type<number[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Video = typeof videos.$inferSelect;
export type InsertVideo = typeof videos.$inferInsert;

// ─── Resources (PDFs, files) ────────────────────────────────────────
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  sectionId: integer("sectionId"),
  videoId: integer("videoId"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  fileUrl: text("fileUrl").notNull(),
  fileType: varchar("fileType", { length: 64 }).notNull(),
  fileSize: integer("fileSize"),
  requiredTier: requiredTierEnum("requiredTier").default("none").notNull(),
  isVisible: boolean("isVisible").default(true).notNull(),
  sortOrder: integer("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Resource = typeof resources.$inferSelect;
export type InsertResource = typeof resources.$inferInsert;

// ─── User Progress ──────────────────────────────────────────────────
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  videoId: integer("videoId").notNull(),
  watchedSeconds: integer("watchedSeconds").default(0).notNull(),
  completed: boolean("completed").default(false).notNull(),
  lastWatchedAt: timestamp("lastWatchedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type UserProgress = typeof userProgress.$inferSelect;

// ─── Bookmarks ──────────────────────────────────────────────────────
export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  videoId: integer("videoId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Bookmark = typeof bookmarks.$inferSelect;

// ─── Newsletter Subscribers (separate from course users) ────────────
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: text("name"),
  isActive: boolean("isActive").default(true).notNull(),
  subscribedAt: timestamp("subscribedAt").defaultNow().notNull(),
  unsubscribedAt: timestamp("unsubscribedAt"),
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;

// ─── Email Log ──────────────────────────────────────────────────────
export const emailLog = pgTable("email_log", {
  id: serial("id").primaryKey(),
  recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  templateName: varchar("templateName", { length: 100 }),
  status: emailStatusEnum("status").default("pending").notNull(),
  errorMessage: text("errorMessage"),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailLogEntry = typeof emailLog.$inferSelect;

// ─── Video Notes (student timestamped notes) ────────────────────────
export const videoNotes = pgTable("video_notes", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  videoId: integer("videoId").notNull(),
  content: text("content").notNull(),
  timestampSeconds: integer("timestampSeconds"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type VideoNote = typeof videoNotes.$inferSelect;
export type InsertVideoNote = typeof videoNotes.$inferInsert;

// ─── Extra Programs (future paid content) ───────────────────────────
export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  stripePriceId: varchar("stripePriceId", { length: 255 }),
  stripeProductId: varchar("stripeProductId", { length: 255 }),
  price: integer("price"),
  currency: varchar("currency", { length: 3 }).default("eur"),
  isVisible: boolean("isVisible").default(false).notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Program = typeof programs.$inferSelect;

// ─── User Program Access ────────────────────────────────────────────
export const userProgramAccess = pgTable("user_program_access", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  programId: integer("programId").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  grantedAt: timestamp("grantedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
});

export type UserProgramAccess = typeof userProgramAccess.$inferSelect;
