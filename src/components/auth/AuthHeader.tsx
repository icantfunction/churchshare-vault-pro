
import { Link } from "react-router-dom";

const AuthHeader = () => {
  return (
    <div className="text-center mb-8">
      <Link to="/" className="text-3xl font-bold text-primary">
        ChurchShare
      </Link>
      <p className="text-gray-600 mt-2">Secure ministry file sharing</p>
    </div>
  );
};

export default AuthHeader;
