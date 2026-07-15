import { startTransition, useEffect, useState, type FormEvent } from "react";

import Alert from "../../components/common/Alert";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import CategoryCard from "../../components/products/CategoryCard";
import ProductCard from "../../components/products/ProductCard";
import ProductFilters, {
  type ProductFiltersValue,
} from "../../components/products/ProductFilters";
import DashboardFooter from "../../components/layout/DashboardFooter";
import productService from "../../services/product.service";
import {
  ProductCategory,
  ProductCondition,
  type Product,
} from "../../types/product.types";
import { getApiErrorMessage } from "../../utils/apiError";

const PAGE_SIZE = 8;

const categoryCards = [
  { value: ProductCategory.BOOKS, title: "Books", icon: "📚" },
  { value: ProductCategory.ELECTRONICS, title: "Electronics", icon: "💻" },
  { value: ProductCategory.CLOTHING, title: "Clothing", icon: "🧥" },
  { value: ProductCategory.FURNITURE, title: "Furniture", icon: "🪑" },
  { value: ProductCategory.HANDMADE, title: "Handmade", icon: "🧶" },
] as const;

const initialFilters: ProductFiltersValue = {
  searchTerm: "",
  category: ProductCategory.ALL,
  condition: ProductCondition.ALL,
  priceRange: "ALL",
  location: "ALL",
  sortBy: "NEWEST",
};

function formatCategoryLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatConditionLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getPriceRangeMatch(price: number, range: string) {
  switch (range) {
    case "UNDER_5000":
      return price < 5000;
    case "5000_15000":
      return price >= 5000 && price <= 15000;
    case "15000_50000":
      return price > 15000 && price <= 50000;
    case "50000_PLUS":
      return price > 50000;
    default:
      return true;
  }
}

