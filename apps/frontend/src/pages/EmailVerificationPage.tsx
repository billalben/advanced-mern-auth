import { FormEvent, KeyboardEvent, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const VerifyEmailPage = () => {
  const [code, setCode] = useState(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  const { error, isLoading, verifyEmail } = useAuthStore();

  const handlePastedContent = (pastedValue: string) => {
    const newCode = Array.from({ length: 6 }, (_, i) => pastedValue[i] || "");
    setCode(newCode);
    const focusIndex = newCode.findIndex((digit) => digit === "");
    inputRefs.current[focusIndex !== -1 ? focusIndex : 5]?.focus();
  };

  const handleChange = (index: number, value: string) => {
    const newCode = [...code];

    // Handle pasted content
    if (value.length > 1) {
      handlePastedContent(value);
      return;
    }

    newCode[index] = value;
    setCode(newCode);

    // Move focus to the next input field if value is entered
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const verificationCode = code.join("");

    await verifyEmail(verificationCode)
      .then(() => {
        navigate("/login");
        toast.success("Email verified successfully");
      })
      .catch(() => {
        toast.error("Error verifying email");
      });
  };

  return (
    <div className="w-full max-w-md overflow-hidden bg-gray-800 bg-opacity-50 shadow-xl rounded-2xl backdrop-blur-xl backdrop-filter">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 bg-gray-800 bg-opacity-50 shadow-2xl rounded-2xl backdrop-blur-xl backdrop-filter"
      >
        <h2 className="mb-6 text-3xl font-bold text-center text-transparent bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text">
          Verify Your Email
        </h2>
        <p className="mb-6 text-center text-gray-300">
          Enter the 6-digit code sent to your email address.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={6}
                value={digit}
                onChange={(event) => handleChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                className="w-12 h-12 text-2xl font-bold text-center text-white bg-gray-700 border-2 border-gray-600 rounded-lg focus:border-green-500 focus:outline-none"
              />
            ))}
          </div>
          {error && <p className="my-2 font-semibold text-red-500">{error}</p>}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isLoading || code.some((digit) => !digit)}
            className="w-full px-4 py-3 font-bold text-white rounded-lg shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
