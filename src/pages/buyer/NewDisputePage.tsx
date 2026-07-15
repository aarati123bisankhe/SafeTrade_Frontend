import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Alert from "../../components/common/Alert";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import disputeService from "../../services/dispute.service";
import transactionService from "../../services/transaction.service";
import {
  DisputeReason,
  type CreateDisputeRequest,
  type Dispute,
} from "../../types/dispute.types";
import { TransactionStatus, type TradeTransaction } from "../../types/transaction.types";
import { getApiErrorMessage } from "../../utils/apiError";
import { formatDisputeReason, formatTransactionStatus } from "./disputePageUtils";

const initialForm: CreateDisputeRequest = {
  transactionId: "",
  reason: DisputeReason.ITEM_NOT_AS_DESCRIBED,
  description: "",
};

const disputableStatuses: TradeTransaction["status"][] = [
  TransactionStatus.FUNDS_HELD,
  TransactionStatus.SELLER_ACCEPTED,
  TransactionStatus.SHIPPED,
];

export default function NewDisputePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [purchases, setPurchases] = useState<TradeTransaction[]>([]);
  const [existingDisputes, setExistingDisputes] = useState<Dispute[]>([]);
  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const stateTransactionId =
    (location.state as { transactionId?: string } | null)?.transactionId ?? "";

  const loadFormData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [purchaseData, disputeData] = await Promise.all([
        transactionService.getMyPurchases(),
        disputeService.getMyDisputes(),
      ]);
      setPurchases(purchaseData);
      setExistingDisputes(disputeData);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "We couldn't load dispute options right now.")
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFormData();
  }, [loadFormData]);

  const eligibleTransactions = useMemo(() => {
    const disputedTransactionIds = new Set(existingDisputes.map((dispute) => dispute.transactionId));

    return purchases.filter(
      (purchase) =>
        disputableStatuses.includes(purchase.status) &&
        !disputedTransactionIds.has(purchase.id)
    );
  }, [existingDisputes, purchases]);

  useEffect(() => {
    if (stateTransactionId && eligibleTransactions.some((item) => item.id === stateTransactionId)) {
      setForm((current) => ({
        ...current,
        transactionId: stateTransactionId,
      }));
      return;
    }

    if (!stateTransactionId && !form.transactionId && eligibleTransactions[0]) {
      setForm((current) => ({
        ...current,
        transactionId: eligibleTransactions[0].id,
      }));
    }
  }, [eligibleTransactions, form.transactionId, stateTransactionId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const created = await disputeService.createDispute(form);
      navigate(`/disputes/${created.id}`);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "We couldn't create the dispute right now.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dashboard-page">
      <section className="disputes-hero ui-card">
        <div className="disputes-hero__copy">
          <Badge variant="warning">Raise a Dispute</Badge>
          <h1>Start a protected dispute review</h1>
          <p>Choose the purchase, explain the issue clearly, and SafeTrade will track the case.</p>
        </div>
      </section>

      <section className="panel-card disputes-panel ui-card">
        {errorMessage ? (
          <Alert variant="error" title="Dispute form unavailable">
            {errorMessage}
          </Alert>
        ) : null}

        {isLoading ? (
          <p>Loading purchases...</p>
        ) : null}

        {!isLoading && eligibleTransactions.length === 0 ? (
          <Card className="marketplace-empty-state purchases-empty-state">
            <Badge variant="info">No eligible purchases</Badge>
            <h3>No current purchases can be disputed.</h3>
            <p>Only purchases with held funds, seller acceptance, or shipped status can open a dispute.</p>
            <div className="purchases-empty-state__actions">
              <Button to="/my-purchases">View My Purchases</Button>
            </div>
          </Card>
        ) : null}

        {!isLoading && eligibleTransactions.length > 0 ? (
          <form className="dispute-form" onSubmit={handleSubmit}>
            <label className="dispute-form__field">
              <span>Transaction</span>
              <select
                value={form.transactionId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    transactionId: event.target.value,
                  }))
                }
              >
                {eligibleTransactions.map((purchase) => (
                  <option key={purchase.id} value={purchase.id}>
                    {purchase.productName} - {formatTransactionStatus(purchase.status)}
                  </option>
                ))}
              </select>
            </label>

            <label className="dispute-form__field">
              <span>Reason</span>
              <select
                value={form.reason}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    reason: event.target.value as CreateDisputeRequest["reason"],
                  }))
                }
              >
                {Object.values(DisputeReason).map((reason) => (
                  <option key={reason} value={reason}>
                    {formatDisputeReason(reason)}
                  </option>
                ))}
              </select>
            </label>

            <label className="dispute-form__field">
              <span>Description</span>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                rows={6}
                placeholder="Describe what went wrong and what support you need."
              />
            </label>

            <div className="dispute-form__actions">
              <Button type="submit" disabled={isSubmitting || form.description.trim().length < 10}>
                {isSubmitting ? "Submitting..." : "Create Dispute"}
              </Button>
              <Button to="/disputes" variant="ghost">
                Cancel
              </Button>
            </div>
          </form>
        ) : null}
      </section>
    </div>
  );
}
