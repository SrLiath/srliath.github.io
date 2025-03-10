"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

const projects = [
  {
    title: "Polibot",
    description: "An RPA application written in Python to automate desktop processes in Windows with no-code functionality. It includes its own compiler and uses a JSON file to determine the automation tasks to be executed. It can also be triggered by a voice command. with 3 versions, python, nodejs and java",
    tech: ["Node.js", "Python", "Java", "automation"],
    link: "https://github.com/srliath/polibot"
  },
  {
    title: "LoteriaLegal",
    description: "A simulation of a lottery, with a backend in node.js, next.js and react.js, using a mongodb database to store the data.",
    tech: ["next.js", "react.js", "Node.js", "Tailwindcss", "mongodb"],
    link: "https://github.com/SrLiath/lotto"
  },
  {
    title: "Daya livros",
    description: "A landing Page to sell ebooks writted in next.js.",
    tech: ["next.js", "react.js", "Node.js", "Tailwindcss"],
    link: "https://github.com/SrLiath/DayaLivros"
  },
  {
    title: "UpdaterClientServer",
    description: "A personal lib to make a client and server to update a software.",
    tech: ["Java", "Swing", "PHP"],
    link: "https://github.com/SrLiath/UpdaterClientServer"
  },
  {
    title: "AutoWxs",
    description: "A personal lib to gen scripts to use in WiX Toolset to generate a MSI package installer",
    tech: ["python", "DotNet", "WiX Toolset"],
    link: "https://github.com/SrLiath/autoWxs"
  },
  {
    title: "JbLogistic",
    description: "A system to delivery, a home to show the service, a admin and user logins, work with GCP and Matrix API to see distance and time to delivery a product",
    tech: ["PHP", "Codeigniter 4", "Mysql", "GCP"],
    link: "https://github.com/SrLiath/JbLogistic"
  },

]

export default function ProjectsOpen() {
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
          Personal projects
        </motion.h2>
        <motion.p className="text-gray-400 mb-4">
          click to see the repository and photos in README
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <a href={project.link} target="_blank" rel="noopener noreferrer">
                <Card style={{ minHeight: "290px" }} className="overflow-hidden bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 transition-colors">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                    <p className="text-gray-400 mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((tech) => (
                        <span key={tech} className="text-sm px-3 py-1 rounded-full bg-blue-500/10 text-blue-400">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
