import React from 'react'
import { Target, Eye, Globe2 } from 'lucide-react'

export const AboutSection = () => {
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
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-maritime-navy mb-4">
            About Smart Export
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-accent-500 to-accent-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Smart Export is a maritime-focused platform designed to simplify international trade operations. 
            Our mission is to provide accurate, real-time cost estimation tools for importers and exporters 
            navigating global markets.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                  
                  <h3 className="text-2xl font-bold text-maritime-navy mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-gradient-to-br from-maritime-navy to-maritime-deepBlue rounded-3xl p-12 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">150+</div>
              <div className="text-accent-300 font-medium">Countries Covered</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">10K+</div>
              <div className="text-accent-300 font-medium">Products Database</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
              <div className="text-accent-300 font-medium">Maritime Ports</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">99%</div>
              <div className="text-accent-300 font-medium">Accuracy Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
