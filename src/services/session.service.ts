import api from "./api";
import type { ActiveSession, ApiResponse } from "../types/auth.types";

export const sessionService = {
  async getSessions(): Promise<ActiveSession[]> {
    const { data } = await api.get<
      ApiResponse<null> & { sessions: ActiveSession[] }
    >("/auth/sessions");

    return data.sessions;
  },

  async revokeCurrentSession(): Promise<void> {
    await api.delete("/auth/sessions/current");
  },

  async revokeSession(sessionId: string): Promise<void> {
    await api.delete(`/auth/sessions/${sessionId}`);
  },

  async revokeOtherSessions(): Promise<void> {
    await api.delete("/auth/sessions/others");
  },
};

export default sessionService;