function getCategoryArt(category: string) {
  const palette: Record<string, { start: string; end: string; accent: string; glyph: string }> = {
    BOOKS: { start: "#eff6ff", end: "#dbeafe", accent: "#2563eb", glyph: "BOOKS" },
    ELECTRONICS: { start: "#ecfeff", end: "#cffafe", accent: "#0891b2", glyph: "TECH" },
    CLOTHING: { start: "#fdf2f8", end: "#fce7f3", accent: "#db2777", glyph: "STYLE" },
    FURNITURE: { start: "#fef3c7", end: "#fde68a", accent: "#b45309", glyph: "HOME" },
    HANDMADE: { start: "#ecfccb", end: "#d9f99d", accent: "#65a30d", glyph: "CRAFT" },
    OTHER: { start: "#f1f5f9", end: "#e2e8f0", accent: "#475569", glyph: "SAFE" },
  };

  const art = palette[category] ?? palette.OTHER;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${art.start}" />
          <stop offset="100%" stop-color="${art.end}" />
        </linearGradient>
      </defs>
      <rect width="640" height="420" rx="36" fill="url(#g)" />
      <circle cx="536" cy="86" r="70" fill="${art.accent}" fill-opacity="0.16" />
      <circle cx="122" cy="332" r="84" fill="${art.accent}" fill-opacity="0.12" />
      <rect x="72" y="94" width="224" height="172" rx="28" fill="#ffffff" fill-opacity="0.8" />
      <rect x="112" y="134" width="140" height="16" rx="8" fill="${art.accent}" fill-opacity="0.24" />
      <rect x="112" y="166" width="102" height="16" rx="8" fill="${art.accent}" fill-opacity="0.18" />
      <rect x="112" y="198" width="126" height="16" rx="8" fill="${art.accent}" fill-opacity="0.18" />
      <rect x="334" y="118" width="210" height="190" rx="34" fill="${art.accent}" fill-opacity="0.9" />
      <text x="439" y="227" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="700" fill="white">${art.glyph}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function getSellerName(product: Product) {
  if (product.seller?.username) {
    return product.seller.username;
  }

  return `seller-${product.sellerId.slice(-4)}`;
}

function getSellerRatingLabel(product: Product) {
  if (typeof product.seller?.rating === "number") {
    return product.seller.rating.toFixed(1);
  }

  return "Not rated yet";
}

function isRecentlyAdded(createdAt: string) {
  const createdAtTime = new Date(createdAt).getTime();
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  return createdAtTime >= sevenDaysAgo;
}

function ProductSkeleton() {
  return (
    <article className="marketplace-product-card marketplace-product-card--skeleton">
      <div className="marketplace-skeleton marketplace-skeleton--media" />
      <div className="marketplace-product-card__content">
        <div className="marketplace-skeleton marketplace-skeleton--badge-row" />
        <div className="marketplace-skeleton marketplace-skeleton--title" />
        <div className="marketplace-skeleton marketplace-skeleton--price" />
        <div className="marketplace-skeleton marketplace-skeleton--text" />
        <div className="marketplace-skeleton marketplace-skeleton--text" />
        <div className="marketplace-skeleton marketplace-skeleton--button" />
      </div>
    </article>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState(initialFilters);
  const [draftSearchTerm, setDraftSearchTerm] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productService.getAllProducts();
        setProducts(data);
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(error, "We couldn't load products right now.")
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadProducts();
  }, []);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [
    filters.searchTerm,
    filters.category,
    filters.condition,
    filters.priceRange,
    filters.location,
    filters.sortBy,
  ]);

  const locationOptions = [
    { label: "All", value: "ALL" },
    ...Array.from(new Set(products.map((product) => product.location)))
      .sort((left, right) => left.localeCompare(right))
      .map((location) => ({
        label: location,
        value: location,
      })),
  ];

  const normalizedSearch = filters.searchTerm.trim().toLowerCase();

  const filteredProducts = products
    .filter((product) => {
      if (filters.category !== ProductCategory.ALL && product.category !== filters.category) {
        return false;
      }

      if (
        filters.condition !== ProductCondition.ALL &&
        product.condition !== filters.condition
      ) {
        return false;
      }

      if (filters.location !== "ALL" && product.location !== filters.location) {
        return false;
      }

      if (!getPriceRangeMatch(product.price, filters.priceRange)) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableText = [
        product.name,
        product.description,
        product.location,
        getSellerName(product),
        formatCategoryLabel(product.category),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    })
    .sort((left, right) => {
      switch (filters.sortBy) {
        case "PRICE_LOW_HIGH":
          return left.price - right.price;
        case "PRICE_HIGH_LOW":
          return right.price - left.price;
        default:
          return (
            new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
          );
      }
    });

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMoreProducts = visibleCount < filteredProducts.length;

  const handleFilterChange = (field: keyof ProductFiltersValue, value: string) => {
    startTransition(() => {
      setFilters((current) => ({
        ...current,
        [field]: value,
      }));
    });
  };

  const applySearch = () => {
    startTransition(() => {
      setFilters((current) => ({
        ...current,
        searchTerm: draftSearchTerm,
      }));
    });
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    applySearch();
  };

  const handleFavoriteToggle = (productId: string) => {
    setFavoriteIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
  };

  return (
    <div className="marketplace-page">
      <div className="dashboard-trust-strip">
        <div className="dashboard-trust-strip__inner">
          <span>Protected transactions with escrow security</span>
          <span>Trusted local listings backed by SafeTrade</span>
        </div>
      </div>

      <main className="marketplace-main">
        <div className="marketplace-main__inner">
          <section className="marketplace-hero">
            <Card className="marketplace-hero__card">
              <div className="marketplace-hero__copy">
                <Badge variant="info">Browse Products</Badge>
                <h1>Browse Products</h1>
                <p>Find trusted local items protected by SafeTrade escrow.</p>
              </div>

              <div className="marketplace-hero__search">
                <ProductFilters
                  values={{
                    ...filters,
                    searchTerm: draftSearchTerm,
                  }}
                  categoryShortcuts={[
                    { label: "All", value: ProductCategory.ALL },
                    ...categoryCards.map((category) => ({
                      label: category.title,
                      value: category.value,
                    })),
                  ]}
                  categoryOptions={[
                    { label: "All", value: ProductCategory.ALL },
                    ...categoryCards.map((category) => ({
                      label: category.title,
                      value: category.value,
                    })),
                    { label: "Other", value: ProductCategory.OTHER },
                  ]}
                  conditionOptions={[
                    { label: "All", value: ProductCondition.ALL },
                    { label: "New", value: ProductCondition.NEW },
                    { label: "Like New", value: ProductCondition.LIKE_NEW },
                    { label: "Good", value: ProductCondition.GOOD },
                    { label: "Fair", value: ProductCondition.FAIR },
                  ]}
                  priceOptions={[
                    { label: "All", value: "ALL" },
                    { label: "Under Rs. 5,000", value: "UNDER_5000" },
                    { label: "Rs. 5,000 - 15,000", value: "5000_15000" },
                    { label: "Rs. 15,001 - 50,000", value: "15000_50000" },
                    { label: "Above Rs. 50,000", value: "50000_PLUS" },
                  ]}
                  locationOptions={locationOptions}
                  sortOptions={[
                    { label: "Newest", value: "NEWEST" },
                    { label: "Price: Low to High", value: "PRICE_LOW_HIGH" },
                    { label: "Price: High to Low", value: "PRICE_HIGH_LOW" },
                  ]}
                  onSearchTermChange={setDraftSearchTerm}
                  onFieldChange={handleFilterChange}
                  onSearch={handleSearchSubmit}
                />
              </div>
            </Card>
          </section>

          <section className="marketplace-categories">
            <div className="marketplace-section-heading">
              <div>
                <h2>Category shortcuts</h2>
                <p>Jump into the sections buyers browse most often.</p>
              </div>
            </div>

            <div className="marketplace-category-grid">
              {categoryCards.map((category) => (
                <CategoryCard
                  key={category.value}
                  title={category.title}
                  icon={category.icon}
                  image={getCategoryArt(category.value)}
                  isActive={filters.category === category.value}
                  onClick={() => handleFilterChange("category", category.value)}
                />
              ))}
            </div>
          </section>

          <section className="marketplace-results">
            <div className="marketplace-results__top">
              <div>
                <h2>Product grid</h2>
                <p>Search trusted local listings protected by escrow.</p>
              </div>
              <Badge variant="success">{filteredProducts.length} products found</Badge>
            </div>

            {errorMessage ? (
              <Alert variant="error" title="Products unavailable">
                {errorMessage}
              </Alert>
            ) : null}

            {isLoading ? (
              <div className="marketplace-product-grid">
                {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                  <ProductSkeleton key={index} />
                ))}
              </div>
            ) : null}

            {!isLoading && !errorMessage && filteredProducts.length === 0 ? (
              <Card className="marketplace-empty-state">
                <Badge variant="info">No matches</Badge>
                <h3>No products match your filters.</h3>
                <p>
                  Try clearing a filter, broadening the search term, or switching
                  to another category.
                </p>
              </Card>
            ) : null}

            {!isLoading && filteredProducts.length > 0 ? (
              <>
                <div className="marketplace-product-grid">
                  {visibleProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      image={getCategoryArt(product.category)}
                      conditionLabel={formatConditionLabel(product.condition)}
                      sellerName={getSellerName(product)}
                      sellerRatingLabel={getSellerRatingLabel(product)}
                      isFavorite={favoriteIds.includes(product.id)}
                      isRecentlyAdded={isRecentlyAdded(product.createdAt)}
                      onToggleFavorite={handleFavoriteToggle}
                    />
                  ))}
                </div>

                <div className="marketplace-load-more">
                  {hasMoreProducts ? (
                    <button
                      type="button"
                      className="marketplace-load-more__button"
                      onClick={() => setVisibleCount((current) => current + PAGE_SIZE)}
                    >
                      Load More
                    </button>
                  ) : (
                    <span>You&apos;ve reached the end of the current results.</span>
                  )}
                </div>
              </>
            ) : null}
          </section>
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}
