import React from 'react'
import { Target, Eye, Globe2, Ship, Anchor } from 'lucide-react'

function About() {
  const features = [
    {
      icon: Target,
      title: 'Accuracy',
      description: 'Precise calculations based on real-time customs data and maritime port fees.',
      color: 'from-accent-500 to-accent-600',
    },
    {
      icon: Eye,
      title: 'Transparency',
      description: 'Clear breakdown of all costs including duties, taxes, and port charges.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Globe2,
      title: 'Global Reach',
      description: 'Coverage of 150+ countries with comprehensive trade regulations.',
      color: 'from-green-500 to-green-600',
    },
  ]

  return (
    <div className="min-h-screen bg-maritime-cream pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-lg">
                <Ship className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent-400 rounded-full flex items-center justify-center">
                <Anchor className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About Smart Export
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-accent-500 to-accent-600 mx-auto mb-8"></div>
          
          <p className="text-xl text-gray-800 max-w-3xl mx-auto leading-relaxed font-medium">
            Smart Export is a maritime-focused platform designed to simplify international trade operations. 
            Our mission is to provide accurate, real-time cost estimation tools for importers and exporters 
            navigating global markets.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-accent-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent-50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-700 leading-relaxed text-base">
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Mission Statement */}
        <div className="bg-white rounded-2xl p-12 shadow-xl border border-gray-200 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Mission</h2>
          <p className="text-lg text-gray-800 leading-relaxed text-center max-w-4xl mx-auto">
            We strive to empower businesses of all sizes with the tools and insights they need to succeed 
            in international trade. By providing transparent, accurate, and easy-to-use cost calculators, 
            we help our clients make informed decisions and optimize their global supply chains.
          </p>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-3xl p-12 shadow-2xl border-2 border-gray-200">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">By the Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2 text-gray-900">150+</div>
              <div className="text-gray-700 font-medium">Countries Covered</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2 text-gray-900">10K+</div>
              <div className="text-gray-700 font-medium">Products Database</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2 text-gray-900">500+</div>
              <div className="text-gray-700 font-medium">Maritime Ports</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2 text-gray-900">99%</div>
              <div className="text-gray-700 font-medium">Accuracy Rate</div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h3>
            <ul className="space-y-3 text-gray-800">
              <li className="flex items-start gap-3">
                <span className="text-accent-500 font-bold text-xl">•</span>
                <span className="text-base"><strong>Integrity:</strong> We provide honest, accurate information</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-500 font-bold text-xl">•</span>
                <span className="text-base"><strong>Innovation:</strong> Continuously improving our platform</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-500 font-bold text-xl">•</span>
                <span className="text-base"><strong>Customer Focus:</strong> Your success is our priority</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Us</h3>
            <ul className="space-y-3 text-gray-800">
              <li className="flex items-start gap-3">
                <span className="text-accent-500 font-bold text-xl">•</span>
                <span className="text-base">Real-time tariff data from official sources</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-500 font-bold text-xl">•</span>
                <span className="text-base">Comprehensive port fee calculations</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-500 font-bold text-xl">•</span>
                <span className="text-base">Multi-currency support for global trade</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent-500 font-bold text-xl">•</span>
                <span className="text-base">User-friendly interface and instant results</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
