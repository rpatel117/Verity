/**
 * Verity Landing Page
 * 
 * Modern landing page with hero animations, gradient text, and glassmorphism
 */

"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ContactForm } from '@/components/ContactForm'
import { Shield, Smartphone, FileText, CheckCircle, ArrowRight, Users, Clock, Lock, Eye } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const { isAuthenticated, isInitializing } = useAuth()
  const [showContactForm, setShowContactForm] = useState(false)

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isInitializing, router])

  // Debug logging
  console.log('🏠 LandingPage state:', { isAuthenticated, isInitializing })
  
  // Force show landing page after 3 seconds if stuck
  useEffect(() => {
    const forceShowLanding = setTimeout(() => {
      console.log('🏠 Force showing landing page after timeout')
    }, 3000)
    
    return () => clearTimeout(forceShowLanding)
  }, [])
  
  // Show loading while checking auth
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading...</p>
          <p className="text-xs text-gray-500 mt-2">isInitializing: {isInitializing.toString()}</p>
          <button 
            onClick={() => {
              console.log('🏠 Manual override - forcing landing page')
              window.location.reload()
            }}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Force Show Landing Page
          </button>
        </div>
      </div>
    )
  }

  // Don't render landing page if user is authenticated (will redirect)
  if (isAuthenticated) {
    return null
  }

  const features = [
    {
      icon: Smartphone,
      title: 'SMS Verification',
      description: 'Send secure, unique verification links directly to guest phones.',
    },
    {
      icon: CheckCircle,
      title: 'Legal Attestation',
      description: 'Capture digital consent with IP, location, and timestamp for legal evidence.',
    },
    {
      icon: FileText,
      title: 'Automated Reporting',
      description: 'Generate comprehensive reports for chargeback disputes and compliance.',
    },
    {
      icon: Lock,
      title: 'Fraud Prevention',
      description: 'Reduce chargebacks and protect your hotel from fraudulent claims.',
    },
  ]

  const securityFeatures = [
    { 
      icon: Shield, 
      title: 'Bank-Grade Encryption', 
      description: 'All data encrypted with AES-256 and TLS 1.3 for maximum security.' 
    },
    { 
      icon: Lock, 
      title: 'PCI DSS Compliant', 
      description: 'Meets strict payment card industry standards for data protection.' 
    },
    { 
      icon: FileText, 
      title: 'Audit Trail Reports', 
      description: 'Generate detailed compliance reports for card arbitrator requirements.' 
    },
    { 
      icon: Eye, 
      title: 'Privacy First', 
      description: 'Minimal data collection with automatic deletion after verification.' 
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-header sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Verity</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/auth')}
              >
                Sign In
              </Button>
              <Button
                variant="gradient"
                onClick={() => router.push('/auth?tab=signup')}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-2xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            
            <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-8 leading-tight">
              Secure Guest
              <span className="gradient-text block"> Attestation</span>
            </h1>
            
            <p className="text-2xl md:text-3xl text-gray-600 mb-16 max-w-5xl mx-auto leading-relaxed">
              Streamline hotel check-ins with our secure SMS-based verification system.
              <span className="block mt-4 text-xl text-gray-500">
                Reduce fraud, improve guest experience, and maintain compliance.
              </span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              <Button
                size="lg"
                variant="gradient"
                onClick={() => router.push('/auth?tab=signup')}
                className="text-xl px-12 py-6 h-16 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-200"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowContactForm(true)}
                className="text-xl px-12 py-6 h-16 border-2 hover:bg-primary/5 transition-all duration-200"
              >
                Request Demo
              </Button>
            </div>
            
            <p className="text-base text-gray-500 mt-8">
              No credit card required • 14-day free trial • Setup in minutes
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How it <span className="gradient-text">Works</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Built for modern hotels that prioritize security, efficiency, and guest satisfaction.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="group">
                  <Card className="text-center h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50/50">
                    <CardHeader className="pb-4">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-8 w-8 text-primary group-hover:text-accent-600 transition-colors duration-300" />
                      </div>
                      <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors duration-300">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Security & Compliance Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Enterprise-Grade Security & Compliance
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Built with security and compliance at its core. Meet card arbitrator requirements and protect your guests' data with industry-leading standards.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {securityFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="text-center group">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-8 w-8 text-primary group-hover:text-accent-600 transition-colors duration-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 bg-clip-text text-transparent">
              Protect Your Hotel with
            </span>
            <span className="block bg-gradient-to-r from-accent-500 to-accent-600 bg-clip-text text-transparent">
              Compliance-Ready Verification
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            Generate detailed audit reports that meet card arbitrator requirements. 
            Reduce chargebacks with legally-binding guest attestations and comprehensive documentation.
          </p>
          
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-8 mb-12 max-w-4xl mx-auto shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">What You Get:</h3>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 text-primary-600 mr-3 flex-shrink-0" />
                  <span>Detailed compliance reports for card disputes</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 text-primary-600 mr-3 flex-shrink-0" />
                  <span>IP address, timestamp, and location verification</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 text-primary-600 mr-3 flex-shrink-0" />
                  <span>Automated audit trail generation</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 text-primary-600 mr-3 flex-shrink-0" />
                  <span>PCI DSS compliant data handling</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 text-primary-600 mr-3 flex-shrink-0" />
                  <span>Bank-grade encryption for all data</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 text-primary-600 mr-3 flex-shrink-0" />
                  <span>Easy integration with existing systems</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
            <Button
              size="lg"
              variant="default"
              onClick={() => router.push('/auth?tab=signup')}
              className="text-lg px-12 py-4 h-14 bg-primary-600 text-white hover:bg-primary-700 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-200 font-semibold"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setShowContactForm(true)}
              className="text-lg px-12 py-4 h-14 border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white transition-all duration-200 font-semibold"
            >
              Request Demo
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary-600" />
              <span className="text-sm font-medium">No setup fees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary-600" />
              <span className="text-sm font-medium">Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary-600" />
              <span className="text-sm font-medium">24/7 support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-8 w-8 text-primary-400" />
                <h3 className="text-2xl font-bold text-white">Verity</h3>
              </div>
              <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
                Enterprise-grade guest verification with compliance-ready reporting. 
                Meet card arbitrator requirements and protect your hotel from chargebacks.
              </p>
              <p className="text-gray-500 text-sm">
                Verity - a Shadow Solutions product
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors duration-200 cursor-pointer">
                  <span className="text-white text-sm font-semibold">f</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors duration-200 cursor-pointer">
                  <span className="text-white text-sm font-semibold">t</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors duration-200 cursor-pointer">
                  <span className="text-white text-sm font-semibold">in</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Compliance</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">PCI DSS Compliance</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Audit Reports</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Data Security</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Integration Guide</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Contact Support</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">System Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2024 Verity. All rights reserved. SOC 2 Type II Compliant.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Contact Form Modal */}
      <ContactForm
        isOpen={showContactForm}
        onClose={() => setShowContactForm(false)}
      />
    </div>
  )
}