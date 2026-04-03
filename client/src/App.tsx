import React, { Suspense, lazy, useEffect, useMemo } from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import { toast } from "sonner";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./_core/hooks/useAuth";
import { getLoginUrl } from "./const";
import { MVPNavigation } from "./components/MVPNavigation";
import { NewLeadFAB } from "./components/NewLeadFAB";
import { PageHeader } from "./components/PageHeader";
import { trpc } from "./lib/trpc";
import { stepToPath } from "./hooks/useOnboardingState";
import { PUBLIC_PATHS } from "@shared/publicPaths";
const PUBLIC_PATH_SET = new Set(PUBLIC_PATHS);
import { CookieConsentBanner } from "./components/CookieConsentBanner";

// Landing page
import NotFound from "@/pages/NotFound";
// Redesigned pages
const ControlRoomDashboard = lazy(() => import("./pages/ControlRoomDashboard").then(m => ({ default: m.default })));
const AlertsTaskQueue = lazy(() => import("./pages/AlertsTaskQueue").then(m => ({ default: m.default })));
const VaultLine = lazy(() => import("./pages/VaultLine").then(m => ({ default: m.default })));
const CompanyIntelligence = lazy(() => import("./pages/CompanyIntelligence").then(m => ({ default: m.default })));

// Core Pages
const Dashboard = lazy(() => import("./pages/Dashboard").then(m => ({ default: m.default })));
const CompanySearch = lazy(() => import("./pages/CompanySearch").then(m => ({ default: m.default })));
const MonitoredCompanies = lazy(() => import("./pages/MonitoredCompanies").then(m => ({ default: m.default })));
const Alerts = lazy(() => import("./pages/Alerts").then(m => ({ default: m.default })));
const Settings = lazy(() => import("./pages/Settings").then(m => ({ default: m.default })));
const Analytics = lazy(() => import("./pages/Analytics").then(m => ({ default: m.default })));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard").then(m => ({ default: m.default })));
const AdminBulkImport = lazy(() => import("./pages/AdminBulkImport").then(m => ({ default: m.default })));
const ChBulkExtract = lazy(() => import("./pages/ChBulkExtract").then(m => ({ default: m.default })));
// Outbound addon — admin-only internal surface
const OutboundOverview = lazy(() => import("./pages/OutboundOverview").then(m => ({ default: m.default })));
const EnrichContacts = lazy(() => import("./pages/EnrichContacts").then(m => ({ default: m.default })));
const OutboundLists = lazy(() => import("./pages/OutboundLists").then(m => ({ default: m.default })));
const OutboundCampaigns = lazy(() => import("./pages/OutboundCampaigns").then(m => ({ default: m.default })));
const OutboundTemplates = lazy(() => import("./pages/OutboundTemplates").then(m => ({ default: m.default })));
const OutboundSuppressions = lazy(() => import("./pages/OutboundSuppressions").then(m => ({ default: m.default })));
const OutboundAnalytics = lazy(() => import("./pages/OutboundAnalytics").then(m => ({ default: m.default })));
const ImportCentre = lazy(() => import("./pages/ImportCentre").then(m => ({ default: m.default })));
const Actions = lazy(() => import("./pages/Actions").then(m => ({ default: m.default })));
const TaskManagement = lazy(() => import("./pages/TaskManagement").then(m => ({ default: m.default })));
const Reports = lazy(() => import("./pages/Reports").then(m => ({ default: m.default })));
const AuditLog = lazy(() => import("./pages/AuditLog").then(m => ({ default: m.default })));
const CompanyDetail = lazy(() => import("./pages/CompanyDetail").then(m => ({ default: m.default })));
const Home = lazy(() => import("./pages/Home").then(m => ({ default: m.default })));
const Pricing = lazy(() => import("./pages/Pricing").then(m => ({ default: m.default })));
const APIConfiguration = lazy(() => import("./pages/APIConfiguration").then(m => ({ default: m.default })));
const MTDDigitalBridge = lazy(() => import("./pages/MTDDigitalBridge").then(m => ({ default: m.default })));
const BiometricVerification = lazy(() => import("./pages/BiometricVerification").then(m => ({ default: m.default })));
const Leads = lazy(() => import("./pages/Leads").then(m => ({ default: m.default })));
const Firms = lazy(() => import("./pages/Firms").then(m => ({ default: m.default })));
const ASCPCompliance = lazy(() => import("./pages/ASCPCompliance").then(m => ({ default: m.default })));
const MTDGuide = lazy(() => import("./pages/MTDGuide").then(m => ({ default: m.default })));
const BasisAccounting = lazy(() => import("./pages/BasisAccounting").then(m => ({ default: m.default })));
const Integrations = lazy(() => import("./pages/Integrations").then(m => ({ default: m.default })));
const Landing = lazy(() => import("./pages/Landing").then(m => ({ default: m.default })));
const RootSplit = lazy(() => import("./pages/RootSplit").then(m => ({ default: m.default })));
const Check = lazy(() => import("./pages/Check").then(m => ({ default: m.default })));
const Accountants = lazy(() => import("./pages/Accountants").then(m => ({ default: m.default })));
const CompaniesHouseFiling = lazy(() => import("./pages/CompaniesHouseFiling").then(m => ({ default: m.default })));

