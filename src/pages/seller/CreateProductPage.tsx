import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import ProductForm from "../../components/products/ProductForm";
import productService from "../../services/product.service";
import type { ProductFormValues } from "../../types/product.types";
import { getApiErrorMessage } from "../../utils/apiError";

const initialValues: ProductFormValues = {
  name: "",
  description: "",
  price: "",
  category: "BOOKS",
  condition: "NEW",
  location: "",
};

export default function CreateProductPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Create a protected listing"
        description="Add a new product using the existing SafeTrade seller experience."
      />

      <Card className="panel-card seller-form-panel">
        <ProductForm
          initialValues={initialValues}
          submitLabel="Create Product"
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
          onSubmit={async (payload) => {
            setIsSubmitting(true);
            setErrorMessage("");

            try {
              await productService.createProduct(payload);
              navigate("/seller/products", {
                state: { successMessage: "Product created successfully." },
              });
            } catch (error) {
              setErrorMessage(
                getApiErrorMessage(error, "We couldn't create this product right now.")
              );
            } finally {
              setIsSubmitting(false);
            }
          }}
        />
      </Card>
    </div>
  );
}
