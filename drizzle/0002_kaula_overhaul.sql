-- Migration: kaula overhaul
-- Run with: pnpm db:push  OR apply manually

ALTER TABLE `videos`
  ADD COLUMN `cloudflareStreamId` varchar(255),
  ADD COLUMN `streamStatus` varchar(64);

CREATE TABLE `video_notes` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `videoId` int NOT NULL,
  `content` text NOT NULL,
  `timestampSeconds` int,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  INDEX `video_notes_user_idx` (`userId`),
  INDEX `video_notes_video_idx` (`videoId`)
);
