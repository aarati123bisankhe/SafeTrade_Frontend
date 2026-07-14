import { AxiosError } from "axios";

import type { ApiErrorResponse } from "../types/auth.types";

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string
): string {
  if (!(error instanceof AxiosError)) {
    return fallbackMessage;
  }

  if (!error.response) {
    return "We couldn't reach the server. Please make sure the backend is running and try again.";
  }

  const response = error.response?.data as ApiErrorResponse | undefined;

  if (!response) {
    return fallbackMessage;
  }

  const fieldErrors = response.errors?.fieldErrors;

  if (fieldErrors) {
    const firstFieldError = Object.values(fieldErrors)
      .flat()
      .find((message): message is string => Boolean(message));

    if (firstFieldError) {
      return firstFieldError;
    }
  }

  const firstFormError = response.errors?.formErrors?.find(Boolean);

  if (firstFormError) {
    return firstFormError;
  }

  return response.message ?? fallbackMessage;
}
