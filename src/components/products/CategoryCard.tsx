type CategoryCardProps = {
  title: string;
  icon: string;
  image: string;
  isActive?: boolean;
  onClick?: () => void;
};

export default function CategoryCard({
  title,
  icon,
  image,
  isActive = false,
  onClick,
}: CategoryCardProps) {
  return (
    <button
      type="button"
      className={[
        "marketplace-category-card",
        isActive ? "marketplace-category-card--active" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
      aria-pressed={isActive}
    >
      <div className="marketplace-category-card__media">
        <img src={image} alt={title} />
        <span>{icon}</span>
      </div>
      <div className="marketplace-category-card__content">
        <strong>{title}</strong>
        <span>Explore trusted listings</span>
      </div>
    </button>
  );
}