const PricingServices = lazy(() => import("./pages/PricingServices").then(m => ({ default: m.default })));
const Agents = lazy(() => import("./pages/Agents").then(m => ({ default: m.default })));
const AgentDashboard = lazy(() => import("./pages/AgentDashboard").then(m => ({ default: m.default })));
const DevonshireGreenGuide = lazy(() => import("./pages/DevonshireGreenGuide").then(m => ({ default: m.default })));
const EngagerSettings = lazy(() => import("./pages/EngagerSettings").then(m => ({ default: m.default })));
const Clients = lazy(() => import("./pages/Clients").then(m => ({ default: m.default })));
const Onboarding = lazy(() => import("./pages/Onboarding").then(m => ({ default: m.default })));
const OnboardingWelcome = lazy(() => import("./pages/OnboardingWelcome").then(m => ({ default: m.default })));
const OnboardingCompany = lazy(() => import("./pages/OnboardingCompany").then(m => ({ default: m.default })));
const OnboardingAlerts = lazy(() => import("./pages/OnboardingAlerts").then(m => ({ default: m.default })));
const OnboardingNotifications = lazy(() => import("./pages/OnboardingNotifications").then(m => ({ default: m.default })));
const OnboardingComplete = lazy(() => import("./pages/OnboardingComplete").then(m => ({ default: m.default })));
const AgentControlCentre = lazy(() => import("./pages/AgentControlCentre").then(m => ({ default: m.default })));
const M365Guide = lazy(() => import("./pages/M365Guide").then(m => ({ default: m.default })));
const AgentDataInput = lazy(() => import("./pages/AgentDataInput").then(m => ({ default: m.default })));
const Payments = lazy(() => import("./pages/Payments").then(m => ({ default: m.default })));
const VatCheck = lazy(() => import("./pages/VatCheck").then(m => ({ default: m.default })));
const HmrcSelfAssessment = lazy(() => import("./pages/HmrcSelfAssessment").then(m => ({ default: m.default })));
const HmrcSubmissions = lazy(() => import("./pages/HmrcSubmissions").then(m => ({ default: m.default })));
const AgentApp = lazy(() => import("./pages/AgentApp/AgentApp").then(m => ({ default: m.default })));
const DocumentVaultPage = lazy(() => import("./pages/DocumentVault").then(m => ({ default: m.DocumentVaultPage })));
const AlertDeliverySettings = lazy(() => import("./pages/AlertDeliverySettings").then(m => ({ default: m.default })));
const SubscriptionManagement = lazy(() => import("./pages/SubscriptionManagement").then(m => ({ default: m.default })));
const ComplianceEvents = lazy(() => import("./pages/ComplianceEvents").then(m => ({ default: m.default })));
const DirectorAlert = lazy(() => import("./pages/DirectorAlert").then(m => ({ default: m.default })));
const RiskScan = lazy(() => import("./pages/RiskScan").then(m => ({ default: m.default })));
const ClientReports = lazy(() => import("./pages/ClientReports").then(m => ({ default: m.default })));
const AlertService = lazy(() => import("./pages/AlertService").then(m => ({ default: m.default })));
const Portfolio = lazy(() => import("./pages/Portfolio").then(m => ({ default: m.default })));
const DeadlineChecker = lazy(() => import("./pages/DeadlineChecker").then(m => ({ default: m.default })));
const CompanyDeadlineChecker = lazy(() => import("./pages/CompanyDeadlineChecker").then(m => ({ default: m.default })));
const ClientPipeline = lazy(() => import("./pages/ClientPipeline").then(m => ({ default: m.default })));
const Pipelines = lazy(() => import("./pages/Pipelines").then(m => ({ default: m.default })));
const AcspFirms = lazy(() => import("./pages/AcspFirms").then(m => ({ default: m.default })));
const SmsTemplates = lazy(() => import("./pages/SmsTemplates").then(m => ({ default: m.default })));
const PartnerDashboard = lazy(() => import("./pages/PartnerDashboard").then(m => ({ default: m.default })));
const MichellesDesk = lazy(() => import("./pages/MichellesDesk").then(m => ({ default: m.default })));
const CountdownWidget = lazy(() => import("./pages/CountdownWidget").then(m => ({ default: m.default })));
const FlowEngage = lazy(() => import("./pages/FlowEngage").then(m => ({ default: m.default })));
const FeatureFlagsAdmin = lazy(() => import("./pages/FeatureFlagsAdmin").then(m => ({ default: m.default })));
const OptOutManagement = lazy(() => import("./pages/OptOutManagement").then(m => ({ default: m.default })));
const RevenueOS = lazy(() => import("./pages/RevenueOS").then(m => ({ default: m.default })));
const Campaigns = lazy(() => import("./pages/Campaigns").then(m => ({ default: m.default })));
const OptimisationLayer = lazy(() => import("./pages/OptimisationLayer").then(m => ({ default: m.default })));
// SEO landing pages
const SeoPageDeadlines = lazy(() => import("./pages/SeoPageDeadlines").then(m => ({ default: m.default })));
const SeoPagePenalties = lazy(() => import("./pages/SeoPagePenalties").then(m => ({ default: m.default })));
const SeoPageConfirmationStatement = lazy(() => import("./pages/SeoPageConfirmationStatement").then(m => ({ default: m.default })));
const SeoPagePenaltyAppeal = lazy(() => import("./pages/SeoPagePenaltyAppeal").then(m => ({ default: m.default })));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe").then(m => ({ default: m.default })));
const TermsOfService = lazy(() => import("./pages/TermsOfService").then(m => ({ default: m.default })));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy").then(m => ({ default: m.default })));
const Sitemap = lazy(() => import("./pages/Sitemap").then(m => ({ default: m.default })));
const About = lazy(() => import("./pages/About").then(m => ({ default: m.default })));
const Contact = lazy(() => import("./pages/Contact").then(m => ({ default: m.default })));
const ModernSlavery = lazy(() => import("./pages/ModernSlavery").then(m => ({ default: m.default })));
const Regulatory = lazy(() => import("./pages/Regulatory").then(m => ({ default: m.default })));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy").then(m => ({ default: m.default })));

