"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

const getCurrentDateFormatted = () => {
  const now = new Date();
  return now.toLocaleString('en-US', { month: 'short', year: 'numeric' });
};

const calculateExperience = (startYear: any, startMonth: any) => {
  const now = new Date();
  const startDate = new Date(startYear, startMonth - 1);
  const diffYears = now.getFullYear() - startDate.getFullYear();
  const diffMonths = now.getMonth() - startDate.getMonth();
  const totalMonths = diffYears * 12 + diffMonths;

  return totalMonths < 12
    ? `${totalMonths} mos`
    : `${Math.floor(totalMonths / 12)} yr ${totalMonths % 12} mos`;
};

const experience = [
  {
    title: "Software Developer",
    company: "TechSize Information Technology",
    period: `May 2023 - ${getCurrentDateFormatted()} · ${calculateExperience(2023, 5)}`,
    location: "Remote",
    contractType: "Indirect Contract",
    description: "Specialized in developing software solutions for clients on demand.",
    technologies: ["Java", "Node.js", "TypeScript", "React Native", "PHP"],
    responsibilities: [
      "Developed and maintained web and mobile applications.",
      "Integrated systems with enterprise applications.",
      "Implemented DevOps practices to automate development and operational processes."
    ]
  },
  {
    title: "Infrastructure & Systems Intern",
    company: "Associação Comercial de São Paulo (ACSP)",
    period: `Aug 2024 - ${getCurrentDateFormatted()} · ${calculateExperience(2024, 8)}`,
    location: "São Paulo, Brazil · On-site",
    contractType: "Internship",
    technologies: ["AWS Lambda", "Node.js", "CloudFront", "PHP"],
    responsibilities: [
      "Developed and maintained backend services using AWS Lambda with Node.js.",
      "Implemented front-end applications on AWS CloudFront.",
      "Performed maintenance and optimizations on legacy PHP systems."
    ]
  },
  {
    title: "Infrastructure & Support Intern",
    company: "Tips Tecnologia",
    period: "Aug 2022 - Mar 2023 · 8 mos",
    location: "São Paulo, Brazil · On-site",
    contractType: "Internship",
    technologies: ["Cloud Computing", "Server Management", "Firewall", "Databases"],
    responsibilities: [
      "Managed cloud infrastructure and performed server maintenance.",
      "Configured and maintained firewall security policies.",
      "Provided internal and external client support for hardware and software issues."
    ]
  },
  {
    title: "Freelance Developer",
    company: "Self-employed",
    period: `2021 - ${getCurrentDateFormatted()} · ${calculateExperience(2021, 1)}`,
    location: "Remote",
    technologies: ["Node.js", "React", "React Native", "Next.js", "MongoDB", "Flutter", "Java", "PHP", "Python", "Automation"],
    responsibilities: [
      "Started my journey in technology with PHP and CodeIgniter 4 for my first projects.",
      "Expanded knowledge into automation using Python and Node.js with Selenium, PyAutoGUI, and Robot.js.",
      "Developed various web and mobile applications using React, React Native, Next.js, and Node.js.",
      "Adapted to the freelance market by working with multiple technologies including Java (web & desktop), Flutter, and automation solutions in Python and PHP.",
      "Established partnerships with companies like TechSize while continuing freelance work as my primary income source."
    ]
  }
];



export default function Experience() {
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
          Work Experience
        </motion.h2>

        <div className="max-w-4xl mx-auto">
          {experience.map((job, index) => (
            <motion.div
              key={job.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="mb-8 last:mb-0"
            >
              <Card className="p-6 bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-blue-400">{job.title}</h3>
                    <p className="text-gray-400">{job.company}</p>
                  </div>
                  <span className="text-gray-500 mt-2 md:mt-0">{job.period}</span>
                </div>
                <p className="text-gray-300 mb-4">{job.description}</p>
                <ul className="space-y-2">
                  {job.responsibilities.map((achievement) => (
                    <li key={achievement} className="text-gray-400 flex items-center">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-3" />
                      {achievement}
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

