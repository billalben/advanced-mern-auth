import { motion } from "framer-motion";
import Input from "../components/Input";
import { Loader, Lock, Mail, User } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import { useAuthStore } from "../store/authStore";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const { register, error, isLoading } = useAuthStore();

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || !email || !password) {
      alert("All fields are required.");
      return;
    }

    try {
      await register(email, password, name);
      navigate("/verify-email");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md overflow-hidden bg-gray-800 bg-opacity-50 shadow-xl rounded-2xl backdrop-blur-xl backdrop-filter"
    >
      <div className="p-8">
        <h2 className="mb-6 text-3xl font-bold text-center text-transparent bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text">
          Create Account
        </h2>

        <form onSubmit={handleRegister}>
          <Input
            icon={User}
            type="text"
            placeholder="Full Name"
            required
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setName(e.target.value)
            }
            aria-invalid={!!error}
          />
          <Input
            icon={Mail}
            type="email"
            placeholder="Email Address"
            required
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            aria-invalid={!!error}
          />
          <Input
            icon={Lock}
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            aria-invalid={!!error}
          />
          {error && <p className="mt-2 font-semibold text-red-500">{error}</p>}

          <PasswordStrengthMeter password={password} />

          <motion.button
            className="w-full px-4 py-3 mt-5 font-bold text-white transition duration-200 rounded-lg shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <Loader className="mx-auto animate-spin" size={24} />
            ) : (
              "Sign Up"
            )}
          </motion.button>
        </form>
      </div>
      <div className="flex justify-center px-8 py-4 bg-gray-900 bg-opacity-50">
        <p className="text-sm text-gray-400">
          Already have an account?{" "}
          <Link to={"/login"} className="text-green-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default RegisterPage;
