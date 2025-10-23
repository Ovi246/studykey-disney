import { useState, FormEvent } from 'react';
import axios from 'axios';
// Assuming Logo is an actual image path
import Logo from "./assets/pngwing.com.png";

interface FormErrors {
  orderId?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  general?: string;
}

interface ApiError {
  type: 'DUPLICATE_CLAIM' | 'FILE_TOO_LARGE' | 'INVALID_DATA' | 'SERVER_ERROR';
  message: string;
}

interface ApiResponse {
  success: boolean;
  error?: ApiError;
  data?: any;
}

function App() {
  const [asin, setAsin] = useState<string | null>(null);
  const [orderId, setOrderId] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoadingOrderId, setIsLoadingOrderId] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const re = /^\+?[\d\s-]{10,}$/;
    return re.test(phone);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!orderId.trim()) {
      newErrors.orderId = "Order ID is required";
    }

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!validatePhoneNumber(phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOrderIdBlur = async () => {
    if (orderId.trim() && asin === null) {
      setIsLoadingOrderId(true);
      try {
        const response = await axios.post(
          "https://studykey-third-server.vercel.app/validate-order-id",
          { orderId }
        );

        if (response.data.valid) {
          setAsin(response.data.asins);
          setErrors(prev => ({ ...prev, orderId: undefined }));
        } else {
          setAsin(null);
          setErrors(prev => ({ ...prev, orderId: "Invalid Order ID. Please try again." }));
        }
      } catch (error) {
        console.error("Error validating order:", error);
        setAsin(null);
        setErrors(prev => ({ ...prev, orderId: "Error validating order. Please try again." }));
      } finally {
        setIsLoadingOrderId(false);
      }
    } else if (!orderId.trim()) {
      setErrors(prev => ({ ...prev, orderId: "Order ID is required" }));
      setAsin(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (asin === null) {
      setErrors(prev => ({ ...prev, orderId: "Please validate Order ID first." }));
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = {
        orderId,
        asin,
        name: fullName,
        email,
        phoneNumber,
      };

      console.log("Submitting data:", formData);

      const { data } = await axios.post<ApiResponse>(
        "https://studykey-third-server.vercel.app/claim-ticket",
        formData
      );

      if (!data.success) {
        switch (data.error?.type) {
          case "DUPLICATE_CLAIM":
            setErrors(prev => ({ ...prev, general: "This order has already been claimed. Each order can only be claimed once." }));
            break;
          case "FILE_TOO_LARGE":
            setErrors(prev => ({ ...prev, general: "The image file is too large. Please upload an image under 5MB." }));
            break;
          case "INVALID_DATA":
            setErrors(prev => ({ ...prev, general: "Please check your information and try again." }));
            break;
          case "SERVER_ERROR":
            setErrors(prev => ({ ...prev, general: "Our servers are experiencing issues. Please try again later." }));
            break;
          default:
            setErrors(prev => ({ ...prev, general: "An unexpected error occurred. Please try again." }));
        }
        return;
      }

      // Success - reset form
      console.log("Success! Form submitted.");
      setOrderId("");
      setFullName("");
      setEmail("");
      setPhoneNumber("");
      setAsin(null);
      setErrors({});
      alert("Your entry has been submitted successfully!");
    } catch (error) {
      console.error("Error submitting:", error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          const errorData = error.response.data as ApiResponse;
          setErrors(prev => ({ ...prev, general: errorData.error?.message || "Server error occurred." }));
        } else if (error.request) {
          setErrors(prev => ({ ...prev, general: "No response from server. Please check your internet connection." }));
        } else {
          setErrors(prev => ({ ...prev, general: "Failed to submit. Please try again." }));
        }
      } else {
        setErrors(prev => ({ ...prev, general: "An unexpected error occurred. Please try again." }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative min-h-[600px] bg-[url('https://images6.alphacoders.com/404/404692.jpg')] bg-cover bg-center rounded-b-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/50"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center text-center text-white space-y-6">
            <img src={Logo} className="w-50 h-auto rounded-lg shadow-lg" alt="Logo" />
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Win Disney World Tickets! ✨
            </h1>
            <p className="text-2xl md:text-3xl max-w-2xl">
              Enter to win an unforgettable trip to the most magical place on earth! 🏰
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
              Limited Time Offer 🎟️
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto items-stretch">
            {/* Entry Form */}
            <div className="flex-1">
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-xl shadow-lg p-4 sm:p-8 space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-gray-800">
                    Enter the Giveaway 📝
                  </h2>
                  <p className="text-gray-600">
                    Fill out the form below to enter the giveaway. 👇
                  </p>
                 
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    {isLoadingOrderId && (
                      <div className="absolute top-4 right-5 flex items-center justify-center">
                        <svg
                          className="animate-spin h-5 w-5 text-blue-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </div>
                    )}
                    <input
                      type="text"
                      className={`w-full p-3 rounded-lg border ${
                        errors.orderId ? "border-red-500" : "border-gray-300"
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm`}
                      placeholder="Order Number*"
                      value={orderId}
                      onChange={(e) => {
                        setOrderId(e.target.value);
                        setErrors((prev) => ({ ...prev, orderId: undefined }));
                        setAsin(null);
                      }}
                      required
                      onBlur={handleOrderIdBlur}
                    />
                    {errors.orderId && (
                      <p className="mt-1 text-sm text-red-500">{errors.orderId}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      className={`w-full p-3 rounded-lg border ${
                        errors.fullName ? "border-red-500" : "border-gray-300"
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm`}
                      placeholder="Full Name*"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        setErrors((prev) => ({ ...prev, fullName: undefined }));
                      }}
                      required
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="email"
                      className={`w-full p-3 rounded-lg border ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm`}
                      placeholder="Email Address*"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      required
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="tel"
                      className={`w-full p-3 rounded-lg border ${
                        errors.phoneNumber ? "border-red-500" : "border-gray-300"
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm`}
                      placeholder="Phone Number*"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        setErrors((prev) => ({ ...prev, phoneNumber: undefined }));
                      }}
                      required
                    />
                    {errors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={asin === null || isLoadingOrderId || isSubmitting}
                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-md ${
                      isLoadingOrderId || isSubmitting || asin === null
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      "Submit Entry"
                    )}
                  </button>
                  
                  {errors.general && (
                    <p className="mt-1 text-sm text-red-500 text-center">
                      {errors.general}
                    </p>
                  )}
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
                    <span>
                      Winner can choose if they want Walt Disney World Resort tickets in Florida
                    </span>
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
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              Contest Rules & Guidelines 📜
            </h2>
            <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <span className="text-blue-600 font-bold">1.</span>
                  <span>Must be 18 years or older to enter 🔞</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-blue-600 font-bold">2.</span>
                  <span>One entry per order number ☝️</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-blue-600 font-bold">3.</span>
                  <span>Winner will be notified via email 📧</span>
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
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16V9m-4 7V9m10 8V5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2z"
                  />
                </svg>
                About the Contest
              </h3>
              <p className="text-gray-400">
                Experience the magic of Disney World with this exclusive giveaway opportunity. ✨
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101m-.757 4.898l-4 4v.001" /></svg>Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors flex items-center">
                    <span className="mr-2">•</span>Terms & Conditions 📜
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors flex items-center">
                    <span className="mr-2">•</span>Privacy Policy 🔒
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors flex items-center">
                    <span className="mr-2">•</span>Contact Us 📞
                  </a>
                </li>
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
            <p>&copy; 2025 Disney World Giveaway | Studykey.ca | All rights reserved. 🎉</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;