
interface AuthLoadingSpinnerProps {
  message: string;
}

const AuthLoadingSpinner = ({ message }: AuthLoadingSpinnerProps) => {
  return (
    <div className="min-h-screen bg-background font-poppins flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default AuthLoadingSpinner;
