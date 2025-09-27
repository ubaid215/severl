"use client"

import { FileText, Scale, CreditCard, Truck, AlertTriangle, Phone, Mail, Clock, Shield } from 'lucide-react'

export default function TermsOfServicePage() {
  const lastUpdated = "September 27, 2025"

  const sections = [
    {
      title: "Acceptance of Terms",
      icon: FileText,
      content: [
        {
          subtitle: "Agreement",
          text: "By accessing and using our website, mobile application, or services, you accept and agree to be bound by the terms and provision of this agreement."
        },
        {
          subtitle: "Modifications",
          text: "We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Continued use of our services constitutes acceptance of modified terms."
        }
      ]
    },
    {
      title: "Use of Services",
      icon: Shield,
      content: [
        {
          subtitle: "Permitted Use",
          text: "You may use our services for lawful purposes only. You agree not to use the service in any way that violates any applicable federal, state, local, or international law or regulation."
        },
        {
          subtitle: "User Accounts",
          text: "You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account."
        },
        {
          subtitle: "Prohibited Activities",
          text: "You may not use our services to transmit any unlawful, harassing, defamatory, or fraudulent content, or attempt to interfere with the proper functioning of our systems."
        }
      ]
    },
    {
      title: "Orders and Payment",
      icon: CreditCard,
      content: [
        {
          subtitle: "Order Acceptance",
          text: "All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order at any time for any reason, including but not limited to product availability, errors in pricing, or fraudulent transactions."
        },
        {
          subtitle: "Pricing",
          text: "All prices are listed in Pakistani Rupees (PKR) and are subject to change without notice. Prices include applicable taxes unless otherwise stated."
        },
        {
          subtitle: "Payment Terms",
          text: "Payment is due at the time of order placement. We accept various payment methods including cash on delivery, credit cards, and digital payment platforms."
        }
      ]
    },
    {
      title: "Delivery and Pickup",
      icon: Truck,
      content: [
        {
          subtitle: "Delivery Areas",
          text: "We deliver within specified areas around our restaurant location. Delivery fees and minimum order requirements may apply and will be clearly displayed at checkout."
        },
        {
          subtitle: "Delivery Times",
          text: "Estimated delivery times are approximate and may vary due to weather, traffic, or high demand periods. We are not liable for delays beyond our reasonable control."
        },
        {
          subtitle: "Risk of Loss",
          text: "Risk of loss for delivered items passes to you upon delivery. For pickup orders, risk of loss passes when items are handed to you or your authorized representative."
        }
      ]
    },
    {
      title: "Refunds and Cancellations",
      icon: Scale,
      content: [
        {
          subtitle: "Cancellation Policy",
          text: "Orders may be cancelled within a reasonable time after placement, typically before preparation begins. Cancellation may not be possible once food preparation has started."
        },
        {
          subtitle: "Refund Policy",
          text: "Refunds are considered on a case-by-case basis for issues related to food quality, incorrect orders, or service failures. Refund requests must be made within 24 hours of order delivery/pickup."
        },
        {
          subtitle: "Quality Guarantee",
          text: "We stand behind the quality of our food. If you're not satisfied with your order, please contact us immediately so we can address your concerns."
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
            <Scale className="w-12 h-12 text-yellow-500 mr-4" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
              Terms of <span className="text-yellow-500">Service</span>
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Please read these terms and conditions carefully before using our services. These terms govern your use of our restaurant's services.
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
            Welcome to our restaurant services. These Terms of Service ("Terms") govern your use of our website, 
            mobile application, delivery services, and dining facilities. By using our services, you agree to comply 
            with and be bound by these Terms. If you do not agree with these Terms, please do not use our services.
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

      {/* Important Notices */}
      <div className="bg-gray-900/50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 rounded-2xl p-8 border border-red-500/20">
            <div className="flex items-center mb-6">
              <div className="bg-red-500/20 rounded-full p-3 mr-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-red-400">Important Notices</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Limitation of Liability</h3>
                <p className="text-gray-300 leading-relaxed pl-4 border-l-2 border-red-500/30">
                  To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special, 
                  consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, 
                  or other intangible losses.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Food Allergies</h3>
                <p className="text-gray-300 leading-relaxed pl-4 border-l-2 border-red-500/30">
                  Please inform us of any food allergies or dietary restrictions when placing your order. While we take 
                  precautions, we cannot guarantee that cross-contamination will not occur in our kitchen.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Governing Law</h3>
                <p className="text-gray-300 leading-relaxed pl-4 border-l-2 border-red-500/30">
                  These Terms shall be governed by and construed in accordance with the laws of Pakistan. 
                  Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of 
                  the courts in Faisalabad, Punjab.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-2xl p-8 border border-yellow-500/30 text-center">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">Questions About These Terms?</h2>
          <p className="text-gray-300 mb-6 leading-relaxed">
            If you have any questions about these Terms of Service or need clarification on any provisions, 
            please contact us. We're here to help!
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