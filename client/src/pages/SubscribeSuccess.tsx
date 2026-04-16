import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function SubscribeSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 glow-md">
          <CheckCircle className="h-10 w-10 text-primary" />
        </div>
        <h1 className="font-serif text-3xl tracking-wider text-foreground text-glow mb-3">Welcome, Sadhaka</h1>
        <p className="text-muted-foreground leading-relaxed mb-8">
          Your subscription is active. The path is now open. Enter the school and begin your practice.
        </p>
        <Link href="/courses">
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-6 text-base tracking-wide glow-sm">
            Enter the School
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
