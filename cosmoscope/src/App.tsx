import { useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";

import Navigation from "@/components/Navigation";
import StarField from "@/components/StarField";
import WelcomeScreen from "@/components/WelcomeScreen";

// Pages
import NotFound from "@/pages/not-found";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import APOD from "@/pages/APOD";
import SolarSystem from "@/pages/SolarSystem";
import Education from "@/pages/Education";
import TonightsSky from "@/pages/TonightsSky";
import OurGalaxy from "@/pages/OurGalaxy";
import SimulationsLanding from "@/pages/simulations/SimulationsLanding";
import BigBangSim from "@/pages/simulations/BigBangSim";
import MilkyWayBirthSim from "@/pages/simulations/MilkyWayBirthSim";
import StarBirthSim from "@/pages/simulations/StarBirthSim";
import StarDeathSim from "@/pages/simulations/StarDeathSim";
import BlackHoleSim from "@/pages/simulations/BlackHoleSim";
import InsideBlackHoleSim from "@/pages/simulations/InsideBlackHoleSim";
import SolarSystemFormationSim from "@/pages/simulations/SolarSystemFormationSim";
import ScaleOfUniverse from "@/pages/ScaleOfUniverse";
import ExoplanetExplorer from "@/pages/ExoplanetExplorer";
import LaunchTracker from "@/pages/LaunchTracker";
import SpaceNews from "@/pages/SpaceNews";
import Discover from "@/pages/Discover";
import Observatory from "@/pages/Observatory";
import AskTheUniverse from "@/pages/AskTheUniverse";
import About from "@/pages/About";
import BlackHoles from "@/pages/BlackHoles";
import Constellations from "@/pages/Constellations";
import Glossary from "@/pages/Glossary";
import BuildYourOwnUniverse from "@/pages/BuildYourOwnUniverse";

const queryClient = new QueryClient();

function Router() {
  return (
    <AnimatePresence mode="wait">
      <Switch>
        <Route path="/" component={SolarSystem} />
        <Route path="/galaxy" component={OurGalaxy} />
        <Route path="/simulations" component={SimulationsLanding} />
        <Route path="/simulations/big-bang" component={BigBangSim} />
        <Route path="/simulations/milky-way-birth" component={MilkyWayBirthSim} />
        <Route path="/simulations/star-birth" component={StarBirthSim} />
        <Route path="/simulations/star-death" component={StarDeathSim} />
        <Route path="/simulations/black-hole" component={BlackHoleSim} />
        <Route path="/simulations/inside-black-hole" component={InsideBlackHoleSim} />
        <Route path="/simulations/solar-system-formation" component={SolarSystemFormationSim} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={BlogPost} />
        <Route path="/education" component={Education} />
        <Route path="/apod" component={APOD} />
        <Route path="/tonight" component={TonightsSky} />
        <Route path="/scale" component={ScaleOfUniverse} />
        <Route path="/exoplanets" component={ExoplanetExplorer} />
        <Route path="/launches" component={LaunchTracker} />
        <Route path="/news" component={SpaceNews} />
        <Route path="/discover" component={Discover} />
        <Route path="/observatory" component={Observatory} />
        <Route path="/ask" component={AskTheUniverse} />
        <Route path="/about" component={About} />
        <Route path="/blackholes" component={BlackHoles} />
        <Route path="/constellations" component={Constellations} />
        <Route path="/glossary" component={Glossary} />
        <Route path="/history" component={Discover} />
        <Route path="/build-universe" component={BuildYourOwnUniverse} />
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  // Ensure dark mode is active
  if (typeof document !== 'undefined') {
    document.documentElement.classList.add('dark');
  }

  const [welcomed, setWelcomed] = useState(() => localStorage.getItem('stellara_welcomed') === '1');

  if (!welcomed) {
    return (
      <AnimatePresence>
        <WelcomeScreen onComplete={() => { localStorage.setItem('stellara_welcomed', '1'); setWelcomed(true); }} />
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
