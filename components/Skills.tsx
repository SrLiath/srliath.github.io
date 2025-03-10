"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

const skills = [
  {
    category: "Frontend",
    items: ["React.js", "Next.js", "TypeScript", "Tailwind CSS", "React Native"],
  },
  {
    category: "Backend",
    items: ["Node.js", "PHP", "Java", "Express", "Laravel 11"],
  },
  {
    category: "Database",
    items: ["MySQL", "Firebase", "MongoDB", "Redis"],
  },
  {
    category: "DevOps",
    items: ["Docker", "AWS", "GCP", "Git"],
  },
]

export default function Skills() {
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
          Technical Skills
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="p-6 bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 transition-colors">
                <h3 className="text-xl font-semibold mb-4 text-blue-400">{skill.category}</h3>
                <ul className="space-y-2">
                  {skill.items.map((item) => (
                    <li key={item} className="text-gray-300">
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

