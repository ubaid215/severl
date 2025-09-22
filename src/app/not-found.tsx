"use client"
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br py-7 from-gray-900 via-gray-800 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        
        {/* Logo Section */}
        <div className="mb-12">
          <div className="inline-block relative">
            {/* Logo Background Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-red-500 to-yellow-500 rounded-xl blur opacity-20 animate-pulse"></div>
            
            {/* Logo Container */}
            <div className="relative bg-white p-6 rounded-xl shadow-2xl">
              <div className="w-24 h-24 mx-auto mb-4 relative">
                {/* Recreated Logo */}
                <div className="w-full h-full border-4 border-transparent bg-gradient-to-r from-red-500 to-yellow-500 rounded-lg p-1">
                  <div className="w-full h-full bg-white rounded-md flex items-center justify-center">
                    <div className="text-4xl font-bold bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent">
                      S
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Brand Name */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-wider text-red-500">
                  SEVERAL
                </h1>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-8 h-px bg-gray-600"></div>
                  <p className="text-sm text-gray-600 font-medium tracking-widest">
                    THE TASTE OF LIFE
                  </p>
                  <div className="w-8 h-px bg-gray-600"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 404 Content */}
        <div className="mb-12">
          {/* Large 404 */}
          <div className="mb-8">
            <h2 className="text-9xl font-black text-transparent bg-gradient-to-r from-red-500 via-yellow-500 to-red-600 bg-clip-text mb-4">
              404
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-red-500 to-yellow-500 mx-auto rounded-full"></div>
          </div>

          {/* Error Message */}
          <div className="space-y-6 mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">
              Oops! We've Lost the Recipe
            </h3>
            <p className="text-xl text-gray-300 leading-relaxed max-w-lg mx-auto">
              Looks like this page wandered off the menu! Don't worry, our chefs are working on it.
            </p>
            <p className="text-lg text-gray-400">
              Let's get you back to taste some amazing flavors.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Back to Home
            </Link>

            <Link
              href="/menu"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 font-semibold rounded-xl hover:from-yellow-600 hover:to-yellow-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Browse Menu
            </Link>
          </div>
        </div>

        {/* Decorative Food Icons */}
        <div className="flex justify-center space-x-8 opacity-20 text-4xl animate-bounce">
          <span className="animation-delay-100">🍕</span>
          <span className="animation-delay-200">🍔</span>
          <span className="animation-delay-300">🍜</span>
          <span className="animation-delay-400">🥗</span>
        </div>

        {/* Additional Links */}
        <div className="mt-16 pt-8 border-t border-gray-700">
          <p className="text-gray-400 mb-4">Need help? Try these popular sections:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/menu" className="text-yellow-400 hover:text-yellow-300 transition-colors">
              Our Menu
            </Link>
            <span className="text-gray-600">•</span>
            <Link href="/about" className="text-yellow-400 hover:text-yellow-300 transition-colors">
              About Us
            </Link>
            <span className="text-gray-600">•</span>
            <Link href="/contact" className="text-yellow-400 hover:text-yellow-300 transition-colors">
              Contact
            </Link>
            <span className="text-gray-600">•</span>
            <Link href="/reservations" className="text-yellow-400 hover:text-yellow-300 transition-colors">
              Reservations
            </Link>
          </div>
        </div>
      </div>

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <style jsx>{`
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-100 {
          animation-delay: 0.1s;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
      `}</style>
    </div>
  )
}