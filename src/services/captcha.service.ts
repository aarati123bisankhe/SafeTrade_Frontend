import api from "./api";
import type {
  ApiResponse,
  CaptchaChallenge,
  CaptchaIntent,
} from "../types/auth.types";

export const captchaService = { //captchaService is an object that contains methods for interacting with the captcha API.
  async getChallenge(intent: CaptchaIntent): Promise<CaptchaChallenge> {
    const { data } = await api.get<ApiResponse<CaptchaChallenge>>(
      "/auth/captcha",
      {
        params: {
          intent,
        },
      },
    );

    return data.data;
  },
};

export default captchaService;
