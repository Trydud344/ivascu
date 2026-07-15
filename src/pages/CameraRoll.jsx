import { useState, useEffect, useMemo, useCallback } from 'react';
import Lightbox from '../components/Lightbox';
import useMediaQuery from '../hooks/useMediaQuery';
import './CameraRoll.css';

function CameraRoll() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const isTablet = useMediaQuery('(min-width: 640px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const columnCount = isDesktop ? 3 : isTablet ? 2 : 1;

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch('/photos.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setPhotos(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const columns = useMemo(() => {
    const cols = Array.from({ length: columnCount }, () => []);
    photos.forEach((photo, index) => {
      cols[index % columnCount].push(photo);
    });
    return cols;
  }, [photos, columnCount]);

  const openLightbox = useCallback((index) => {
    setLightboxIndex(index);
  }, []);

  if (loading) {
    return <div className="camera-roll-status-message">Loading photos…</div>;
  }

  if (error) {
    return (
      <div className="camera-roll-status-message">
        Could not load photos. {error}
      </div>
    );
  }

  if (photos.length === 0) {
    return <div className="camera-roll-status-message">No photos yet.</div>;
  }

  return (
    <>
      <div className="camera-roll-container">
        <div className="camera-roll-grid">
          {columns.map((col, colIdx) => (
            <div key={colIdx} className="camera-roll-column">
              {col.map((photo) => {
                const globalIdx = photos.indexOf(photo);
                return (
                  <div
                    key={photo.id}
                    className="camera-roll-item"
                    style={{ aspectRatio: photo.aspectRatio || 1 }}
                    onClick={() => openLightbox(globalIdx)}
                  >
                    <img
                      src={photo.thumb}
                      alt=""
                      loading="lazy"
                      className="camera-roll-image"
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}

export default CameraRoll;
