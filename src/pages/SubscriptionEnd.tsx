import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

const SubscriptionExpired: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-rose-100 px-6">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex justify-center mb-4"
        >
          <AlertTriangle className="w-16 h-16 text-red-500" />
        </motion.div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          Subscription Expired
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-6">
          Your subscription has expired. To continue accessing all premium 
          features and services, please renew or upgrade your plan.
        </p>

        {/* Button */}
        <motion.button
          whileHover={{
            scale: 1.05,
            backgroundColor: "#dc2626", // red-600
            color: "#fff",
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/pricing-modal")}
          className="px-6 py-2 rounded-full bg-red-600 text-white font-medium shadow-md hover:shadow-lg transition"
        >
          Renew / Upgrade Plan
        </motion.button>
      </motion.div>

      {/* Footer */}
      <p className="mt-6 text-gray-500 text-sm">
        © {new Date().getFullYear()} Deepnap Softech. All rights reserved.
      </p>
    </div>
  );
};

export default SubscriptionExpired;