import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import FeaturedProjects from '@/components/FeaturedProjects'
import Footer from '@/components/Footer'

export default async function Home() {
  return (
    <main className="bg-dark min-h-screen">
      <Nav />
      <Hero />
      <hr className="section-divider" />
      <FeaturedProjects />
      <Footer />
    </main>
  )
}
