import { useCallback, useEffect, useMemo, useState } from "react";

import Alert from "../../components/common/Alert";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import StatusBadge from "../../components/common/StatusBadge";
import disputeService from "../../services/dispute.service";
import {
  DisputeStatus,
  type Dispute,
} from "../../types/dispute.types";
import { getApiErrorMessage } from "../../utils/apiError";
import {
  formatDisputeDate,
  formatDisputeReason,
  formatDisputeStatus,
  getDisputeImage,
} from "./disputePageUtils";

const statusTabs = [
  { label: "All", value: "ALL" },
  { label: "Open", value: DisputeStatus.OPEN },
  { label: "Under Review", value: DisputeStatus.UNDER_REVIEW },
  { label: "Resolved for Buyer", value: DisputeStatus.RESOLVED_BUYER },
  { label: "Resolved for Seller", value: DisputeStatus.RESOLVED_SELLER },
  { label: "Rejected", value: DisputeStatus.REJECTED },
] as const;

type StatusTabValue = (typeof statusTabs)[number]["value"];

function SummaryIcon({
  tone,
}: {
  tone: "open" | "review" | "buyer" | "seller";
}) {
  const paths = {
    open: (
      <path d="M12 8v4m0 4h.01M10.3 4.9 3.6 16.2A1.4 1.4 0 0 0 4.8 18h14.4a1.4 1.4 0 0 0 1.2-1.8L13.7 4.9a1.4 1.4 0 0 0-2.4 0Z" />
    ),
    review: (
      <path d="M12 3a9 9 0 1 0 9 9h-9V3Zm1 1.1V11h6.9A8 8 0 0 0 13 4.1Z" />
    ),
    buyer: <path d="m7 12 3 3 7-7m-5-5a9 9 0 1 1 0 18 9 9 0 0 1 0-18Z" />,
    seller: (
      <path d="M12 3l7 3v5c0 4.5-2.9 8.6-7 10-4.1-1.4-7-5.5-7-10V6l7-3Zm-2.5 9.5 1.9 1.9 4.1-4.1" />
    ),
  };

  return (
    <span className="metric-card__icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        {paths[tone]}
      </svg>
    </span>
  );
}

function getDisputeStatusVariant(status: Dispute["status"]) {
  switch (status) {
    case DisputeStatus.OPEN:
      return "warning";
    case DisputeStatus.UNDER_REVIEW:
      return "info";
    case DisputeStatus.RESOLVED_BUYER:
      return "success";
    case DisputeStatus.RESOLVED_SELLER:
      return "success";
    case DisputeStatus.REJECTED:
      return "danger";
    default:
      return "default";
  }
}

