import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Subscribe from "./pages/Subscribe";
import SubscribeSuccess from "./pages/SubscribeSuccess";
import Courses from "./pages/Courses";
import SectionView from "./pages/SectionView";
import VideoPlayer from "./pages/VideoPlayer";
import Bookmarks from "./pages/Bookmarks";
import SearchPage from "./pages/SearchPage";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSections from "./pages/admin/AdminSections";
import AdminVideos from "./pages/admin/AdminVideos";
import AdminResources from "./pages/admin/AdminResources";
import AdminInvoices from "./pages/admin/AdminInvoices";
import AdminEmails from "./pages/admin/AdminEmails";
import AdminNewsletter from "./pages/admin/AdminNewsletter";
import PracticeJournal from "./pages/PracticeJournal";
import Impressum from "./pages/legal/Impressum";
import Datenschutz from "./pages/legal/Datenschutz";
import AGB from "./pages/legal/AGB";
import Widerruf from "./pages/legal/Widerruf";

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />

      {/* Subscription */}
      <Route path="/subscribe">
        <ProtectedRoute>
          <Subscribe />
        </ProtectedRoute>
      </Route>
      <Route path="/subscribe/success">
        <ProtectedRoute>
          <SubscribeSuccess />
        </ProtectedRoute>
      </Route>

      {/* Course content (requires auth + subscription) */}
      <Route path="/courses">
        <ProtectedRoute requireSubscription>
          <Courses />
        </ProtectedRoute>
      </Route>
      <Route path="/courses/:slug">
        <ProtectedRoute requireSubscription>
          <SectionView />
        </ProtectedRoute>
      </Route>
      <Route path="/video/:slug">
        <ProtectedRoute requireSubscription>
          <VideoPlayer />
        </ProtectedRoute>
      </Route>
      <Route path="/bookmarks">
        <ProtectedRoute>
          <Bookmarks />
        </ProtectedRoute>
      </Route>
      <Route path="/search">
        <ProtectedRoute>
          <SearchPage />
        </ProtectedRoute>
      </Route>
      <Route path="/journal">
        <ProtectedRoute requireSubscription>
          <PracticeJournal />
        </ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      </Route>

      {/* Admin (requires admin role) */}
      <Route path="/admin">
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      </Route>
      <Route path="/admin/users">
        <AdminRoute>
          <AdminUsers />
        </AdminRoute>
      </Route>
      <Route path="/admin/sections">
        <AdminRoute>
          <AdminSections />
        </AdminRoute>
      </Route>
      <Route path="/admin/videos">
        <AdminRoute>
          <AdminVideos />
        </AdminRoute>
      </Route>
      <Route path="/admin/resources">
        <AdminRoute>
          <AdminResources />
        </AdminRoute>
      </Route>
      <Route path="/admin/invoices">
        <AdminRoute>
          <AdminInvoices />
        </AdminRoute>
      </Route>
      <Route path="/admin/emails">
        <AdminRoute>
          <AdminEmails />
        </AdminRoute>
      </Route>
      <Route path="/admin/newsletter">
        <AdminRoute>
          <AdminNewsletter />
        </AdminRoute>
      </Route>

      {/* Legal pages */}
      <Route path="/impressum" component={Impressum} />
      <Route path="/datenschutz" component={Datenschutz} />
      <Route path="/agb" component={AGB} />
      <Route path="/widerruf" component={Widerruf} />

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
