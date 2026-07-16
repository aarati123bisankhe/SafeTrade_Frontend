import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Alert from "../../components/common/Alert";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import ProductForm from "../../components/products/ProductForm";
import useAuth from "../../hooks/useAuth";
import productService from "../../services/product.service";
import type { Product, ProductFormValues } from "../../types/product.types";
import { getApiErrorMessage } from "../../utils/apiError";

function getInitialValues(product: Product): ProductFormValues {
  return {
    name: product.name,
    description: product.description,
    price: String(product.price),
    category: product.category,
    condition: product.condition,
    location: product.location,
    imageUrl: product.imageUrl ?? null,
  };
}

export default function EditProductPage() {
  const { productId = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadProduct = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await productService.getProductById(productId);
      setProduct(data);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "We couldn't load this product right now.")
      );
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  const canEdit = useMemo(() => {
    if (!product || !user) {
      return false;
    }

    return user.role === "ADMIN" || user.id === product.sellerId;
  }, [product, user]);

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Edit your listing"
        description="Update a SafeTrade listing while keeping the same seller product structure."
      />

      {isLoading ? (
        <Card className="panel-card seller-form-panel">
          <p>Loading product details...</p>
        </Card>
      ) : null}

      {!isLoading && errorMessage && !product ? (
        <Card className="marketplace-empty-state">
          <Badge variant="danger">Product unavailable</Badge>
          <h3>We couldn't load this seller product.</h3>
          <p>{errorMessage}</p>
          <div className="purchases-empty-state__actions">
            <Button variant="secondary" onClick={() => void loadProduct()}>
              Retry
            </Button>
            <Button to="/seller/products" variant="ghost">
              Back to Seller Products
            </Button>
          </div>
        </Card>
      ) : null}

      {!isLoading && product && !canEdit ? (
        <Card className="marketplace-empty-state">
          <Badge variant="danger">Access restricted</Badge>
          <h3>You cannot edit this product.</h3>
          <p>Only the product owner or an admin can update this listing.</p>
          <div className="purchases-empty-state__actions">
            <Button to="/seller/products">Back to Seller Products</Button>
          </div>
        </Card>
      ) : null}

      {!isLoading && product && canEdit ? (
        <Card className="panel-card seller-form-panel">
          <ProductForm
            initialValues={getInitialValues(product)}
            submitLabel="Save Changes"
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
            requireChanges
            onSubmit={async (payload) => {
              setIsSubmitting(true);
              setErrorMessage("");

              try {
                await productService.updateProduct(product.id, payload);
                navigate("/seller/products", {
                  state: { successMessage: "Product updated successfully." },
                });
              } catch (error) {
                setErrorMessage(
                  getApiErrorMessage(error, "We couldn't update this product right now.")
                );
              } finally {
                setIsSubmitting(false);
              }
            }}
          />
        </Card>
      ) : null}

      {!isLoading && errorMessage && product ? (
        <Alert variant="error" title="Product update unavailable">
          {errorMessage}
        </Alert>
      ) : null}
    </div>
  );
}
