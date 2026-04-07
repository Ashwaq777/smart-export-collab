import React from 'react'
import { HeroSection } from '../components/sections/HeroSection'
import Calculator from './Calculator'

function Home() {
  return (
    <div>
      <HeroSection />
      
      <section id="calculator" className="py-20 bg-gradient-to-br from-maritime-cream to-white">
        <Calculator />
      </section>
    </div>
  )
}

export default Home