// Mobile companion
const MobileHome = lazy(() => import("./pages/mobile/MobileHome").then(m => ({ default: m.default })));
const MobileDeadlines = lazy(() => import("./pages/mobile/MobileDeadlines").then(m => ({ default: m.default })));
const MobileAlerts = lazy(() => import("./pages/mobile/MobileAlerts").then(m => ({ default: m.default })));
const MobileCompanyDetail = lazy(() => import("./pages/mobile/MobileCompanyDetail").then(m => ({ default: m.default })));
const MobileWidgetSpec = lazy(() => import("./pages/mobile/MobileWidgetSpec").then(m => ({ default: m.default })));
const MobileDemo = lazy(() => import("./pages/mobile/MobileDemo").then(m => ({ default: m.default })));
// Agent surface
const AgentOverview = lazy(() => import("./pages/agent/AgentOverview").then(m => ({ default: m.default })));
const AgentCompanies = lazy(() => import("./pages/agent/AgentCompanies").then(m => ({ default: m.default })));
const AgentAlerts = lazy(() => import("./pages/agent/AgentAlerts").then(m => ({ default: m.default })));
const AgentCompanyDetail = lazy(() => import("./pages/agent/AgentCompanyDetail").then(m => ({ default: m.default })));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        <p className="mt-4 text-slate-400">Loading...</p>
      </div>
    </div>
  );
}

// Public pages that render without the sidebar nav (have their own nav)
// Source of truth: shared/publicPaths.ts

