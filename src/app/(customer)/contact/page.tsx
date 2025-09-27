"use client"

import { Phone, MapPin, Clock, Mail, MessageCircle, Utensils, Star } from 'lucide-react'

export default function ContactPage() {
  const phoneNumbers = [
    "03290039757",
    "03127172184"
  ]

  const address = "P-562/A Opposite Govt. Nusrat Fateh Ali Khan Hospital, Peoples Colony No 2, Faisalabad"

  const handleCallClick = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`
  }

  const handleLocationClick = () => {
    const encodedAddress = encodeURIComponent(address)
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 py-20">
        <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Utensils className="w-12 h-12 text-yellow-500 mr-4" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
              Contact <span className="text-yellow-500">Us</span>
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Get in touch with us for reservations, orders, or any inquiries. We're here to serve you the best dining experience!
          </p>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Contact Details */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-yellow-400 mb-4 flex items-center justify-center lg:justify-start">
                <MessageCircle className="w-8 h-8 mr-3" />
                Get In Touch
              </h2>
              <p className="text-gray-300 text-lg">
                Reach out to us through any of the following ways. We're always happy to hear from you!
              </p>
            </div>

            {/* Phone Numbers */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300">
              <div className="flex items-center mb-4">
                <Phone className="w-6 h-6 text-yellow-500 mr-3" />
                <h3 className="text-xl font-semibold text-white">Call Us</h3>
              </div>
              <div className="space-y-3">
                {phoneNumbers.map((phone, index) => (
                  <button
                    key={index}
                    onClick={() => handleCallClick(phone)}
                    className="block w-full text-left bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 hover:border-yellow-500 rounded-lg p-4 transition-all duration-300 group"
                  >
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 text-yellow-500 mr-3 group-hover:animate-pulse" />
                      <span className="text-lg font-mono text-white group-hover:text-yellow-400">
                        {phone}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Address */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300">
              <div className="flex items-center mb-4">
                <MapPin className="w-6 h-6 text-yellow-500 mr-3" />
                <h3 className="text-xl font-semibold text-white">Visit Us</h3>
              </div>
              <button
                onClick={handleLocationClick}
                className="w-full text-left bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 hover:border-yellow-500 rounded-lg p-4 transition-all duration-300 group"
              >
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-yellow-500 mr-3 mt-1 group-hover:animate-bounce" />
                  <div>
                    <span className="text-white group-hover:text-yellow-400 leading-relaxed">
                      {address}
                    </span>
                    <p className="text-gray-400 text-sm mt-2 group-hover:text-gray-300">
                      Click to open in Google Maps
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Business Hours */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-yellow-500/20">
              <div className="flex items-center mb-4">
                <Clock className="w-6 h-6 text-yellow-500 mr-3" />
                <h3 className="text-xl font-semibold text-white">Business Hours</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-300">Monday - Sunday</span>
                  <span className="text-white font-semibold">5:00 PM - 01:00 AM</span>
                </div>
                <div className="flex items-center text-sm text-yellow-400">
                  <Star className="w-4 h-4 mr-2" />
                  <span>Open 7 days a week for your convenience</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-900 rounded-2xl p-8 border border-yellow-500/20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-yellow-400 mb-4">
                Send Message
              </h2>
              <p className="text-gray-300">
                Have a question or feedback? Drop us a message and we'll get back to you soon!
              </p>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-semibold mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-black border border-yellow-500/30 rounded-lg text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Phone</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 bg-black border border-yellow-500/30 rounded-lg text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none transition-colors"
                    placeholder="Your phone number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-black border border-yellow-500/30 rounded-lg text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none transition-colors"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Subject</label>
                <select className="w-full px-4 py-3 bg-black border border-yellow-500/30 rounded-lg text-white focus:border-yellow-500 focus:outline-none transition-colors">
                  <option value="">Select a topic</option>
                  <option value="reservation">Table Reservation</option>
                  <option value="order">Food Order Inquiry</option>
                  <option value="feedback">Feedback</option>
                  <option value="complaint">Complaint</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Message</label>
                <textarea
                  rows={5}
                  className="w-full px-4 py-3 bg-black border border-yellow-500/30 rounded-lg text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none resize-none transition-colors"
                  placeholder="Tell us how we can help you..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-yellow-500 text-black py-4 px-6 rounded-lg font-bold text-lg hover:bg-yellow-600 transition-all duration-300 hover:scale-105 flex items-center justify-center"
              >
                <Mail className="w-5 h-5 mr-2" />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
            Ready to Order?
          </h2>
          <p className="text-black/80 text-lg mb-8 max-w-2xl mx-auto">
            Browse our delicious menu and place your order now. Fresh ingredients, authentic flavors, delivered to your doorstep!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => window.location.href = '/menu'}
              className="bg-black text-yellow-500 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-900 transition-all duration-300 hover:scale-105 flex items-center"
            >
              <Utensils className="w-5 h-5 mr-2" />
              View Menu
            </button>
            <button 
              onClick={() => handleCallClick(phoneNumbers[0])}
              className="bg-white text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 flex items-center"
            >
              <Phone className="w-5 h-5 mr-2" />
              Call Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}