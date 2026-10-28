import { Switch, Route, Redirect, Router as WouterRouter } from "wouter";
import { lazy, Suspense, useState, type ComponentType } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";

import Navigation from "@/components/Navigation";
import StarField from "@/components/StarField";
import WelcomeScreen from "@/components/WelcomeScreen";

// Each page is loaded only when someone opens it, so the first visit downloads far less.
// If a page fails to load because the site was updated while it was open, reload once to fetch
// the new version rather than showing a blank screen.
function page(load: () => Promise<{ default: ComponentType<any> }>) {
  return lazy(() =>
    load().catch((err) => {
      try {
        if (!sessionStorage.getItem("pale_reloaded")) {
          sessionStorage.setItem("pale_reloaded", "1");
          window.location.reload();
          return new Promise<never>(() => {});
        }
      } catch {
        /* storage blocked */
      }
      throw err;
    }),
  );
}

const NotFound = page(() => import("@/pages/not-found"));
const SolarSystem = page(() => import("@/pages/SolarSystem"));
const Tonight = page(() => import("@/pages/Tonight"));
const APOD = page(() => import("@/pages/APOD"));
const Constellations = page(() => import("@/pages/Constellations"));
const ScaleOfUniverse = page(() => import("@/pages/ScaleOfUniverse"));
const ExoplanetExplorer = page(() => import("@/pages/ExoplanetExplorer"));
const SimulationsLanding = page(() => import("@/pages/simulations/SimulationsLanding"));
const BigBangSim = page(() => import("@/pages/simulations/BigBangSim"));
const EarthSim = page(() => import("@/pages/simulations/EarthSim"));
const StarBirthSim = page(() => import("@/pages/simulations/StarBirthSim"));
const StarDeathSim = page(() => import("@/pages/simulations/StarDeathSim"));
const BlackHoleSim = page(() => import("@/pages/simulations/BlackHoleSim"));
const About = page(() => import("@/pages/About"));
const Discoveries = page(() => import("@/pages/Discoveries"));
const Credits = page(() => import("@/pages/Credits"));
const NotePage = page(() => import("@/pages/Note"));
const Privacy = page(() => import("@/pages/Privacy"));

const queryClient = new QueryClient();

// Pages that have been retired, and where their old links now go.
const RETIRED: [string, string][] = [
  ["/universe", "/"],
  ["/galaxy", "/"],
  ["/explore", "/"],
  ["/observatory", "/tonight"],
  ["/history", "/tonight"],
  ["/discover", "/tonight"],
  ["/news", "/tonight"],
  ["/launches", "/tonight"],
  ["/blackholes", "/simulations/black-hole"],
  ["/simulations/milky-way-birth", "/simulations"],
  ["/simulations/solar-system-formation", "/simulations"],
  ["/simulations/inside-black-hole", "/simulations/black-hole"],
  ["/build-universe", "/simulations"],
  ["/education", "/"],
  ["/glossary", "/"],
  ["/blog", "/"],
  ["/blog/:slug", "/"],
];

// Shown for the moment a page takes to arrive: the same dark sky, nothing else.
function Loading() {
  return <div className="min-h-screen" style={{ background: "#05070C" }} aria-busy="true" />;
}

function Router() {
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<Loading />}>
        <Switch>
          <Route path="/" component={SolarSystem} />
          <Route path="/tonight" component={Tonight} />
          <Route path="/apod" component={APOD} />
          <Route path="/constellations" component={Constellations} />
          <Route path="/scale" component={ScaleOfUniverse} />
          <Route path="/exoplanets" component={ExoplanetExplorer} />
          <Route path="/simulations" component={SimulationsLanding} />
          <Route path="/simulations/big-bang" component={BigBangSim} />
          <Route path="/simulations/earth" component={EarthSim} />
          <Route path="/simulations/star-birth" component={StarBirthSim} />
          <Route path="/simulations/star-death" component={StarDeathSim} />
          <Route path="/simulations/black-hole" component={BlackHoleSim} />
          <Route path="/note" component={NotePage} />
          <Route path="/discoveries" component={Discoveries} />
          <Route path="/about" component={About} />
          <Route path="/credits" component={Credits} />
          <Route path="/privacy" component={Privacy} />
          {RETIRED.map(([from, to]) => (
            <Route key={from} path={from}>
              <Redirect to={to} replace />
            </Route>
          ))}
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </AnimatePresence>
  );
}

// The welcome is for people arriving at the front door. Someone opening a shared note, a weekly
// picture or any other page goes straight to it.
function arrivingAtFrontDoor() {
  if (typeof window === "undefined") return true;
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const path = window.location.pathname.slice(base.length) || "/";
  return path === "/" && !window.location.search && !window.location.hash;
}

function App() {
  // Ensure dark mode is active
  if (typeof document !== "undefined") {
    document.documentElement.classList.add("dark");
  }

  const [welcomed, setWelcomed] = useState(() => {
    try {
      return localStorage.getItem("stellara_welcomed") === "1" || !arrivingAtFrontDoor();
    } catch {
      return true;
    }
  });

  if (!welcomed) {
    return (
      <AnimatePresence>
        <WelcomeScreen
          onComplete={() => {
            try {
              localStorage.setItem("stellara_welcomed", "1");
            } catch {
              /* storage blocked */
            }
            setWelcomed(true);
          }}
        />
      </AnimatePresence>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="relative min-h-screen font-sans selection:bg-primary/30"
          >
            <StarField />
            <Navigation />
            <main className="relative z-10 pb-20 md:pb-0">
              <Router />
            </main>
          </motion.div>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
