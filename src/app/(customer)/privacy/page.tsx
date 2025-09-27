"use client"

import { Shield, Eye, Lock, Users, Mail, Phone, Clock, FileText } from 'lucide-react'

export default function PrivacyPolicyPage() {
  const lastUpdated = "September 27, 2025"

  const sections = [
    {
      title: "Information We Collect",
      icon: Users,
      content: [
        {
          subtitle: "Personal Information",
          text: "When you place an order, create an account, or contact us, we may collect personal information including your name, email address, phone number, delivery address, and payment information."
        },
        {
          subtitle: "Usage Information",
          text: "We automatically collect information about how you use our website and mobile app, including your IP address, browser type, device information, and pages visited."
        },
        {
          subtitle: "Location Information",
          text: "With your permission, we may collect location information to provide delivery services and estimate delivery times."
        }
      ]
    },
    {
      title: "How We Use Your Information",
      icon: Eye,
      content: [
        {
          subtitle: "Service Delivery",
          text: "We use your information to process orders, arrange deliveries, send order confirmations, and provide customer support."
        },
        {
          subtitle: "Communication",
          text: "We may use your contact information to send you important updates about your orders, promotional offers, and restaurant news."
        },
        {
          subtitle: "Improvement",
          text: "We analyze usage patterns to improve our services, website functionality, and customer experience."
        }
      ]
    },
    {
      title: "Information Sharing",
      icon: Lock,
      content: [
        {
          subtitle: "Third-Party Services",
          text: "We may share information with trusted third-party service providers who help us operate our business, such as payment processors and delivery partners."
        },
        {
          subtitle: "Legal Requirements",
          text: "We may disclose information when required by law, to protect our rights, or to ensure the safety of our customers and staff."
        },
        {
          subtitle: "Business Transfers",
          text: "In the event of a merger, sale, or transfer of our business, customer information may be transferred as part of the transaction."
        }
      ]
    },
    {
      title: "Data Security",
      icon: Shield,
      content: [
        {
          subtitle: "Protection Measures",
          text: "We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction."
        },
        {
          subtitle: "Payment Security",
          text: "All payment transactions are processed through secure, encrypted connections. We do not store complete credit card information on our servers."
        },
        {
          subtitle: "Access Control",
          text: "Access to personal information is restricted to authorized personnel who need it to perform their job functions."
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 py-16">
        <div className="absolute inset-0 bg-[url('/images/pattern.jpg')] opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-12 h-12 text-yellow-500 mr-4" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
              Privacy <span className="text-yellow-500">Policy</span>
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
          </p>
          <div className="mt-8 flex items-center justify-center text-gray-400">
            <Clock className="w-5 h-5 mr-2" />
            <span>Last updated: {lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gray-900 rounded-2xl p-8 border border-yellow-500/20">
          <div className="flex items-center mb-6">
            <FileText className="w-8 h-8 text-yellow-500 mr-3" />
            <h2 className="text-2xl font-bold text-yellow-400">Introduction</h2>
          </div>
          <p className="text-gray-300 leading-relaxed text-lg">
            At our restaurant, we are committed to protecting your privacy and ensuring the security of your personal information. 
            This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you visit our 
            website, use our mobile application, or dine at our restaurant. By using our services, you consent to the 
            practices described in this policy.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="space-y-8">
          {sections.map((section, index) => {
            const IconComponent = section.icon
            return (
              <div key={index} className="bg-gray-900 rounded-2xl p-8 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="bg-yellow-500/20 rounded-full p-3 mr-4">
                    <IconComponent className="w-8 h-8 text-yellow-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-yellow-400">{section.title}</h2>
                </div>
                
                <div className="space-y-6">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex}>
                      <h3 className="text-lg font-semibold text-white mb-3">{item.subtitle}</h3>
                      <p className="text-gray-300 leading-relaxed pl-4 border-l-2 border-yellow-500/30">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Your Rights Section */}
      <div className="bg-gray-900/50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 rounded-2xl p-8 border border-yellow-500/20">
            <div className="flex items-center mb-6">
              <div className="bg-blue-500/20 rounded-full p-3 mr-4">
                <Users className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold text-yellow-400">Your Rights</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Access & Correction</h3>
                  <p className="text-gray-300">You have the right to access, update, or correct your personal information.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Data Portability</h3>
                  <p className="text-gray-300">You can request a copy of your personal data in a structured format.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Deletion</h3>
                  <p className="text-gray-300">You may request deletion of your personal information, subject to legal requirements.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Opt-out</h3>
                  <p className="text-gray-300">You can unsubscribe from marketing communications at any time.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-2xl p-8 border border-yellow-500/30 text-center">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">Questions About This Policy?</h2>
          <p className="text-gray-300 mb-6 leading-relaxed">
            If you have any questions about this Privacy Policy or how we handle your personal information, 
            please don't hesitate to contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => window.location.href = 'tel:03290039757'}
              className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-all duration-300 flex items-center"
            >
              <Phone className="w-5 h-5 mr-2" />
              Call: 03290039757
            </button>
            <button 
              onClick={() => window.location.href = '/contact'}
              className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 flex items-center"
            >
              <Mail className="w-5 h-5 mr-2" />
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}