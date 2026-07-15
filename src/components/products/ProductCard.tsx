import Badge from "../common/Badge";
import Button from "../common/Button";
import type { Product, ProductStatus } from "../../types/product.types";

type ProductCardProps = {
  product: Product;
  image: string;
  categoryLabel: string;
  conditionLabel: string;
  sellerName: string;
  sellerRatingLabel: string;
  isFavorite?: boolean;
  isRecentlyAdded?: boolean;
  onToggleFavorite?: (productId: string) => void;
};

function getStatusBadgeVariant(status: ProductStatus) {
  switch (status) {
    case "AVAILABLE":
      return "success";
    case "RESERVED":
      return "warning";
    case "SOLD":
      return "info";
    default:
      return "default";
  }
}

export default function ProductCard({
  product,
  image,
  categoryLabel,
  conditionLabel,
  sellerName,
  sellerRatingLabel,
  isFavorite = false,
  isRecentlyAdded = false,
  onToggleFavorite,
}: ProductCardProps) {
  return (
    <article className="marketplace-product-card">
      <div className="marketplace-product-card__media">
        <img src={image} alt={product.name} />
        <button
          type="button"
          className={[
            "marketplace-product-card__favorite",
            isFavorite ? "marketplace-product-card__favorite--active" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onToggleFavorite?.(product.id)}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          ♥
        </button>
        <div className="marketplace-product-card__badges">
          <Badge variant="default">{conditionLabel}</Badge>
          <Badge variant="success">Escrow Protected</Badge>
          <Badge variant={getStatusBadgeVariant(product.status)}>
            {product.status}
          </Badge>
          {isRecentlyAdded ? <Badge variant="info">Recently added</Badge> : null}
        </div>
      </div>

      <div className="marketplace-product-card__content">
        <div className="marketplace-product-card__headline">
          <div>
            <h3>{product.name}</h3>
            <span>{product.location}</span>
          </div>
          <strong>Rs. {product.price.toLocaleString()}</strong>
        </div>

        <p>{product.description}</p>

        <div className="marketplace-product-card__meta">
          <span>Category: {categoryLabel}</span>
          <span>Condition: {conditionLabel}</span>
          <span>Location: {product.location}</span>
          <span>Seller: {sellerName}</span>
          <span>Status: {product.status}</span>
          <span>★ {sellerRatingLabel}</span>
        </div>

        <Button to={`/products/${product.id}`} fullWidth>
          View Details
        </Button>
      </div>
    </article>
  );
}