function DisputeSkeleton() {
  return (
    <article className="disputes-card disputes-card--skeleton">
      <div className="disputes-skeleton disputes-skeleton--image" />
      <div className="disputes-card__content">
        <div className="disputes-skeleton disputes-skeleton--title" />
        <div className="disputes-skeleton disputes-skeleton--meta" />
        <div className="disputes-skeleton disputes-skeleton--meta" />
        <div className="disputes-skeleton disputes-skeleton--text" />
        <div className="disputes-skeleton disputes-skeleton--actions" />
      </div>
    </article>
  );
}

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [activeTab, setActiveTab] = useState<StatusTabValue>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadDisputes = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await disputeService.getMyDisputes();
      setDisputes(data);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "We couldn't load your disputes right now.")
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDisputes();
  }, [loadDisputes]);

  const summary = useMemo(() => {
    return {
      open: disputes.filter((dispute) => dispute.status === DisputeStatus.OPEN).length,
      review: disputes.filter((dispute) => dispute.status === DisputeStatus.UNDER_REVIEW)
        .length,
      buyer: disputes.filter((dispute) => dispute.status === DisputeStatus.RESOLVED_BUYER)
        .length,
      seller: disputes.filter((dispute) => dispute.status === DisputeStatus.RESOLVED_SELLER)
        .length,
    };
  }, [disputes]);

  const filteredDisputes = useMemo(() => {
    if (activeTab === "ALL") {
      return disputes;
    }

    return disputes.filter((dispute) => dispute.status === activeTab);
  }, [activeTab, disputes]);

  return (
    <div className="dashboard-page">
      <section className="disputes-hero ui-card">
        <div className="disputes-hero__copy">
          <Badge variant="warning">Disputes</Badge>
          <h1>Manage issues with full SafeTrade visibility</h1>
          <p>
            Review open cases, track evidence, and follow the resolution process
            for every protected transaction.
          </p>
        </div>
        <div className="disputes-hero__actions">
          <Button to="/disputes/new">Raise a Dispute</Button>
        </div>
      </section>

      <section className="metrics-grid">
        <Card className="metric-card metric-card--enhanced">
          <div className="metric-card__top">
            <SummaryIcon tone="open" />
            <Badge variant="warning">Open Disputes</Badge>
          </div>
          <strong>{String(summary.open).padStart(2, "0")}</strong>
          <span className="metric-card__detail">Awaiting progress or evidence</span>
        </Card>
        <Card className="metric-card metric-card--enhanced">
          <div className="metric-card__top">
            <SummaryIcon tone="review" />
            <Badge variant="info">Under Review</Badge>
          </div>
          <strong>{String(summary.review).padStart(2, "0")}</strong>
          <span className="metric-card__detail">Currently being reviewed by SafeTrade</span>
        </Card>
        <Card className="metric-card metric-card--enhanced">
          <div className="metric-card__top">
            <SummaryIcon tone="buyer" />
            <Badge variant="success">Resolved for Buyer</Badge>
          </div>
          <strong>{String(summary.buyer).padStart(2, "0")}</strong>
          <span className="metric-card__detail">Cases resolved in the buyer's favor</span>
        </Card>
        <Card className="metric-card metric-card--enhanced">
          <div className="metric-card__top">
            <SummaryIcon tone="seller" />
            <Badge variant="success">Resolved for Seller</Badge>
          </div>
          <strong>{String(summary.seller).padStart(2, "0")}</strong>
          <span className="metric-card__detail">Cases closed in the seller's favor</span>
        </Card>
      </section>

      <section className="panel-card disputes-panel ui-card">
        <div className="panel-card__header">
          <div>
            <h3>Dispute Activity</h3>
            <p>Filter disputes by their live review and resolution state.</p>
          </div>
          <Button to="/disputes/new" variant="secondary" size="sm">
            Raise a Dispute
          </Button>
        </div>

        <div className="purchases-tabs" role="tablist" aria-label="Dispute statuses">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.value}
              className={[
                "purchases-tab",
                activeTab === tab.value ? "purchases-tab--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {errorMessage ? (
          <div className="purchases-feedback">
            <Alert variant="error" title="Disputes unavailable">
              {errorMessage}
            </Alert>
            <Button onClick={() => void loadDisputes()} variant="secondary">
              Retry
            </Button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="transaction-list">
            {Array.from({ length: 4 }).map((_, index) => (
              <DisputeSkeleton key={index} />
            ))}
          </div>
        ) : null}

        {!isLoading && !errorMessage && filteredDisputes.length === 0 ? (
          <Card className="marketplace-empty-state purchases-empty-state">
            <Badge variant="info">
              {disputes.length === 0 ? "No disputes yet" : "No matches"}
            </Badge>
            <h3>
              {disputes.length === 0
                ? "You don't have any disputes yet."
                : "No disputes match this status."}
            </h3>
            <p>
              {disputes.length === 0
                ? "When an issue needs review, your dispute timeline and evidence will appear here."
                : "Try another status tab or review all disputes."}
            </p>
            <div className="purchases-empty-state__actions">
              <Button to="/disputes/new">Raise a Dispute</Button>
            </div>
          </Card>
        ) : null}

        {!isLoading && filteredDisputes.length > 0 ? (
          <div className="transaction-list">
            {filteredDisputes.map((dispute) => (
              <article key={dispute.id} className="disputes-card">
                <img
                  src={getDisputeImage(dispute.transaction?.product)}
                  alt={dispute.transaction?.productName ?? "Dispute product"}
                  className="disputes-card__image"
                />
                <div className="disputes-card__content">
                  <div className="transaction-card__top">
                    <div className="disputes-card__headline">
                      <div className="purchases-card__badges">
                        <StatusBadge
                          label={formatDisputeStatus(dispute.status)}
                          variant={getDisputeStatusVariant(dispute.status)}
                        />
                        <Badge variant="default">
                          {dispute.evidence?.length ?? 0} evidence file
                          {(dispute.evidence?.length ?? 0) === 1 ? "" : "s"}
                        </Badge>
                      </div>
                      <strong>
                        {dispute.transaction?.productName ?? "Protected transaction"}
                      </strong>
                      <span>Seller: {dispute.transaction?.seller?.username ?? "Not available"}</span>
                    </div>
                    <div className="transaction-card__meta">
                      <strong>{formatDisputeReason(dispute.reason)}</strong>
                      <span>Opened {formatDisputeDate(dispute.createdAt)}</span>
                    </div>
                  </div>

                  <p className="disputes-card__description">{dispute.description}</p>

                  <div className="disputes-card__meta">
                    <span>Transaction ID: {dispute.transactionId}</span>
                    <span>
                      Current transaction state:{" "}
                      {dispute.transaction?.status
                        ? formatDisputeStatus(dispute.transaction.status)
                        : "Not available"}
                    </span>
                  </div>

                  <div className="disputes-card__actions">
                    <Button to={`/disputes/${dispute.id}`} variant="secondary" size="sm">
                      View Dispute
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
