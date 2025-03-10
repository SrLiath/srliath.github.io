import { motion } from "framer-motion"

export default function About() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.h2
          className="mb-8 text-4xl font-bold"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          About Me
        </motion.h2>
        <motion.p
          className="mb-4 text-lg"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          I'm a Jr front-end developer with over 8 years of experience in creating responsive, performant, and
          accessible web applications. My expertise includes React, Next.js, TypeScript, and modern CSS frameworks like
          Tailwind.
        </motion.p>
        <motion.p
          className="text-lg"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          I'm passionate about creating intuitive user interfaces and optimizing web performance. When I'm not coding,
          you can find me exploring new web technologies or contributing to open-source projects.
        </motion.p>
      </div>
    </section>
  )
}

