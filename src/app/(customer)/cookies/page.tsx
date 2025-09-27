"use client"

import { Cookie, Settings, BarChart3, Shield, Globe, Clock, Phone, Mail, AlertCircle, CheckCircle } from 'lucide-react'

export default function CookiePolicyPage() {
  const lastUpdated = "September 27, 2025"

  const cookieTypes = [
    {
      title: "Essential Cookies",
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/20",
      description: "These cookies are necessary for the website to function and cannot be switched off in our systems.",
      examples: [
        "Authentication cookies to remember your login status",
        "Shopping cart cookies to maintain your order",
        "Security cookies to protect against fraud",
        "Session cookies for basic functionality"
      ],
      canDisable: false
    },
    {
      title: "Analytics Cookies",
      icon: BarChart3,
      color: "text-blue-500",
      bgColor: "bg-blue-500/20",
      description: "These cookies help us understand how visitors interact with our website by collecting anonymous information.",
      examples: [
        "Google Analytics to track page visits and user behavior",
        "Heatmap tools to understand user interaction patterns",
        "Performance monitoring cookies",
        "A/B testing cookies for website optimization"
      ],
      canDisable: true
    },
    {
      title: "Marketing Cookies",
      icon: Globe,
      color: "text-purple-500",
      bgColor: "bg-purple-500/20",
      description: "These cookies track your activity across websites to deliver more relevant advertisements.",
      examples: [
        "Social media platform cookies for sharing features",
        "Advertising network cookies for targeted ads",
        "Remarketing cookies to show relevant promotions",
        "Conversion tracking cookies for marketing campaigns"
      ],
      canDisable: true
    },
    {
      title: "Functional Cookies",
      icon: Settings,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/20",
      description: "These cookies enable enhanced functionality and personalization, but are not essential for basic use.",
      examples: [
        "Language preference cookies",
        "Location-based service cookies for delivery",
        "Theme and layout preference cookies",
        "Recently viewed items cookies"
      ],
      canDisable: true
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 py-16">
        <div className="absolute inset-0 bg-[url('/images/pattern.jpg')] opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Cookie className="w-12 h-12 text-yellow-500 mr-4" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
              Cookie <span className="text-yellow-500">Policy</span>
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Learn about how we use cookies and similar technologies to enhance your experience on our website and services.
          </p>
          <div className="mt-8 flex items-center justify-center text-gray-400">
            <Clock className="w-5 h-5 mr-2" />
            <span>Last updated: {lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* What Are Cookies */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gray-900 rounded-2xl p-8 border border-yellow-500/20">
          <div className="flex items-center mb-6">
            <Cookie className="w-8 h-8 text-yellow-500 mr-3" />
            <h2 className="text-2xl font-bold text-yellow-400">What Are Cookies?</h2>
          </div>
          <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
            <p>
              Cookies are small text files that are placed on your computer or mobile device when you visit our website. 
              They help us make your experience better by remembering your preferences, keeping you logged in, and 
              understanding how you use our services.
            </p>
            <p>
              We also use similar technologies such as web beacons, pixel tags, and local storage to enhance functionality 
              and provide you with a more personalized experience. This policy covers all these technologies collectively 
              referred to as "cookies."
            </p>
          </div>
        </div>
      </div>

      {/* Types of Cookies */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-yellow-400 mb-4">Types of Cookies We Use</h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            We use different types of cookies for various purposes. Here's a breakdown of each type and how they help improve your experience.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {cookieTypes.map((cookieType, index) => {
            const IconComponent = cookieType.icon
            return (
              <div key={index} className="bg-gray-900 rounded-2xl p-6 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 h-full">
                <div className="flex items-center mb-4">
                  <div className={`${cookieType.bgColor} rounded-full p-3 mr-4`}>
                    <IconComponent className={`w-6 h-6 ${cookieType.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{cookieType.title}</h3>
                    <div className="flex items-center mt-1">
                      {cookieType.canDisable ? (
                        <span className="text-sm text-yellow-400 flex items-center">
                          <Settings className="w-4 h-4 mr-1" />
                          Can be disabled
                        </span>
                      ) : (
                        <span className="text-sm text-green-400 flex items-center">
                          <Shield className="w-4 h-4 mr-1" />
                          Always active
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-4 leading-relaxed">
                  {cookieType.description}
                </p>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-white mb-2">Examples:</h4>
                  <ul className="space-y-1">
                    {cookieType.examples.map((example, exampleIndex) => (
                      <li key={exampleIndex} className="text-sm text-gray-400 flex items-start">
                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* How We Use Cookies */}
      <div className="bg-gray-900/50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 rounded-2xl p-8 border border-yellow-500/20">
            <div className="flex items-center mb-6">
              <div className="bg-blue-500/20 rounded-full p-3 mr-4">
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold text-yellow-400">How We Use Cookies</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    Essential Operations
                  </h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Remember items in your shopping cart</li>
                    <li>• Keep you logged into your account</li>
                    <li>• Remember your delivery preferences</li>
                    <li>• Provide secure checkout processes</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <Settings className="w-5 h-5 text-yellow-500 mr-2" />
                    Personalization
                  </h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Remember your language preferences</li>
                    <li>• Customize content based on location</li>
                    <li>• Show relevant menu recommendations</li>
                    <li>• Maintain your site preferences</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <BarChart3 className="w-5 h-5 text-blue-500 mr-2" />
                    Analytics & Improvement
                  </h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Understand website usage patterns</li>
                    <li>• Identify popular menu items</li>
                    <li>• Improve website performance</li>
                    <li>• Test new features and layouts</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <Globe className="w-5 h-5 text-purple-500 mr-2" />
                    Marketing & Communication
                  </h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Show relevant promotions and offers</li>
                    <li>• Enable social media sharing</li>
                    <li>• Track marketing campaign effectiveness</li>
                    <li>• Provide targeted advertisements</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Managing Your Cookie Preferences */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gray-900 rounded-2xl p-8 border border-yellow-500/20">
          <div className="flex items-center mb-6">
            <div className="bg-purple-500/20 rounded-full p-3 mr-4">
              <Settings className="w-8 h-8 text-purple-500" />
            </div>
            <h2 className="text-2xl font-bold text-yellow-400">Managing Your Cookie Preferences</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Browser Settings</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Most web browsers allow you to control cookies through their settings. You can usually find these 
                options in the "Privacy" or "Security" section of your browser's settings. Here's how to access 
                cookie settings in popular browsers:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-black rounded-lg p-4 border border-gray-700">
                  <h4 className="font-semibold text-white mb-2">Chrome</h4>
                  <p className="text-sm text-gray-400">Settings → Privacy and security → Cookies and other site data</p>
                </div>
                <div className="bg-black rounded-lg p-4 border border-gray-700">
                  <h4 className="font-semibold text-white mb-2">Firefox</h4>
                  <p className="text-sm text-gray-400">Options → Privacy & Security → Cookies and Site Data</p>
                </div>
                <div className="bg-black rounded-lg p-4 border border-gray-700">
                  <h4 className="font-semibold text-white mb-2">Safari</h4>
                  <p className="text-sm text-gray-400">Preferences → Privacy → Cookies and website data</p>
                </div>
                <div className="bg-black rounded-lg p-4 border border-gray-700">
                  <h4 className="font-semibold text-white mb-2">Edge</h4>
                  <p className="text-sm text-gray-400">Settings → Cookies and site permissions → Cookies and site data</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Cookie Consent Banner</h3>
              <p className="text-gray-300 leading-relaxed">
                When you first visit our website, you'll see a cookie consent banner that allows you to choose 
                which types of cookies you want to accept. You can change these preferences at any time by 
                clicking the "Cookie Settings" link in our website footer.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Important Information */}
      <div className="bg-gray-900/50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 rounded-2xl p-8 border border-orange-500/20">
            <div className="flex items-center mb-6">
              <div className="bg-orange-500/20 rounded-full p-3 mr-4">
                <AlertCircle className="w-8 h-8 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold text-orange-400">Important Information</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Impact of Disabling Cookies</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  While you have the right to disable cookies, please note that doing so may affect your 
                  experience on our website:
                </p>
                <ul className="space-y-2 text-gray-300 pl-4">
                  <li>• Your shopping cart may not function properly</li>
                  <li>• You may need to re-enter information repeatedly</li>
                  <li>• Some features may not work as intended</li>
                  <li>• You may see less relevant content and offers</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Third-Party Cookies</h3>
                <p className="text-gray-300 leading-relaxed">
                  Some cookies on our website are set by third-party services we use, such as Google Analytics, 
                  social media platforms, and advertising networks. These third parties have their own privacy 
                  policies and cookie practices, which we encourage you to review.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Updates to This Policy</h3>
                <p className="text-gray-300 leading-relaxed">
                  We may update this Cookie Policy from time to time to reflect changes in our practices or 
                  for other operational, legal, or regulatory reasons. We will notify you of any material 
                  changes by posting the updated policy on our website.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-2xl p-8 border border-yellow-500/30 text-center">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">Questions About Cookies?</h2>
          <p className="text-gray-300 mb-6 leading-relaxed">
            If you have any questions about our use of cookies or this Cookie Policy, 
            please don't hesitate to contact us. We're here to help!
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