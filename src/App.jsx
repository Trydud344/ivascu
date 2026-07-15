import { Route, Switch, useLocation } from 'wouter';
import { AnimatePresence, motion } from 'motion/react';
import GradualBlur from './components/GradualBlur/GradualBlur';
import Home from './pages/Home';
import CameraRoll from './pages/CameraRoll';
import Test from './pages/Test';

const TRANSITION_DURATION_SECONDS = 0.25;

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  );
}

function Pages() {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Switch location={location} key={location}>
        <Route path="/">
          <PageTransition>
            <Home />
          </PageTransition>
        </Route>
        <Route path="/camera-roll">
          <PageTransition>
            <CameraRoll />
          </PageTransition>
        </Route>
        <Route path="/test">
          <PageTransition>
            <Test />
          </PageTransition>
        </Route>
      </Switch>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <>
      <nav-bar />
      <GradualBlur
        target="page"
        position="top"
        height="6rem"
        strength={3}
        divCount={8}
        curve="bezier"
        exponential={true}
        opacity={1}
        zIndex={-1}
      />
      <Pages />
    </>
  );
}
