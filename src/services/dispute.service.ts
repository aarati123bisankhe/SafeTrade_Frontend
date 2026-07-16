import api from "./api";
import type { ApiResponse } from "../types/auth.types";
import type {
  CreateDisputeRequest,
  Dispute,
  DisputeEvidence,
  ResolveDisputeRequest,
} from "../types/dispute.types";

const disputeService = {
  async getMyDisputes(): Promise<Dispute[]> {
    const { data } = await api.get<ApiResponse<Dispute[]>>("/disputes/my-disputes");
    return data.data;
  },

  async getDisputeById(disputeId: string): Promise<Dispute> {
    const { data } = await api.get<ApiResponse<Dispute>>(`/disputes/${disputeId}`);
    return data.data;
  },

  async createDispute(payload: CreateDisputeRequest): Promise<Dispute> {
    const { data } = await api.post<ApiResponse<Dispute>>("/disputes", payload);
    return data.data;
  },

  async markUnderReview(disputeId: string): Promise<Dispute> {
    const { data } = await api.patch<ApiResponse<Dispute>>(
      `/disputes/${disputeId}/review`
    );
    return data.data;
  },

  async resolveDispute(
    disputeId: string,
    payload: ResolveDisputeRequest
  ): Promise<Dispute> {
    const { data } = await api.patch<ApiResponse<Dispute>>(
      `/disputes/${disputeId}/resolve`,
      payload
    );
    return data.data;
  },

  async listEvidence(disputeId: string): Promise<DisputeEvidence[]> {
    const { data } = await api.get<ApiResponse<DisputeEvidence[]>>(
      `/disputes/${disputeId}/evidence`
    );
    return data.data;
  },

  async downloadEvidence(
    disputeId: string,
    evidenceId: string,
    originalName: string
  ): Promise<void> {
    const response = await api.get<Blob>(
      `/disputes/${disputeId}/evidence/${evidenceId}`,
      {
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");

    link.href = url;
    link.download = originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  async uploadEvidence(disputeId: string, file: File): Promise<DisputeEvidence> {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await api.post<ApiResponse<DisputeEvidence>>(
      `/disputes/${disputeId}/evidence`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return data.data;
  },
};

export default disputeService;
