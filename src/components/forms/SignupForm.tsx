import { AuthForm } from "@/components/auth/AuthForm";
import { useNavigate } from "react-router-dom";

export const SignupForm = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/community");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <AuthForm onSuccess={handleSuccess} />
    </div>
  );
};