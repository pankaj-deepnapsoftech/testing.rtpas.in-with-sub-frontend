//@ts-nocheck
import { motion } from "framer-motion";
import {
  Monitor,
  Clock,
  Settings,
  Cpu,
  Eye,
  Brain,
  BarChart3,
} from "lucide-react";

export default function AboutSection() {
  const products = [
    {
      title: "Real-Time Production Automation Suite",
      description:
        "A comprehensive automation platform that integrates machines, workforce, and management into a single ecosystem. It delivers live production tracking, device integration, machine-level data acquisition, performance analytics, attendance syncing, HR integration, and intelligent reporting.",
      icon: Monitor,
    },
    {
      title: "Shift-Oriented Production Automation Suite",
      description:
        "Designed for industries working in shift-based environments. It ensures seamless planning, monitoring, and execution of production tasks across shifts with optimized workflows, real-time shift reports, token and payment verification, and delivery tracking.",
      icon: Clock,
    },
    {
      title: "Kontrolix",
      description:
        "Our advanced automation and control system built for organizations seeking precision, compliance, and top-tier efficiency. From managing machine-level interactions to enabling oversight for supervisors and plant managers.",
      icon: Settings,
    },
  ];

  // const features = [
  //   { label: "Real-Time Visibility", icon: Eye },
  //   { label: "Intelligent Automation", icon: Cpu },
  //   { label: "AI-Powered Ecosystems", icon: Brain },
  //   { label: "Data-Driven Decisions", icon: BarChart3 },
  // ];

  return (
    <section
      id="about"
      className="relative w-full bg-gradient-to-b from-blue-50 via-white to-blue-100 px-6 py-28 flex flex-col items-center overflow-hidden"
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
        About Us –
        <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-sky-400 to-blue-600">
          ITSYBIZZ AI PRIVATE LIMITED
        </span>
      </motion.h1>

      {/* Main Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.75 }}
        className="text-blue-700 max-w-4xl text-center text-lg md:text-xl leading-relaxed mb-6"
      >
        ITSYBIZZ AI Private Limited is a technology-driven company dedicated to
        transforming the way modern industries operate through intelligent
        automation and real-time data insights. Powered by innovation and backed
        by Deepnap Softech's technological expertise, ITSYBIZZ specializes in
        building advanced industrial automation solutions that help
        manufacturing units achieve higher efficiency, accuracy, and
        productivity.
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.75, delay: 0.1 }}
        className="text-blue-600 max-w-4xl text-center text-base md:text-lg leading-relaxed"
      >
        At ITSYBIZZ, we develop cutting-edge automation products designed to
        simplify complex operations, eliminate manual dependencies, and enable
        continuous monitoring across the production lifecycle. Our core vision
        is to empower industries with AI-enabled tools that ensure transparency,
        accountability, and operational excellence.
      </motion.p>

      {/* Flagship Products Section */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-2xl md:text-4xl font-bold text-blue-900 mt-20 mb-12 text-center"
      >
        Our Flagship Products
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {products.map((product, i) => (
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
            className="group bg-white/70 backdrop-blur-md border border-white/50 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 rounded-2xl p-8 cursor-default"
          >
            {/* Icon */}
            <div className="flex justify-center mb-5">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-sky-400 rounded-xl shadow-lg">
                <product.icon className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-blue-900 text-center mb-4">
              {product.title}
            </h3>

            {/* Description */}
            <p className="text-blue-700 text-sm leading-relaxed text-center">
              {product.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Mission Statement */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="mt-20 bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600 rounded-3xl p-10 md:p-14 max-w-5xl w-full text-center shadow-2xl"
      >
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
          Our Mission
        </h3>
        <p className="text-white/90 text-lg md:text-xl leading-relaxed mb-6">
          At ITSYBIZZ AI Private Limited, we believe the future of manufacturing
          lies in real-time visibility, intelligent automation, and data-driven
          decisions. Our mission is to help industries move from traditional
          manual processes to fully automated, AI-powered ecosystems.
        </p>
        <p className="text-white font-bold text-xl md:text-2xl">
          ITSYBIZZ – Automating the Future of Production.
        </p>
      </motion.div>

      {/* Features Grid */}
      {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 w-full max-w-4xl">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.5,
              delay: i * 0.1,
            }}
            className="flex flex-col items-center p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-blue-100 hover:border-blue-300 transition-colors"
          >
            <feature.icon className="w-8 h-8 text-blue-600 mb-3" />
            <span className="text-blue-800 font-medium text-sm text-center">
              {feature.label}
            </span>
          </motion.div>
        ))}
      </div> */}
    </section>
  );
}
