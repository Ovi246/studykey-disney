import Logo from "./assets/pngwing.com.png"

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative min-h-[600px] bg-[url('https://images6.alphacoders.com/404/404692.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/50"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center text-center text-white space-y-6">
            <img src={Logo} className="w-50 "></img>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">Win Disney World Tickets! ✨</h1>
            <p className="text-2xl md:text-3xl max-w-2xl">Enter to win an unforgettable trip to the most magical place on earth! 🏰</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105">
              Limited Time Offer 🎟️
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto items-stretch">
            {/* Contact Instructions Container */}
            <div className="flex-1">
              <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-bold text-gray-800">How to Enter the Giveaway 📝</h2>
                  <p className="text-gray-600 text-lg">Please contact us on Amazon to enter the contest! 👇</p>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                  <h3 className="text-xl font-bold text-blue-800 mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Contact Us on Amazon
                  </h3>
                  <p className="text-blue-700 mb-4">
                    To enter our Disney World giveaway contest, please reach out to us through Amazon's customer messaging system.
                  </p>
                 
                </div>
              </div>
            </div>

            {/* Prize Details */}
            <div className="flex-1 space-y-6 py-8">
              <div className="bg-blue-800 rounded-xl shadow-lg p-8 text-white">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>Prize Details
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>2 adult tickets & 2 kids tickets</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Winner can choose if they want Walt Disney World Resort Tickets in Florida</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Or Disneyland Park tickets in California</span>
                  </li>
                </ul>
              </div>

              

             
            </div>
          </div>
        </div>
      </section>

      {/* Contest Rules Section */}
    
      {/* Footer Section */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V9m-4 7V9m10 8V5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2z" /></svg>About Studykey.ca</h3>
              <p className="text-gray-400">Experience the magic of Disney World with this exclusive giveaway opportunity. ✨</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101m-.757 4.898l-4 4v.001" /></svg>Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="https://studykey.ca" className="hover:text-white transition-colors flex items-center"><span className="mr-2">•</span>Visit Studykey.ca 🌎</a></li>
                <li><a href="#" className="hover:text-white transition-colors flex items-center"><span className="mr-2">•</span>Privacy Policy 🔒</a></li>
                <li><a href="#" className="hover:text-white transition-colors flex items-center"><span className="mr-2">•</span>Contact Us 📞</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684L10 9l-2 2m0 0l2 2m-2-2l-2 2m2-2h4m3 0h3M10 13l2 2m0 0l2 2m-2-2v4m-4-4l-1 1M14 10l-1 1" /></svg>Contact 📧</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Email: support@studykey.ca</li>
                <li>Phone: (555) 123-4567</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2025 Disney World Giveaway. All rights reserved. 🎉</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
