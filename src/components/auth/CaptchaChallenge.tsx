import Button from "../common/Button";
import Input from "../common/Input";
import type { CaptchaChallenge as CaptchaChallengeType } from "../../types/auth.types";

type CaptchaChallengeProps = {
  challenge: CaptchaChallengeType | null;
  answer: string;
  onAnswerChange: (value: string) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
};

export default function CaptchaChallenge({
  challenge,
  answer,
  onAnswerChange,
  onRefresh,
  isRefreshing = false,
}: CaptchaChallengeProps) {
  return (
    <div className="auth-captcha ui-card">
      <div className="auth-captcha__header">
        <strong>Human check</strong>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
      <p>{challenge?.prompt ?? "Loading a quick verification challenge..."}</p>
      <Input
        label="CAPTCHA answer"
        value={answer}
        onChange={(event) => onAnswerChange(event.target.value)}
        placeholder="Enter your answer"
        autoComplete="off"
        required
      />
    </div>
  );
}
