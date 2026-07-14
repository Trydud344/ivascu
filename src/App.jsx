import { useLocation } from 'wouter';
import { AnimatePresence, motion } from 'motion/react';
import GradualBlur from './components/GradualBlur/GradualBlur';
import Home from './pages/Home';
import CameraRoll from './pages/CameraRoll';
import Test from './pages/Test';

function Pages() {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="wait">
      {location === '/' && (
        <motion.div
          key="home"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Home />
        </motion.div>
      )}
      {location === '/camera-roll' && (
        <motion.div
          key="camera-roll"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <CameraRoll />
        </motion.div>
      )}
      {location === '/test' && (
        <motion.div
          key="test"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Test />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function App() {
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

export default App;
