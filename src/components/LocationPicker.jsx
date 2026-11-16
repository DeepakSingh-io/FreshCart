import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Navigation, Search, Loader2, AlertCircle, Check, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MOCK_LOCATIONS = [
  { address: '123 Fifth Avenue, New York, NY 10003', lat: 40.7359, lng: -73.9911 },
  { address: '1600 Amphitheatre Parkway, Mountain View, CA 94043', lat: 37.4221, lng: -122.0841 },
  { address: '221B Baker Street, London NW1 6XE, UK', lat: 51.5237, lng: -0.1585 },
];

export default function LocationPicker({ isOpen, onClose, onSelect }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY' || apiKey.includes('YOUR_API_KEY') || apiKey === 'MY_GOOGLE_MAPS_API_KEY') {
      console.warn('VITE_GOOGLE_MAPS_API_KEY is missing or invalid. Falling back to Demo Mode.');
      setIsDemoMode(true);
      return;
    }

    // Global handler for Google Maps authentication failures (like InvalidKeyMapError)
    window.gm_authFailure = () => {
      console.error('Google Maps authentication failed (InvalidKeyMapError).');
      setError('The Google Maps API key provided is invalid or has expired. Please verify your key in the Google Cloud Console.');
      setIsDemoMode(true);

      const script = document.getElementById('google-maps-script');
      if (script) script.remove();
      if (window.google) delete window.google;
    };

    const loadGoogleMaps = () => {
      if (window.google?.maps?.places) {
        initAutocomplete();
        return;
      }

      const scriptId = 'google-maps-script';
      if (document.getElementById(scriptId)) {
        const checkInterval = setInterval(() => {
          if (window.google?.maps?.places) {
            clearInterval(checkInterval);
            initAutocomplete();
          }
        }, 100);
        return;
      }

      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initAutocomplete();
      };
      script.onerror = () => {
        setError('Failed to load Google Maps API. Please check your API key and internet connection.');
        setIsDemoMode(true);
      };
      document.head.appendChild(script);
    };

    const timer = setTimeout(loadGoogleMaps, 100);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const initAutocomplete = () => {
    let retries = 0;
    const tryInit = () => {
      if (inputRef.current && window.google?.maps?.places) {
        try {
          if (autocompleteRef.current) {
            window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
          }

          autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
            types: ['address'],
            fields: ['formatted_address', 'geometry', 'name'],
          });

          autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current?.getPlace();
            if (place?.formatted_address && place.geometry?.location) {
              onSelect({
                address: place.formatted_address,
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              });
              onClose();
            }
          });
          setIsDemoMode(false);
          setError(null);
        } catch (err) {
          console.error('Autocomplete initialization failed:', err);
          setIsDemoMode(true);
        }
      } else if (retries < 10) {
        retries++;
        setTimeout(tryInit, 100);
      } else {
        setIsDemoMode(true);
      }
    };

    tryInit();
  };

  const handleGetCurrentLocation = () => {
    setIsLoading(true);
    setError(null);

    if (isDemoMode) {
      setTimeout(() => {
        onSelect(MOCK_LOCATIONS[0]);
        setIsLoading(false);
        onClose();
      }, 1000);
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
            );
            const data = await response.json();
            if (data.results && data.results[0]) {
              onSelect({
                address: data.results[0].formatted_address,
                lat: latitude,
                lng: longitude,
              });
              onClose();
            } else {
              setError('Could not find address for your location.');
            }
          } catch (err) {
            setError('Failed to fetch address.');
          } finally {
            setIsLoading(false);
          }
        },
        () => {
          setError('Permission denied or location unavailable. Using demo location.');
          setTimeout(() => {
            onSelect(MOCK_LOCATIONS[0]);
            setIsLoading(false);
            onClose();
          }, 1000);
        }
      );
    } else {
      setError('Geolocation not supported. Using demo location.');
      onSelect(MOCK_LOCATIONS[0]);
      setIsLoading(false);
    }
  };

  const handleMockSelect = (loc) => {
    onSelect(loc);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:p-4 pointer-events-none">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="location-picker-title"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]"
            >
              {/* Mobile drag handle */}
              <div className="sm:hidden pt-3 pb-1 flex justify-center shrink-0" aria-hidden="true">
                <div className="w-10 h-1.5 bg-slate-200 rounded-full" />
              </div>

              <div className="px-5 py-4 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-brand-600 shrink-0" />
                  <h2 id="location-picker-title" className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                    Delivery Location
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close location picker"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-slate-100 rounded-xl transition-colors shrink-0"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                {isDemoMode && (
                  <div className="p-3 bg-amber-50 border border-amber-200/70 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs font-bold text-amber-900">Demo Mode Active</p>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        Google Maps API key is missing or invalid. You can still test using the suggestions below or the &quot;Use Current Location&quot; button.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Search Address</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder={isDemoMode ? 'Search disabled in demo mode' : 'Enter your delivery address'}
                      disabled={isDemoMode}
                      className={`w-full bg-slate-100 border border-transparent rounded-xl py-3 pl-10 pr-10 text-base sm:text-sm outline-none transition-all ${isDemoMode ? 'opacity-60 cursor-not-allowed' : 'focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'}`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && !isDemoMode && (
                      <button
                        type="button"
                        aria-label="Clear address search"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {isDemoMode && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Suggested Locations</p>
                    <div className="space-y-1.5">
                      {MOCK_LOCATIONS.map((loc, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleMockSelect(loc)}
                          className="w-full min-h-[48px] flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-brand-200 transition-all text-left group"
                        >
                          <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors shrink-0">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <span className="text-sm text-slate-700 font-medium line-clamp-2">{loc.address}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-400 font-bold">Or</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={isLoading}
                  className="w-full min-h-[48px] flex items-center justify-center gap-2 py-3 px-4 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Navigation className="w-5 h-5" />
                  )}
                  Use Current Location
                </button>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl space-y-2.5">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <div className="space-y-1 min-w-0">
                        <p className="text-sm font-bold text-red-800">API Key Error</p>
                        <p className="text-xs text-red-700 leading-relaxed">{error}</p>
                      </div>
                    </div>
                    <div>
                      <a
                        href="https://developers.google.com/maps/documentation/javascript/error-messages#invalid-key-map-error"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-red-600 hover:underline inline-flex items-center gap-1"
                      >
                        How to fix this <ChevronRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 text-center pb-safe shrink-0">
                <div className="flex items-center justify-center gap-1.5 text-brand-700 mb-0.5">
                  <Check className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Safe &amp; Secure</span>
                </div>
                <p className="text-xs text-slate-500">
                  Used only to show available products and delivery times in your area.
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
