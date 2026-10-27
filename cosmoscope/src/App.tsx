import { Switch, Route, Redirect, Router as WouterRouter } from "wouter";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";

import Navigation from "@/components/Navigation";
import StarField from "@/components/StarField";
import WelcomeScreen from "@/components/WelcomeScreen";

// Pages
import NotFound from "@/pages/not-found";
import SolarSystem from "@/pages/SolarSystem";
import Tonight from "@/pages/Tonight";
import APOD from "@/pages/APOD";
import Constellations from "@/pages/Constellations";
import ScaleOfUniverse from "@/pages/ScaleOfUniverse";
import ExoplanetExplorer from "@/pages/ExoplanetExplorer";
import SimulationsLanding from "@/pages/simulations/SimulationsLanding";
import BigBangSim from "@/pages/simulations/BigBangSim";
import StarBirthSim from "@/pages/simulations/StarBirthSim";
import StarDeathSim from "@/pages/simulations/StarDeathSim";
import BlackHoleSim from "@/pages/simulations/BlackHoleSim";
import About from "@/pages/About";
import Discoveries from "@/pages/Discoveries";
import Credits from "@/pages/Credits";
import NotePage from "@/pages/Note";
import Privacy from "@/pages/Privacy";

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

function Router() {
  return (
    <AnimatePresence mode="wait">
      <Switch>
        <Route path="/" component={SolarSystem} />
        <Route path="/tonight" component={Tonight} />
        <Route path="/apod" component={APOD} />
        <Route path="/constellations" component={Constellations} />
        <Route path="/scale" component={ScaleOfUniverse} />
        <Route path="/exoplanets" component={ExoplanetExplorer} />
        <Route path="/simulations" component={SimulationsLanding} />
        <Route path="/simulations/big-bang" component={BigBangSim} />
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
    </AnimatePresence>
  );
}

function App() {
  // Ensure dark mode is active
  if (typeof document !== "undefined") {
    document.documentElement.classList.add("dark");
  }

  const [welcomed, setWelcomed] = useState(() => {
    try {
      return localStorage.getItem("stellara_welcomed") === "1";
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
