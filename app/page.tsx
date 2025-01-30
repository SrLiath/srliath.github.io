import Hero from "@/components/Hero"
import Skills from "@/components/Skills"
import Projects from "@/components/Projects"
import Experience from "@/components/Experience"
import Contact from "@/components/Contact"
import ThemeToggle from "@/components/ThemeToggle"
import ProjectsOpen from "@/components/ProjectsOpen"

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="relative">
        <Hero />
        <Skills />
        <ProjectsOpen />
        <Projects />
        <Experience />
        {/* implementar em um futuro próximo
        <ThemeToggle /> */}
        <Contact />
      </div>
    </main>
  )
}