// Redirect new users (onboardingCompleted=false) or users with pending onboarding state to /onboarding
function PostAuthOnboardingRedirect() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  useEffect(() => {
    if (!user) return;
    const path = window.location.pathname;
    // Don't redirect if already in onboarding or dashboard
    if (path.startsWith('/onboarding') || path.startsWith('/dashboard')) return;
    // Check for pending onboarding state from /check (company seeded, not yet paid)
    try {
      const raw = sessionStorage.getItem('fg_onboarding');
      if (raw) {
        const state = JSON.parse(raw);
        // Resume at the last valid step if there's a company and payment not yet done
        if (state.companyNumber && !state.paidAt) {
          const target = stepToPath(state.lastStep ?? 'company');
          setLocation(target);
          return;
        }
      }
    } catch {}
    // Redirect new users who haven't completed onboarding
    if (!user.onboardingCompleted) {
      setLocation('/onboarding');
    }
  }, [user, setLocation]); // setLocation is intentional — wouter returns a stable reference, so this won't cause extra re-renders
  return null;
}

function AuthenticatedApp() {
  const [location, setLocation] = useLocation();
  const isPublicPath = useMemo(() => {
    const base = location.split('?')[0].split('#')[0];
    if (PUBLIC_PATH_SET.has(base)) return true;
    return PUBLIC_PATHS.some(p => base.startsWith(p + '/'));
  }, [location]);

  // Belt-and-braces: inject <meta name="robots" content="noindex, nofollow"> on all
  // authenticated app pages so bots cannot index them even if robots.txt is ignored.
  // The tag is removed automatically when navigating to a public page.
  useEffect(() => {
    if (isPublicPath) return;
    let el = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const hadRobots = !!el;
    const prevContent = el?.getAttribute('content') ?? '';
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', 'robots');
      document.head.appendChild(el);
    }
    el.setAttribute('content', 'noindex, nofollow');
    return () => {
      const tag = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
      if (!tag) return;
      if (hadRobots) {
        tag.setAttribute('content', prevContent);
      } else {
        tag.parentNode?.removeChild(tag);
      }
    };
  }, [isPublicPath]);

  // If on a public page, render without the sidebar nav
  if (isPublicPath) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/check" component={Check} />
          <Route path="/accountants" component={Accountants} />
          <Route path="/landing" component={Landing} />
          <Route path="/pricing-services" component={PricingServices} />
          <Route path="/devonshire-green" component={DevonshireGreenGuide} />
          <Route path="/onboarding" component={OnboardingWelcome} />
          <Route path="/onboarding/company" component={OnboardingCompany} />
          <Route path="/onboarding/alerts" component={OnboardingAlerts} />
          <Route path="/onboarding/notifications" component={OnboardingNotifications} />
          <Route path="/onboarding/complete" component={OnboardingComplete} />
          <Route path="/agent-app" component={AgentApp} />
          <Route path="/deadline-checker" component={DeadlineChecker} />
          <Route path="/company-deadline-checker" component={CompanyDeadlineChecker} />
          {/* SEO landing pages */}
          <Route path="/check-companies-house-deadlines" component={SeoPageDeadlines} />
          <Route path="/companies-house-penalties" component={SeoPagePenalties} />
          <Route path="/confirmation-statement-deadline" component={SeoPageConfirmationStatement} />
          <Route path="/late-filing-penalty-appeal" component={SeoPagePenaltyAppeal} />
          <Route path="/unsubscribe" component={Unsubscribe} />
          <Route path="/terms" component={TermsOfService} />
          <Route path="/privacy" component={PrivacyPolicy} />
          <Route path="/sitemap" component={Sitemap} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route path="/modern-slavery" component={ModernSlavery} />
          <Route path="/regulatory" component={Regulatory} />
          <Route path="/cookies" component={CookiePolicy} />
          <Route path="/widget" component={CountdownWidget} />
          <Route path="/mobile" component={MobileHome} />
          <Route path="/mobile/deadlines" component={MobileDeadlines} />
          <Route path="/mobile/alerts" component={MobileAlerts} />
          <Route path="/mobile/company/:id" component={MobileCompanyDetail} />
          <Route path="/mobile/widgets" component={MobileWidgetSpec} />
          <Route path="/mobile/demo" component={MobileDemo} />
          {/* Agent surface — own layout, no admin sidebar */}
          <Route path="/agent" component={AgentOverview} />
          <Route path="/agent/companies" component={AgentCompanies} />
          <Route path="/agent/alerts" component={AgentAlerts} />
          <Route path="/agent/company/:id" component={AgentCompanyDetail} />
        </Switch>
      </Suspense>
    );
  }

  return (
    <>
      <MVPNavigation />
      <NewLeadFAB />
      <main className="min-h-screen bg-slate-50 pt-14 pb-16 md:pt-0 md:pb-0 md:pl-56">
        <PageHeader />
        <Suspense fallback={<PageLoader />}>
          <Switch>
            <Route path="/dashboard" component={ControlRoomDashboard} />
            <Route path="/search" component={CompanySearch} />
            <Route path="/monitored" component={MonitoredCompanies} />
            <Route path="/alerts" component={AlertsTaskQueue} />
            <Route path="/settings" component={Settings} />
            <Route path="/analytics" component={Analytics} />
            <Route path="/admin" component={AdminDashboard} />
            <Route path="/admin/bulk-import" component={AdminBulkImport} />
            <Route path="/admin/ch-bulk-extract" component={ChBulkExtract} />
            {/* Outbound — admin-only internal surface */}
            <Route path="/outbound" component={OutboundOverview} />
            <Route path="/outbound/lists" component={OutboundLists} />
            <Route path="/outbound/campaigns" component={OutboundCampaigns} />
            <Route path="/outbound/templates" component={OutboundTemplates} />
            <Route path="/outbound/suppressions" component={OutboundSuppressions} />
            <Route path="/outbound/analytics" component={OutboundAnalytics} />
            <Route path="/enrich-contacts" component={EnrichContacts} />
            <Route path="/import" component={ImportCentre} />
            <Route path="/actions" component={Actions} />
            <Route path="/tasks" component={TaskManagement} />
            <Route path="/reports" component={Reports} />
            <Route path="/audit-log" component={AuditLog} />
            <Route path="/company/:id" component={CompanyDetail} />
            <Route path="/api-config" component={APIConfiguration} />
            <Route path="/pricing" component={Pricing} />
            <Route path="/mtd-bridge" component={MTDDigitalBridge} />
            <Route path="/biometric" component={BiometricVerification} />
            <Route path="/leads" component={Leads} />
            <Route path="/firms" component={Firms} />
            <Route path="/ascp-compliance" component={ASCPCompliance} />
            <Route path="/mtd-guide" component={MTDGuide} />
            <Route path="/accounting" component={BasisAccounting} />
            <Route path="/integrations" component={Integrations} />
            <Route path="/landing" component={Landing} />
            <Route path="/ch-filing" component={CompaniesHouseFiling} />
            <Route path="/pricing-services" component={PricingServices} />
            <Route path="/agents" component={Agents} />
            <Route path="/agents/:id" component={AgentDashboard} />
            <Route path="/agent-control-centre" component={AgentControlCentre} />
            <Route path="/devonshire-green" component={DevonshireGreenGuide} />
            <Route path="/engager-settings" component={EngagerSettings} />
            <Route path="/m365-guide" component={M365Guide} />
            <Route path="/agent-data-input" component={AgentDataInput} />
            <Route path="/payments" component={Payments} />
            <Route path="/vat-check" component={VatCheck} />
            <Route path="/hmrc/self-assessment" component={HmrcSelfAssessment} />
            <Route path="/hmrc/submissions" component={HmrcSubmissions} />
            <Route path="/clients" component={Clients} />
            <Route path="/document-vault" component={DocumentVaultPage} />
            <Route path="/alert-delivery" component={AlertDeliverySettings} />
            <Route path="/subscription" component={SubscriptionManagement} />
            <Route path="/compliance-events" component={ComplianceEvents} />
            <Route path="/director-alert" component={DirectorAlert} />
            <Route path="/risk-scan" component={RiskScan} />
            <Route path="/client-reports" component={ClientReports} />
            <Route path="/alert-service" component={AlertService} />
            <Route path="/portfolio" component={Portfolio} />
            <Route path="/vaultline" component={VaultLine} />
            <Route path="/intelligence" component={CompanyIntelligence} />
            <Route path="/client-pipeline" component={ClientPipeline} />
            <Route path="/pipelines" component={Pipelines} />
            <Route path="/acsp-firms" component={AcspFirms} />
            <Route path="/sms-templates" component={SmsTemplates} />
            <Route path="/partner/dashboard" component={PartnerDashboard} />
            <Route path="/desk" component={MichellesDesk} />
            <Route path="/flow-engage" component={FlowEngage} />
            <Route path="/settings/feature-flags" component={FeatureFlagsAdmin} />
            <Route path="/settings/opt-outs" component={OptOutManagement} />
            <Route path="/revenue-os" component={RevenueOS} />
            <Route path="/campaigns" component={Campaigns} />
            <Route path="/optimisation" component={OptimisationLayer} />
            {/* /agent-app is handled in the public (no-sidebar) block above */}
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </main>
    </>
  );
}

