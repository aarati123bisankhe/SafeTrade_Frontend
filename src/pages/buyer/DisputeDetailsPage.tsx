import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useParams } from "react-router-dom";

import Alert from "../../components/common/Alert";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import StatusBadge from "../../components/common/StatusBadge";
import disputeService from "../../services/dispute.service";
import { DisputeStatus, type Dispute } from "../../types/dispute.types";
import { getApiErrorMessage } from "../../utils/apiError";
import {
  formatDisputeDate,
  formatDisputeReason,
  formatDisputeStatus,
  formatTransactionStatus,
  getDisputeImage,
} from "./disputePageUtils";

function getStatusVariant(status: Dispute["status"]) {
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

export default function DisputeDetailsPage() {
  const { disputeId = "" } = useParams();
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const loadDispute = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await disputeService.getDisputeById(disputeId);
      setDispute(data);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "We couldn't load this dispute right now.")
      );
    } finally {
      setIsLoading(false);
    }
  }, [disputeId]);

  useEffect(() => {
    void loadDispute();
  }, [loadDispute]);

  const canUploadEvidence =
    dispute?.status === DisputeStatus.OPEN ||
    dispute?.status === DisputeStatus.UNDER_REVIEW;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setUploadMessage("");
  };

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile || !dispute) {
      return;
    }

    setIsUploading(true);
    setUploadMessage("");

    try {
      await disputeService.uploadEvidence(dispute.id, selectedFile);
      setSelectedFile(null);
      setUploadMessage("Evidence uploaded successfully.");
      await loadDispute();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "We couldn't upload evidence right now.")
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <section className="panel-card ui-card">
          <p>Loading dispute details...</p>
        </section>
      </div>
    );
  }

  if (errorMessage && !dispute) {
    return (
      <div className="dashboard-page">
        <section className="panel-card ui-card">
          <Alert variant="error" title="Dispute unavailable">
            {errorMessage}
          </Alert>
          <Button onClick={() => void loadDispute()} variant="secondary">
            Retry
          </Button>
        </section>
      </div>
    );
  }

  if (!dispute) {
    return null;
  }

  return (
    <div className="dashboard-page">
      <section className="disputes-hero ui-card">
        <div className="disputes-hero__copy">
          <Badge variant="warning">Dispute Details</Badge>
          <h1>{dispute.transaction?.productName ?? "Protected transaction"}</h1>
          <p>Review the dispute timeline, evidence, and final resolution details.</p>
        </div>
      </section>

      {errorMessage ? (
        <Alert variant="error" title="Action unavailable">
          {errorMessage}
        </Alert>
      ) : null}

      {uploadMessage ? (
        <Alert variant="success" title="Evidence updated">
          {uploadMessage}
        </Alert>
      ) : null}

      <section className="buyer-main-grid">
        <Card className="panel-card">
          <div className="panel-card__header">
            <div>
              <h3>Dispute Status</h3>
              <p>Current review and resolution state for this case.</p>
            </div>
            <StatusBadge
              label={formatDisputeStatus(dispute.status)}
              variant={getStatusVariant(dispute.status)}
            />
          </div>

          <div className="dispute-detail-grid">
            <div>
              <span>Reason</span>
              <strong>{formatDisputeReason(dispute.reason)}</strong>
            </div>
            <div>
              <span>Date opened</span>
              <strong>{formatDisputeDate(dispute.createdAt)}</strong>
            </div>
            <div>
              <span>Raised by</span>
              <strong>{dispute.raisedBy?.username ?? "Buyer"}</strong>
            </div>
            <div>
              <span>Evidence count</span>
              <strong>{dispute.evidence?.length ?? 0}</strong>
            </div>
          </div>
        </Card>

        <Card className="panel-card">
          <div className="panel-card__header">
            <div>
              <h3>Product Details</h3>
              <p>The product connected to this disputed transaction.</p>
            </div>
          </div>

          <div className="dispute-product-row">
            <img
              src={getDisputeImage(dispute.transaction?.product)}
              alt={dispute.transaction?.productName ?? "Product"}
              className="disputes-card__image"
            />
            <div className="disputes-card__content">
              <strong>{dispute.transaction?.productName ?? "Protected transaction"}</strong>
              <span>Seller: {dispute.transaction?.seller?.username ?? "Not available"}</span>
              <span>
                Agreed price: Rs. {dispute.transaction?.agreedPrice.toLocaleString() ?? "0"}
              </span>
              <span>
                Transaction status:{" "}
                {dispute.transaction?.status
                  ? formatTransactionStatus(dispute.transaction.status)
                  : "Not available"}
              </span>
            </div>
          </div>
        </Card>
      </section>

      <section className="buyer-main-grid">
        <Card className="panel-card">
          <div className="panel-card__header">
            <div>
              <h3>Buyer Description</h3>
              <p>The issue reported for review.</p>
            </div>
          </div>
          <p className="disputes-card__description">{dispute.description}</p>
        </Card>

        <Card className="panel-card">
          <div className="panel-card__header">
            <div>
              <h3>Review Status</h3>
              <p>Seller response, admin notes, and final resolution.</p>
            </div>
          </div>
          <div className="dispute-detail-grid">
            <div>
              <span>Seller response</span>
              <strong>No seller response is available in the current backend response.</strong>
            </div>
            <div>
              <span>Admin review status</span>
              <strong>{formatDisputeStatus(dispute.status)}</strong>
            </div>
            <div>
              <span>Final resolution</span>
              <strong>{dispute.adminNote ?? "No final resolution note yet."}</strong>
            </div>
            <div>
              <span>Resolved at</span>
              <strong>{formatDisputeDate(dispute.resolvedAt)}</strong>
            </div>
          </div>
        </Card>
      </section>

      <section className="panel-card disputes-panel ui-card">
        <div className="panel-card__header">
          <div>
            <h3>Uploaded Evidence</h3>
            <p>Files attached to support this case.</p>
          </div>
        </div>

        {dispute.evidence && dispute.evidence.length > 0 ? (
          <div className="dispute-evidence-list">
            {dispute.evidence.map((evidence) => (
              <div key={evidence.id} className="dispute-evidence-item">
                <strong>{evidence.originalName}</strong>
                <span>{evidence.mimeType}</span>
                <span>
                  {(evidence.sizeBytes / 1024).toFixed(1)} KB uploaded{" "}
                  {formatDisputeDate(evidence.createdAt)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <Card className="marketplace-empty-state purchases-empty-state">
            <Badge variant="info">No evidence yet</Badge>
            <h3>No files have been uploaded for this dispute.</h3>
            <p>Add supporting screenshots, photos, or documents while the dispute is still active.</p>
          </Card>
        )}

        {canUploadEvidence ? (
          <form className="dispute-upload-form" onSubmit={handleUpload}>
            <label className="dispute-upload-form__field">
              <span>Add evidence</span>
              <input type="file" onChange={handleFileChange} />
            </label>
            <Button type="submit" disabled={!selectedFile || isUploading}>
              {isUploading ? "Uploading..." : "Upload Evidence"}
            </Button>
          </form>
        ) : null}
      </section>
    </div>
  );
}
