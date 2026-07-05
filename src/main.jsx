import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  Check,
  Copy,
  Gift,
  Globe2,
  Heart,
  Link,
  LockKeyhole,
  MousePointer2,
  Plus,
  Share2,
  Sparkles,
} from "lucide-react";
import "./styles.css";

const starterProducts = [
  {
    id: 1,
    title: "Coral Cloud Runner",
    store: "Northline Studio",
    price: "$128",
    note: "Size 38, coral or ivory",
    imageIndex: 0,
    reserved: false,
    priority: "Top pick",
  },
  {
    id: 2,
    title: "Quiet Arc Headphones",
    store: "Sound & Co",
    price: "$219",
    note: "Matte black",
    imageIndex: 1,
    reserved: true,
    priority: "Reserved",
  },
  {
    id: 3,
    title: "Glow Serum Set",
    store: "Mira Beauty",
    price: "$64",
    note: "Sensitive skin formula",
    imageIndex: 2,
    reserved: false,
    priority: "Lovely",
  },
  {
    id: 4,
    title: "Arc Ceramic Lamp",
    store: "House Form",
    price: "$146",
    note: "Warm white shade",
    imageIndex: 3,
    reserved: false,
    priority: "Home",
  },
];

const importMethods = [
  {
    icon: Link,
    title: "Paste any URL",
    text: "Drop a product link from any shop and review the imported title, image, price, and store.",
  },
  {
    icon: MousePointer2,
    title: "Browser extension",
    text: "Save while shopping with a one-click extension contract ready for the next milestone.",
  },
  {
    icon: Sparkles,
    title: "Manual fallback",
    text: "When a store blocks extraction, a clean manual form keeps the user moving.",
  },
];

function ProductImage({ index }) {
  return (
    <div className="product-image" aria-hidden="true">
      <img
        src="/assets/product-thumbnails.png"
        alt=""
        style={{ transform: `translateX(-${index * 20}%)` }}
      />
    </div>
  );
}

function PrimaryButton({ children, onClick, type = "button" }) {
  return (
    <button className="button primary-button" onClick={onClick} type={type}>
      {children}
      <ArrowRight size={17} strokeWidth={2.4} />
    </button>
  );
}

function SecondaryButton({ children, onClick }) {
  return (
    <button className="button secondary-button" onClick={onClick} type="button">
      {children}
    </button>
  );
}

