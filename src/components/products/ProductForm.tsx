import { useEffect, useMemo, useState, type FormEvent } from "react";

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

type ProductFormField = keyof ProductFormValues | "imageFile";
type ProductFormErrors = Partial<Record<ProductFormField, string>>;

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

function validateForm(values: ProductFormValues, imageFile: File | null) {
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

  if (imageFile) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(imageFile.type)) {
      errors.imageFile = "Image must be a JPG, PNG, or WebP file.";
    }

    if (imageFile.size > 5 * 1024 * 1024) {
      errors.imageFile = "Image must be smaller than 5 MB.";
    }
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(
    initialValues.imageUrl ?? null
  );
  const [fieldErrors, setFieldErrors] = useState<ProductFormErrors>({});

  useEffect(() => {
    setValues(initialValues);
    setImageFile(null);
    setImagePreviewUrl(initialValues.imageUrl ?? null);
  }, [initialValues]);

  useEffect(() => {
    if (!imageFile) {
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [imageFile]);

  const hasChanges = useMemo(
    () =>
      JSON.stringify(values) !== JSON.stringify(initialValues) || imageFile !== null,
    [imageFile, initialValues, values]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateForm(values, imageFile);
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
      imageFile,
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

      <label className="ui-field">
        <span className="ui-field__label">Product image</span>
        <input
          className="ui-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => {
            const nextFile = event.target.files?.[0] ?? null;
            setImageFile(nextFile);
            setFieldErrors((current) => ({ ...current, imageFile: undefined }));
          }}
        />
        <span className="ui-field__helper">
          Upload a JPG, PNG, or WebP image up to 5 MB.
        </span>
        {fieldErrors.imageFile ? (
          <span className="ui-field__helper">{fieldErrors.imageFile}</span>
        ) : null}
      </label>

      {imagePreviewUrl ? (
        <div className="seller-product-form__preview">
          <img src={imagePreviewUrl} alt="Product preview" />
        </div>
      ) : null}

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
