//@ts-nocheck
import { motion } from "framer-motion";
import { TrendingUp, Zap, Factory, ShieldCheck } from "lucide-react";

export default function AboutSection() {
  const stats = [
    { label: "Realtime Productions Tracked", value: "12,000+", icon: TrendingUp },
    { label: "Automation Triggers Executed", value: "48,000+", icon: Zap },
    { label: "Active Manufacturing Units", value: "650+", icon: Factory },
    { label: "Uptime Accuracy", value: "99.9%", icon: ShieldCheck },
  ];

  return (
    <section
      id="about"
      className="relative w-full min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 px-6 py-28 flex flex-col items-center overflow-hidden"
    >
      {/* Background Glow Effects */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.12 }}
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(56,149,255,0.35),transparent_60%)]"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.12 }}
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_70%,rgba(0,148,255,0.25),transparent_60%)]"
      />

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: -40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-4xl md:text-6xl font-bold text-center max-w-4xl mb-6 text-blue-900 leading-tight"
      >
        Powering the Future of
        <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-sky-400 to-blue-600">
          Smart Manufacturing & Automation
        </span>
      </motion.h1>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.75 }}
        className="text-blue-700 max-w-2xl text-center text-lg md:text-xl leading-relaxed"
      >
        We help factories unlock intelligent production. With real-time
        monitoring, automated decision systems and a scalable cloud-native
        architecture — manufacturing becomes smarter, faster, and more efficient.
      </motion.p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mt-20 w-full max-w-6xl">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.6,
              delay: i * 0.15,
              type: "spring",
            }}
            className="group bg-white/60 backdrop-blur-md border border-white/50 shadow-lg hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 rounded-2xl px-8 py-10 text-center cursor-default"
          >
            {/* Icon */}
            <div className="flex justify-center mb-5">
              <stat.icon className="w-10 h-10 text-blue-600 group-hover:text-blue-700 transition" />
            </div>

            {/* Value */}
            <h2 className="text-3xl md:text-4xl font-extrabold text-blue-900">
              {stat.value}
            </h2>

            {/* Label */}
            <p className="text-blue-700 mt-2 text-sm font-medium">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
