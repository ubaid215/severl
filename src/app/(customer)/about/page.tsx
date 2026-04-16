"use client"

import { 
  Heart, 
  Users, 
  Award, 
  Clock, 
  ChefHat, 
  Star, 
  Utensils, 
  MapPin,
  Shield,
  Leaf,
  Truck,
  Phone,
  Sparkles,
  Coffee
} from 'lucide-react'

export default function AboutPage() {
  const stats = [
    { icon: Users, number: "500+", label: "Happy Customers" },
    { icon: Award, number: "1+", label: "Years Experience" },
    { icon: Star, number: "4.8/5", label: "Customer Rating" },
    { icon: ChefHat, number: "10+", label: "Menu Items" }
  ]

  const values = [
    {
      icon: Heart,
      title: "Quality First",
      description: "We use only the freshest ingredients and authentic spices to create memorable dining experiences.",
      color: "text-rose-500",
      bgColor: "bg-rose-500/10"
    },
    {
      icon: Users,
      title: "Customer Focused",
      description: "Your satisfaction is our priority. We listen, adapt, and continuously improve our service.",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: Shield,
      title: "Food Safety",
      description: "Maintaining the highest standards of hygiene and food safety in all our operations.",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10"
    },
    {
      icon: Leaf,
      title: "Fresh & Local",
      description: "Supporting local farmers and using fresh, seasonal ingredients whenever possible.",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10"
    }
  ]

  const features = [
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Quick and reliable delivery service ensuring your food arrives fresh and on time.",
      color: "text-emerald-500"
    },
    {
      icon: Clock,
      title: "Always Fresh",
      description: "We prepare everything fresh daily using premium ingredients for the best taste.",
      color: "text-blue-500"
    },
    {
      icon: Heart,
      title: "Made with Love",
      description: "Every dish is crafted with care, attention to detail, and genuine passion.",
      color: "text-rose-500"
    },
    {
      icon: Sparkles,
      title: "Unique Flavors",
      description: "Authentic recipes combined with innovative techniques for unforgettable taste.",
      color: "text-amber-500"
    }
  ]

  const handleCallClick = () => {
    window.location.href = 'tel:03290039757'
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section with Modern Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-black via-neutral-900 to-black">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500 rounded-full mix-blend-multiply filter blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-600 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-amber-500/20">
              <Heart className="w-4 h-4 text-amber-500" />
              <span className="text-amber-400 text-sm font-medium">Welcome to our story</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6">
              About
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600"> Us</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Discover the passion, quality, and dedication behind every dish we serve. 
              We're more than just a restaurant – we're your culinary destination in Faisalabad.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section - Modern Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <div 
                key={index} 
                className="bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-2xl p-6 text-center border border-neutral-800 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-amber-500/10 group"
              >
                <div className="inline-flex p-3 rounded-xl bg-amber-500/10 mb-4 group-hover:bg-amber-500/20 transition-all">
                  <IconComponent className="w-6 h-6 text-amber-500" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.number}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Our Story Section - Enhanced */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 rounded-full px-4 py-1.5 mb-6">
              <Utensils className="w-4 h-4 text-amber-500" />
              <span className="text-amber-400 text-sm font-medium">Our Journey</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              The Story Behind
              <span className="text-amber-500"> The Flavors</span>
            </h2>
            
            <div className="space-y-5 text-gray-300 leading-relaxed">
              <p className="text-lg">
                Founded with a passion for exceptional food and warm hospitality, our restaurant has been serving 
                the Faisalabad community with authentic flavors and memorable dining experiences.
              </p>
              <p>
                Located in the heart of Peoples Colony No 2, we've built our reputation on quality ingredients, 
                traditional recipes, and innovative culinary techniques. Every dish tells a story of dedication, 
                creativity, and love for the culinary arts.
              </p>
              <p>
                Our commitment goes beyond just serving food – we create experiences that bring families and friends 
                together, celebrating the joy of sharing great meals in a welcoming atmosphere.
              </p>
            </div>
            
            <div className="mt-8 flex flex-wrap gap-4">
              <button 
                onClick={() => window.location.href = '/menu'}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-amber-500/20"
              >
                Explore Menu
              </button>
              <button 
                onClick={handleCallClick}
                className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl transition-all duration-300 border border-neutral-700"
              >
                Contact Us
              </button>
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-2xl blur-xl"></div>
              <div className="relative bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-2xl p-8 border border-amber-500/20 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-5">
                  {stats.slice(0, 4).map((stat, index) => {
                    const IconComponent = stat.icon
                    return (
                      <div key={index} className="text-center group">
                        <div className="bg-black/50 rounded-xl p-4 border border-amber-500/10 group-hover:border-amber-500/30 transition-all duration-300">
                          <IconComponent className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-white">{stat.number}</div>
                          <div className="text-xs text-gray-400">{stat.label}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section - Modern Grid */}
      <section className="bg-gradient-to-b from-black to-neutral-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 rounded-full px-4 py-1.5 mb-4">
              <Star className="w-4 h-4 text-amber-500" />
              <span className="text-amber-400 text-sm font-medium">Core Principles</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              What <span className="text-amber-500">Drives Us</span>
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              The principles that guide everything we do, from sourcing ingredients to serving our community.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const IconComponent = value.icon
              return (
                <div 
                  key={index} 
                  className="group relative bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-2xl p-6 border border-neutral-800 hover:border-amber-500/40 transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/5 group-hover:to-amber-600/5 rounded-2xl transition-all duration-500"></div>
                  <div className="relative">
                    <div className={`inline-flex p-3 rounded-xl ${value.bgColor} mb-5 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className={`w-6 h-6 ${value.color}`} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">
                      {value.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section - Enhanced */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 rounded-full px-4 py-1.5 mb-4">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-amber-400 text-sm font-medium">Why We're Different</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why Choose <span className="text-amber-500">Us?</span>
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              What sets us apart and makes us the preferred choice for food lovers in Faisalabad.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <div 
                  key={index} 
                  className="bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-2xl p-6 text-center border border-neutral-800 hover:border-amber-500/40 transition-all duration-300 hover:scale-105 group"
                >
                  <div className="inline-flex p-3 rounded-xl bg-amber-500/10 mb-5 group-hover:bg-amber-500/20 transition-all duration-300 group-hover:scale-110">
                    <IconComponent className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Location & Contact Section - Modern */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative overflow-hidden bg-gradient-to-br from-neutral-900 to-black rounded-3xl border border-amber-500/20 p-8 md:p-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-600/10 rounded-full filter blur-3xl"></div>
          
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-500/10 rounded-full px-4 py-1.5 mb-6">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span className="text-amber-400 text-sm font-medium">Visit Us</span>
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-6">
                Find Your <span className="text-amber-500">Flavor Destination</span>
              </h2>
              
              <div className="space-y-5">
                <div className="flex items-start gap-4 p-4 bg-neutral-900/50 rounded-xl border border-neutral-800">
                  <MapPin className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold mb-1">Address</p>
                    <p className="text-gray-300 leading-relaxed">
                      P-562/A Opposite Govt. Nusrat Fateh Ali Khan Hospital, <br />
                      Peoples Colony No 2, Faisalabad
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-neutral-900/50 rounded-xl border border-neutral-800">
                  <Clock className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold mb-1">Opening Hours</p>
                    <p className="text-gray-300">Open daily: 5:00 PM - 1:00 AM</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center lg:text-right">
              <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 rounded-2xl p-8 border border-amber-500/20">
                <Coffee className="w-12 h-12 text-amber-500 mx-auto lg:mx-0 lg:ml-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-3">Ready for Amazing Food?</h3>
                <p className="text-gray-300 mb-6">Book a table or order online for pickup/delivery</p>
                
                <div className="flex flex-col sm:flex-row lg:flex-col gap-4">
                  <button 
                    onClick={() => window.location.href = '/menu'}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                  >
                    <Utensils className="w-5 h-5" />
                    View Full Menu
                  </button>
                  <button 
                    onClick={handleCallClick}
                    className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl transition-all duration-300 border border-neutral-700 flex items-center justify-center gap-2"
                  >
                    <Phone className="w-5 h-5" />
                    Call: 0329 0039757
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}