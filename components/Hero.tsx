"use client"

import { motion } from "framer-motion"
import { TypeAnimation } from "react-type-animation"
import { Github, Linkedin, Twitter } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Gradient orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/30 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
            Jonathan Santos
          </h1>

          <div className="text-2xl md:text-4xl font-light mb-8 min-h-[60px]">
            <TypeAnimation
              sequence={[
                "React.js",
                1000,
                "Next.js",
                1000,
                "React Native",
                1000,
                "Full Stack",
                1000,
              ]}
              wrapper="span"
              speed={50}
              repeat={Number.POSITIVE_INFINITY}
            />
          </div>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12">
            Building modern web and mobile applications with cutting-edge technologies. Passionate about creating
            seamless user experiences and scalable solutions.
          </p>

          <div className="flex items-center justify-center space-x-6">
            <motion.a
              href="https://github.com/srliath"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 p-4 rounded-full hover:bg-white/20 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Github className="w-6 h-6" />
            </motion.a>
            <motion.a
              href="https://linkedin.com/in/jawjihn"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 p-4 rounded-full hover:bg-white/20 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Linkedin className="w-6 h-6" />
            </motion.a>
            <motion.a
              href="https://wa.me/5511972954453"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 p-4 rounded-full hover:bg-white/20 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaWhatsapp className="w-6 h-6" />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

