import React from 'react'
import { ArrowRight, Ship, Globe, TrendingUp } from 'lucide-react'

export const HeroSection = () => {
  const scrollToCalculator = () => {
    const calculatorSection = document.getElementById('calculator')
    if (calculatorSection) {
      calculatorSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative bg-gradient-to-br from-maritime-cream via-white to-accent-50 pt-32 pb-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-64 h-64 bg-accent-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-maritime-navy rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-accent-100 text-accent-700 px-4 py-2 rounded-full text-sm font-semibold">
              <Globe className="w-4 h-4" />
              Global Maritime Trade Platform
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-maritime-navy leading-tight">
              Export Duties Calculator with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-500 to-accent-600">
                Precision
              </span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed">
              Smart Export helps you estimate customs duties, VAT, and maritime port costs instantly. 
              Navigate international trade with confidence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={scrollToCalculator}
                className="group bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
              >
                Calculate Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="/about"
                className="border-2 border-maritime-navy text-maritime-navy px-8 py-4 rounded-xl font-bold text-lg hover:bg-maritime-navy hover:text-white transition-all duration-300 inline-block text-center"
              >
                Learn More
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div>
                <div className="text-3xl font-bold text-maritime-navy">150+</div>
                <div className="text-sm text-gray-600">Countries</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-maritime-navy">10K+</div>
                <div className="text-sm text-gray-600">Products</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-maritime-navy">99%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative">
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl opacity-20 blur-2xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-maritime-navy to-maritime-deepBlue rounded-2xl opacity-20 blur-2xl"></div>
              
              <div className="relative space-y-6">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-accent-50 to-accent-100 rounded-xl">
                  <div className="w-12 h-12 bg-accent-500 rounded-lg flex items-center justify-center">
                    <Ship className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700">Maritime Shipping</div>
                    <div className="text-xs text-gray-500">Real-time port costs</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700">Customs Duties</div>
                    <div className="text-xs text-gray-500">Accurate calculations</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700">Global Coverage</div>
                    <div className="text-xs text-gray-500">150+ countries</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
