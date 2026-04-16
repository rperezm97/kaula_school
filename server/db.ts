import { eq, and, like, or, desc, asc, isNull, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  InsertUser, users, sections, videos, resources, userProgress,
  bookmarks, newsletterSubscribers, emailLog, programs, userProgramAccess,
  videoNotes,
  type InsertSection, type InsertVideo, type InsertResource, type InsertVideoNote
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && ENV.databaseUrl) {
    try {
      const client = postgres(ENV.databaseUrl, { max: 1, ssl: "require" });
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── User Helpers ────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod", "passwordHash"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    (values as any)[field] = value ?? null;
    updateSet[field] = value ?? null;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.email === ENV.adminEmail) {
    values.role = 'admin';
    updateSet.role = 'admin';
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onConflictDoUpdate({ target: users.openId, set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUser(id: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, id));
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function getUserByResetToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.resetToken, token)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Section Helpers ─────────────────────────────────────────────────

export async function getAllSections() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sections).orderBy(asc(sections.sortOrder));
}

export async function getSectionBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(sections).where(eq(sections.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getSectionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(sections).where(eq(sections.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSection(data: InsertSection) {
  const db = await getDb();
  if (!db) return;
  await db.insert(sections).values(data);
}

export async function updateSection(id: number, data: Partial<InsertSection>) {
  const db = await getDb();
  if (!db) return;
  await db.update(sections).set(data).where(eq(sections.id, id));
}

export async function deleteSection(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(sections).where(eq(sections.id, id));
}

// ─── Video Helpers ───────────────────────────────────────────────────

export async function getVideosBySectionId(sectionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(videos).where(eq(videos.sectionId, sectionId)).orderBy(asc(videos.sortOrder));
}

export async function getVideoBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(videos).where(eq(videos.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getVideoById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(videos).where(eq(videos.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllVideos() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(videos).orderBy(asc(videos.sortOrder));
}

export async function createVideo(data: InsertVideo) {
  const db = await getDb();
  if (!db) return;
  await db.insert(videos).values(data);
}

export async function updateVideo(id: number, data: Partial<InsertVideo>) {
  const db = await getDb();
  if (!db) return;
  await db.update(videos).set(data).where(eq(videos.id, id));
}

export async function deleteVideo(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(videos).where(eq(videos.id, id));
}

export async function searchVideos(query: string) {
  const db = await getDb();
  if (!db) return [];
  const pattern = `%${query}%`;
  return db.select().from(videos).where(
    or(like(videos.title, pattern), like(videos.description, pattern))
  );
}

// ─── Resource Helpers ────────────────────────────────────────────────

export async function getResourcesBySectionId(sectionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(resources).where(eq(resources.sectionId, sectionId)).orderBy(asc(resources.sortOrder));
}

export async function getResourcesByVideoId(videoId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(resources).where(eq(resources.videoId, videoId)).orderBy(asc(resources.sortOrder));
}

export async function createResource(data: InsertResource) {
  const db = await getDb();
  if (!db) return;
  await db.insert(resources).values(data);
}

export async function updateResource(id: number, data: Partial<InsertResource>) {
  const db = await getDb();
  if (!db) return;
  await db.update(resources).set(data).where(eq(resources.id, id));
}

export async function deleteResource(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(resources).where(eq(resources.id, id));
}

export async function getAllResources() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(resources).orderBy(asc(resources.sortOrder));
}

export async function searchResources(query: string) {
  const db = await getDb();
  if (!db) return [];
  const pattern = `%${query}%`;
  return db.select().from(resources).where(
    or(like(resources.title, pattern), like(resources.description, pattern))
  );
}

// ─── Progress Helpers ────────────────────────────────────────────────

export async function getUserProgress(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userProgress).where(eq(userProgress.userId, userId));
}

export async function getVideoProgress(userId: number, videoId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userProgress)
    .where(and(eq(userProgress.userId, userId), eq(userProgress.videoId, videoId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertProgress(userId: number, videoId: number, watchedSeconds: number, completed: boolean) {
  const db = await getDb();
  if (!db) return;
  const existing = await getVideoProgress(userId, videoId);
  if (existing) {
    await db.update(userProgress).set({
      watchedSeconds,
      completed: completed || existing.completed,
      lastWatchedAt: new Date(),
    }).where(eq(userProgress.id, existing.id));
  } else {
    await db.insert(userProgress).values({
      userId, videoId, watchedSeconds, completed, lastWatchedAt: new Date(),
    });
  }
}

// ─── Bookmark Helpers ────────────────────────────────────────────────

export async function getUserBookmarks(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bookmarks).where(eq(bookmarks.userId, userId)).orderBy(desc(bookmarks.createdAt));
}

export async function toggleBookmark(userId: number, videoId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const existing = await db.select().from(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.videoId, videoId)))
    .limit(1);
  if (existing.length > 0) {
    await db.delete(bookmarks).where(eq(bookmarks.id, existing[0].id));
    return false; // removed
  } else {
    await db.insert(bookmarks).values({ userId, videoId });
    return true; // added
  }
}

// ─── Newsletter Helpers ──────────────────────────────────────────────

export async function getAllNewsletterSubscribers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.subscribedAt));
}

export async function addNewsletterSubscriber(email: string, name?: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(newsletterSubscribers).values({ email, name: name ?? null }).onConflictDoUpdate({
    target: newsletterSubscribers.email,
    set: { isActive: true, unsubscribedAt: null },
  });
}

export async function removeNewsletterSubscriber(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(newsletterSubscribers).set({ isActive: false, unsubscribedAt: new Date() })
    .where(eq(newsletterSubscribers.id, id));
}

// ─── Email Log Helpers ───────────────────────────────────────────────

export async function logEmail(recipientEmail: string, subject: string, templateName: string, status: "sent" | "failed" | "pending", errorMessage?: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(emailLog).values({
    recipientEmail, subject, templateName, status,
    errorMessage: errorMessage ?? null,
    sentAt: status === "sent" ? new Date() : null,
  });
}

export async function getEmailLogs(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(emailLog).orderBy(desc(emailLog.createdAt)).limit(limit);
}

// ─── Video Notes Helpers ──────────────────────────────────────────────

export async function getNotesByVideoAndUser(userId: number, videoId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(videoNotes)
    .where(and(eq(videoNotes.userId, userId), eq(videoNotes.videoId, videoId)))
    .orderBy(asc(videoNotes.timestampSeconds), asc(videoNotes.createdAt));
}

export async function getAllNotesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(videoNotes)
    .where(eq(videoNotes.userId, userId))
    .orderBy(desc(videoNotes.createdAt));
}

export async function createNote(data: InsertVideoNote) {
  const db = await getDb();
  if (!db) return;
  await db.insert(videoNotes).values(data);
}

export async function updateNote(id: number, userId: number, content: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(videoNotes).set({ content }).where(and(eq(videoNotes.id, id), eq(videoNotes.userId, userId)));
}

export async function deleteNote(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(videoNotes).where(and(eq(videoNotes.id, id), eq(videoNotes.userId, userId)));
}

// ─── Continue Watching ────────────────────────────────────────────────

export async function getRecentProgress(userId: number, limit = 5) {
  const db = await getDb();
  if (!db) return [];
  const progress = await db.select().from(userProgress)
    .where(eq(userProgress.userId, userId))
    .orderBy(desc(userProgress.lastWatchedAt))
    .limit(limit);
  if (progress.length === 0) return [];
  const videoIds = progress.map(p => p.videoId);
  const videoRows = await db.select().from(videos).where(inArray(videos.id, videoIds));
  const videoMap = new Map(videoRows.map(v => [v.id, v]));
  return progress.map(p => ({ ...p, video: videoMap.get(p.videoId) ?? null })).filter(p => p.video !== null);
}

// ─── Program Helpers ─────────────────────────────────────────────────

export async function getAllPrograms() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(programs).orderBy(desc(programs.createdAt));
}

export async function getVisiblePrograms() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(programs).where(eq(programs.isVisible, true));
}

export async function getUserProgramAccess(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userProgramAccess).where(eq(userProgramAccess.userId, userId));
}
