import Button from "../common/Button";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function SocialLoginButton() {
  const handleGoogleSignIn = () => {
    if (!API_BASE_URL) {
      return;
    }

    window.location.assign(`${API_BASE_URL}/auth/google`);
  };

  return (
    <Button
      type="button"
      variant="secondary"
      fullWidth
      className="social-login-button"
      onClick={handleGoogleSignIn}
    >
      <span aria-hidden="true">G</span>
      Continue with Google
    </Button>
  );
}
