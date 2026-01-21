import IntroLoader from "@/components/IntroLoader";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ParticleTransition from "@/components/ParticleTransition";
import TextExplosionTransition from "@/components/TextExplosionTransition";
import GlitchTextTransition from "@/components/GlitchTextTransition";
import EnergyFieldTransition from "@/components/EnergyFieldTransition";
import StickySection from "@/components/StickySection"; // Add this import

export default function Home() {
  return (
    <>
      <IntroLoader />
      <Navigation />
      <main>
        <Hero />
        
        {/* Particle transition tussen Hero en About */}
        <ParticleTransition
          id="hero-about-transition"
          particleCount={150}
          height={130}
          colors={["#3b82f6", "#60a5fa", "#93c5fd", "#2563eb", "#1d4ed8", "#dbeafe"]}
        >
          <div className="text-center max-w-2xl mx-auto px-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full mb-6">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <p className="text-accent font-mono text-sm tracking-wider">
                KEEP SCROLLING
              </p>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
              Creating Digital
              <span className="text-gradient block">Experiences</span>
            </h2>
            <p className="text-muted text-lg">
              Where code meets creativity
            </p>
          </div>
        </ParticleTransition>
        
        <StickySection pinDistance={700}>
          <About />
        </StickySection>

        {/* Text Explosion transition tussen About en Projects - SPECTACULAIR */}
        <TextExplosionTransition
          id="about-projects-transition"
          height={100}
          title="PORTFOLIO"
          subtitle="Discover the projects that define our craft"
          colors={["#3b82f6", "#8b5cf6", "#60a5fa", "#06b6d4"]}
        />

        <Projects />

        {/* Glitch Text transition tussen Projects en Skills - MATRIX STYLE */}
        <GlitchTextTransition
          id="projects-skills-transition"
          height={100}
          title="SKILLS_LOADED"
          subtitle="Initializing expertise modules..."
          colors={["#06b6d4", "#3b82f6", "#8b5cf6"]}
        />

        <StickySection pinDistance={700}>
          <Skills />
        </StickySection>

        {/* Energy Field transition tussen Skills en Contact */}
        <EnergyFieldTransition
          id="skills-contact-transition"
          height={100}
          title="Let's Connect"
          subtitle="Your vision, my expertise — let's build something amazing"
          colors={["#3b82f6", "#8b5cf6", "#06b6d4"]}
        />

        <StickySection pinDistance={700}>
          <Contact />
        </StickySection>

      </main>
      <Footer />
    </>
  );
}
