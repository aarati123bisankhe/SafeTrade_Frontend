type OnboardingProgressProps = {
  currentStep: number;
  totalSteps: number;
};

export default function OnboardingProgress({
  currentStep,
  totalSteps,
}: OnboardingProgressProps) {
  return (
    <div className="onboarding-progress" aria-label="Onboarding progress">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isComplete = stepNumber < currentStep;

        return (
          <span
            key={stepNumber}
            className={[
              "onboarding-progress__dot",
              isActive ? "onboarding-progress__dot--active" : "",
              isComplete ? "onboarding-progress__dot--complete" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          />
        );
      })}
    </div>
  );
}
