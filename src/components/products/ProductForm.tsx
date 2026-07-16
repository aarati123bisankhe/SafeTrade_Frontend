import { useMemo, useState, type FormEvent } from "react";

import Alert from "../common/Alert";
import Button from "../common/Button";
import Input from "../common/Input";
import type {
  ProductCategory,
  ProductCondition,
  ProductFormValues,
  ProductPayload,
} from "../../types/product.types";

type ProductFormProps = {
  initialValues: ProductFormValues;
  submitLabel: string;
  isSubmitting: boolean;
  errorMessage?: string;
  requireChanges?: boolean;
  onSubmit: (payload: ProductPayload) => Promise<void>;
};

type ProductFormErrors = Partial<Record<keyof ProductFormValues, string>>;

const categoryOptions: Array<Exclude<ProductCategory, "ALL">> = [
  "BOOKS",
  "ELECTRONICS",
  "CLOTHING",
  "FURNITURE",
  "HANDMADE",
  "OTHER",
];

const conditionOptions: Array<Exclude<ProductCondition, "ALL">> = [
  "NEW",
  "LIKE_NEW",
  "GOOD",
  "FAIR",
];

function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function validateForm(values: ProductFormValues) {
  const errors: ProductFormErrors = {};

  if (values.name.trim().length < 2) {
    errors.name = "Product name must be at least 2 characters.";
  }

  if (values.description.trim().length < 10) {
    errors.description = "Description must be at least 10 characters.";
  }

  const price = Number(values.price);
  if (!Number.isFinite(price) || price <= 0) {
    errors.price = "Price must be greater than 0.";
  }

  if (values.location.trim().length < 2) {
    errors.location = "Location is required.";
  }

  return errors;
}

export default function ProductForm({
  initialValues,
  submitLabel,
  isSubmitting,
  errorMessage,
  requireChanges = false,
  onSubmit,
}: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<ProductFormErrors>({});

  const hasChanges = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(initialValues),
    [initialValues, values]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateForm(values);
    setFieldErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    await onSubmit({
      name: values.name.trim(),
      description: values.description.trim(),
      price: Number(values.price),
      category: values.category,
      condition: values.condition,
      location: values.location.trim(),
    });
  };

  return (
    <form className="seller-product-form" onSubmit={handleSubmit}>
      {errorMessage ? (
        <Alert variant="error" title="Product update unavailable">
          {errorMessage}
        </Alert>
      ) : null}

      <div className="seller-product-form__grid">
        <Input
          label="Product name"
          value={values.name}
          onChange={(event) =>
            setValues((current) => ({ ...current, name: event.target.value }))
          }
          helperText={fieldErrors.name}
        />

        <Input
          label="Price"
          type="number"
          min="0"
          step="0.01"
          value={values.price}
          onChange={(event) =>
            setValues((current) => ({ ...current, price: event.target.value }))
          }
          helperText={fieldErrors.price}
        />

        <label className="ui-field">
          <span className="ui-field__label">Category</span>
          <select
            className="ui-input"
            value={values.category}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                category: event.target.value as ProductFormValues["category"],
              }))
            }
          >
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {formatEnumLabel(option)}
              </option>
            ))}
          </select>
        </label>

        <label className="ui-field">
          <span className="ui-field__label">Condition</span>
          <select
            className="ui-input"
            value={values.condition}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                condition: event.target.value as ProductFormValues["condition"],
              }))
            }
          >
            {conditionOptions.map((option) => (
              <option key={option} value={option}>
                {formatEnumLabel(option)}
              </option>
            ))}
          </select>
        </label>

        <Input
          label="Location"
          value={values.location}
          onChange={(event) =>
            setValues((current) => ({ ...current, location: event.target.value }))
          }
          helperText={fieldErrors.location}
        />
      </div>

      <label className="ui-field">
        <span className="ui-field__label">Description</span>
        <textarea
          className="ui-input seller-product-form__textarea"
          rows={6}
          value={values.description}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
        />
        {fieldErrors.description ? (
          <span className="ui-field__helper">{fieldErrors.description}</span>
        ) : null}
      </label>

      <div className="seller-product-form__actions">
        <Button
          type="submit"
          disabled={isSubmitting || (requireChanges && !hasChanges)}
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
