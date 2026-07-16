import Button from "../common/Button";
import Card from "../common/Card";

type DeleteProductModalProps = {
  productName: string;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteProductModal({
  productName,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteProductModalProps) {
  return (
    <div className="seller-modal" role="dialog" aria-modal="true" aria-labelledby="delete-product-title">
      <div className="seller-modal__backdrop" onClick={onCancel} />
      <Card className="seller-modal__card">
        <div className="seller-modal__content">
          <h3 id="delete-product-title">Are you sure you want to remove this product?</h3>
          <p>
            <strong>{productName}</strong> will be removed from active browsing and
            seller management views.
          </p>
        </div>
        <div className="seller-modal__actions">
          <Button variant="ghost" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? "Removing..." : "Remove Product"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
