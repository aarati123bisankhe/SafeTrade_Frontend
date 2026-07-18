import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useLocation } from "react-router-dom";

import Alert from "../../components/common/Alert";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import CategoryCard from "../../components/products/CategoryCard";
import ProductCard from "../../components/products/ProductCard";
import ProductFilters, {
  type ProductFiltersValue,
} from "../../components/products/ProductFilters";
import DashboardHeader from "../../components/layout/DashboardHeader";
import DashboardFooter from "../../components/layout/DashboardFooter";
import productService from "../../services/product.service";
import {
  type PaginatedProducts,
  ProductCategory,
  ProductCondition,
  type Product,
} from "../../types/product.types";
import { getApiErrorMessage } from "../../utils/apiError";

const PAGE_SIZE = 8;
const FAVORITES_STORAGE_KEY = "safetrade-browse-favorites";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const hashCategoryMap: Record<string, string> = {
  "#books": ProductCategory.BOOKS,
  "#electronics": ProductCategory.ELECTRONICS,
  "#clothing": ProductCategory.CLOTHING,
  "#furniture": ProductCategory.FURNITURE,
  "#handmade": ProductCategory.HANDMADE,
};

const categoryCards = [
  { value: ProductCategory.ALL, title: "All", icon: "🛍️" },
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

function getPriceBounds(range: string) {
  switch (range) {
    case "UNDER_5000":
      return { minPrice: undefined, maxPrice: 4999 };
    case "5000_15000":
      return { minPrice: 5000, maxPrice: 15000 };
    case "15000_50000":
      return { minPrice: 15001, maxPrice: 50000 };
    case "50000_PLUS":
      return { minPrice: 50001, maxPrice: undefined };
    default:
      return { minPrice: undefined, maxPrice: undefined };
  }
}

function getCategoryArt(category: string) {
  const palette: Record<string, { start: string; end: string; accent: string; glyph: string }> = {
    ALL: { start: "#eff6ff", end: "#e0f2fe", accent: "#2563eb", glyph: "ALL" },
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

function getProductArt(product: Product) {
  if (product.imageUrl?.trim()) {
    return resolveProductImage(product.imageUrl);
  }

  const name = product.name.toLowerCase();
  const accentByCategory: Record<string, { start: string; end: string; accent: string }> = {
    BOOKS: { start: "#eff6ff", end: "#dbeafe", accent: "#1d4ed8" },
    ELECTRONICS: { start: "#ecfeff", end: "#cffafe", accent: "#0891b2" },
    CLOTHING: { start: "#fdf2f8", end: "#fce7f3", accent: "#db2777" },
    FURNITURE: { start: "#fef3c7", end: "#fde68a", accent: "#b45309" },
    HANDMADE: { start: "#ecfccb", end: "#d9f99d", accent: "#65a30d" },
    OTHER: { start: "#f8fafc", end: "#e2e8f0", accent: "#475569" },
  };

  let label = "ITEM";
  if (name.includes("headphone") || name.includes("earbud")) label = "AUDIO";
  else if (name.includes("phone") || name.includes("iphone")) label = "PHONE";
  else if (name.includes("laptop") || name.includes("computer")) label = "LAPTOP";
  else if (name.includes("book") || name.includes("novel")) label = "BOOK";
  else if (name.includes("shirt") || name.includes("jacket") || name.includes("hoodie")) label = "WEAR";
  else if (name.includes("table") || name.includes("chair") || name.includes("sofa")) label = "HOME";
  else if (name.includes("bag") || name.includes("handmade") || name.includes("craft")) label = "CRAFT";

  const palette = accentByCategory[product.category] ?? accentByCategory.OTHER;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette.start}" />
          <stop offset="100%" stop-color="${palette.end}" />
        </linearGradient>
        <linearGradient id="card" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.98" />
          <stop offset="100%" stop-color="#f8fafc" stop-opacity="0.92" />
        </linearGradient>
      </defs>
      <rect width="640" height="420" rx="36" fill="url(#bg)" />
      <circle cx="520" cy="92" r="80" fill="${palette.accent}" fill-opacity="0.14" />
      <circle cx="110" cy="332" r="96" fill="${palette.accent}" fill-opacity="0.1" />
      <rect x="118" y="76" width="404" height="268" rx="34" fill="url(#card)" />
      <rect x="158" y="112" width="324" height="152" rx="24" fill="${palette.accent}" fill-opacity="0.12" />
      <text x="320" y="200" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="44" font-weight="800" fill="${palette.accent}">${label}</text>
      <rect x="160" y="286" width="210" height="16" rx="8" fill="${palette.accent}" fill-opacity="0.24" />
      <rect x="160" y="314" width="138" height="14" rx="7" fill="${palette.accent}" fill-opacity="0.16" />
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function resolveProductImage(imageUrl: string) {
  if (
    imageUrl.startsWith("data:") ||
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  const apiOrigin = API_BASE_URL ? new URL(API_BASE_URL).origin : "https://localhost:5005";

  return new URL(imageUrl, apiOrigin).toString();
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
  const location = useLocation();
  const [productResults, setProductResults] = useState<PaginatedProducts>({
    items: [],
    page: 1,
    limit: PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
  });
  const [filters, setFilters] = useState(initialFilters);
  const [searchInput, setSearchInput] = useState(initialFilters.searchTerm);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    const priceBounds = getPriceBounds(filters.priceRange);

    try {
      const data = await productService.getAllProducts({
        page: currentPage,
        limit: PAGE_SIZE,
        search: filters.searchTerm.trim() || undefined,
        category:
          filters.category === ProductCategory.ALL
            ? undefined
            : (filters.category as Exclude<ProductCategory, "ALL">),
        condition:
          filters.condition === ProductCondition.ALL
            ? undefined
            : (filters.condition as Exclude<ProductCondition, "ALL">),
        location: filters.location === "ALL" ? undefined : filters.location,
        minPrice: priceBounds.minPrice,
        maxPrice: priceBounds.maxPrice,
        sortBy: filters.sortBy as "NEWEST" | "PRICE_LOW_HIGH" | "PRICE_HIGH_LOW",
      });
      setProductResults(data);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "We couldn't load products right now.")
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const categoryFromHash = hashCategoryMap[location.hash.toLowerCase()];

    if (!categoryFromHash) {
      return;
    }

    startTransition(() => {
      setFilters((current) => ({
        ...current,
        category: categoryFromHash,
      }));
      setCurrentPage(1);
    });
  }, [location.hash]);

  useEffect(() => {
    const storedFavorites = sessionStorage.getItem(FAVORITES_STORAGE_KEY);

    if (!storedFavorites) {
      return;
    }

    try {
      const parsedFavorites = JSON.parse(storedFavorites) as unknown;

      if (Array.isArray(parsedFavorites)) {
        setFavoriteIds(
          parsedFavorites.filter((value): value is string => typeof value === "string")
        );
      }
    } catch {
      sessionStorage.removeItem(FAVORITES_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  const locationOptions = useMemo(
    () => [
      { label: "All", value: "ALL" },
      ...Array.from(
        new Set(
          productResults.items
            .map((product) => product.location.trim())
            .filter(Boolean)
        )
      )
        .sort((left, right) => left.localeCompare(right))
        .map((location) => ({
          label: location,
          value: location,
        })),
    ],
    [productResults.items]
  );

  const handleFilterChange = (field: keyof ProductFiltersValue, value: string) => {
    startTransition(() => {
      setFilters((current) => ({
        ...current,
        [field]: value,
      }));
      setCurrentPage(1);
    });
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(() => {
      setFilters((current) => ({
        ...current,
        searchTerm: searchInput,
      }));
      setCurrentPage(1);
    });
  };

  const handleSearchTermChange = (value: string) => {
    setSearchInput(value);
  };

  const handleFavoriteToggle = (productId: string) => {
    setFavoriteIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
  };

  const hasActiveFilters =
    filters.searchTerm.trim().length > 0 ||
    filters.category !== ProductCategory.ALL ||
    filters.condition !== ProductCondition.ALL ||
    filters.priceRange !== "ALL" ||
    filters.location !== "ALL";

  const emptyStateContent =
    !hasActiveFilters
      ? {
          badge: "No products yet",
          title: "No products are available right now.",
          description:
            "Check back soon for new listings protected by SafeTrade escrow.",
        }
      : {
          badge: "No matches",
          title: "No products match your filters.",
          description:
            "Try clearing a filter, broadening the search term, or switching to another category.",
        };

  return (
    <div className="marketplace-page">
      <DashboardHeader />

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
                  values={{ ...filters, searchTerm: searchInput }}
                  categoryShortcuts={categoryCards.map((category) => ({
                    label: category.title,
                    value: category.value,
                  }))}
                  categoryOptions={[
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
                  onSearchTermChange={handleSearchTermChange}
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
              <Badge variant="success">
                {productResults.totalItems} products found
              </Badge>
            </div>

            {errorMessage ? (
              <div className="marketplace-empty-state">
                <Alert variant="error" title="Products unavailable">
                  {errorMessage}
                </Alert>
                <div className="marketplace-load-more">
                  <button
                    type="button"
                    className="marketplace-load-more__button"
                    onClick={() => void loadProducts()}
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : null}

            {isLoading ? (
              <div className="marketplace-product-grid">
                {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                  <ProductSkeleton key={index} />
                ))}
              </div>
            ) : null}

            {!isLoading && !errorMessage && productResults.items.length === 0 ? (
              <Card className="marketplace-empty-state">
                <Badge variant="info">{emptyStateContent.badge}</Badge>
                <h3>{emptyStateContent.title}</h3>
                <p>{emptyStateContent.description}</p>
              </Card>
            ) : null}

            {!isLoading && productResults.items.length > 0 ? (
              <>
                <div className="marketplace-product-grid">
                  {productResults.items.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      image={getProductArt(product)}
                      categoryLabel={formatCategoryLabel(product.category)}
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
                  <button
                    type="button"
                    className="marketplace-load-more__button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span className="marketplace-load-more__label">
                    Page {productResults.page} of {productResults.totalPages}
                  </span>
                  <button
                    type="button"
                    className="marketplace-load-more__button"
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(productResults.totalPages, page + 1)
                      )
                    }
                    disabled={currentPage >= productResults.totalPages}
                  >
                    Next
                  </button>
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
