import { useState, FormEvent } from 'react';
import axios from 'axios';
import Logo from "./assets/pngwing.com.png"

interface FormErrors {
  orderId?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  // reviewScreenshot?: string; // Commented out
}

// Add this interface for error types
interface ApiError {
  type: 'DUPLICATE_CLAIM' | 'FILE_TOO_LARGE' | 'INVALID_DATA' | 'SERVER_ERROR';
  message: string;
}

// Add this interface for API response
interface ApiResponse {
  success: boolean;
  error?: ApiError;
  data?: Record<string, unknown>; // Changed from any to be more specific
}

function App() {
  const [currentPage, setCurrentPage] = useState(1); // 1 for page 1, 2 for page 2
  const [asin, setAsin] = useState<string | null>(null); // Simulates ASIN from API response
  const [orderId, setOrderId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  // const [reviewScreenshot, setReviewScreenshot] = useState<File | null>(null); // Commented out
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const re = /^\+?[\d\s-]{10,}$/;
    return re.test(phone);
  };

  const validatePage1 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!orderId.trim()) {
      newErrors.orderId = 'Order ID is required';
    }

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!validatePhoneNumber(phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePage2 = (): boolean => {
    // No validation needed for page 2 since we removed the screenshot requirement
    return true;
  };

  const handlePage1Submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validatePage1()) {
      return;
    }

    setIsLoading(true);
    try {
      // Replace with your actual API endpoint
      const response = await axios.post('https://studykey-third-server.vercel.app/validate-order-id', {
        orderId,
      });

      if (response.data.valid) {
        setAsin(response.data.asins);
        setCurrentPage(2);
      } else {
        setErrors({ orderId: 'Invalid Order ID. Please try again.' });
      }
    } catch (error) {
      console.error('Error validating order:', error);
      setErrors({ orderId: 'Error validating order. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function to show errors
  const showError = (message: string) => {
    setErrors({ orderId: message }); // Changed from reviewScreenshot to orderId since we removed that field
  };

  const handlePage2Submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validatePage2()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      // formData.append('reviewScreenshot', reviewScreenshot as File); // Commented out
      formData.append('orderId', orderId);
      formData.append('asin', asin as string);
      formData.append('name', fullName);
      formData.append('email', email);
      formData.append('phoneNumber', phoneNumber);

      const { data } = await axios.post<ApiResponse>('https://studykey-third-server.vercel.app/claim-ticket', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!data.success) {
        switch (data.error?.type) {
          case 'DUPLICATE_CLAIM':
            showError('This order has already been claimed. Each order can only be claimed once.');
            break;
          case 'FILE_TOO_LARGE':
            showError('The image file is too large. Please upload an image under 5MB.');
            break;
          case 'INVALID_DATA':
            showError('Please check your information and try again.');
            break;
          case 'SERVER_ERROR':
            showError('Our servers are experiencing issues. Please try again later.');
            break;
          default:
            showError('An unexpected error occurred. Please try again.');
        }
        return;
      }

      // Success case
      alert('Your entry has been submitted successfully!');
      // Reset form
      setCurrentPage(1);
      setOrderId('');
      setFullName('');
      setEmail('');
      setPhoneNumber('');
      setAsin(null);
      // setReviewScreenshot(null); // Commented out
      setErrors({});

    } catch (error) {
      console.error('Error submitting review:', error);
      
      // Handle Axios specific errors
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          const errorData = error.response.data as ApiResponse;
          if (errorData.error) {
            showError(errorData.error.message);
          } else {
            showError('Server error occurred. Please try again later.');
          }
        } else if (error.request) {
          // The request was made but no response was received
          showError('No response from server. Please check your internet connection.');
        } else {
          // Something happened in setting up the request that triggered an Error
          showError('Failed to submit claim. Please try again.');
        }
      } else {
        // Handle non-Axios errors
        showError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { // Commented out entire function
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     if (file.size > 5 * 1024 * 1024) { // 5MB limit
  //       setErrors({ reviewScreenshot: 'File size should be less than 5MB' });
  //       return;
  //     }
  //     if (!file.type.startsWith('image/')) {
  //       setErrors({ reviewScreenshot: 'Please upload an image file' });
  //       return;
  //     }
  //     setReviewScreenshot(file);
  //     setErrors({ ...errors, reviewScreenshot: undefined });
  //   }
  // };

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
            {/* Entry Form Container */}
            <div className="flex-1 relative min-h-[600px]">
              {/* Page 1 Form */}
              <form
                onSubmit={handlePage1Submit}
                className={`absolute inset-0 bg-white rounded-xl shadow-lg p-4 sm:p-8 space-y-6 transition-transform duration-500 ${
                  currentPage === 1 ? 'translate-x-0 opacity-100 z-10' : '-translate-x-full opacity-0 z-0'
                }`}
              >
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-gray-800">Enter the Giveaway 📝</h2>
                  <p className="text-gray-600">Fill out the form below to enter the giveaway. 👇</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg flex items-center">
                  <span className="text-blue-800 font-semibold mr-2">💡 Demo Form:</span>
                  <span className="text-blue-600">Fill out all fields to proceed!</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      className={`w-full p-3 rounded-lg border ${errors.orderId ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                      placeholder="Order Number*"
                      value={orderId}
                      onChange={(e) => {
                        setOrderId(e.target.value);
                        setErrors({ ...errors, orderId: undefined });
                      }}
                      required
                    />
                    {errors.orderId && <p className="mt-1 text-sm text-red-500">{errors.orderId}</p>}
                  </div>

                  <div>
                    <input
                      type="text"
                      className={`w-full p-3 rounded-lg border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                      placeholder="Full Name*"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        setErrors({ ...errors, fullName: undefined });
                      }}
                      required
                    />
                    {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>}
                  </div>

                  <div>
                    <input
                      type="email"
                      className={`w-full p-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                      placeholder="Email Address*"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors({ ...errors, email: undefined });
                      }}
                      required
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                  </div>

                  <div>
                    <input
                      type="tel"
                      className={`w-full p-3 rounded-lg border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                      placeholder="Phone Number*"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        setErrors({ ...errors, phoneNumber: undefined });
                      }}
                      required
                    />
                    {errors.phoneNumber && <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Validating...
                      </div>
                    ) : (
                      'Continue'
                    )}
                  </button>
                </div>
              </form>

              {/* Page 2 Form */}
              <form
                onSubmit={handlePage2Submit}
                className={`absolute inset-0 bg-white rounded-xl shadow-lg p-4 sm:p-8 space-y-6 transition-transform duration-500 ${
                  currentPage === 2 ? 'translate-x-0 opacity-100 z-10' : 'translate-x-full opacity-0 z-0'
                }`}
              >
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-gray-800">Almost Done! 🎉</h2>
                  <p className="text-gray-600">We'd love to get your honest feedback to help us improve our product for toddlers like yours! ✨</p>
                </div>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-blue-800">
                    <p className="font-semibold mb-2">💝 Your Feedback Matters:</p>
                    <p className="text-sm">We would love to get your honest feedback! You will be helping us improve our product for toddlers like yours!</p>
                  </div>

                  {asin && (
                    <a
                      href={`https://www.amazon.com/review/create-review/ref=cm_cr_arp_d_wr_but_bottom?asin=${asin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Share Review on Amazon
                    </a>
                  )}

                  <div className="bg-green-50 p-4 rounded-lg text-green-800">
                    <p className="font-semibold mb-2">✅ Ready to Submit:</p>
                    <p className="text-sm">Click the button below to finalize your entry into the Disney World giveaway!</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </div>
                    ) : (
                      'Final Submit'
                    )}
                  </button>
                </div>
              </form>
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

              

              {/* Stay Connected */}
              <div className="bg-rose-800 rounded-xl shadow-lg p-8 text-white">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM12 11v9m-4-9v9m8-9v9M3 13h18" />
                  </svg>Stay Connected
                </h2>
                <p className="mb-6">Follow us on Instagram to stay updated about the official rules and winner announcement! 📢</p>
                <button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-3 rounded-lg text-lg font-semibold flex items-center justify-center transition-all duration-300 transform hover:scale-[1.02]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-instagram mr-2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  @studykey_official
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contest Rules Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Contest Rules & Guidelines 📜</h2>
            <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <span className="text-blue-600 font-bold">1.</span>
                  <span>Must be 18 years or older to enter 🔞</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-blue-600 font-bold">2.</span>
                  <span>One entry per person ☝️</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-blue-600 font-bold">3.</span>
                  <span>Winner will be notified via email and social media @studykey_official 📧</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-blue-600 font-bold">4.</span>
                  <span>Prize must be claimed within 30 days of winning 🏆</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

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
