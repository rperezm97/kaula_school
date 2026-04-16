import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

type ProtectedRouteProps = {
  children: React.ReactNode;
  requireSubscription?: boolean;
  redirectTo?: string;
};

export default function ProtectedRoute({
  children,
  requireSubscription = false,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const subStatus = trpc.subscription.status.useQuery(undefined, {
    enabled: requireSubscription && isAuthenticated,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation(redirectTo, { replace: true });
    }
  }, [isAuthenticated, loading, redirectTo, setLocation]);

  useEffect(() => {
    if (
      requireSubscription &&
      !loading &&
      isAuthenticated &&
      subStatus.data &&
      !subStatus.data.hasAccess
    ) {
      setLocation("/subscribe", { replace: true });
    }
  }, [requireSubscription, loading, isAuthenticated, subStatus.data, setLocation]);

  if (loading || (requireSubscription && isAuthenticated && subStatus.isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (requireSubscription && subStatus.data && !subStatus.data.hasAccess) return null;

  return <>{children}</>;
}
