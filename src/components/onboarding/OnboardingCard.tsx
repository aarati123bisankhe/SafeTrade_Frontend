type OnboardingCardProps = {
  title: string;
  description: string;
  eyebrow: string;
};

export default function OnboardingCard({ //onboarding card component
  title,
  description,
  eyebrow,
}: OnboardingCardProps) {
  return (
    <div className="onboarding-card">
      <span className="onboarding-card__eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}
