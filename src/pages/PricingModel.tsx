//@ts-nocheck
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const navigate = useNavigate();
  const [cookies] = useCookies();
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<any>(null);
  // usersCount now represents the number of ADDITIONAL users the buyer wants to add (not total)
  const [usersCount, setUsersCount] = useState<number>(0);
  const [computedAmountPaise, setComputedAmountPaise] = useState<number>(0);

  // helper: parse included users from plan.features (looks for "Users (N)")
  const getIncludedUsers = (plan) => {
    try {
      const usersFeature = plan.features?.find((f) =>
        typeof f.name === "string" && f.name.toLowerCase().startsWith("users")
      );
      if (!usersFeature) return 1;
      const m = usersFeature.name.match(/\((\d+)\)/);
      if (m && m[1]) return parseInt(m[1], 10);
      if (typeof usersFeature.included === "number") return usersFeature.included;
      return 1;
    } catch (e) {
      return 1;
    }
  };

  // helper: find per-user extra charge (search feature like "Charges for Additional Users ₹1000/user")
  const getPerUserCharge = (plan) => {
    try {
      const chargeFeature = plan.features?.find((f) =>
        typeof f.name === "string" &&
        f.name.toLowerCase().includes("additional user")
      );
      if (!chargeFeature) {
        return 1000;
      }
      const m = chargeFeature.name.replace(/,/g, "").match(/₹\s*([0-9]+)/);
      if (m && m[1]) return parseInt(m[1], 10);
      return 1000;
    } catch (e) {
      return 1000;
    }
  };

  // Load Razorpay checkout script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  // Handle payment when user clicks a plan's button
  const handleBuy = async (plan) => {
    const rawPrice = String(plan.price || "0").replace(/[^0-9]/g, "");
    const amountNumber = parseInt(rawPrice || "0", 10);
    if (!amountNumber || amountNumber === 0) {
      alert(`${plan.name} is free. Start your free trial!`);
      return;
    }

    setPendingPlan(plan);

    // Important: do NOT prefill with included users. usersCount = additional users (default 0)
    setUsersCount(0);

    // compute initial computed amount paise (base price + 0 extra users)
    const basePriceRupees = parseInt(String(plan.price || "0").replace(/[^0-9]/g, ""), 10) || 0;
    setComputedAmountPaise(basePriceRupees * 100);

    setIsUsersModalOpen(true);
  };

  const proceedPayment = async () => {
    if (!pendingPlan) return;

    // base price rupees extracted from displayed plan.price (works for monthly/yearly because you generate plans above)
    const basePriceRupees = parseInt(String(pendingPlan.price || "0").replace(/[^0-9]/g, ""), 10) || 0;

    // included users from plan
    const includedUsers = getIncludedUsers(pendingPlan) || 1;
    const perUserCharge = getPerUserCharge(pendingPlan) || 1000; // rupees per additional user

    // usersCount is additional users; compute totals
    const additionalUsers = Math.max(0, Math.floor(usersCount || 0));
    const totalUsers = includedUsers + additionalUsers;

    // calculate total rupees: base plan + extra users * perUserCharge
    const totalRupees = basePriceRupees + additionalUsers * perUserCharge;
    const totalAmountPaise = totalRupees * 100;

    const ok = await loadRazorpayScript();
    if (!ok) {
      alert("Failed to load Razorpay SDK. Please try again later.");
      return;
    }

    try {
      const apiBase = process.env.REACT_APP_BACKEND_URL || "";
      const base = apiBase ? apiBase.replace(/\/$/, "") : "";
      const token = cookies.access_token || null;

      // Send totalUsers to backend (this is the total allowed users after purchase)
      const createResp = await fetch(`${base}/subscription/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          plan: pendingPlan.name,
          amount: totalAmountPaise,
          period: isYearly ? "year" : "month",
          // send total allowed users (included + additional) — the backend can persist this
          allowedUsers: Math.max(1, totalUsers),
        }),
      });

      if (!createResp.ok) {
        const errText = await createResp.text();
        throw new Error(`Create order failed: ${errText}`);
      }

      const { data } = await createResp.json();
      const orderId = data?.orderId;
      const orderAmount = data?.amount ?? totalAmountPaise;

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY || "YOUR_RAZORPAY_KEY",
        amount: orderAmount,
        currency: "INR",
        name: "RTPAS",
        description: pendingPlan.name,
        order_id: orderId,
        handler: async function (response) {
          try {
            const apiBase = process.env.REACT_APP_BACKEND_URL || "";
            const base = apiBase ? apiBase.replace(/\/$/, "") : "";
            const token = cookies.access_token || null;
            const verifyResp = await fetch(`${base}/subscription/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              // backend verify can also use allowedUsers if you want to persist after verify
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                // include totalUsers so verify endpoint can persist final user count if desired
                allowedUsers: Math.max(1, totalUsers),
              }),
            });

            if (!verifyResp.ok) {
              const err = await verifyResp.text();
              alert("Payment verification failed: " + err);
              return;
            }

            const verifyJson = await verifyResp.json();
            if (verifyJson?.success) {
              alert("Payment successful and verified.");
              window.location.href = "/";
            } else {
              alert("Payment processed but verification failed.");
            }
          } catch (e) {
            alert("Payment verification failed: " + e);
            return;
          }
        },
        theme: { color: "#2563eb" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      alert("Unable to start payment: " + (e.message || e));
    } finally {
      setIsUsersModalOpen(false);
      setPendingPlan(null);
    }
  };

  // ✅ Individual Plan Data — each card fully independent
  const plansMonthly = [
    {
      name: "KONTROLIX",
      price: "₹999",
      period: "/month",
      button: "Choose KONTROLIX",
      highlight: false,
      features: [
        { name: "Dashboard Access", included: true },
        { name: "Sensors Integration", included: true },
        { name: "Resource Status Monitoring", included: true },
        { name: "Machine ON/OFF Control (Remote)", included: true },
        { name: "View Production Data from Anywhere", included: true },
        { name: "Machine Logs & Error Reports", included: true },
        { name: "Real-Time Production Monitoring", included: true },
        { name: "Production Monitoring", included: true },
        { name: "Employee Management", included: false },
        { name: "User Roles & Permissions", included: false },
        { name: "Resource Management", included: false },
        { name: "Work In Progress Tracking", included: false },
        { name: "Store & Inventory Management", included: false },
        { name: "Inventory Approvals", included: false },
        { name: "Scrap Management", included: false },
        { name: "Sales Order Management", included: false },
        { name: "Procurement", included: false },
        { name: "Production Module", included: false },
        { name: "Bill of Materials (BOM)", included: false },
        { name: "Pre-Production Management", included: false },
        { name: "Dispatch & Delivery Tracking", included: false },
        { name: "Accounts & Finance", included: false },
        { name: "Proforma Invoice", included: false },
        { name: "Tax Invoice", included: false },
        { name: "Payments Module", included: false },
        { name: "Admin Approvals", included: false },
        { name: "User Profile & Settings", included: false },
        { name: "Users (5)", included: true },
        { name: "Custom Integrations (Attendance, HR, CRM)", included: false },
        { name: "Cloud Access (Web + Mobile)", included: true },
        { name: "Support Type", included: "Standard" },
      ],
    },
    {
      name: "SOPAS",
      price: "₹1999",
      period: "/month",
      button: "Choose SOPAS",
      highlight: true,
      features: [
        { name: "Dashboard Access", included: true },
        { name: "Sensors Integration", included: false },
        { name: "Resource Status Monitoring", included: false },
        { name: "Machine ON/OFF Control (Remote)", included: false },
        { name: "View Production Data from Anywhere", included: false },
        { name: "Machine Logs & Error Reports", included: false },
        { name: "Real-Time Production Monitoring", included: false },
        { name: "Production Monitoring", included: true },
        { name: "Employee Management", included: true },
        { name: "User Roles & Permissions", included: true },
        { name: "Resource Management", included: true },
        { name: "Work In Progress Tracking", included: true },
        { name: "Store & Inventory Management", included: true },
        { name: "Inventory Approvals", included: true },
        { name: "Scrap Management", included: true },
        { name: "Sales Order Management", included: true },
        { name: "Procurement", included: true },
        { name: "Production Module", included: true },
        { name: "Bill of Materials (BOM)", included: true },
        { name: "Pre-Production Management", included: true },
        { name: "Dispatch & Delivery Tracking", included: true },
        { name: "Accounts & Finance", included: true },
        { name: "Proforma Invoice", included: true },
        { name: "Tax Invoice", included: true },
        { name: "Payments Module", included: true },
        { name: "Admin Approvals", included: true },
        { name: "User Profile & Settings", included: true },
        { name: "Users (5)", included: true },
        { name: "Charges for Additional Users ₹1000/user", included: true },
        { name: "Custom Integrations (Attendance, HR, CRM)", included: true },
        { name: "Cloud Access (Web + Mobile)", included: true },
        { name: "Support Type", included: "Standard" },
      ],
    },
    {
      name: "RTPAS",
      price: "₹4999",
      period: "/month",
      button: "Choose RTPAS",
      highlight: false,
      features: [
        { name: "Dashboard Access", included: true },
        { name: "Sensors Integration", included: true },
        { name: "Resource Status Monitoring", included: true },
        { name: "Machine ON/OFF Control (Remote)", included: true },
        { name: "View Production Data from Anywhere", included: true },
        { name: "Machine Logs & Error Reports", included: true },
        { name: "Real-Time Production Monitoring", included: true },
        { name: "Production Monitoring", included: true },
        { name: "Employee Management", included: true },
        { name: "User Roles & Permissions", included: true },
        { name: "Resource Management", included: true },
        { name: "Work In Progress Tracking", included: true },
        { name: "Store & Inventory Management", included: true },
        { name: "Inventory Approvals", included: true },
        { name: "Scrap Management", included: true },
        { name: "Sales Order Management", included: true },
        { name: "Procurement", included: true },
        { name: "Production Module", included: true },
        { name: "Bill of Materials (BOM)", included: true },
        { name: "Pre-Production Management", included: true },
        { name: "Dispatch & Delivery Tracking", included: true },
        { name: "Accounts & Finance", included: true },
        { name: "Proforma Invoice", included: true },
        { name: "Tax Invoice", included: true },
        { name: "Payments Module", included: true },
        { name: "Admin Approvals", included: true },
        { name: "User Profile & Settings", included: true },
        { name: "Users (7)", included: true },
        { name: "Custom Integrations (Attendance, HR, CRM)", included: true },
        { name: "Cloud Access (Web + Mobile)", included: true },
        { name: "Support Type", included: "Priority" },
      ],
    },
  ];

  const plansYearly = plansMonthly.map((p) => ({
    ...p,
    price:
      p.name === "Free Trial"
        ? "₹0"
        : `₹${parseInt(p.price.replace(/[₹,]/g, "")) * 10}`,
    period: p.name === "Free Trial" ? "for 14 days" : "/year",
  }));

  const plans = isYearly ? plansYearly : plansMonthly;

  // compute displayed estimated rupees for modal (base + additional users)
  const computeEstimatedRupees = () => {
    if (!pendingPlan) return 0;
    const basePrice = parseInt(String(pendingPlan.price || "0").replace(/[^0-9]/g, ""), 10) || 0;
    const included = getIncludedUsers(pendingPlan) || 1;
    const perUser = getPerUserCharge(pendingPlan) || 1000;
    const extra = Math.max(0, Math.floor(usersCount || 0));
    return basePrice + extra * perUser;
  };

  return (
    <section className="relative bg-gradient-to-b from-blue-100 to-white py-24 px-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-200/40 blur-3xl rounded-full"></div>

      {/* 🔹 Global Close Button (top-right corner) */}
      <button
        className="absolute top-6 right-6 bg-white/70 hover:bg-blue-100 p-2 rounded-full shadow-md transition"
        onClick={() => navigate("/")} // 👉 Replace with your own logic
      >
        <X className="w-6 h-6 text-blue-700" />
      </button>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-extrabold text-blue-900 text-center mb-6"
        >
          RTPAS Pricing Plans
        </motion.h2>

        <p className="text-center text-blue-700 text-lg mb-10">
          Choose the plan that fits your automation workflow.
        </p>

        {/* Toggle Monthly / Yearly */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex bg-white/60 backdrop-blur-xl border border-blue-200 shadow-lg rounded-2xl p-1">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                !isYearly
                  ? "bg-blue-600 text-white shadow-lg scale-105"
                  : "text-blue-700 hover:bg-blue-100"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                isYearly
                  ? "bg-blue-600 text-white shadow-lg scale-105"
                  : "text-blue-700 hover:bg-blue-100"
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative rounded-3xl p-8 flex flex-col border backdrop-blur-2xl transition-all duration-300 ${
                plan.highlight
                  ? "border-blue-600 bg-white/80 shadow-2xl scale-105"
                  : "border-blue-200 bg-white/70 shadow-xl hover:scale-[1.03]"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-4 py-1 rounded-full shadow-lg">
                  Most Popular
                </span>
              )}

              <h3 className="text-2xl font-bold text-blue-800 text-center">
                {plan.name}
              </h3>

              <div className="flex justify-center items-baseline mt-4 mb-6">
                <span className="text-5xl font-extrabold text-blue-900">
                  {plan.price}
                </span>
                <span className="text-blue-600 ml-2">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-blue-800 text-sm"
                  >
                    {f.included === true ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : f.included === false ? (
                      <X className="w-5 h-5 text-red-500" />
                    ) : (
                      <span className="text-blue-700 font-semibold ml-2">
                        {f.included}
                      </span>
                    )}
                    {typeof f.included === "boolean" && (
                      <span
                        className={`${
                          f.included
                            ? "font-medium"
                            : "line-through text-blue-400"
                        }`}
                      >
                        {f.name}
                      </span>
                    )}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleBuy(plan)}
                className={`mt-auto w-full py-3 rounded-xl font-semibold shadow-md transition-all ${
                  plan.highlight
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-blue-100 text-blue-900 hover:bg-blue-200"
                }`}
              >
                {plan.button}
              </button>
            </motion.div>
          ))}
        </div>

        {isUsersModalOpen && pendingPlan && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <h4 className="text-xl font-semibold mb-4">Add Additional Employees</h4>
              <p className="text-sm mb-3">
                Enter how many additional employee accounts you want to add to this subscription.
              </p>

              {/* Show included users (informational only) but DO NOT prefill input */}
              <div className="mb-3 text-sm">
                <span className="font-medium">Included users in plan:</span>{" "}
                {getIncludedUsers(pendingPlan)}{" "}
                <span className="text-gray-500">(already part of the plan)</span>
              </div>

              <input
                type="number"
                value={usersCount}
                min={0}
                onChange={(e) =>
                  setUsersCount(Math.max(0, parseInt(e.target.value || "0", 10)))
                }
                className="w-full border rounded-lg px-3 py-2 mb-4"
                placeholder="Enter additional users (0 if none)"
              />

              <div className="text-sm mb-4">
                <div>
                  <span className="font-medium">Per additional user:</span>{" "}
                  ₹{getPerUserCharge(pendingPlan).toLocaleString()}{" "}
                  <span className="text-gray-500">/user</span>
                </div>
                <div className="mt-2">
                  <span className="font-medium">Estimated total amount:</span>{" "}
                  ₹{computeEstimatedRupees().toLocaleString()}{" "}
                  <span className="text-gray-500">
                    {isYearly ? "/year" : "/month"}
                  </span>
                </div>

                {/* show breakdown */}
                <div className="mt-2 text-xs text-gray-600">
                  {`Total users after purchase: ${getIncludedUsers(pendingPlan) + Math.max(0, Math.floor(usersCount || 0))} (Included ${getIncludedUsers(pendingPlan)} + Additional ${Math.max(0, Math.floor(usersCount || 0))})`}
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  className="px-4 py-2 rounded-lg border"
                  onClick={() => setIsUsersModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white"
                  onClick={proceedPayment}
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
