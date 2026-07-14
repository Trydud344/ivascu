import { useLocation } from 'wouter';
import { AnimatePresence, motion } from 'motion/react';
import Home from './pages/Home';
import CameraRoll from './pages/CameraRoll';

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
    </AnimatePresence>
  );
}

function App() {
  return (
    <>
      <nav-bar />
      <Pages />
    </>
  );
}

export default App;
