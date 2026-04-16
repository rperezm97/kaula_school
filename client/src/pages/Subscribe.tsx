import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { Loader2, Check, Heart } from "lucide-react";

const YANTRA_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663440106934/Z38f2pvPBxWeP9byuWrrSZ/yantra-hero-mS4hu6TMqj5gR8ntzMg4SC.webp";

const TIERS = [
  {
    key: "lower" as const,
    name: "Sadhaka",
    subtitle: "The Seeker",
    price: 30,
    description: "For those beginning or continuing the path with what they can offer.",
    available: true,
  },
  {
    key: "mid" as const,
    name: "Vira",
    subtitle: "The Dedicated",
    price: 50,
    description: "For dedicated practitioners who wish to support the continuation of this work.",
    popular: true,
    available: false,
  },
  {
    key: "premium" as const,
    name: "Siddha",
    subtitle: "The Accomplished",
    price: 70,
    description: "For those with the means to generously sustain the teaching and the teacher.",
    available: false,
  },
];

export default function Subscribe() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedTier, setSelectedTier] = useState<"lower" | "mid" | "premium" | null>(null);
  const [contractAccepted, setContractAccepted] = useState(false);
  const [showContract, setShowContract] = useState(false);
  const [digitalWaiverAccepted, setDigitalWaiverAccepted] = useState(false);

  const checkoutMutation = trpc.subscription.createCheckout.useMutation({
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (err) => toast.error(err.message),
  });

  useEffect(() => {
    if (user?.subscriptionStatus === "active") {
      setLocation("/courses", { replace: true });
    }
  }, [user?.subscriptionStatus, setLocation]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  if (user?.subscriptionStatus === "active") return null;

  const handleCheckout = () => {
    if (!selectedTier) { toast.error("Please select a tier"); return; }
    if (!contractAccepted) { toast.error("Please accept the subscription terms to proceed"); return; }
    if (!digitalWaiverAccepted) { toast.error("Please confirm the digital content waiver to proceed"); return; }
    checkoutMutation.mutate({
      tier: selectedTier,
      contractAccepted: true,
    });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border/50">
        <Link href="/"><span className="font-serif text-xl tracking-widest text-primary">KAULA SCHOOL</span></Link>
      </nav>

      <main className="relative z-10 container py-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <img src={YANTRA_URL} alt="Yantra" className="w-16 h-16 mx-auto mb-4 opacity-60" />
          <h1 className="font-serif text-4xl tracking-wider text-foreground mb-3">Choose Your Path</h1>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            All tiers unlock the complete course library. This is a sliding scale system — choose the level that reflects your capacity to support this work.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-primary/70">
            <Heart className="h-4 w-4" />
            <span>Every contribution sustains the teaching</span>
          </div>
        </div>

        {/* Tier Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {TIERS.map((tier) => (
            <button
              key={tier.key}
              onClick={() => tier.available && setSelectedTier(tier.key)}
              disabled={!tier.available}
              className={`relative bg-card border rounded-xl p-8 text-left transition-all duration-300 ${
                tier.available
                  ? "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 cursor-pointer"
                  : "opacity-50 cursor-not-allowed"
              } ${
                selectedTier === tier.key
                  ? "border-primary shadow-lg shadow-primary/15"
                  : "border-border/50"
              } ${tier.popular ? "md:-translate-y-2" : ""}`}
            >
              {tier.popular && !tier.available && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-muted-foreground text-background text-xs px-3 py-1 rounded-full tracking-wide">
                  Coming Soon
                </span>
              )}
              {tier.popular && tier.available && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full tracking-wide">
                  Most Chosen
                </span>
              )}
              {!tier.popular && !tier.available && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-muted-foreground text-background text-xs px-3 py-1 rounded-full tracking-wide">
                  Coming Soon
                </span>
              )}
              <div className="mb-6">
                <h3 className="font-serif text-2xl text-foreground tracking-wide">{tier.name}</h3>
                <p className="text-primary/60 text-sm tracking-wider uppercase">{tier.subtitle}</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-light text-foreground">€{tier.price}</span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">{tier.description}</p>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Full course library</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> All video content</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Practice resources</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Progress tracking</li>
              </ul>
              {selectedTier === tier.key && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Contract Acceptance */}
        {selectedTier && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-card/30 border border-border/50 rounded-xl p-6 mb-6">
              <button onClick={() => setShowContract(!showContract)} className="w-full text-left">
                <h3 className="font-serif text-lg text-foreground tracking-wide mb-1">Subscription Terms</h3>
                <p className="text-muted-foreground text-sm">{showContract ? "Click to collapse" : "Click to read the full terms"}</p>
              </button>

              {showContract && (
                <div className="mt-4 pt-4 border-t border-border/30 text-sm text-foreground/70 space-y-3 max-h-64 overflow-y-auto">
                  <p><strong className="text-foreground/90">Subscription Commitment:</strong> By subscribing, you commit to a minimum period of 3 months. You may cancel after the initial 3-month period, and your access will continue until the end of the current billing cycle.</p>
                  <p><strong className="text-foreground/90">Billing:</strong> You will be billed monthly at the rate of your chosen tier. Payments are processed securely through Stripe. You can upgrade or downgrade your tier at any time.</p>
                  <p><strong className="text-foreground/90">Data Handling:</strong> We collect only the information necessary to provide the service: your name, email address, and payment information (processed by Stripe — we do not store card details). We do not use cookies for tracking. Your personal data will never be sold or shared with third parties.</p>
                  <p><strong className="text-foreground/90">Content Access:</strong> All course content is for personal use only. Downloading, recording, or redistributing video content is strictly prohibited. Access is granted to the individual subscriber only.</p>
                  <p><strong className="text-foreground/90">Refund Policy:</strong> Given the digital nature of the content, refunds are handled on a case-by-case basis. Contact us within the first 14 days if you are unsatisfied.</p>
                  <p><strong className="text-foreground/90">Cancellation:</strong> You may manage your subscription through the account settings. Cancellation takes effect at the end of the current billing period.</p>
                </div>
              )}

              <label className="flex items-start gap-3 mt-4 pt-4 border-t border-border/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={contractAccepted}
                  onChange={(e) => setContractAccepted(e.target.checked)}
                  className="mt-1 rounded border-border accent-primary"
                />
                <span className="text-sm text-foreground/80">
                  I have read and accept the subscription terms, including the 3-month minimum commitment and data handling policy.
                </span>
              </label>

              {/* Digital content waiver — required under §356 Abs. 5 BGB (Germany) */}
              <label className="flex items-start gap-3 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={digitalWaiverAccepted}
                  onChange={(e) => setDigitalWaiverAccepted(e.target.checked)}
                  className="mt-1 rounded border-border accent-primary"
                />
                <span className="text-sm text-foreground/80">
                  I expressly request immediate access to the digital content and acknowledge that my right of withdrawal expires upon the start of contract performance (§ 356 Abs. 5 BGB).
                </span>
              </label>
            </div>

            <Button
              onClick={handleCheckout}
              disabled={!contractAccepted || !digitalWaiverAccepted || checkoutMutation.isPending}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-base tracking-wide shadow-lg shadow-primary/20"
            >
              {checkoutMutation.isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
              Subscribe — €{TIERS.find(t => t.key === selectedTier)?.price}/month
            </Button>
          </div>
        )}
      </main>

      <footer className="relative z-10 border-t border-border/30 py-6 px-6 text-center">
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
