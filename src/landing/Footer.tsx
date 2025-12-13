//@ts-nocheck
import React from "react";
import { motion } from "framer-motion";
import {
  AiFillYoutube,
  AiFillInstagram,
  AiFillTwitterCircle,
} from "react-icons/ai";
import { BsFacebook } from "react-icons/bs";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  const socialLinks = [
    {
      icon: <BsFacebook />,
      to: "https://www.facebook.com/deepnapsoftech",
      label: "Facebook",
      color: "hover:text-blue-600",
    },
    {
      icon: <AiFillInstagram />,
      to: "https://www.instagram.com/deepnapsoftech/",
      label: "Instagram",
      color: "hover:text-pink-600",
    },
    {
      icon: <AiFillTwitterCircle />,
      to: "https://twitter.com/deepnapsoftech",
      label: "Twitter",
      color: "hover:text-sky-500",
    },
    {
      icon: <AiFillYoutube />,
      to: "https://www.youtube.com/@deepnap_softech",
      label: "YouTube",
      color: "hover:text-red-600",
    },
  ];

  const developmentLinks = [
    { label: "Website Design", to: "/web-design" },
    { label: "Logo Design", to: "/logo-development" },
    { label: "Web Development", to: "/web-development" },
    { label: "Software Development", to: "/software" },
    { label: "App Development", to: "/app-dev" },
    { label: "CRM Development", to: "/crm-dev" },
  ];

  const marketingLinks = [
    { label: "Meta Ads", to: "/meta-ads" },
    { label: "Google Ads", to: "/google-ads" },
    { label: "Email Marketing", to: "/email-marketing" },
    { label: "Content Marketing", to: "/content-Marketing" },
    { label: "SEO & SEM", to: "/seo&smo" },
    { label: "PPC", to: "/ppc" },
  ];

  const brandLinks = [
    { label: "Brand Building", to: "/brand" },
    { label: "Public Relations", to: "/public-relation" },
    { label: "ORM", to: "/orm" },
    { label: "Digital Marketing", to: "/digital-marketing" },
    { label: "Influencer Marketing", to: "/influence" },
    { label: "Social Media Presence", to: "/socialmedia" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", to: "/privacy-policy" },
    { label: "Terms & Conditions", to: "/terms" },
  ];

  return (
    <footer
      id="footer"
      className="relative z-50 bg-gradient-to-br from-white via-blue-50 to-blue-100 text-blue-900 border-t border-blue-200 pt-16"
    >
      {/* Floating Glow Lights */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute w-[320px] h-[320px] bg-blue-300 rounded-full blur-3xl -top-36 -right-10 opacity-25 pointer-events-none"
      />

      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute w-[260px] h-[260px] bg-sky-200 rounded-full blur-3xl -bottom-20 -left-10 opacity-20 pointer-events-none"
      />

      {/* Footer Content */}
      <div className="container max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">

          {/* Logo + Social */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer"
              onClick={() => navigate("/")}
            >
              <img
                src="/itsybizz.png"
                alt="Itsybizz Logo"
                className="h-20 w-auto mb-4"
              />
            </motion.div>

            <p className="text-sm text-blue-600 mb-3 font-medium">Follow Us</p>

            <div className="flex space-x-3">
              {socialLinks.map((link, index) => (
                <motion.a
                  key={index}
                  href={link.to}
                  target="_blank"
                  rel="noreferrer"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.25, y: -5 }}
                  className={`rounded-full bg-white shadow-md text-blue-700 ${link.color} p-3 text-xl transition-all`}
                >
                  {link.icon}
                </motion.a>
              ))}
            </div>

            <p className="text-xs text-blue-400 mt-6">
              © 2023 Deepnap Softech
            </p>
          </motion.div>

          {/* Sections */}
          {[
            { title: "Development", links: developmentLinks, route: "development" },
            { title: "Digital Marketing", links: marketingLinks, route: "digital-marketing" },
            { title: "Brand Services", links: brandLinks, route: "become-a-brand" },
            { title: "Resources", links: legalLinks, route: null },
          ].map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
            >
              <p className="font-semibold text-lg text-blue-800 mb-4">{section.title}</p>

              <div className="flex flex-col space-y-2">
                {section.links.map((link, i) => (
                  <motion.a
                    key={i}
                    href={
                      section.route
                        ? `https://www.deepnapsoftech.com/service/${section.route}${link.to}`
                        : link.to
                    }
                    target="_blank"
                    rel="noreferrer"
                    whileHover={{ x: 5 }}
                    className="text-blue-600 hover:text-blue-900 text-sm flex items-center gap-1 font-medium group"
                  >
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                    {link.label}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="h-px my-10 bg-gradient-to-r from-transparent via-blue-300 to-transparent"
      />

      {/* Bottom Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center pb-6 px-4"
      >
        <p className="text-xs text-blue-500 font-medium">
          All rights reserved:{" "}
          <span className="text-blue-700 font-semibold">Itsybizz AI Pvt. Ltd.</span>
        </p>
        <p className="text-xs text-blue-400 mt-1">
          Crafted with <span className="text-red-500">❤️</span> for modern manufacturers
        </p>
      </motion.div>
    </footer>
  );
};

export default Footer;
