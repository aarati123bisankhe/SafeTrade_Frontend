import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Navbar from "../../components/layout/Navbar";
import OnboardingCard from "../../components/onboarding/OnboardingCard";
import OnboardingProgress from "../../components/onboarding/OnboardingProgress";

const steps = [
  {
    heading: "Discover Local Products",
    description:
      "Browse books, electronics, clothing, furniture, handmade products, and more from local sellers.",
    eyebrow: "Step 1",
    highlights: ["Books", "Electronics", "Furniture"],
  },
  {
    heading: "Your Payment Stays Protected",
    description:
      "SafeTrade holds the payment in escrow until you confirm that you received the product.",
    eyebrow: "Step 2",
    highlights: ["Escrow secured", "Funds held", "Release on confirmation"],
  },
  {
    heading: "Resolve Problems Fairly",
    description:
      "Raise a dispute when something goes wrong, submit evidence, and receive support from SafeTrade administrators.",
    eyebrow: "Step 3",
    highlights: ["Evidence uploads", "Admin review", "Clear outcomes"],
  },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      navigate("/register");
      return;
    }

    setCurrentStep((step) => step + 1);
  };

  const handleBack = () => {
    if (isFirstStep) {
      navigate("/");
      return;
    }

    setCurrentStep((step) => step - 1);
  };

  const handleSkip = () => {
    navigate("/register");
  };

  return (
    <div className="landing-shell">
      <Navbar />

      <main className="onboarding-page">
        <Card className="onboarding-layout">
          <section className="onboarding-visual">
            <span className="section-tag">SafeTrade onboarding</span>
            <h1>Learn the protection behind every SafeTrade transaction.</h1>
            <p>
              SafeTrade helps buyers and sellers trade locally with clearer
              transaction steps, protected escrow, and reliable dispute support.
            </p>

            <div className="onboarding-visual__panel">
              <span className="onboarding-visual__status">Escrow protection active</span>
              <div className="onboarding-visual__highlights">
                {steps[currentStep].highlights.map((highlight) => (
                  <span key={highlight}>{highlight}</span>
                ))}
              </div>
            </div>
          </section>

          <section className="onboarding-content">
            <div className="onboarding-content__top">
              <div>
                <span className="section-tag">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <OnboardingCard
                  eyebrow={steps[currentStep].eyebrow}
                  title={steps[currentStep].heading}
                  description={steps[currentStep].description}
                />
              </div>
              <OnboardingProgress
                currentStep={currentStep + 1}
                totalSteps={steps.length}
              />
            </div>

            <div className="onboarding-actions">
              <Button variant="ghost" onClick={handleSkip}>
                Skip
              </Button>
              <div className="onboarding-actions__group">
                <Button variant="secondary" onClick={handleBack}>
                  Back
                </Button>
                <Button onClick={handleNext}>
                  {isLastStep ? "Get Started" : "Next"}
                </Button>
              </div>
            </div>

            <div className="onboarding-footer">
              <Button to="/register" variant="success">
                Create Account
              </Button>
              <p>
                Already have an account? <Link to="/login">Sign in</Link>
              </p>
            </div>
          </section>
        </Card>
      </main>
    </div>
  );
}
