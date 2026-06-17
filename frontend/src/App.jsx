import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE = 'http://localhost:8080/api';

function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [authTab, setAuthTab] = useState('login'); // 'login' or 'register'
  const [authForm, setAuthForm] = useState({
    name: '',
    dob: '',
    mobile: '',
    email: '',
    password: ''
  });
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Navigation & Page State
  const [activeTab, setActiveTab] = useState('shop'); // 'shop', 'orders', 'assistance', 'checkout'
  
  // Products & Categories State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedPriceBrackets, setSelectedPriceBrackets] = useState([]);
  const [sortBy, setSortBy] = useState('none'); // 'none', 'low-high', 'high-low'
  const [searchQuery, setSearchQuery] = useState('');

  // Cart State
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Order/Checkout State
  const [checkoutForm, setCheckoutForm] = useState({
    customerName: '',
    customerEmail: '',
    address: '',
    city: '',
    zipCode: '',
    paymentMethod: 'Card', // 'Card', 'UPI', 'Net Banking', 'COD'
    creditCardType: 'Visa', // 'Visa', 'Mastercard', 'Amex', 'Other'
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    bankName: 'SBI',
    upiTxnId: ''
  });
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [ordersHistory, setOrdersHistory] = useState([]);

  // Assistance Page State
  const [activeFaq, setActiveFaq] = useState(null);
  const [assistanceForm, setAssistanceForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [assistanceSuccess, setAssistanceSuccess] = useState(false);

  // Admin CRUD State
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [adminProductForm, setAdminProductForm] = useState({
    id: null,
    name: '',
    description: '',
    price: '',
    gender: 'Male',
    size: 'M',
    imageUrl: '',
    stock: '',
    categoryId: ''
  });

  // Load Categories & Products on startup
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [selectedGender, selectedCategory]);

  // Load user data (cart and history) when currentUser changes
  useEffect(() => {
    if (currentUser) {
      fetchCart();
      fetchOrdersHistory();
      // Auto-fill checkout fields using user profile details
      setCheckoutForm(prev => ({
        ...prev,
        customerName: currentUser.name || '',
        customerEmail: currentUser.email || ''
      }));
      setAssistanceForm(prev => ({
        ...prev,
        name: currentUser.name || '',
        email: currentUser.email || ''
      }));
    } else {
      setCartItems([]);
      setOrdersHistory([]);
    }
  }, [currentUser]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/products/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_BASE}/products`;
      const params = [];
      if (selectedGender !== 'All') {
        params.push(`gender=${selectedGender}`);
      }
      if (selectedCategory !== 'All') {
        params.push(`categoryId=${selectedCategory}`);
      }
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Could not load products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE}/cart?userId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setCartItems(data);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    }
  };

  const fetchOrdersHistory = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE}/orders?userId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setOrdersHistory(data);
      }
    } catch (err) {
      console.error('Failed to fetch orders history:', err);
    }
  };

  // --- Auth Operations ---
  const handleAuthChange = (e) => {
    const { name, value } = e.target;
    setAuthForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (authTab === 'register') {
        const payload = {
          name: authForm.name,
          dob: authForm.dob,
          mobile: authForm.mobile,
          email: authForm.email,
          password: authForm.password
        };

        const res = await fetch(`${API_BASE}/users/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const user = await res.json();
          localStorage.setItem('currentUser', JSON.stringify(user));
          setCurrentUser(user);
        } else {
          const errMsg = await res.text();
          setAuthError(errMsg || 'Registration failed.');
        }
      } else {
        const payload = {
          email: authForm.email,
          password: authForm.password
        };

        const res = await fetch(`${API_BASE}/users/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const user = await res.json();
          localStorage.setItem('currentUser', JSON.stringify(user));
          setCurrentUser(user);
        } else {
          const errMsg = await res.text();
          setAuthError(errMsg || 'Incorrect email or password.');
        }
      }
    } catch (err) {
      setAuthError('Connection error. Is the backend server running?');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('currentUser');
      setCurrentUser(null);
      setActiveTab('shop');
      setIsCartOpen(false);
      setOrderSuccess(null);
      setAuthForm({
        name: '',
        dob: '',
        mobile: '',
        email: '',
        password: ''
      });
    }
  };

  // --- Cart Operations ---
  const handleAddToCart = async (product) => {
    if (!currentUser) {
      alert('Please log in or sign up first to add items to your cart.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/cart?userId=${currentUser.id}&productId=${product.id}&quantity=1`, {
        method: 'POST'
      });
      if (res.ok) {
        fetchCart();
        setIsCartOpen(true);
      } else {
        const msg = await res.text();
        alert(`Failed to add to cart: ${msg}`);
      }
    } catch (err) {
      alert('Error adding to cart');
    }
  };

  const handleUpdateQty = async (cartItemId, newQty) => {
    try {
      if (newQty <= 0) {
        await handleRemoveFromCart(cartItemId);
        return;
      }
      const res = await fetch(`${API_BASE}/cart/${cartItemId}?quantity=${newQty}`, {
        method: 'PUT'
      });
      if (res.ok) {
        fetchCart();
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  const handleRemoveFromCart = async (cartItemId) => {
    try {
      const res = await fetch(`${API_BASE}/cart/${cartItemId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchCart();
      }
    } catch (err) {
      console.error('Error removing from cart:', err);
    }
  };

  const handleClearCart = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE}/cart?userId=${currentUser.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setCartItems([]);
      }
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  };

  // --- Checkout Operations ---
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      const payload = {
        userId: currentUser.id,
        customerName: checkoutForm.customerName,
        customerEmail: checkoutForm.customerEmail,
        address: checkoutForm.address,
        city: checkoutForm.city,
        zipCode: checkoutForm.zipCode,
        paymentMethod: checkoutForm.paymentMethod,
        creditCardType: checkoutForm.paymentMethod === 'Card' ? checkoutForm.creditCardType : null
      };

      const res = await fetch(`${API_BASE}/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setOrderSuccess(data);
        setCartItems([]);
        fetchOrdersHistory();
      } else {
        const msg = await res.text();
        alert(`Checkout failed: ${msg}`);
      }
    } catch (err) {
      alert('Error during checkout');
    }
  };

  // --- Admin CRUD Operations ---
  const handleAdminFormChange = (e) => {
    const { name, value } = e.target;
    setAdminProductForm(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenAddProduct = () => {
    setIsEditMode(false);
    setAdminProductForm({
      id: null,
      name: '',
      description: '',
      price: '',
      gender: 'Male',
      size: 'M',
      imageUrl: '',
      stock: '',
      categoryId: categories[0]?.id || ''
    });
    setIsAdminOpen(true);
  };

  const handleOpenEditProduct = (product) => {
    setIsEditMode(true);
    setAdminProductForm({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      gender: product.gender,
      size: product.size,
      imageUrl: product.imageUrl,
      stock: product.stock,
      categoryId: product.category.id
    });
    setIsAdminOpen(true);
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: adminProductForm.name,
      description: adminProductForm.description,
      price: parseFloat(adminProductForm.price),
      gender: adminProductForm.gender,
      size: adminProductForm.size,
      imageUrl: adminProductForm.imageUrl,
      stock: parseInt(adminProductForm.stock),
      category: { id: parseInt(adminProductForm.categoryId) }
    };

    try {
      let res;
      if (isEditMode) {
        res = await fetch(`${API_BASE}/products/${adminProductForm.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API_BASE}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        setIsAdminOpen(false);
        fetchProducts();
      } else {
        const msg = await res.text();
        alert(`Operation failed: ${msg}`);
      }
    } catch (err) {
      alert('Error saving product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this clothing item?')) return;
    try {
      const res = await fetch(`${API_BASE}/products/${productId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchProducts();
      } else {
        alert('Could not delete product');
      }
    } catch (err) {
      alert('Error deleting product');
    }
  };

  // --- Assistance Ticket Submission ---
  const handleAssistanceSubmit = (e) => {
    e.preventDefault();
    setAssistanceSuccess(true);
    // Auto-clear form after 3 seconds
    setTimeout(() => {
      setAssistanceForm(prev => ({
        ...prev,
        subject: '',
        message: ''
      }));
      setAssistanceSuccess(false);
    }, 4000);
  };

  // Toggle size filter
  const handleToggleSize = (size) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  // Toggle price filter
  const handleTogglePriceBracket = (bracket) => {
    setSelectedPriceBrackets(prev => 
      prev.includes(bracket) ? prev.filter(b => b !== bracket) : [...prev, bracket]
    );
  };

  // --- Filtering & Sorting Local Logic ---
  const filteredProducts = products
    .filter(p => {
      // Search query matches name, description or category
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesSearch = p.name.toLowerCase().includes(q) || 
                              p.description.toLowerCase().includes(q) ||
                              p.category.name.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }
      
      // Sizes filter (multi-select)
      if (selectedSizes.length > 0 && !selectedSizes.includes(p.size)) {
        return false;
      }

      // Price brackets filter (multi-select)
      if (selectedPriceBrackets.length > 0) {
        const matchesPrice = selectedPriceBrackets.some(bracket => {
          if (bracket === 'under-50') return p.price < 50;
          if (bracket === '50-100') return p.price >= 50 && p.price <= 100;
          if (bracket === 'above-100') return p.price > 100;
          return false;
        });
        if (!matchesPrice) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'low-high') return a.price - b.price;
      if (sortBy === 'high-low') return b.price - a.price;
      return 0;
    });

  // Category counts based on overall loaded products
  const getCategoryCount = (categoryId) => {
    return products.filter(p => p.category.id === categoryId).length;
  };

  const getGenderCount = (gender) => {
    if (gender === 'All') return products.length;
    return products.filter(p => p.gender === gender).length;
  };

  const getSizeCount = (size) => {
    return products.filter(p => p.size === size).length;
  };

  const getPriceBracketCount = (bracket) => {
    return products.filter(p => {
      if (bracket === 'under-50') return p.price < 50;
      if (bracket === '50-100') return p.price >= 50 && p.price <= 100;
      if (bracket === 'above-100') return p.price > 100;
      return false;
    }).length;
  };

  // Calculate cart total values
  const totalCartQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // Dynamic Credit Card Offer calculations during checkout
  const getCardDiscountRate = (cardType) => {
    if (cardType === 'Visa') return 0.10;      // 10%
    if (cardType === 'Mastercard') return 0.15; // 15%
    if (cardType === 'Amex') return 0.20;       // 20%
    return 0.0;
  };
  const currentDiscountRate = checkoutForm.paymentMethod === 'Card' ? getCardDiscountRate(checkoutForm.creditCardType) : 0.0;
  const checkoutDiscountAmt = totalCartPrice * currentDiscountRate;
  const checkoutFinalPrice = totalCartPrice - checkoutDiscountAmt;

  // FAQs list
  const faqs = [
    {
      q: "How do I track my order?",
      a: "Once your order is shipped, you will receive a tracking link via email. You can also monitor status updates inside your Orders History tab."
    },
    {
      q: "What is your return policy?",
      a: "We offer a 30-day hassle-free return policy on all unworn items with tags attached. Please contact customer assistance to initiate a return."
    },
    {
      q: "How long does delivery take?",
      a: "Standard delivery takes 3-5 business days. Express shipping options are available at checkout for next-day or 2-day delivery."
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept all major Credit/Debit cards (Visa, Mastercard, Amex), UPI payments (via QR Code scan), Net Banking across major banks, and Cash on Delivery (COD)."
    },
    {
      q: "Are there any credit card discounts?",
      a: "Yes! We offer automatic promotions on credit cards: 10% Off on Visa, 15% Off on Mastercard, and 20% Off on American Express. Select your card network at checkout to apply."
    },
    {
      q: "Is my transaction secure?",
      a: "Absolutely. All transactions are processed using industry-standard SSL encryption and secure banking gateways. We do not store your raw card details."
    }
  ];

  // Render Authentication Portal (Login / Register) if user is not logged in
  if (!currentUser) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'radial-gradient(circle at 50% 30%, #1e1b4b 0%, #0a0b10 80%)' }}>
        <div className="auth-card fade-in">
          <div className="auth-brand">
            ✦ AURA FASHION
          </div>
          
          <div className="auth-tabs">
            <button 
              className={`auth-tab ${authTab === 'login' ? 'active' : ''}`} 
              onClick={() => { setAuthTab('login'); setAuthError(null); }}
            >
              Sign In
            </button>
            <button 
              className={`auth-tab ${authTab === 'register' ? 'active' : ''}`} 
              onClick={() => { setAuthTab('register'); setAuthError(null); }}
            >
              Create Account
            </button>
          </div>

          {authError && <div className="auth-error-banner">{authError}</div>}

          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {authTab === 'register' && (
              <>
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    className="form-control" 
                    required 
                    value={authForm.name} 
                    onChange={handleAuthChange} 
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input 
                      type="date" 
                      name="dob" 
                      className="form-control" 
                      required 
                      value={authForm.dob} 
                      onChange={handleAuthChange} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Mobile Number</label>
                    <input 
                      type="tel" 
                      name="mobile" 
                      className="form-control" 
                      required 
                      value={authForm.mobile} 
                      onChange={handleAuthChange} 
                      placeholder="e.g. +91 9876543210"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                name="email" 
                className="form-control" 
                required 
                value={authForm.email} 
                onChange={handleAuthChange} 
                placeholder="name@domain.com"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                name="password" 
                className="form-control" 
                required 
                value={authForm.password} 
                onChange={handleAuthChange} 
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem', marginTop: '0.5rem' }} disabled={authLoading}>
              {authLoading ? 'Verifying...' : authTab === 'login' ? 'Access Storefront' : 'Register & Enter'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header / Navbar */}
      <header className="navbar">
        <div className="nav-brand" onClick={() => { setActiveTab('shop'); setSelectedGender('All'); setSelectedCategory('All'); setSelectedSizes([]); setSelectedPriceBrackets([]); setSearchQuery(''); }}>
          <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>✦</span>
          AURA FASHION
        </div>

        {/* Amazon/Flipkart-style Centered Search Bar */}
        <div className="nav-search-container">
          <input 
            type="text" 
            className="nav-search-input" 
            placeholder="Search clothing, brands, categories..." 
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              if (activeTab !== 'shop' && activeTab !== 'checkout' && activeTab !== 'assistance') {
                setActiveTab('shop');
              }
            }}
          />
          <button className="nav-search-btn" title="Search">🔍</button>
        </div>
        
        <div className="nav-actions-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <nav>
            <ul className="nav-links">
              <li className={`nav-link ${activeTab === 'shop' && selectedGender === 'All' ? 'active' : ''}`} onClick={() => { setActiveTab('shop'); setSelectedGender('All'); }}>All Shop</li>
              <li className={`nav-link ${activeTab === 'shop' && selectedGender === 'Male' ? 'active' : ''}`} onClick={() => { setActiveTab('shop'); setSelectedGender('Male'); }}>Men</li>
              <li className={`nav-link ${activeTab === 'shop' && selectedGender === 'Female' ? 'active' : ''}`} onClick={() => { setActiveTab('shop'); setSelectedGender('Female'); }}>Women</li>
              <li className={`nav-link ${activeTab === 'shop' && selectedGender === 'Unisex' ? 'active' : ''}`} onClick={() => { setActiveTab('shop'); setSelectedGender('Unisex'); }}>Unisex</li>
              <li className={`nav-link ${activeTab === 'assistance' ? 'active' : ''}`} onClick={() => { setActiveTab('assistance'); setAssistanceSuccess(false); }}>Assistance</li>
              <li className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Orders</li>
            </ul>
          </nav>

          <div className="nav-actions">
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginRight: '0.5rem' }}>
              Hi, <strong>{currentUser.name.split(' ')[0]}</strong>
            </span>
            {activeTab === 'shop' && (
              <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', borderRadius: '10px' }} onClick={handleOpenAddProduct}>
                + Add Clothing
              </button>
            )}
            <button className="cart-icon-btn" onClick={() => setIsCartOpen(true)} title="View Cart">
              🛒
              {totalCartQty > 0 && <span className="cart-badge">{totalCartQty}</span>}
            </button>
            <button className="btn btn-secondary" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.55rem 1rem', borderRadius: '10px' }} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Hero Showcase (Only on Shop Tab) */}
      {activeTab === 'shop' && (
        <section className="hero fade-in">
          <h1 className="hero-title">Elevate Your Daily <span className="text-gradient">Style & Wardrobe</span></h1>
          <p className="hero-subtitle">Welcome, {currentUser.name}! Discover premium clothing. Explore handpicked shirts, dresses, denim, and jackets.</p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={() => { setSelectedGender('Male'); fetchProducts(); }}>Shop Male</button>
            <button className="btn btn-secondary" onClick={() => { setSelectedGender('Female'); fetchProducts(); }}>Shop Women</button>
            <button className="btn btn-secondary" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)' }} onClick={() => { setSelectedGender('Unisex'); fetchProducts(); }}>Shop Unisex</button>
          </div>
        </section>
      )}

      {/* Main Content Areas */}
      {activeTab === 'shop' && (
        <main className="shop-layout fade-in">
          {/* Sidebar Filters */}
          <aside className="filters-sidebar">
            <div className="filter-section">
              <h3 className="filter-title">Gender</h3>
              <div className="filter-group">
                {['All', 'Male', 'Female', 'Unisex'].map(g => (
                  <label key={g} className="filter-option">
                    <input 
                      type="radio" 
                      name="gender" 
                      checked={selectedGender === g}
                      onChange={() => { setSelectedGender(g); fetchProducts(); }}
                    />
                    {g === 'All' ? 'All Clothing' : g} ({getGenderCount(g)})
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h3 className="filter-title">Categories</h3>
              <div className="filter-group">
                <label className="filter-option">
                  <input 
                    type="radio" 
                    name="category" 
                    checked={selectedCategory === 'All'}
                    onChange={() => setSelectedCategory('All')}
                  />
                  All Categories ({products.length})
                </label>
                {categories.map(cat => (
                  <label key={cat.id} className="filter-option">
                    <input 
                      type="radio" 
                      name="category" 
                      checked={selectedCategory === cat.id.toString()}
                      onChange={() => setSelectedCategory(cat.id.toString())}
                    />
                    {cat.name} ({getCategoryCount(cat.id)})
                  </label>
                ))}
              </div>
            </div>

            {/* Advanced Filters: Multi-select Size options */}
            <div className="filter-section">
              <h3 className="filter-title">Select Sizes</h3>
              <div className="size-checkbox-grid">
                {['S', 'M', 'L', 'XL'].map(sz => {
                  const isActive = selectedSizes.includes(sz);
                  return (
                    <button 
                      key={sz} 
                      type="button"
                      className={`size-checkbox-btn ${isActive ? 'active' : ''}`}
                      onClick={() => handleToggleSize(sz)}
                    >
                      {sz} ({getSizeCount(sz)})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Advanced Filters: Multi-select Price brackets */}
            <div className="filter-section">
              <h3 className="filter-title">Price Range</h3>
              <div className="price-checkbox-group">
                <label className="price-checkbox-option">
                  <input 
                    type="checkbox"
                    checked={selectedPriceBrackets.includes('under-50')}
                    onChange={() => handleTogglePriceBracket('under-50')}
                  />
                  Under $50 ({getPriceBracketCount('under-50')})
                </label>
                <label className="price-checkbox-option">
                  <input 
                    type="checkbox"
                    checked={selectedPriceBrackets.includes('50-100')}
                    onChange={() => handleTogglePriceBracket('50-100')}
                  />
                  $50 - $100 ({getPriceBracketCount('50-100')})
                </label>
                <label className="price-checkbox-option">
                  <input 
                    type="checkbox"
                    checked={selectedPriceBrackets.includes('above-100')}
                    onChange={() => handleTogglePriceBracket('above-100')}
                  />
                  Above $100 ({getPriceBracketCount('above-100')})
                </label>
              </div>
            </div>

            <div className="filter-section">
              <h3 className="filter-title">Sort By Price</h3>
              <div className="filter-group">
                {[['none', 'Default'], ['low-high', 'Low to High'], ['high-low', 'High to Low']].map(([val, label]) => (
                  <label key={val} className="filter-option">
                    <input 
                      type="radio" 
                      name="sort" 
                      checked={sortBy === val}
                      onChange={() => setSortBy(val)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {(selectedSizes.length > 0 || selectedPriceBrackets.length > 0 || searchQuery !== '') && (
              <button 
                className="btn btn-secondary" 
                style={{ width: '100%', justifyContent: 'center', padding: '0.6rem' }} 
                onClick={() => { setSelectedSizes([]); setSelectedPriceBrackets([]); setSearchQuery(''); }}
              >
                Clear Filters
              </button>
            )}
          </aside>

          {/* Products Grid & Display */}
          <section className="products-container">
            <div className="products-header">
              <div className="products-count">
                Showing <strong>{filteredProducts.length}</strong> items matching filters
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading fresh fits...</div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#ef4444' }}>Error: {error}. Is the Spring Boot backend running?</div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', color: 'var(--text-secondary)' }}>
                No clothing items found matching your selection. Try adjusting filters or search.
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map(p => (
                  <article className="product-card fade-in" key={p.id}>
                    <div className="product-card-img-wrapper">
                      <img src={p.imageUrl || 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=400'} alt={p.name} className="product-card-img" />
                      <span className="gender-tag">{p.gender}</span>
                    </div>
                    <div className="product-info">
                      <div className="product-category">{p.category.name}</div>
                      <h3 className="product-name">{p.name}</h3>
                      <p className="product-desc">{p.description}</p>
                      
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        Size: <strong>{p.size}</strong> | Stock: <strong>{p.stock}</strong>
                      </div>

                      <div className="product-meta">
                        <span className="product-price">${p.price.toFixed(2)}</span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '0.5rem', borderRadius: '8px' }} 
                            onClick={() => handleOpenEditProduct(p)}
                            title="Edit Item"
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn btn-danger" 
                            style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444' }} 
                            onClick={() => handleDeleteProduct(p.id)}
                            title="Delete Item"
                          >
                            🗑️
                          </button>
                          <button 
                            className="btn btn-primary btn-add-to-cart" 
                            onClick={() => handleAddToCart(p)}
                            disabled={p.stock <= 0}
                          >
                            {p.stock > 0 ? '+ Add to Cart' : 'Out of Stock'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {/* Orders History Panel */}
      {activeTab === 'orders' && (
        <main style={{ maxWidth: '1000px', width: '100%', margin: '0 auto', padding: '3rem 2rem' }} className="fade-in">
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>Order Placements History</h2>
          {ordersHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', color: 'var(--text-secondary)' }}>
              No orders have been submitted yet. Go add some outfits to your cart and checkout!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {ordersHistory.map(order => (
                <div key={order.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>ORDER ID</div>
                      <div style={{ fontWeight: 700 }}>#000{order.id}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>DATE PLACED</div>
                      <div style={{ fontWeight: 700 }}>{new Date(order.orderDate).toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>PAYMENT METHOD</div>
                      <div style={{ fontWeight: 700 }}>
                        {order.paymentMethod === 'Card' ? `💳 Card (${order.creditCardType})` : order.paymentMethod === 'UPI' ? '📱 UPI / QR Scan' : order.paymentMethod === 'Net Banking' ? '🏦 Net Banking' : '💵 Cash on Delivery'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>FINAL PAID</div>
                      <div style={{ fontWeight: 800, color: 'var(--accent-primary)', fontSize: '1.1rem' }}>${order.totalPrice.toFixed(2)}</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                    <div>
                      <h4 style={{ marginBottom: '0.45rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>SHIPPED TO</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        <strong>{order.customerName}</strong><br />
                        {order.address}, {order.city}, {order.zipCode}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <h4 style={{ marginBottom: '0.45rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>PAYMENT SUMMARY</h4>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                        Subtotal: ${order.originalPrice?.toFixed(2) || '0.00'}<br />
                        Discount: -${order.discountAmount?.toFixed(2) || '0.00'}<br />
                        <strong>Final Total: ${order.totalPrice.toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>

                  <h4 style={{ marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>ITEMS SUMMARY</h4>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {order.orderItems.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg-tertiary)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.95rem' }}>
                        <div>
                          <strong>{item.product?.name || 'Deleted Product'}</strong> 
                          <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>({item.product?.gender || 'Unisex'}, Size {item.product?.size || 'N/A'})</span>
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>
                          {item.quantity} x ${item.price.toFixed(2)} = <strong>${(item.quantity * item.price).toFixed(2)}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* Customer Assistance Help Page */}
      {activeTab === 'assistance' && (
        <main className="assistance-grid fade-in">
          {/* Left Column: FAQ list */}
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem' }}>Customer Assistance FAQs</h2>
            <div className="faq-accordion">
              {faqs.map((faq, idx) => {
                const isActive = activeFaq === idx;
                return (
                  <div key={idx} className={`faq-item ${isActive ? 'active' : ''}`}>
                    <div className="faq-question" onClick={() => setActiveFaq(isActive ? null : idx)}>
                      <span>{faq.q}</span>
                      <span className="faq-toggle">▼</span>
                    </div>
                    <div className="faq-answer">
                      {faq.a}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div style={{ marginTop: '2.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>Need Direct Assistance?</h3>
              <div className="assistance-contact-cards">
                <div className="contact-card">
                  <div className="contact-card-icon">📞</div>
                  <div className="contact-card-title">Toll-Free Helpline</div>
                  <div className="contact-card-detail">+1 (800) 123-4567</div>
                  <div className="contact-card-detail" style={{ fontSize: '0.75rem', opacity: 0.6 }}>Mon-Fri, 9am - 6pm EST</div>
                </div>
                <div className="contact-card">
                  <div className="contact-card-icon">✉️</div>
                  <div className="contact-card-title">Email Support</div>
                  <div className="contact-card-detail">support@aurafashion.com</div>
                  <div className="contact-card-detail" style={{ fontSize: '0.75rem', opacity: 0.6 }}>24/7 Response within 24h</div>
                </div>
              </div>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => alert("Connecting to a live customer assistance agent... (Simulated Chatroom)")}
              >
                💬 Launch Live Support Chat
              </button>
            </div>
          </div>

          {/* Right Column: Submit Support Inquiry Form */}
          <div>
            <div className="checkout-section" style={{ position: 'sticky', top: '100px' }}>
              <h3 className="checkout-section-title">
                <span>✉️</span> Submit Help Ticket
              </h3>
              {assistanceSuccess ? (
                <div className="success-state fade-in" style={{ padding: '1rem 0' }}>
                  <div className="success-icon" style={{ fontSize: '3rem', padding: '1rem' }}>✓</div>
                  <h4 className="success-title" style={{ fontSize: '1.25rem' }}>Ticket Created Successfully</h4>
                  <p className="success-msg" style={{ fontSize: '0.88rem' }}>
                    Thank you! Your support ticket **#AURA-{(Math.floor(Math.random() * 90000) + 10000)}** has been opened.<br />
                    Our customer assistance desk will get back to you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleAssistanceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      required 
                      value={assistanceForm.name}
                      onChange={e => setAssistanceForm({...assistanceForm, name: e.target.value})}
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      required 
                      value={assistanceForm.email}
                      onChange={e => setAssistanceForm({...assistanceForm, email: e.target.value})}
                      placeholder="e.g. john@domain.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Subject</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      required 
                      value={assistanceForm.subject}
                      onChange={e => setAssistanceForm({...assistanceForm, subject: e.target.value})}
                      placeholder="e.g. Order Tracking Issue, Refund Status"
                    />
                  </div>
                  <div className="form-group">
                    <label>Description of Issue</label>
                    <textarea 
                      className="form-control" 
                      required 
                      rows="4"
                      value={assistanceForm.message}
                      onChange={e => setAssistanceForm({...assistanceForm, message: e.target.value})}
                      placeholder="Describe your issue or question in detail here..."
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }}>
                    Send Inquiry Ticket
                  </button>
                </form>
              )}
            </div>
          </div>
        </main>
      )}

      {/* Dedicated Separate Checkout Page */}
      {activeTab === 'checkout' && (
        <main className="checkout-layout fade-in">
          {/* Left Column: Checkout details or Success summary */}
          <div>
            {orderSuccess ? (
              <div className="checkout-section">
                <div className="success-state fade-in">
                  <div className="success-icon">✓</div>
                  <h3 className="success-title">Order Placed Successfully!</h3>
                  <p className="success-msg" style={{ padding: '0.5rem 1rem' }}>
                    Thank you, <strong>{orderSuccess.customerName}</strong>! Your order <strong>#000{orderSuccess.id}</strong> has been received.<br />
                    Payment Method: <strong>{orderSuccess.paymentMethod === 'Card' ? `Credit Card (${orderSuccess.creditCardType})` : orderSuccess.paymentMethod === 'UPI' ? 'UPI QR Code Scan' : orderSuccess.paymentMethod === 'Net Banking' ? 'Net Banking' : 'Cash on Delivery (COD)'}</strong>.<br />
                    Original Amount: <s>${orderSuccess.originalPrice?.toFixed(2)}</s> | Saved: <strong>${orderSuccess.discountAmount?.toFixed(2)}</strong>.<br />
                    Final payment charged: <strong>${orderSuccess.totalPrice.toFixed(2)}</strong>.<br />
                    Items will be shipped to: <strong>{orderSuccess.address}, {orderSuccess.city}, {orderSuccess.zipCode}</strong>.
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => { 
                        setOrderSuccess(null); 
                        setActiveTab('shop'); 
                      }}
                    >
                      Continue Shopping
                    </button>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => { 
                        setOrderSuccess(null); 
                        setActiveTab('orders'); 
                      }}
                    >
                      View Order in History
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit}>
                {/* Shipping Form Section */}
                <div className="checkout-section">
                  <h3 className="checkout-section-title">
                    <span>📦</span> Shipping Information
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label>Recipient Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        required
                        value={checkoutForm.customerName}
                        onChange={e => setCheckoutForm({...checkoutForm, customerName: e.target.value})}
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        required
                        value={checkoutForm.customerEmail}
                        onChange={e => setCheckoutForm({...checkoutForm, customerEmail: e.target.value})}
                        placeholder="e.g. john@example.com"
                      />
                    </div>
                    <div className="form-group">
                      <label>Shipping Address</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        required
                        value={checkoutForm.address}
                        onChange={e => setCheckoutForm({...checkoutForm, address: e.target.value})}
                        placeholder="e.g. 123 Fashion Ave"
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>City</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          required
                          value={checkoutForm.city}
                          onChange={e => setCheckoutForm({...checkoutForm, city: e.target.value})}
                          placeholder="e.g. New York"
                        />
                      </div>
                      <div className="form-group">
                        <label>Zip Code</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          required
                          value={checkoutForm.zipCode}
                          onChange={e => setCheckoutForm({...checkoutForm, zipCode: e.target.value})}
                          placeholder="e.g. 10001"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Option Selector Section */}
                <div className="checkout-section">
                  <h3 className="checkout-section-title">
                    <span>💳</span> Choose Payment Option
                  </h3>
                  
                  <div className="payment-methods-grid">
                    <div 
                      className={`payment-method-card ${checkoutForm.paymentMethod === 'Card' ? 'active' : ''}`}
                      onClick={() => setCheckoutForm({...checkoutForm, paymentMethod: 'Card'})}
                    >
                      <div className="payment-method-header">
                        <span>Credit/Debit Card</span>
                        <span className="payment-method-icon">💳</span>
                      </div>
                      <div className="payment-method-desc">
                        Visa (10% Off), Mastercard (15% Off), Amex (20% Off) automatic promotions.
                      </div>
                    </div>

                    <div 
                      className={`payment-method-card ${checkoutForm.paymentMethod === 'UPI' ? 'active' : ''}`}
                      onClick={() => setCheckoutForm({...checkoutForm, paymentMethod: 'UPI'})}
                    >
                      <div className="payment-method-header">
                        <span>UPI / Scan QR</span>
                        <span className="payment-method-icon">📱</span>
                      </div>
                      <div className="payment-method-desc">
                        Scan our official merchant QR code using GPay, PhonePe, or Paytm.
                      </div>
                    </div>

                    <div 
                      className={`payment-method-card ${checkoutForm.paymentMethod === 'Net Banking' ? 'active' : ''}`}
                      onClick={() => setCheckoutForm({...checkoutForm, paymentMethod: 'Net Banking'})}
                    >
                      <div className="payment-method-header">
                        <span>Net Banking</span>
                        <span className="payment-method-icon">🏦</span>
                      </div>
                      <div className="payment-method-desc">
                        Direct bank account transfer. All major banks supported.
                      </div>
                    </div>

                    <div 
                      className={`payment-method-card ${checkoutForm.paymentMethod === 'COD' ? 'active' : ''}`}
                      onClick={() => setCheckoutForm({...checkoutForm, paymentMethod: 'COD'})}
                    >
                      <div className="payment-method-header">
                        <span>Cash on Delivery</span>
                        <span className="payment-method-icon">💵</span>
                      </div>
                      <div className="payment-method-desc">
                        Pay with cash when the package is delivered to your doorstep.
                      </div>
                    </div>
                  </div>

                  {/* Payment Details Custom Forms */}
                  {checkoutForm.paymentMethod === 'Card' && (
                    <div className="payment-details-form">
                      <div className="credit-card-offers">
                        <div className="offer-tag" style={{ borderLeftColor: '#f59e0b', background: 'rgba(245, 158, 11, 0.02)' }}>
                          🎁 <strong>Visa Promo</strong>: Save 10% Off automatically!
                        </div>
                        <div className="offer-tag" style={{ borderLeftColor: '#ec4899', background: 'rgba(236, 72, 153, 0.02)' }}>
                          🎁 <strong>Mastercard Promo</strong>: Save 15% Off automatically!
                        </div>
                        <div className="offer-tag" style={{ borderLeftColor: '#6366f1', background: 'rgba(99, 102, 241, 0.02)' }}>
                          🎁 <strong>Amex Promo</strong>: Save 20% Off automatically!
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
                        <div className="form-group">
                          <label>Select Card Network</label>
                          <select 
                            className="form-control"
                            value={checkoutForm.creditCardType}
                            onChange={e => setCheckoutForm({...checkoutForm, creditCardType: e.target.value})}
                          >
                            <option value="Visa">Visa (Save 10%)</option>
                            <option value="Mastercard">Mastercard (Save 15%)</option>
                            <option value="Amex">American Express (Save 20%)</option>
                            <option value="Other">Other Card Network (No Discount)</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Card Number</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            required
                            maxLength="19"
                            placeholder="4111 2222 3333 4444"
                            value={checkoutForm.cardNumber}
                            onChange={e => setCheckoutForm({...checkoutForm, cardNumber: e.target.value})}
                          />
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Expiry Date</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              required
                              maxLength="5"
                              placeholder="MM/YY"
                              value={checkoutForm.cardExpiry}
                              onChange={e => setCheckoutForm({...checkoutForm, cardExpiry: e.target.value})}
                            />
                          </div>
                          <div className="form-group">
                            <label>CVV</label>
                            <input 
                              type="password" 
                              className="form-control" 
                              required
                              maxLength="4"
                              placeholder="•••"
                              value={checkoutForm.cardCvv}
                              onChange={e => setCheckoutForm({...checkoutForm, cardCvv: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {checkoutForm.paymentMethod === 'UPI' && (
                    <div className="payment-details-form upi-qr-container">
                      <img src="/payment.jpeg" alt="Payment QR Code" className="upi-qr-image" />
                      <div className="upi-instructions">
                        <strong>Official Merchant QR Code</strong><br />
                        Scan the QR code above using your GPay, PhonePe, Paytm, or BHIM app. 
                        Please make payment of <strong>${checkoutFinalPrice.toFixed(2)}</strong>.
                      </div>
                      <div className="form-group" style={{ width: '100%', maxWidth: '300px', textAlign: 'left' }}>
                        <label>UPI Transaction ID (optional)</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="e.g. 12-digit ref number"
                          value={checkoutForm.upiTxnId}
                          onChange={e => setCheckoutForm({...checkoutForm, upiTxnId: e.target.value})}
                        />
                      </div>
                    </div>
                  )}

                  {checkoutForm.paymentMethod === 'Net Banking' && (
                    <div className="payment-details-form banking-container">
                      <div className="form-group">
                        <label>Select Your Bank</label>
                        <select 
                          className="form-control"
                          value={checkoutForm.bankName}
                          onChange={e => setCheckoutForm({...checkoutForm, bankName: e.target.value})}
                        >
                          <option value="SBI">State Bank of India (SBI)</option>
                          <option value="HDFC">HDFC Bank</option>
                          <option value="ICICI">ICICI Bank</option>
                          <option value="Axis">Axis Bank</option>
                          <option value="PNB">Punjab National Bank (PNB)</option>
                        </select>
                      </div>
                      <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        🔒 **Redirect Prompt**: You will be redirected to the secure portal of **{checkoutForm.bankName} Bank** to complete this payment once you proceed. (Simulated)
                      </div>
                    </div>
                  )}

                  {checkoutForm.paymentMethod === 'COD' && (
                    <div className="payment-details-form cod-confirmation">
                      <div className="cod-icon">🚚</div>
                      <div style={{ fontSize: '0.9rem', lineHeight: 1.45 }}>
                        <strong>Cash on Delivery (COD) Verified</strong><br />
                        Please keep the exact cash amount of <strong>${checkoutFinalPrice.toFixed(2)}</strong> ready at the time of delivery. A standard verification call will be placed prior to dispatch.
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ flex: 1, justifyContent: 'center' }} 
                    onClick={() => {
                      setActiveTab('shop');
                      setIsCartOpen(true);
                    }}
                  >
                    Cancel & Return to Cart
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                    Confirm & Place Order (${checkoutFinalPrice.toFixed(2)})
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Checkout cart summary */}
          <div>
            <div className="order-summary-card">
              <h3 className="checkout-section-title" style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>
                🛍️ Order Summary
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', maxHeight: '35vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {cartItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                    <img 
                      src={item.product.imageUrl} 
                      alt={item.product.name} 
                      style={{ width: '45px', height: '55px', objectFit: 'cover', borderRadius: '4px', background: '#151825' }} 
                    />
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{item.product.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.product.gender} | Size {item.product.size}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Qty: {item.quantity} x ${item.product.price.toFixed(2)}</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', alignSelf: 'center' }}>
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculations */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <span>Cart Subtotal ({totalCartQty} items):</span>
                  <span>${totalCartPrice.toFixed(2)}</span>
                </div>
                {checkoutForm.paymentMethod === 'Card' && checkoutDiscountAmt > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#10b981' }}>
                    <span>Card Offer Discount ({currentDiscountRate * 100}%):</span>
                    <span>-${checkoutDiscountAmt.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <span>Shipping & Handling:</span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>FREE</span>
                </div>
                <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '0.5rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800 }}>
                  <span>Final Price:</span>
                  <span className="text-gradient">${checkoutFinalPrice.toFixed(2)}</span>
                </div>
              </div>
              
              <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span>🛡️</span> 256-Bit SSL Encrypted Secure Connection
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Cart Slide-out Drawer */}
      {isCartOpen && (
        <>
          <div className="cart-overlay" onClick={() => setIsCartOpen(false)}></div>
          <div className="cart-drawer">
            <div className="cart-header">
              <div className="cart-title">
                🛍️ Your Shopping Cart
              </div>
              <button className="close-btn" onClick={() => setIsCartOpen(false)}>×</button>
            </div>

            <div className="cart-items-list">
              {cartItems.length === 0 ? (
                <div className="cart-empty">
                  <div className="cart-empty-icon">🛒</div>
                  <p>Your bag is currently empty.</p>
                  <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setIsCartOpen(false)}>Continue Browsing</button>
                </div>
              ) : (
                cartItems.map(item => (
                  <div className="cart-item" key={item.id}>
                    <img src={item.product.imageUrl} alt={item.product.name} className="cart-item-img" />
                    <div className="cart-item-info">
                      <div>
                        <h4 className="cart-item-name">{item.product.name}</h4>
                        <div className="cart-item-size-gender">{item.product.gender} | Size {item.product.size}</div>
                      </div>
                      <div className="cart-item-controls">
                        <div className="quantity-control">
                          <button className="qty-btn" onClick={() => handleUpdateQty(item.id, item.quantity - 1)}>-</button>
                          <span className="qty-val">{item.quantity}</span>
                          <button className="qty-btn" onClick={() => handleUpdateQty(item.id, item.quantity + 1)}>+</button>
                        </div>
                        <button className="remove-item-btn" onClick={() => handleRemoveFromCart(item.id)}>Remove</button>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="cart-item-price">${(item.product.price * item.quantity).toFixed(2)}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>${item.product.price} each</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="cart-footer">
                <div className="cart-summary-row">
                  <span>Subtotal Price</span>
                  <span className="cart-total-price">${totalCartPrice.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleClearCart}>Empty Cart</button>
                  <button 
                    className="btn btn-primary" 
                    style={{ flex: 2 }} 
                    onClick={() => { 
                      setIsCartOpen(false); 
                      setOrderSuccess(null);
                      setActiveTab('checkout'); 
                    }}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Admin Add/Edit Product Modal (CRUD) */}
      {isAdminOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{isEditMode ? '✏️ Edit Clothing Item' : '✨ Add New Clothing Item'}</h3>
              <button className="close-btn" onClick={() => setIsAdminOpen(false)}>×</button>
            </div>
            <form onSubmit={handleAdminSubmit}>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="form-group">
                  <label>Clothing Name</label>
                  <input 
                    type="text" 
                    name="name"
                    className="form-control" 
                    required
                    value={adminProductForm.name}
                    onChange={handleAdminFormChange}
                    placeholder="e.g. Vintage Leather Jacket"
                  />
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    name="description"
                    className="form-control" 
                    required
                    rows="3"
                    value={adminProductForm.description}
                    onChange={handleAdminFormChange}
                    placeholder="Describe the fabric, cut, and styles..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Price ($ USD)</label>
                    <input 
                      type="number" 
                      name="price"
                      step="0.01"
                      min="0"
                      className="form-control" 
                      required
                      value={adminProductForm.price}
                      onChange={handleAdminFormChange}
                      placeholder="e.g. 89.99"
                    />
                  </div>
                  <div className="form-group">
                    <label>Stock Quantity</label>
                    <input 
                      type="number" 
                      name="stock"
                      min="0"
                      className="form-control" 
                      required
                      value={adminProductForm.stock}
                      onChange={handleAdminFormChange}
                      placeholder="e.g. 50"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Gender Category</label>
                    <select 
                      name="gender"
                      className="form-control"
                      value={adminProductForm.gender}
                      onChange={handleAdminFormChange}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Unisex">Unisex</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Default Size</label>
                    <select 
                      name="size"
                      className="form-control"
                      value={adminProductForm.size}
                      onChange={handleAdminFormChange}
                    >
                      <option value="S">Small (S)</option>
                      <option value="M">Medium (M)</option>
                      <option value="L">Large (L)</option>
                      <option value="XL">Extra Large (XL)</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category Type</label>
                    <select 
                      name="categoryId"
                      className="form-control"
                      required
                      value={adminProductForm.categoryId}
                      onChange={handleAdminFormChange}
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Image URL</label>
                    <input 
                      type="url" 
                      name="imageUrl"
                      className="form-control" 
                      required
                      value={adminProductForm.imageUrl}
                      onChange={handleAdminFormChange}
                      placeholder="Paste an Unsplash image URL..."
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAdminOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{isEditMode ? 'Update Details' : 'Create Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <p className="footer-text">© 2026 AURA FASHION Store. Designed with premium dark aesthetics. All rights reserved.</p>
        <p className="footer-text" style={{ fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.5 }}>Logged in as: {currentUser.email} | ID #{currentUser.id}</p>
      </footer>
    </div>
  );
}

export default App;