function ProductCard({ product, onReserve, compact = false }) {
  return (
    <article className={`product-card ${compact ? "compact" : ""}`}>
      <ProductImage index={product.imageIndex} />
      <div className="product-card-body">
        <div>
          <div className="product-card-topline">
            <span>{product.store}</span>
            <strong>{product.price}</strong>
          </div>
          <h3>{product.title}</h3>
          <p>{product.note}</p>
        </div>
        <button
          className={product.reserved ? "reserve-button reserved" : "reserve-button"}
          disabled={product.reserved}
          onClick={() => onReserve(product.id)}
          type="button"
        >
          {product.reserved ? (
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
    </article>
  );
}

function BuilderPanel({ products, onAddProduct, url, setUrl, importStatus }) {
  const availableCount = products.filter((product) => !product.reserved).length;

  return (
    <section className="builder-panel" aria-label="Wishlist builder demo">
      <div className="panel-header">
        <div>
          <span className="panel-label">Builder</span>
          <h2>Birthday Wishlist</h2>
        </div>
        <span className="visibility">
          <LockKeyhole size={14} />
          Share link on
        </span>
      </div>

      <form className="import-form" onSubmit={onAddProduct}>
        <div className="input-shell">
          <Globe2 size={17} />
          <input
            aria-label="Product URL"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="Paste a product URL from any store"
          />
        </div>
        <button type="submit">
          <Plus size={17} />
          Add
        </button>
      </form>
      <p className="import-status">{importStatus}</p>

      <div className="wishlist-meta">
        <div>
          <strong>{products.length}</strong>
          <span>Saved gifts</span>
        </div>
        <div>
          <strong>{availableCount}</strong>
          <span>Still open</span>
        </div>
        <div>
          <strong>1 link</strong>
          <span>Ready to share</span>
        </div>
      </div>

      <div className="builder-list">
        {products.slice(0, 4).map((product) => (
          <div className="builder-row" key={product.id}>
            <ProductImage index={product.imageIndex} />
            <div>
              <strong>{product.title}</strong>
              <span>{product.store} - {product.price}</span>
            </div>
            <span className={product.reserved ? "status-dot reserved" : "status-dot"}>
              {product.reserved ? "Reserved" : product.priority}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function PublicPreview({ products, onReserve, shareCopied, onShare }) {
  return (
    <section className="public-preview" aria-label="Public wishlist preview">
      <div className="public-card-header">
        <div>
          <span className="panel-label">Public link</span>
          <h2>Anna's Gift List</h2>
          <p>Choose something she will actually love. Reserved gifts stay private.</p>
        </div>
        <button className="share-button" onClick={onShare} type="button">
          {shareCopied ? <Check size={16} /> : <Copy size={16} />}
          {shareCopied ? "Copied" : "Copy link"}
        </button>
      </div>
      <div className="public-products">
        {products.slice(0, 3).map((product) => (
          <ProductCard compact key={product.id} product={product} onReserve={onReserve} />
        ))}
      </div>
    </section>
  );
}

function Hero({ products, onReserve, onAddProduct, url, setUrl, importStatus, shareCopied, onShare }) {
  return (
    <section className="hero" id="product">
      <div className="hero-copy">
        <h1>One wishlist for every online store</h1>
        <p>
          Save products from any shop, share one beautiful link, and let friends
          reserve gifts without duplicate surprises.
        </p>
        <div className="hero-actions">
          <PrimaryButton onClick={() => document.getElementById("demo-flow")?.scrollIntoView({ behavior: "smooth" })}>
            Start your wishlist
          </PrimaryButton>
          <SecondaryButton onClick={() => document.getElementById("demo-flow")?.scrollIntoView({ behavior: "smooth" })}>
            View demo
          </SecondaryButton>
        </div>
        <div className="proof-row" aria-label="MVP validation metrics">
          <span><Heart size={15} /> Universal saving</span>
          <span><Share2 size={15} /> Share-ready</span>
          <span><Gift size={15} /> No duplicate gifts</span>
        </div>
      </div>

      <div className="hero-product">
        <BuilderPanel
          importStatus={importStatus}
          onAddProduct={onAddProduct}
          products={products}
          setUrl={setUrl}
          url={url}
        />
        <PublicPreview
          onReserve={onReserve}
          onShare={onShare}
          products={products}
          shareCopied={shareCopied}
        />
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="section how-section" id="how">
      <div className="section-heading">
        <h2>From product discovery to perfect gift in three moves</h2>
        <p>The MVP keeps the loop short enough to validate product-market fit fast.</p>
      </div>
      <div className="step-grid">
        {["Create a wishlist", "Add products", "Share and reserve"].map((title, index) => (
          <article className="step" key={title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{title}</h3>
            <p>
              {index === 0 &&
                "Name an occasion, choose visibility, and start with an empty list that feels ready to share."}
              {index === 1 &&
                "Paste URLs, save via extension later, or enter details manually when a store blocks import."}
              {index === 2 &&
                "Friends open the link, pick a gift, and reserve it without creating an account."}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ImportMethods() {
  return (
    <section className="section import-section" id="demo-flow">
      <div className="section-heading align-left">
        <h2>Universal capture is the product edge</h2>
        <p>
          The MVP supports the promise from day one: URL import first, extension
          contract next, manual fallback always.
        </p>
      </div>
      <div className="method-grid">
        {importMethods.map(({ icon: Icon, title, text }) => (
          <article className="method" key={title}>
            <Icon size={22} />
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ExampleWishlist({ products, onReserve }) {
  return (
    <section className="section example-section" id="examples">
      <div className="example-copy">
        <h2>A public wishlist that converts friends into buyers</h2>
        <p>
          Gift-givers see price, store, notes, and reservation state immediately.
          No account wall, no confusing registry flow.
        </p>
      </div>
      <div className="example-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onReserve={onReserve} />
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="final-cta">
      <div>
        <h2>Launch the first wishlist in minutes</h2>
        <p>
          Built for the MVP learning loop: signup, wishlist created, product
          added, share, reserve, return.
        </p>
      </div>
      <PrimaryButton onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        Start free
      </PrimaryButton>
    </section>
  );
}

function App() {
  const [products, setProducts] = useState(starterProducts);
  const [url, setUrl] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const [importStatus, setImportStatus] = useState("Try the demo: paste any product URL and press Add.");

  const reservedCount = useMemo(
    () => products.filter((product) => product.reserved).length,
    [products],
  );

  function handleReserve(productId) {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId ? { ...product, reserved: true, priority: "Reserved" } : product,
      ),
    );
  }

  function handleAddProduct(event) {
    event.preventDefault();
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setImportStatus("Add a URL first. Manual fallback stays available when import fails.");
      return;
    }

    const host = trimmedUrl
      .replace(/^https?:\/\//, "")
      .split("/")[0]
      .replace(/^www\./, "") || "Any Store";

    setProducts((current) => [
      {
        id: Date.now(),
        title: "Imported wishlist find",
        store: host,
        price: "$89",
        note: "Review title, image, price, and notes before saving",
        imageIndex: 4,
        reserved: false,
        priority: "New",
      },
      ...current,
    ]);
    setUrl("");
    setImportStatus(`Imported draft from ${host}. In production this becomes the review step.`);
  }

  function handleShare() {
    setShareCopied(true);
    window.navigator?.clipboard?.writeText?.("https://onlinewishlist.app/w/anna-birthday");
    window.setTimeout(() => setShareCopied(false), 1800);
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
          <a href="#how">How it works</a>
          <a href="#examples">Examples</a>
        </nav>
        <a className="header-cta" href="#demo-flow">Start free</a>
      </header>

      <Hero
        importStatus={importStatus}
        onAddProduct={handleAddProduct}
        onReserve={handleReserve}
        onShare={handleShare}
        products={products}
        setUrl={setUrl}
        shareCopied={shareCopied}
        url={url}
      />

      <div className="metric-strip" aria-label="Product validation metrics">
        <div><strong>{products.length}</strong><span>Demo products</span></div>
        <div><strong>{reservedCount}</strong><span>Reserved gifts</span></div>
        <div><strong>4</strong><span>Import paths planned</span></div>
        <div><strong>1,000</strong><span>MVP user target</span></div>
      </div>

      <HowItWorks />
      <ImportMethods />
      <ExampleWishlist products={products.slice(0, 5)} onReserve={handleReserve} />
      <FinalCta />
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
