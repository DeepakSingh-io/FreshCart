import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  Plus,
  Minus,
  Trash2,
  ChevronRight,
  Apple,
  Leaf,
  Milk,
  Croissant,
  Fish,
  Package,
  Coffee,
  LayoutGrid,
  MapPin,
  User,
  Heart,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CATEGORIES, PRODUCTS } from './constants.js';
import AuthModal from './components/AuthModal.jsx';
import LocationPicker from './components/LocationPicker.jsx';

const IconMap = {
  Apple: <Apple className="w-5 h-5" />,
  Leaf: <Leaf className="w-5 h-5" />,
  Milk: <Milk className="w-5 h-5" />,
  Croissant: <Croissant className="w-5 h-5" />,
  Fish: <Fish className="w-5 h-5" />,
  Package: <Package className="w-5 h-5" />,
  Coffee: <Coffee className="w-5 h-5" />,
  LayoutGrid: <LayoutGrid className="w-5 h-5" />,
};

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [failedImages, setFailedImages] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterJoined, setNewsletterJoined] = useState(false);

  const [user, setUser] = useState(null);
  const [location, setLocation] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  const catalogRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsCartOpen(false);
        setIsMobileMenuOpen(false);
        setIsSearchFocused(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const searchSuggestions = useMemo(() => {
    if (!searchQuery || searchQuery.trim().length < 1) return [];
    const searchLower = searchQuery.trim().toLowerCase();
    return PRODUCTS
      .filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.category.toLowerCase().includes(searchLower)
      )
      .slice(0, 6);
  }, [searchQuery]);

  const addToCart = (product) => {
    setOrderPlaced(false);
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev.flatMap((item) => {
        if (item.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return [];
          return [{ ...item, quantity: newQty }];
        }
        return [item];
      })
    );
  };

  const toggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSelectSuggestion = (name) => {
    setSearchQuery(name);
    setIsSearchFocused(false);
    scrollToCatalog();
  };

  const handleCheckout = () => {
    setOrderPlaced(true);
    setCart([]);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterJoined(true);
    setNewsletterEmail('');
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-4 h-14 sm:h-20">
            {/* Zone 1: Brand */}
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                setSelectedCategory('all');
                setSearchQuery('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 shrink-0 min-h-[44px]"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-brand-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-brand-500/20 shrink-0">
                <Leaf className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-base sm:text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap">
                FreshCart
              </span>
            </a>

            {/* Zone 2: Desktop Search Bar */}
            <div className="flex-1 max-w-lg mx-4 lg:mx-8 hidden md:block relative">
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-600 transition-colors pointer-events-none" />
                <input
                  type="text"
                  aria-label="Search fresh groceries"
                  placeholder="Search fresh groceries..."
                  className="w-full bg-slate-100 border border-transparent rounded-2xl py-2.5 pl-11 pr-10 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/30 focus:bg-white transition-all outline-none"
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchFocused(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setIsSearchFocused(false);
                      scrollToCatalog();
                    }
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Desktop Search Suggestions */}
              <AnimatePresence>
                {isSearchFocused && searchSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[60]"
                  >
                    <div className="p-2">
                      {searchSuggestions.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleSelectSuggestion(product.name)}
                          className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors text-left group"
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-900 group-hover:text-brand-600 transition-colors truncate">
                              {product.name}
                            </p>
                            <p className="text-xs text-slate-500 tabular-nums">
                              ${product.price.toFixed(2)} · {product.unit}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="bg-slate-50 px-3 py-2 text-center border-t border-slate-100">
                      <p className="text-xs font-medium text-slate-500">Press Enter to search all results</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Zone 3: Actions + Compact Location Pill */}
            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
              <button
                type="button"
                onClick={() => setIsLocationPickerOpen(true)}
                aria-label="Select delivery location"
                className="min-h-[40px] sm:min-h-[44px] px-2.5 sm:px-3 py-1.5 text-slate-700 bg-slate-100/90 hover:bg-slate-200/70 rounded-full sm:rounded-xl transition-colors flex items-center gap-1.5 max-w-[130px] min-[400px]:max-w-[165px] sm:max-w-[200px] min-w-0"
              >
                <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                <span className="text-xs sm:text-sm font-medium truncate">
                  {location ? location.address : 'Set location'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                aria-label={user ? `Account: ${user.name}` : 'Sign in'}
                className="hidden sm:flex min-h-[44px] min-w-[44px] px-2.5 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors items-center justify-center gap-2 shrink-0"
              >
                <User className="w-5 h-5" />
                {user && <span className="text-sm font-semibold hidden lg:block max-w-[110px] truncate">{user.name}</span>}
              </button>

              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                aria-label={`Shopping cart with ${cartCount} items`}
                className="relative min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
              >
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-brand-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-white tabular-nums">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Search Strip */}
      <div className="md:hidden px-4 py-2.5 bg-white border-b border-slate-100 relative z-30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            aria-label="Search groceries"
            placeholder="Search fresh groceries..."
            className="w-full bg-slate-100 border border-transparent rounded-xl py-2.5 pl-10 pr-10 text-base focus:bg-white focus:border-brand-500/30 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchFocused(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setIsSearchFocused(false);
                scrollToCatalog();
              }
            }}
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearchQuery('')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Mobile Search Suggestions */}
        <AnimatePresence>
          {isSearchFocused && searchSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15 }}
              className="absolute left-4 right-4 top-full mt-1.5 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50"
            >
              <div className="p-2 max-h-72 overflow-y-auto">
                {searchSuggestions.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectSuggestion(product.name)}
                    className="w-full min-h-[48px] flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
                      <p className="text-xs text-slate-500 tabular-nums">
                        ${product.price.toFixed(2)} · {product.unit}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content */}
      <main id="top" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-8 sm:space-y-10">
        {/* Hero Section */}
        <section className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-brand-900 text-white p-6 sm:p-10 lg:p-12 min-h-[240px] sm:min-h-[300px] flex flex-col justify-center">
          <div className="relative z-10 max-w-xl space-y-3 sm:space-y-4">
            <span className="inline-block text-brand-300 text-xs sm:text-sm font-semibold tracking-wide uppercase">
              Fresh &amp; Organic Delivery
            </span>
            <h1 className="text-2xl min-[380px]:text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.12] text-balance">
              Get your groceries delivered in <span className="text-brand-400">15 minutes</span>
            </h1>
            <p className="text-slate-200 text-sm sm:text-base lg:text-lg max-w-md leading-relaxed">
              Freshness guaranteed. Shop from over 5,000+ products from your favorite local brands.
            </p>
            <div className="pt-1 sm:pt-2">
              <button
                type="button"
                onClick={scrollToCatalog}
                className="min-h-[44px] sm:min-h-[48px] bg-brand-500 hover:bg-brand-600 text-white px-6 sm:px-8 py-3 rounded-xl sm:rounded-2xl font-bold shadow-xl shadow-brand-500/20 transition-all inline-flex items-center gap-2 group text-sm sm:text-base whitespace-nowrap"
              >
                Shop Now
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Background Decoration with Measured Contrast Scrim */}
          <div className="absolute top-0 right-0 w-full sm:w-2/3 lg:w-1/2 h-full pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
              alt="Fresh produce and groceries"
              className="w-full h-full object-cover opacity-30 sm:opacity-35"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-900 via-brand-900/90 to-brand-900/50 sm:to-transparent" />
          </div>
        </section>

        {/* Categories */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Categories</h2>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                scrollToCatalog();
              }}
              className="text-brand-600 font-semibold text-sm hover:underline min-h-[40px] px-2 whitespace-nowrap shrink-0"
            >
              View All
            </button>
          </div>
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                className={`flex flex-col items-center justify-center gap-2.5 min-w-[88px] sm:min-w-[104px] min-h-[44px] p-3 sm:p-4 rounded-2xl transition-all shrink-0 ${
                  selectedCategory === category.id
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80'
                }`}
              >
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${
                    selectedCategory === category.id ? 'bg-white/20' : 'bg-slate-100'
                  }`}
                >
                  {IconMap[category.icon]}
                </div>
                <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">{category.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Products Grid */}
        <section ref={catalogRef} id="products-catalog" className="space-y-5 sm:space-y-6 scroll-mt-24">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {selectedCategory === 'all'
                ? 'Popular Products'
                : CATEGORIES.find((c) => c.id === selectedCategory)?.name}
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium tabular-nums">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} found
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5 lg:gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => {
                const isWishlisted = wishlist.includes(product.id);
                const inCartItem = cart.find((item) => item.id === product.id);
                const isImgBroken = failedImages[product.id];

                return (
                  <motion.div
                    layout
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.18 }}
                    className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-3 sm:p-4 hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col min-w-0"
                  >
                    <div className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 mb-3 sm:mb-4">
                      {!isImgBroken ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          onError={() => setFailedImages((prev) => ({ ...prev, [product.id]: true }))}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-brand-50 to-slate-100 text-brand-600 p-3 text-center">
                          <Leaf className="w-8 h-8 mb-1 opacity-70" />
                          <span className="text-xs font-semibold text-slate-600 line-clamp-2">{product.name}</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleWishlist(product.id)}
                        aria-label={isWishlisted ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`}
                        className={`absolute top-1.5 right-1.5 min-h-[40px] min-w-[40px] flex items-center justify-center bg-white/85 backdrop-blur-sm rounded-full transition-colors ${
                          isWishlisted ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
                        }`}
                      >
                        <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
                      </button>
                    </div>

                    <div className="flex-1 space-y-1 min-w-0">
                      <p className="text-[11px] sm:text-xs font-semibold text-brand-600 uppercase tracking-wider truncate">
                        {product.category}
                      </p>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 truncate">{product.unit}</p>
                    </div>

                    <div className="mt-3 sm:mt-4 flex items-center justify-between gap-2">
                      <span className="text-base sm:text-lg font-bold text-slate-900 tabular-nums">
                        ${product.price.toFixed(2)}
                      </span>

                      {inCartItem ? (
                        <div className="flex items-center gap-1 bg-brand-50 border border-brand-200 rounded-xl p-0.5">
                          <button
                            type="button"
                            aria-label={`Decrease quantity of ${product.name}`}
                            onClick={() => updateQuantity(product.id, -1)}
                            className="min-h-[36px] min-w-[32px] flex items-center justify-center rounded-lg text-brand-700 hover:bg-white transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs sm:text-sm font-bold text-brand-800 w-5 text-center tabular-nums">
                            {inCartItem.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label={`Increase quantity of ${product.name}`}
                            onClick={() => updateQuantity(product.id, 1)}
                            className="min-h-[36px] min-w-[32px] flex items-center justify-center rounded-lg text-brand-700 hover:bg-white transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addToCart(product)}
                          aria-label={`Add ${product.name} to cart`}
                          className="min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center bg-brand-100 text-brand-700 rounded-xl hover:bg-brand-500 hover:text-white transition-all shadow-sm shrink-0"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16 sm:py-20 space-y-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">No products found</h3>
              <p className="text-sm sm:text-base text-slate-500">Try adjusting your search or category filters.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="min-h-[44px] px-4 text-brand-600 font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 pt-10 sm:pt-12 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white">
                <Leaf className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">FreshCart</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Your daily grocery needs delivered to your doorstep. Fresh, organic, and fast.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-3 sm:mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#top" className="hover:text-brand-600 transition-colors inline-block py-0.5">About Us</a></li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    scrollToCatalog();
                  }}
                  className="hover:text-brand-600 transition-colors inline-block py-0.5"
                >
                  Shop All
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('fruits');
                    scrollToCatalog();
                  }}
                  className="hover:text-brand-600 transition-colors inline-block py-0.5"
                >
                  Fresh Produce
                </button>
              </li>
              <li><a href="#products-catalog" className="hover:text-brand-600 transition-colors inline-block py-0.5">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-3 sm:mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>
                <button
                  type="button"
                  onClick={() => setIsLocationPickerOpen(true)}
                  className="hover:text-brand-600 transition-colors inline-block py-0.5"
                >
                  Delivery Areas
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="hover:text-brand-600 transition-colors inline-block py-0.5"
                >
                  My Account
                </button>
              </li>
              <li><a href="#products-catalog" className="hover:text-brand-600 transition-colors inline-block py-0.5">Shipping Policy</a></li>
              <li><a href="#products-catalog" className="hover:text-brand-600 transition-colors inline-block py-0.5">FAQ</a></li>
            </ul>
          </div>

          <div className="min-w-0">
            <h4 className="font-bold text-slate-900 mb-3 sm:mb-4">Newsletter</h4>
            <p className="text-sm text-slate-500 mb-3">Get the latest updates and offers.</p>
            {newsletterJoined ? (
              <div className="p-3 bg-brand-50 text-brand-700 rounded-xl text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>You&apos;re subscribed for weekly fresh deals.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col min-[380px]:flex-row gap-2">
                <input
                  type="email"
                  required
                  aria-label="Email address for newsletter"
                  placeholder="Email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="min-w-0 flex-1 bg-slate-100 border border-transparent rounded-xl px-4 py-2.5 text-base sm:text-sm outline-none focus:bg-white focus:border-brand-500/30 focus:ring-2 focus:ring-brand-500/20"
                />
                <button
                  type="submit"
                  className="min-h-[44px] bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap shrink-0"
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-slate-400">
          <p>&copy; 2026 FreshCart Grocery. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#top" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
            <a href="#top" className="hover:text-slate-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(userData) => setUser(userData)}
      />

      <LocationPicker
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        onSelect={(locData) => setLocation(locData)}
      />

      {/* Mobile Slide-Out Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60]"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation menu"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed top-0 left-0 h-[100dvh] w-[min(85vw,300px)] bg-white shadow-2xl z-[70] flex flex-col"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <span className="text-lg font-bold tracking-tight text-slate-900">FreshCart</span>
                </div>
                <button
                  type="button"
                  aria-label="Close navigation menu"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
                <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Categories</p>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setIsMobileMenuOpen(false);
                      scrollToCatalog();
                    }}
                    className={`w-full min-h-[44px] flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-sm ${
                      selectedCategory === cat.id
                        ? 'bg-brand-50 text-brand-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    {IconMap[cat.icon]}
                    <span>{cat.name}</span>
                  </button>
                ))}

                <hr className="my-4 border-slate-100" />
                <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Account</p>
                <button
                  type="button"
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full min-h-[44px] flex items-center gap-3 px-3.5 py-2.5 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-medium"
                >
                  <User className="w-5 h-5 shrink-0" />
                  <span className="truncate">{user ? user.name : 'Sign In / Register'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsLocationPickerOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full min-h-[44px] flex items-center gap-3 px-3.5 py-2.5 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-medium"
                >
                  <MapPin className="w-5 h-5 shrink-0 text-brand-600" />
                  <span className="truncate">{location ? location.address : 'Set Delivery Location'}</span>
                </button>
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50 pb-safe shrink-0">
                <p className="text-xs text-slate-500 text-center">FreshCart Grocery Delivery</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200 z-40 pb-safe">
        <div className="grid grid-cols-4 items-center h-14 px-2">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-colors ${
              !isLocationPickerOpen && !isCartOpen && !isAuthModalOpen ? 'text-brand-600' : 'text-slate-500'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="text-[11px] font-semibold leading-none">Shop</span>
          </button>

          <button
            type="button"
            onClick={() => setIsLocationPickerOpen(true)}
            className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-colors ${
              isLocationPickerOpen ? 'text-brand-600' : 'text-slate-500'
            }`}
          >
            <MapPin className="w-5 h-5" />
            <span className="text-[11px] font-semibold leading-none">Location</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className={`relative min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-colors ${
              isCartOpen ? 'text-brand-600' : 'text-slate-500'
            }`}
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-brand-500 text-white text-[9px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center border border-white tabular-nums">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[11px] font-semibold leading-none">Cart</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-colors ${
              isAuthModalOpen ? 'text-brand-600' : 'text-slate-500'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[11px] font-semibold leading-none truncate max-w-[68px]">
              {user ? user.name.split(' ')[0] : 'Profile'}
            </span>
          </button>
        </div>
      </div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60]"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Shopping cart"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed top-0 right-0 h-[100dvh] w-full sm:max-w-md bg-white shadow-2xl z-[70] flex flex-col"
            >
              <div className="px-5 py-4 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-brand-600" />
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">Your Cart</h2>
                  <span className="text-xs font-semibold text-slate-500 tabular-nums">({cartCount})</span>
                </div>
                <button
                  type="button"
                  aria-label="Close cart"
                  onClick={() => setIsCartOpen(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                {orderPlaced ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-4">
                    <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center text-brand-600">
                      <CheckCircle2 className="w-9 h-9" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Order Confirmed</h3>
                    <p className="text-sm text-slate-500 max-w-xs">
                      {location
                        ? `Preparing your fresh groceries for delivery to ${location.address}.`
                        : 'Preparing your fresh groceries for express 15-minute delivery.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setOrderPlaced(false);
                        setIsCartOpen(false);
                      }}
                      className="min-h-[44px] px-6 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition-colors"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                      <ShoppingCart className="w-10 h-10" />
                    </div>
                    <p className="text-slate-500 font-medium">Your cart is empty</p>
                    <button
                      type="button"
                      onClick={() => setIsCartOpen(false)}
                      className="min-h-[44px] px-4 text-brand-600 font-bold hover:underline"
                    >
                      Start shopping
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex gap-3 sm:gap-4 min-w-0">
                      <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">{item.name}</h3>
                          <button
                            type="button"
                            aria-label={`Remove ${item.name} from cart`}
                            onClick={() => removeFromCart(item.id)}
                            className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors shrink-0 -mt-1 -mr-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500">{item.unit}</p>
                        <div className="flex items-center justify-between pt-1.5">
                          <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                            <button
                              type="button"
                              aria-label={`Decrease quantity of ${item.name}`}
                              onClick={() => updateQuantity(item.id, -1)}
                              className="min-h-[32px] min-w-[32px] flex items-center justify-center hover:bg-white rounded-lg transition-colors text-slate-700"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-sm font-bold w-5 text-center tabular-nums">{item.quantity}</span>
                            <button
                              type="button"
                              aria-label={`Increase quantity of ${item.name}`}
                              onClick={() => updateQuantity(item.id, 1)}
                              className="min-h-[32px] min-w-[32px] flex items-center justify-center hover:bg-white rounded-lg transition-colors text-slate-700"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="font-bold text-slate-900 tabular-nums">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-100 space-y-4 pb-safe shrink-0">
                  <div className="space-y-2">
                    <div className="flex justify-between text-slate-500 text-sm">
                      <span>Subtotal</span>
                      <span className="tabular-nums">${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-sm">
                      <span>Delivery Fee</span>
                      <span className="text-brand-600 font-semibold">FREE</span>
                    </div>
                    <div className="flex justify-between text-slate-900 font-bold text-lg pt-2 border-t border-slate-200">
                      <span>Total</span>
                      <span className="tabular-nums">${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="w-full min-h-[48px] bg-brand-500 hover:bg-brand-600 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-brand-500/20 transition-all"
                  >
                    Checkout Now
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
