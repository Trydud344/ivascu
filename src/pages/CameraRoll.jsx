import { useState, useEffect, useMemo, useCallback } from 'react';
import Lightbox from '../components/Lightbox';

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

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
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
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
    photos.forEach((photo, i) => cols[i % columnCount].push(photo));
    return cols;
  }, [photos, columnCount]);

  const openLightbox = useCallback((index) => {
    setLightboxIndex(index);
  }, []);

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px 100px', textAlign: 'center', color: '#888' }}>
        Loading photos…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px 100px', textAlign: 'center', color: '#888' }}>
        Could not load photos. {error}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px 100px', textAlign: 'center', color: '#888' }}>
        No photos yet.
      </div>
    );
  }

  return (
    <>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '60px 24px 100px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          {columns.map((col, colIdx) => (
            <div
              key={colIdx}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {col.map((photo, photoIdx) => {
                const globalIdx = photos.indexOf(photo);
                return (
                  <div
                    key={photo.id}
                    style={{
                      width: '100%',
                      aspectRatio: photo.aspectRatio || 1,
                      borderRadius: 8,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      background: '#1c1f1d',
                    }}
                    onClick={() => openLightbox(globalIdx)}
                  >
                    <img
                      src={photo.thumb}
                      alt=""
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transition: 'transform 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.03)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
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
