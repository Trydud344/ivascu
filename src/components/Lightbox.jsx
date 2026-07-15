import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import './Lightbox.css';

function Lightbox({ photos, currentIndex, onClose }) {
  const [index, setIndex] = useState(currentIndex);

  useEffect(() => {
    setIndex(currentIndex);
  }, [currentIndex]);

  const goNext = useCallback(() => {
    setIndex((prevIndex) => (prevIndex + 1) % photos.length);
  }, [photos.length]);

  const goPrev = useCallback(() => {
    setIndex((prevIndex) => (prevIndex - 1 + photos.length) % photos.length);
  }, [photos.length]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowRight':
          goNext();
          break;
        case 'ArrowLeft':
          goPrev();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, goNext, goPrev]);

  const photo = photos[index];
  if (!photo) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="lightbox-overlay"
      onClick={onClose}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={photo.id || index}
          src={photo.full}
          alt=""
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="lightbox-image"
          onClick={(event) => event.stopPropagation()}
          draggable={false}
        />
      </AnimatePresence>

      {photos.length > 1 && (
        <>
          <button
            onClick={(event) => {
              event.stopPropagation();
              goPrev();
            }}
            className="lightbox-button lightbox-button-prev"
          >
            ‹
          </button>

          <button
            onClick={(event) => {
              event.stopPropagation();
              goNext();
            }}
            className="lightbox-button lightbox-button-next"
          >
            ›
          </button>
        </>
      )}

      <div className="lightbox-counter">
        {index + 1} / {photos.length}
      </div>

      <button
        onClick={onClose}
        className="lightbox-button-close"
      >
        ✕
      </button>
    </motion.div>
  );
}

export default Lightbox;
