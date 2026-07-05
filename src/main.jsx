import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Facebook,
  Gift,
  Globe2,
  Heart,
  Instagram,
  Link,
  LogOut,
  Mail,
  MessageCircle,
  Plus,
  Send,
  Share2,
  Sparkles,
  UserRound,
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "./supabaseClient";
import "./styles.css";

const LOCAL_PRODUCTS_KEY = "online-wishlist-products";
const LOCAL_PROFILE_KEY = "online-wishlist-profile";
const LOCAL_WISHLIST_KEY = "online-wishlist-meta";

const starterProducts = [
  {
    id: "starter-1",
    title: "Coral Cloud Runner",
    store_name: "Northline Studio",
    source_url: "https://shop.example.com/coral-runner",
    price: "$128",
    note: "Size 38, coral or ivory",
    image_url: "",
    image_index: 0,
    reserved: false,
    reserved_by: "",
  },
  {
    id: "starter-2",
    title: "Quiet Arc Headphones",
    store_name: "Sound & Co",
    source_url: "https://shop.example.com/quiet-arc",
    price: "$219",
    note: "Matte black",
    image_url: "",
    image_index: 1,
    reserved: true,
    reserved_by: "Jessica",
  },
  {
    id: "starter-3",
    title: "Glow Serum Set",
    store_name: "Mira Beauty",
    source_url: "https://shop.example.com/glow-serum",
    price: "$64",
    note: "Sensitive skin formula",
    image_url: "",
    image_index: 2,
    reserved: false,
    reserved_by: "",
  },
];

const fallbackWishlist = {
  id: "local-wishlist",
  title: "My Universal Wishlist",
  description: "Things I would love to receive.",
  share_token: "demo-wishlist",
  is_public: true,
};

function readStoredJson(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeStoredJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function getStoreName(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Manual item";
  }
}

function getShareUrl(wishlist) {
  const base = window.location.origin;
  return `${base}/?wishlist=${wishlist.share_token}`;
}

function ProductImage({ index = 0, imageUrl = "" }) {
  return (
    <div className="product-image" aria-hidden="true">
      {imageUrl ? (
        <img className="single-product-image" src={imageUrl} alt="" />
      ) : (
        <img
          src="/assets/product-thumbnails.png"
          alt=""
          style={{ transform: `translateX(-${Math.min(index, 4) * 20}%)` }}
        />
      )}
    </div>
  );
}

function AuthButton({ provider, icon, label, onClick }) {
  return (
    <button className={`auth-button ${provider}`} onClick={onClick} type="button">
      {icon}
      {label}
    </button>
  );
}

