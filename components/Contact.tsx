"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Mail, Phone } from "lucide-react"

export default function Contact() {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-4xl md:text-5xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          About Me
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="p-6 bg-white/5 backdrop-blur-sm border-white/10 text-white">
            <p className="text-lg mb-6">
              I am a passionate software developer specializing in modern web and mobile technologies.
              With experience in JavaScript, TypeScript, React, React Native, and backend technologies like Node.js,
              I love building scalable, efficient, and user-friendly applications.
            </p>
            <p className="text-lg mb-6">
              When I’m not coding, I enjoy learning about cybersecurity, optimizing workflows with automation, and exploring
              new technologies to enhance productivity and security.
            </p>
            <p className="text-lg mb-6">
              If something is too difficult, it means most people think inside the box. But real solutions come from those who dare to think outside of it.
              I love martial arts, manga, and above all, challenges. That’s why I take on projects others avoid—because complexity is just a puzzle waiting to be solved.
              And if something isn’t understood, it simply means you haven’t looked at it from the right angle yet.
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="text-blue-400" />
                <span className="text-lg">&nbsp;santos.jonathan.jj@gmail.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-blue-400" />
                <span className="text-lg">&nbsp;+55 11 97295-4453</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
