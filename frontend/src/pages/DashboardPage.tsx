import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import formatDate from "../utils/date";

const DashboardPage = () => {
  const { user, logout } = useAuthStore();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md p-8 mx-auto mt-10 bg-gray-900 border border-gray-800 shadow-2xl rounded-xl bg-opacity-80 backdrop-blur-lg backdrop-filter"
    >
      <h2 className="mb-6 text-3xl font-bold text-center text-transparent bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text">
        Dashboard
      </h2>

      <div className="space-y-6">
        <div className="p-4 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg">
          <h3 className="mb-3 text-xl font-semibold text-green-400">
            Profile Information
          </h3>
          <p className="text-gray-300">Name: {user?.name}</p>
          <p className="text-gray-300">Email: {user?.email}</p>
        </div>

        <div className="p-4 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg">
          <h3 className="mb-3 text-xl font-semibold text-green-400">
            Account Activity
          </h3>
          <p className="text-gray-300">
            <span className="font-bold">Joined: </span>
            {new Date(user?.createdAt as string).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-gray-300">
            <span className="font-bold">Last Login: </span>
            {formatDate(user?.lastLogin as string)}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => logout()}
          className="w-full px-4 py-3 font-bold text-white rounded-lg shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          Logout
        </motion.button>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
