import React from 'react'
import { Link } from 'react-router-dom'
import { Ship, Anchor, Mail, Phone, MapPin, Linkedin, Twitter, Facebook } from 'lucide-react'

export const Footer = () => {
  return (
    <footer className="bg-maritime-navy text-white mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-accent-500 via-accent-600 to-accent-700 rounded-xl flex items-center justify-center shadow-xl border-2 border-accent-400/30">
                  <Ship className="w-7 h-7 text-white drop-shadow-lg" />
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-gradient-to-br from-accent-400 to-accent-500 rounded-full flex items-center justify-center shadow-lg border-2 border-maritime-navy">
                  <Anchor className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">Smart Export</h3>
                <p className="text-xs text-gray-400 font-medium">Global Maritime Trade Platform</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed max-w-md">
              Smart Export is a maritime-focused platform designed to simplify international trade operations. 
              We provide accurate, real-time cost estimation tools for importers and exporters navigating global markets.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-300 hover:text-accent-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/#calculator" className="text-sm text-gray-300 hover:text-accent-400 transition-colors">
                  Calculator
                </Link>
              </li>
              <li>
                <Link to="/#about" className="text-sm text-gray-300 hover:text-accent-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-sm text-gray-300 hover:text-accent-400 transition-colors">
                  Administration
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-accent-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-300">contact@smartexport.com</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-accent-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-300">+212 5XX-XXXXXX</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-accent-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-300">Casablanca, Morocco</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © 2024 Smart Export. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-400 hover:text-accent-400 transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-accent-400 transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-accent-400 transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
