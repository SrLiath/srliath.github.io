"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

const projects = [
  {
    title: "Help Desk System",
    description: "A desktop-based help desk system built with Java Swing for user support, integrated with the GLPI API. It includes user management, live chat, and ticket creation functionality.",
    tech: ["Java", "Swing", "GLPI"]
  },
  {
    title: "Internal Mobile System - QR Code Detector and Detailing",
    description: "System built in React Native for product detailing based on its QR code and database.",
    tech: ["React Native", "Node.js"],
  },
  {
    title: "Application to Find Jobs in Hairdressing",
    description: "System built in React Native like Tinder, to connect hairdressers with salons dynamically, with a front page, a back-end and a application for ios and android.",
    tech: ["React Native", "Node.js", "MongoDB", "Express", "React"],
  },
  {
    title: "Hub to automation",
    description: "A desktop app, to automate the process of sending emails, manipulate excellsheets, program tasks,interact with a database, scrapling sites and manipulate files.",
    tech: ["Nodejs", "RobotJs", "Selenium", "SqlServer", "Electron", "SheetJS"],
  },
  {
    title: "PatioSP System",
    description: "Web system for Patio SP, using Selenium in the background for automation.",
    tech: ["Node.js", "Selenium"],
  },
  {
    title: "ERP and CRM - Food Industry Company",
    description: "ERP and CRM for a food industry company, developed in CodeIgniter 4 with a MySQL database.",
    tech: ["CodeIgniter", "PHP", "MySQL"],
  },
]

export default function Projects() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

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
          Private projects
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
            >
              <Card style={{ minHeight: "290px" }} className="overflow-hidden bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 transition-colors" >
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
