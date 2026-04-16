import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";

const YANTRA_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663440106934/Z38f2pvPBxWeP9byuWrrSZ/yantra-hero-mS4hu6TMqj5gR8ntzMg4SC.webp";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Ambient background — deep indigo/violet sacred gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full"
          style={{ background: "radial-gradient(circle, oklch(0.38 0.12 280 / 25%) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, oklch(0.30 0.10 300 / 20%) 0%, transparent 70%)" }} />
        <div className="absolute top-1/3 left-[-5%] w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, oklch(0.35 0.08 260 / 15%) 0%, transparent 70%)" }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <Link href="/">
          <span className="font-serif text-xl tracking-widest text-primary">KAULA SCHOOL</span>
        </Link>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link href="/courses">
                <Button variant="ghost" className="text-foreground/70 hover:text-primary">Courses</Button>
              </Link>
              {user?.role === "admin" && (
                <Link href="/admin">
                  <Button variant="ghost" className="text-foreground/70 hover:text-primary">Admin</Button>
                </Link>
              )}
              <Link href="/settings">
                <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
                  {user?.name || user?.email?.split("@")[0]}
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-foreground/70 hover:text-primary">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md">Begin Your Path</Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative mb-8"
        >
          {/* Soft glow behind yantra */}
          <div className="absolute inset-0 rounded-full blur-3xl scale-150"
            style={{ background: "radial-gradient(circle, oklch(0.65 0.14 220 / 20%) 0%, transparent 70%)" }} />
          <img
            src={YANTRA_URL}
            alt="Sri Yantra"
            className="relative w-56 h-56 md:w-72 md:h-72 object-contain"
            style={{ filter: "drop-shadow(0 0 30px oklch(0.58 0.16 230 / 25%))" }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center max-w-2xl"
        >
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light tracking-wider text-foreground mb-4">
            KAULA SCHOOL
          </h1>
          <p className="font-serif text-lg md:text-xl text-primary tracking-widest uppercase mb-6">
            Feral Awareness
          </p>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-10 max-w-lg mx-auto">
            An immersion into the living tradition of Kashmir Shaivism. 
            The path of the Kaula — where the sacred and the wild are one.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link href="/courses">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-6 text-base tracking-wide shadow-lg shadow-primary/20">
                  Enter the School
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-6 text-base tracking-wide shadow-lg shadow-primary/20">
                    Begin Your Path
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="border-primary/40 text-primary hover:bg-primary/5 px-10 py-6 text-base tracking-wide">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </motion.div>


      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30 py-8 px-6 text-center space-y-2">
        <p className="text-xs text-muted-foreground tracking-wider">
          &copy; {new Date().getFullYear()} Feral Awareness. All rights reserved.
        </p>
        <p className="text-xs text-muted-foreground/60">
          <a href="https://feralawareness.com" className="hover:text-primary transition-colors">feralawareness.com</a>
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground/50">
          <Link href="/impressum"><span className="hover:text-primary transition-colors cursor-pointer">Impressum</span></Link>
          <span>·</span>
          <Link href="/datenschutz"><span className="hover:text-primary transition-colors cursor-pointer">Datenschutz</span></Link>
          <span>·</span>
          <Link href="/agb"><span className="hover:text-primary transition-colors cursor-pointer">AGB</span></Link>
          <span>·</span>
          <Link href="/widerruf"><span className="hover:text-primary transition-colors cursor-pointer">Widerruf</span></Link>
        </div>
      </footer>
    </div>
  );
}
