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
  Phone
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
      color: "text-red-500"
    },
    {
      icon: Users,
      title: "Customer Focused",
      description: "Your satisfaction is our priority. We listen, adapt, and continuously improve our service.",
      color: "text-blue-500"
    },
    {
      icon: Shield,
      title: "Food Safety",
      description: "Maintaining the highest standards of hygiene and food safety in all our operations.",
      color: "text-green-500"
    },
    {
      icon: Leaf,
      title: "Fresh & Local",
      description: "Supporting local farmers and using fresh, seasonal ingredients whenever possible.",
      color: "text-yellow-500"
    }
  ]

  const team = [
    {
      name: "Chef Ahmed",
      role: "Head Chef",
      description: "15+ years of culinary expertise specializing in traditional and fusion cuisine.",
      image: "/chef1.jpg"
    },
    {
      name: "Muhammad Umair",
      role: "Restaurant Manager",
      description: "Passionate about hospitality with 8 years of restaurant management experience.",
      image: "/manager.jpg"
    },
    {
      name: "Ali Hassan",
      role: "Sous Chef",
      description: "Creative culinary artist known for innovative flavor combinations and presentations.",
      image: "/chef2.jpg"
    }
  ]

  const handleCallClick = () => {
    window.location.href = 'tel:03290039757'
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 py-20">
        <div className="absolute inset-0 bg-[url('/images/pattern.jpg')] opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Heart className="w-12 h-12 text-yellow-500 mr-4" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
              About <span className="text-yellow-500">Us</span>
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Discover our story, values, and the passionate team behind every delicious meal. We're more than just a restaurant – we're your culinary destination in Faisalabad.
          </p>
        </div>
      </div>

      {/* Our Story Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-6 flex items-center">
              <Utensils className="w-8 h-8 mr-3" />
              Our Story
            </h2>
            <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
              <p>
                Founded with a passion for exceptional food and warm hospitality, our restaurant has been serving the Faisalabad community with authentic flavors and memorable dining experiences. What started as a small family dream has grown into a beloved local destination.
              </p>
              <p>
                Located in the heart of Peoples Colony No 2, we've built our reputation on quality ingredients, traditional recipes, and innovative culinary techniques. Every dish tells a story of dedication, creativity, and love for the culinary arts.
              </p>
              <p>
                Our commitment goes beyond just serving food – we create experiences that bring families and friends together, celebrating the joy of sharing great meals in a welcoming atmosphere.
              </p>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-2xl p-8 border border-yellow-500/30">
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => {
                  const IconComponent = stat.icon
                  return (
                    <div key={index} className="text-center group">
                      <div className="bg-gray-900 rounded-xl p-4 border border-yellow-500/20 group-hover:border-yellow-500/50 transition-all duration-300">
                        <IconComponent className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-white">{stat.number}</div>
                        <div className="text-sm text-gray-400">{stat.label}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="bg-gray-900/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-4 flex items-center justify-center">
              <Star className="w-8 h-8 mr-3" />
              Our Values
            </h2>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              The principles that guide everything we do, from sourcing ingredients to serving our community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon
              return (
                <div key={index} className="bg-gray-900 rounded-2xl p-6 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 hover:scale-105 group">
                  <div className="text-center">
                    <div className="bg-black rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <IconComponent className={`w-8 h-8 ${value.color}`} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors">
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

      {/* Our Team Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-4 flex items-center justify-center">
            <ChefHat className="w-8 h-8 mr-3" />
            Meet Our Team
          </h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            The talented individuals who bring passion and expertise to every dish we serve.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <div key={index} className="bg-gray-900 rounded-2xl overflow-hidden border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 hover:scale-105 group">
              <div className="relative h-64 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 flex items-center justify-center">
                <ChefHat className="w-16 h-16 text-yellow-500 group-hover:scale-110 transition-transform" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                  {member.name}
                </h3>
                <div className="text-yellow-500 font-semibold mb-3">
                  {member.role}
                </div>
                <p className="text-gray-400 leading-relaxed">
                  {member.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-gray-900/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-4">
              Why Choose Us?
            </h2>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              What sets us apart and makes us the preferred choice for food lovers in Faisalabad.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 rounded-2xl p-8 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 text-center group">
              <div className="bg-green-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Truck className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-yellow-400 transition-colors">
                Fast Delivery
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Quick and reliable delivery service ensuring your food arrives fresh and on time, every time.
              </p>
            </div>

            <div className="bg-gray-900 rounded-2xl p-8 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 text-center group">
              <div className="bg-blue-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-yellow-400 transition-colors">
                Always Fresh
              </h3>
              <p className="text-gray-400 leading-relaxed">
                We prepare everything fresh daily using premium ingredients for the best taste and quality.
              </p>
            </div>

            <div className="bg-gray-900 rounded-2xl p-8 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 text-center group">
              <div className="bg-purple-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-yellow-400 transition-colors">
                Made with Love
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Every dish is crafted with care, attention to detail, and genuine passion for culinary excellence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Location & Contact Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-2xl p-8 border border-yellow-500/30">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-yellow-400 mb-6 flex items-center">
                <MapPin className="w-8 h-8 mr-3" />
                Visit Our Location
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-yellow-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold mb-1">Address:</p>
                    <p className="text-gray-300 leading-relaxed">
                      P-562/A Opposite Govt. Nusrat Fateh Ali Khan Hospital, Peoples Colony No 2, Faisalabad
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-yellow-500 mr-3" />
                  <div>
                    <p className="text-white font-semibold mb-1">Hours:</p>
                    <p className="text-gray-300">Open daily: 5:00 APM - 01:00 AM</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center lg:text-right">
              <h3 className="text-2xl font-bold text-white mb-6">Ready to Experience Amazing Food?</h3>
              <div className="flex flex-col sm:flex-row lg:flex-col gap-4 justify-center lg:justify-end">
                <button 
                  onClick={() => window.location.href = '/menu'}
                  className="bg-yellow-500 text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-600 transition-all duration-300 hover:scale-105 flex items-center justify-center"
                >
                  <Utensils className="w-5 h-5 mr-2" />
                  View Our Menu
                </button>
                <button 
                  onClick={handleCallClick}
                  className="bg-white text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 flex items-center justify-center"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}