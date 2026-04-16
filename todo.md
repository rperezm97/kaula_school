# Kaula School - Project TODO

## Authentication & Security
- [x] Custom email/password registration system
- [x] JWT-based session management with secure cookies
- [x] Password hashing with bcrypt
- [x] Password change functionality
- [x] Password reset flow (email-based)
- [x] Rate limiting on auth endpoints
- [x] Role-based access control (admin vs user)
- [x] Admin account seeded: feralawareness@gmail.com

## Subscription System
- [x] Three-tier Stripe subscription (Lower €30 / Mid €50 / Premium €70)
- [x] Sliding scale disclaimer encouraging support
- [x] Subscription gate after registration (redirect to payment if no active sub)
- [x] Contract acceptance during payment (3-month commitment + data handling)
- [x] Stripe webhook endpoint for payment events
- [x] Subscription status tracking and display
- [x] Support for future extra paid programs
- [x] Test product (invisible placeholder for future programs)

## Course Structure & Video Player
- [x] Main sections: Start Here, Teaching of the Path, 112 Yuktis, Visualizations, Deferred Live Practices, Other Resources
- [x] Subsections within each main section
- [x] Google Drive video embedding
- [x] Subtitle support via .vtt files
- [x] Playback speed control (up to 2x)
- [x] Download prevention on videos
- [x] Video descriptions with cross-linking
- [x] Progress tracking per video/section
- [x] Bookmarking/favorites for videos
- [x] Search across course content and PDFs

## Admin Dashboard
- [x] Video upload/delete management (Google Drive links + metadata)
- [x] User management (view, edit roles, disable)
- [x] Invoice viewing from Stripe
- [x] Automated email/notification controls
- [x] Newsletter subscriber management (separate from course users)
- [x] Admin-only protected routes

## Email & Notifications
- [x] Resend integration for transactional emails
- [x] Welcome email on registration
- [x] Payment confirmation emails
- [x] Course access notifications
- [x] Subscription reminder emails
- [x] Admin alerts for new registrations/payments
- [x] Newsletter email list management

## Storage & Resources
- [x] S3 storage for PDFs and course materials
- [x] Access control based on subscription tier
- [x] Google Drive embed flexibility for future service changes

## Design & UI
- [x] Soft electric sky blue color scheme
- [x] Central yantra design element
- [x] Consistent with Feral Awareness main site but lighter
- [x] "Ocean of nectar-shiva-shakti" aesthetic vibe
- [x] Login/registration pages styled
- [x] Course navigation UI
- [x] Responsive foundation (desktop-first)