function ProductCard({ product, onReserve, compact = false }) {
  const reserved = product.reserved;

  return (
    <article className={`product-card ${compact ? "compact" : ""}`}>
      <ProductImage index={product.image_index} imageUrl={product.image_url} />
      <div className="product-card-body">
        <div>
          <div className="product-card-topline">
            <span>{product.store_name}</span>
            <strong>{product.price || "Price open"}</strong>
          </div>
          <h3>{product.title}</h3>
          <p>{product.note || "Saved from any online store"}</p>
        </div>
        <div className="product-actions">
          <a className="source-link" href={product.source_url} target="_blank" rel="noreferrer">
            <ExternalLink size={14} />
            Store
          </a>
          <button
            className={reserved ? "reserve-button reserved" : "reserve-button"}
            disabled={reserved}
            onClick={() => onReserve(product.id)}
            type="button"
          >
            {reserved ? (
              <>
                <Check size={15} /> Reserved
              </>
            ) : (
              <>
                <Gift size={15} /> Reserve
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

function SharePanel({ wishlist, onCopy, copied }) {
  const shareUrl = getShareUrl(wishlist);
  const text = encodeURIComponent(`My wishlist: ${wishlist.title}`);
  const url = encodeURIComponent(shareUrl);

  async function nativeShare() {
    if (navigator.share) {
      await navigator.share({
        title: wishlist.title,
        text: "Here is my Online WishList",
        url: shareUrl,
      });
      return;
    }
    onCopy();
  }

  return (
    <section className="share-panel" aria-label="Share wishlist">
      <div>
        <span className="panel-label">Public sharing</span>
        <h2>Share one link everywhere</h2>
        <p>{shareUrl}</p>
      </div>
      <div className="share-actions">
        <button onClick={nativeShare} type="button">
          <Share2 size={16} /> System share
        </button>
        <button onClick={onCopy} type="button">
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "Copied" : "Copy link"}
        </button>
        <a href={`https://wa.me/?text=${text}%20${url}`} target="_blank" rel="noreferrer">
          <MessageCircle size={16} /> WhatsApp
        </a>
        <a href={`https://t.me/share/url?url=${url}&text=${text}`} target="_blank" rel="noreferrer">
          <Send size={16} /> Telegram
        </a>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${url}`} target="_blank" rel="noreferrer">
          <Facebook size={16} /> Facebook
        </a>
      </div>
    </section>
  );
}

function AddProductForm({ onAddProduct, isSaving }) {
  const [form, setForm] = useState({
    url: "",
    title: "",
    price: "",
    note: "",
  });

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    onAddProduct(form);
    setForm({ url: "", title: "", price: "", note: "" });
  }

  return (
    <form className="add-product-form" onSubmit={submit}>
      <div className="form-row wide">
        <label htmlFor="product-url">Product URL</label>
        <div className="input-shell">
          <Globe2 size={17} />
          <input
            id="product-url"
            required
            value={form.url}
            onChange={(event) => updateField("url", event.target.value)}
            placeholder="https://store.com/product"
            type="url"
          />
        </div>
      </div>
      <div className="form-row">
        <label htmlFor="product-title">Title</label>
        <input
          id="product-title"
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
          placeholder="Product name"
        />
      </div>
      <div className="form-row">
        <label htmlFor="product-price">Price</label>
        <input
          id="product-price"
          value={form.price}
          onChange={(event) => updateField("price", event.target.value)}
          placeholder="$89"
        />
      </div>
      <div className="form-row wide">
        <label htmlFor="product-note">Notes for friends</label>
        <input
          id="product-note"
          value={form.note}
          onChange={(event) => updateField("note", event.target.value)}
          placeholder="Size, color, delivery preferences"
        />
      </div>
      <button className="button primary-button form-submit" disabled={isSaving} type="submit">
        <Plus size={17} />
        {isSaving ? "Saving..." : "Save product"}
      </button>
    </form>
  );
}

function Cabinet({
  profile,
  products,
  wishlist,
  status,
  onAddProduct,
  onReserve,
  onCopyShare,
  copied,
  onLogout,
  isSaving,
}) {
  const openProducts = products.filter((product) => !product.reserved).length;

  return (
    <section className="cabinet" id="cabinet">
      <div className="cabinet-header">
        <div>
          <span className="panel-label">Your cabinet</span>
          <h2>{wishlist.title}</h2>
          <p>{wishlist.description}</p>
        </div>
        <div className="profile-card">
          <div className="avatar">
            {profile.avatar_url ? <img src={profile.avatar_url} alt="" /> : <UserRound size={24} />}
          </div>
          <div>
            <strong>{profile.name}</strong>
            <span>{profile.email}</span>
          </div>
          <button onClick={onLogout} type="button" aria-label="Sign out">
            <LogOut size={17} />
          </button>
        </div>
      </div>

      <div className="cabinet-grid">
        <article>
          <strong>{products.length}</strong>
          <span>Saved products</span>
        </article>
        <article>
          <strong>{openProducts}</strong>
          <span>Available gifts</span>
        </article>
        <article>
          <strong>{products.length - openProducts}</strong>
          <span>Reserved gifts</span>
        </article>
      </div>

      <AddProductForm onAddProduct={onAddProduct} isSaving={isSaving} />
      <p className="import-status">{status}</p>
      <SharePanel wishlist={wishlist} onCopy={onCopyShare} copied={copied} />

      <div className="cabinet-products">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onReserve={onReserve} />
        ))}
      </div>
    </section>
  );
}

function Hero({ profile, onAuth, onStart }) {
  return (
    <section className="hero" id="product">
      <div className="hero-copy">
        <h1>One wishlist for every online store</h1>
        <p>
          Sign in, save products from any shop, share one beautiful link, and let
          friends reserve gifts without duplicate surprises.
        </p>
        <div className="hero-actions">
          {profile ? (
            <button className="button primary-button" onClick={onStart} type="button">
              Open cabinet <ArrowRight size={17} />
            </button>
          ) : (
            <>
              <AuthButton
                provider="google"
                icon={<Mail size={18} />}
                label="Continue with Google"
                onClick={() => onAuth("google")}
              />
              <AuthButton
                provider="facebook"
                icon={<Facebook size={18} />}
                label="Continue with Facebook"
                onClick={() => onAuth("facebook")}
              />
            </>
          )}
        </div>
        <div className="proof-row" aria-label="MVP features">
          <span><Heart size={15} /> Universal saving</span>
          <span><Share2 size={15} /> Social sharing</span>
          <span><Gift size={15} /> Gift reservation</span>
        </div>
      </div>

      <div className="hero-product">
        <section className="builder-panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">Live MVP</span>
              <h2>Save from any shop</h2>
            </div>
            <span className="visibility">
              <Sparkles size={14} />
              OAuth ready
            </span>
          </div>
          <div className="builder-list">
            {starterProducts.map((product) => (
              <div className="builder-row" key={product.id}>
                <ProductImage index={product.image_index} imageUrl={product.image_url} />
                <div>
                  <strong>{product.title}</strong>
                  <span>{product.store_name} - {product.price}</span>
                </div>
                <span className={product.reserved ? "status-dot reserved" : "status-dot"}>
                  {product.reserved ? "Reserved" : "Saved"}
                </span>
              </div>
            ))}
          </div>
        </section>
        <section className="public-preview">
          <div className="public-card-header">
            <div>
              <span className="panel-label">Shareable public list</span>
              <h2>Anna's Gift List</h2>
              <p>Friends open the link, buy from the store, and reserve gifts.</p>
            </div>
          </div>
          <div className="share-icons">
            <span><Instagram size={16} /> Stories</span>
            <span><MessageCircle size={16} /> WhatsApp</span>
            <span><Facebook size={16} /> Facebook</span>
          </div>
        </section>
      </div>
    </section>
  );
}

function App() {
  const [profile, setProfile] = useState(null);
  const [wishlist, setWishlist] = useState(fallbackWishlist);
  const [products, setProducts] = useState(starterProducts);
  const [status, setStatus] = useState("Ready. Add a product URL to save it to your wishlist.");
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const reservedCount = useMemo(
    () => products.filter((product) => product.reserved).length,
    [products],
  );

  useEffect(() => {
    const publicToken = new URLSearchParams(window.location.search).get("wishlist");

    if (!isSupabaseConfigured) {
      setProfile(readStoredJson(LOCAL_PROFILE_KEY, null));
      setWishlist(readStoredJson(LOCAL_WISHLIST_KEY, fallbackWishlist));
      setProducts(readStoredJson(LOCAL_PRODUCTS_KEY, starterProducts));
      return;
    }

    if (publicToken) {
      bootPublicWishlist(publicToken);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        bootSupabaseUser(data.session.user);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        bootSupabaseUser(session.user);
      } else {
        setProfile(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function bootPublicWishlist(shareToken) {
    const { data: publicWishlist, error: wishlistError } = await supabase
      .from("wishlists")
      .select("*")
      .eq("share_token", shareToken)
      .eq("is_public", true)
      .maybeSingle();

    if (wishlistError || !publicWishlist) {
      setStatus("This public wishlist link is unavailable or private.");
      return;
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("wishlist_id", publicWishlist.id)
      .order("created_at", { ascending: false });

    if (error) {
      setStatus(`Could not load public wishlist: ${error.message}`);
      return;
    }

    setWishlist(publicWishlist);
    setProducts(data || []);
    setStatus("Public wishlist loaded. Choose a gift and reserve it.");
  }

  async function bootSupabaseUser(user) {
    const nextProfile = {
      id: user.id,
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email,
      email: user.email,
      avatar_url: user.user_metadata?.avatar_url || "",
    };
    setProfile(nextProfile);

    const { data: existingWishlist, error: wishlistError } = await supabase
      .from("wishlists")
      .select("*")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (wishlistError) {
      setStatus(`Supabase wishlist error: ${wishlistError.message}`);
      return;
    }

    let activeWishlist = existingWishlist;
    if (!activeWishlist) {
      const { data, error } = await supabase
        .from("wishlists")
        .insert({
          user_id: user.id,
          title: `${nextProfile.name?.split(" ")?.[0] || "My"} Wishlist`,
          description: "Products I would love to receive.",
        })
        .select()
        .single();

      if (error) {
        setStatus(`Could not create wishlist: ${error.message}`);
        return;
      }
      activeWishlist = data;
    }

    setWishlist(activeWishlist);
    await loadSupabaseProducts(activeWishlist.id);
  }

  async function loadSupabaseProducts(wishlistId) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("wishlist_id", wishlistId)
      .order("created_at", { ascending: false });

    if (error) {
      setStatus(`Could not load products: ${error.message}`);
      return;
    }

    setProducts(data.length ? data : []);
    setStatus("Synced with Supabase. Products are stored in your account.");
  }

  async function handleAuth(provider) {
    if (!isSupabaseConfigured) {
      const demoProfile = {
        id: "demo-user",
        name: provider === "google" ? "Google Demo User" : "Facebook Demo User",
        email: `${provider}.demo@onlinewishlist.app`,
        avatar_url: "",
      };
      setProfile(demoProfile);
      writeStoredJson(LOCAL_PROFILE_KEY, demoProfile);
      writeStoredJson(LOCAL_WISHLIST_KEY, wishlist);
      writeStoredJson(LOCAL_PRODUCTS_KEY, products);
      setStatus("Demo mode: add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for real OAuth.");
      document.getElementById("cabinet")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });

    if (error) setStatus(`Auth error: ${error.message}`);
  }

  async function handleLogout() {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    window.localStorage.removeItem(LOCAL_PROFILE_KEY);
    setProfile(null);
    setStatus("Signed out.");
  }

  async function handleAddProduct(form) {
    setIsSaving(true);
    let importedProduct = null;

    try {
      const importResponse = await fetch("/api/import-product", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: form.url }),
      });
      const importData = await importResponse.json();

      if (importResponse.ok) {
        importedProduct = importData;
      } else {
        setStatus(importData.error);
      }
    } catch {
      setStatus("Importer unavailable locally. Saving with manual details.");
    }

    const storeName = importedProduct?.store_name || getStoreName(form.url);
    const nextProduct = {
      id: crypto.randomUUID(),
      title: form.title || importedProduct?.title || `Wishlist find from ${storeName}`,
      source_url: importedProduct?.source_url || form.url,
      store_name: storeName,
      price: form.price || importedProduct?.price || "",
      note: form.note || importedProduct?.note || "Saved from product URL",
      image_url: importedProduct?.image_url || "",
      image_index: products.length % 5,
      reserved: false,
      reserved_by: "",
    };

    if (isSupabaseConfigured && profile?.id) {
      const { data, error } = await supabase
        .from("products")
        .insert({
          ...nextProduct,
          wishlist_id: wishlist.id,
          user_id: profile.id,
        })
        .select()
        .single();

      setIsSaving(false);
      if (error) {
        setStatus(`Save failed: ${error.message}`);
        return;
      }
      setProducts((current) => [data, ...current]);
      setStatus(`Saved ${data.title} from ${storeName}.`);
      return;
    }

    const updatedProducts = [nextProduct, ...products];
    setProducts(updatedProducts);
    writeStoredJson(LOCAL_PRODUCTS_KEY, updatedProducts);
    setIsSaving(false);
    setStatus(`Saved locally: ${nextProduct.title}. Configure Supabase for cloud storage.`);
  }

  async function handleReserve(productId) {
    const product = products.find((item) => item.id === productId);
    if (!product || product.reserved) return;

    const reserver = window.prompt("Your name for reservation", "Friend");
    if (!reserver) return;

    if (isSupabaseConfigured && !String(productId).startsWith("starter")) {
      const { data, error } = await supabase.rpc("reserve_product", {
        p_product_id: productId,
        p_reserver_name: reserver,
      });

      if (error) {
        setStatus(`Reservation failed: ${error.message}`);
        return;
      }

      setProducts((current) => current.map((item) => (item.id === productId ? data : item)));
      setStatus(`${data.title} reserved by ${reserver}.`);
      return;
    }

    const updatedProducts = products.map((item) =>
      item.id === productId ? { ...item, reserved: true, reserved_by: reserver } : item,
    );
    setProducts(updatedProducts);
    writeStoredJson(LOCAL_PRODUCTS_KEY, updatedProducts);
    setStatus(`${product.title} reserved by ${reserver}.`);
  }

  function handleCopyShare() {
    navigator.clipboard?.writeText(getShareUrl(wishlist));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Online WishList home">
          <span><Heart size={23} strokeWidth={2.35} /></span>
          Online WishList
        </a>
        <nav aria-label="Primary navigation">
          <a href="#product">Product</a>
          <a href="#cabinet">Cabinet</a>
          <a href="#share">Share</a>
        </nav>
        {profile ? (
          <a className="header-cta" href="#cabinet">My cabinet</a>
        ) : (
          <button className="header-cta" onClick={() => handleAuth("google")} type="button">Sign in</button>
        )}
      </header>

      <Hero
        profile={profile}
        onAuth={handleAuth}
        onStart={() => document.getElementById("cabinet")?.scrollIntoView({ behavior: "smooth" })}
      />

      <div className="metric-strip" aria-label="Product validation metrics">
        <div><strong>{products.length}</strong><span>Saved products</span></div>
        <div><strong>{reservedCount}</strong><span>Reserved gifts</span></div>
        <div><strong>{isSupabaseConfigured ? "Cloud" : "Local"}</strong><span>Storage mode</span></div>
        <div><strong>Social</strong><span>Share ready</span></div>
      </div>

      {profile ? (
        <Cabinet
          copied={copied}
          isSaving={isSaving}
          onAddProduct={handleAddProduct}
          onCopyShare={handleCopyShare}
          onLogout={handleLogout}
          onReserve={handleReserve}
          products={products}
          profile={profile}
          status={status}
          wishlist={wishlist}
        />
      ) : (
        <section className="section auth-section" id="cabinet">
          <div className="section-heading">
            <h2>Sign in to open your cabinet</h2>
            <p>
              Google and Facebook OAuth are wired through Supabase. Without env
              vars, this MVP runs in local demo mode for product validation.
            </p>
          </div>
          <div className="auth-panel">
            <AuthButton
              provider="google"
              icon={<Mail size={18} />}
              label="Continue with Google"
              onClick={() => handleAuth("google")}
            />
            <AuthButton
              provider="facebook"
              icon={<Facebook size={18} />}
              label="Continue with Facebook"
              onClick={() => handleAuth("facebook")}
            />
          </div>
        </section>
      )}

      <section className="section example-section" id="share">
        <div className="example-copy">
          <h2>A public wishlist friends can actually use</h2>
          <p>
            Gift-givers open the share link, visit the original store, and
            reserve gifts so nobody buys duplicates.
          </p>
        </div>
        <div className="example-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onReserve={handleReserve} />
          ))}
        </div>
      </section>

      <section className="final-cta">
        <div>
          <h2>Ready for real users</h2>
          <p>
            Add Supabase env vars and provider credentials, run the SQL schema,
            and this MVP stores products in user accounts.
          </p>
        </div>
        <button className="button primary-button" onClick={handleCopyShare} type="button">
          Share wishlist <Share2 size={17} />
        </button>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
