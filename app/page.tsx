/**
 * Verity Landing Page
 * 
 * Modern landing page with hero animations, gradient text, and glassmorphism
 */

"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginModal } from '@/components/auth/LoginModal'
import { Shield, Smartphone, FileText, CheckCircle, ArrowRight, Users, Clock, Lock } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const [showLoginModal, setShowLoginModal] = useState(false)

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

  const stats = [
    { label: 'Hotels Trusting Us', value: '100+' },
    { label: 'Chargebacks Prevented', value: '90%' },
    { label: 'Verifications Completed', value: '50K+' },
    { label: 'Average Response Time', value: '< 2 min' }
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
                onClick={() => setShowLoginModal(true)}
              >
                Sign In
              </Button>
              <Button
                variant="gradient"
                onClick={() => setShowLoginModal(true)}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Secure Guest
              <span className="gradient-text"> Attestation</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Streamline hotel check-ins with our secure SMS-based verification system.
              Reduce fraud, improve guest experience, and maintain compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="gradient"
                onClick={() => setShowLoginModal(true)}
                className="text-lg px-8 py-3"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/auth')}
                className="text-lg px-8 py-3"
              >
                Sign Up Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose Verity?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built for modern hotels that prioritize security, efficiency, and guest satisfaction.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index}>
                  <Card className="text-center">
                    <CardHeader>
                      <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
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

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Check-in Process?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join hundreds of hotels already using Verity to secure their guest verification process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="default"
              onClick={() => setShowLoginModal(true)}
              className="text-lg px-8 py-3"
            >
              Get Started Today
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/auth')}
              className="text-lg px-8 py-3"
            >
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2 gradient-text">Verity</h3>
            <p className="text-muted-foreground mb-4">
              Secure attestation and verification system for modern hotels
            </p>
            <p className="text-sm text-muted-foreground">
              © 2024 Verity. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  )
}