function PendingMonitorHandler() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const trackFunnel = trpc.monitorFunnel.track.useMutation();
  const addMutation = trpc.monitored.add.useMutation({
    onSuccess: (_data, variables) => {
      const name = sessionStorage.getItem("pendingMonitorName") || "Company";
      toast.success(`Now monitoring ${name}`, {
        description: "Company added to your portfolio. You'll receive alerts before every deadline.",
      });
      sessionStorage.removeItem("pendingMonitorName");
      // Track portfolio_add — this is the final step of the post-login funnel
      trackFunnel.mutate({
        eventType: "portfolio_add",
        companyNumber: variables.companyNumber,
        companyName: name,
      });
      },
    onError: (err) => {
      if ((err.data as { code?: string } | undefined)?.code === "PAYMENT_REQUIRED") {
        toast.error("Payment required to start monitoring this company.", {
          description: "Start your subscription on the Check page.",
          action: { label: "Go to Check", onClick: () => setLocation("/check") },
        });
      }
      // Other errors are silent for the pending-monitor flow
    },
  });
  useEffect(() => {
    if (!user) return;
    const pending = sessionStorage.getItem("pendingMonitor");
    if (!pending) return;
    sessionStorage.removeItem("pendingMonitor");
    addMutation.mutate({ companyNumber: pending });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  return null;
}

function App() {
  const { user, loading } = useAuth();

  // Wait for the auth.me query to resolve before deciding which shell to render.
  // Without this guard, navigating directly to /dashboard flashes the Landing
  // page (and may redirect to login) before the session cookie is validated.
  if (loading) {
    return (
      <ThemeProvider>
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  if (!user) {
    // If the user is trying to access a protected route, redirect them to login.
    // Public routes (landing, marketing, pricing, onboarding) are served normally.
    // Source of truth: shared/publicPaths.ts
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    const basePath = currentPath.split('?')[0].split('#')[0];
    const isPublicRoute = PUBLIC_PATH_SET.has(basePath) || PUBLIC_PATHS.some(r => basePath.startsWith(r + '/'));
    if (!isPublicRoute) {
      // Redirect to login, preserving the intended destination
      if (typeof window !== 'undefined') {
        window.location.href = getLoginUrl();
      }
      return null;
    }
    return (
      <ThemeProvider>
        <ErrorBoundary>
          <TooltipProvider>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/landing" component={Landing} />
              <Route path="/pricing-services" component={PricingServices} />
              <Route path="/onboarding" component={OnboardingWelcome} />
              <Route path="/onboarding/company" component={OnboardingCompany} />
              <Route path="/onboarding/alerts" component={OnboardingAlerts} />
              <Route path="/onboarding/notifications" component={OnboardingNotifications} />
              <Route path="/onboarding/complete" component={OnboardingComplete} />
              <Route path="/agent-app" component={AgentApp} />
              <Route path="/deadline-checker" component={DeadlineChecker} />
              <Route path="/company-deadline-checker" component={CompanyDeadlineChecker} />
              {/* Public marketing & SEO pages */}
              <Route path="/check" component={Check} />
              <Route path="/accountants" component={Accountants} />
              <Route path="/check-companies-house-deadlines" component={SeoPageDeadlines} />
              <Route path="/companies-house-penalties" component={SeoPagePenalties} />
              <Route path="/confirmation-statement-deadline" component={SeoPageConfirmationStatement} />
              <Route path="/late-filing-penalty-appeal" component={SeoPagePenaltyAppeal} />
              <Route path="/unsubscribe" component={Unsubscribe} />
              {/* Legal & resource pages */}
              <Route path="/terms" component={TermsOfService} />
              <Route path="/privacy" component={PrivacyPolicy} />
              <Route path="/sitemap" component={Sitemap} />
              <Route path="/about" component={About} />
              <Route path="/contact" component={Contact} />
              <Route path="/modern-slavery" component={ModernSlavery} />
              <Route path="/regulatory" component={Regulatory} />
              <Route path="/cookies" component={CookiePolicy} />
              <Route path="/pricing" component={Pricing} />
              <Route component={Home} />
            </Switch>
            <Toaster />
          </TooltipProvider>
        </ErrorBoundary>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <TooltipProvider>
          <PendingMonitorHandler />
          <PostAuthOnboardingRedirect />
          <AuthenticatedApp />
          <CookieConsentBanner />
          <Toaster />
        </TooltipProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
