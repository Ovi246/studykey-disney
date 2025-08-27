import { useState, FormEvent } from 'react';
import axios from 'axios';
// Assuming Logo is an actual image path
import Logo from "./assets/pngwing.com.png";

interface FormErrors {
  orderId?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  reviewScreenshot?: string;
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
  data?: any;
}

function App() {

  const [asin, setAsin] = useState<string | null>(null); // Simulates ASIN from API response
  const [orderId, setOrderId] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoadingOrderIdValidation, setIsLoadingOrderIdValidation] = useState(false); // Specific loading for order ID
  const [isSubmittingForm, setIsSubmittingForm] = useState(false); // Specific loading for form submission

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
    // Only call API if orderId is not empty and hasn't been validated yet (asin is null)
    if (orderId.trim() && asin === null) {
      setIsLoadingOrderIdValidation(true);
      try {
        // Replace with your actual API endpoint
        const response = await axios.post(
          "https://studykey-third-server.vercel.app/validate-order-id",
          {
            orderId,
          }
        );

        if (response.data.valid) {
          setAsin(response.data.asins);
          setErrors(prev => ({ ...prev, orderId: undefined })); // Clear order ID error if valid
        } else {
          setAsin(null); // Ensure ASIN is null if validation fails
          setErrors(prev => ({ ...prev, orderId: "Invalid Order ID. Please try again." })); // Update specific error
        }
      } catch (error) {
        console.error("Error validating order:", error);
        setAsin(null); // Ensure ASIN is null on error
        setErrors(prev => ({ ...prev, orderId: "Error validating order. Please try again." })); // Update specific error
      } finally {
        setIsLoadingOrderIdValidation(false);
      }
    } else if (!orderId.trim()) {
      setErrors(prev => ({ ...prev, orderId: "Order ID is required" }));
      setAsin(null); // Clear ASIN if order ID is empty
    }
  };

  const handlePage2Submit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validatePage1()) {
      return;
    }

    // Ensure ASIN is available before opening Amazon link and submitting form
    if (asin === null) {
      // If asin is still null, it means order ID validation didn't complete or failed.
      // This case should ideally be prevented by the disabled button, but as a fallback:
      setErrors(prev => ({ ...prev, orderId: "Please validate Order ID first." }));
      return;
    }

    // Open Amazon review page in a new tab
    window.open(`https://www.amazon.com/review/create-review?${asin}`, '_blank');

    setIsSubmittingForm(true);
    try {
      // Create a plain JavaScript object instead of FormData
      const formDataToSend = {
        orderId,
        asin, // ASIN is guaranteed to be string here
        name: fullName,
        email,
        phoneNumber,
      };

      // Log the object contents for debugging purposes
      console.log("JSON data being sent:", formDataToSend);

      const { data } = await axios.post<ApiResponse>(
        "https://studykey-third-server.vercel.app/claim-ticket",
        formDataToSend, // Send the plain JavaScript object
      );

      if (!data.success) {
        switch (data.error?.type) {
          case "DUPLICATE_CLAIM":
            showError(
              "This order has already been claimed. Each order can only be claimed once."
            );
            break;
          case "FILE_TOO_LARGE":
            showError(
              "The image file is too large. Please upload an image under 5MB."
            );
            break;
          case "INVALID_DATA":
            showError("Please check your information and try again.");
            break;
          case "SERVER_ERROR":
            showError(
              "Our servers are experiencing issues. Please try again later."
            );
            break;
          default:
            showError("An unexpected error occurred. Please try again.");
        }
        return;
      }

      // Success case
      console.log("Your review and entry have been submitted successfully!");
      // In a real application, you might show a success message in a modal or toast.

      // Reset form fields after successful submission
      setOrderId("");
      setFullName("");
      setEmail("");
      setPhoneNumber("");
      setAsin(null);
      setErrors({});
    } catch (error) {
      console.error("Error submitting review:", error);

      // Handle Axios specific errors for better user feedback
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // The request was made and the server responded with a status code that falls out of the range of 2xx
          const errorData = error.response.data as ApiResponse;
          if (errorData.error) {
            showError(errorData.error.message);
          } else {
            showError("Server error occurred. Please try again later.");
          }
        } else if (error.request) {
          // The request was made but no response was received (e.g., network error)
          showError(
            "No response from server. Please check your internet connection."
          );
        } else {
          // Something happened in setting up the request that triggered an Error
          showError("Failed to submit claim. Please try again.");
        }
      } else {
        // Handle any non-Axios errors
        showError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmittingForm(false);
    }
  }

  // Function to show errors, ideally updating a UI component for user feedback
  const showError = (message: string) => {
    // For this example, we're setting it to the reviewScreenshot error field
    // In a production app, you might have a dedicated state for general form errors
    setErrors(prev => ({ ...prev, reviewScreenshot: message }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative min-h-[600px] bg-[url('https://images6.alphacoders.com/404/404692.jpg')] bg-cover bg-center rounded-b-xl overflow-hidden"> {/* Added rounded-b-xl */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/50"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center text-center text-white space-y-6">
            <img src={Logo} className="w-50 h-auto rounded-lg shadow-lg"></img> {/* Added styling to image */}
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Win Disney World Tickets! ✨
            </h1>
            <p className="text-2xl md:text-3xl max-w-2xl">
              Enter to win an unforgettable trip to the most magical place on
              earth! 🏰
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"> {/* Rounded button */}
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
                onSubmit={handlePage2Submit}
                className={`absolute inset-0 bg-white rounded-xl shadow-lg p-4 sm:p-8 space-y-6`}
              >
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-gray-800">
                    Enter the Giveaway 📝
                  </h2>
                  <p className="text-gray-600">
                    Fill out the form below to enter the giveaway. 👇
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg flex items-center shadow-inner"> {/* Added shadow-inner */}
                  <span className="text-blue-800 font-semibold mr-2">
                    💡 Demo Form:
                  </span>
                  <span className="text-blue-600">
                    Fill out all fields to proceed!
                  </span>
                </div>
                <div className="space-y-4">
                  <div className='relative'>
                    {isLoadingOrderIdValidation && <div className="absolute top-4 right-5 flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500"
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
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>}
                    <input
                      type="text"
                      className={`w-full p-3 rounded-lg border ${
                        errors.orderId ? "border-red-500" : "border-gray-300"
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm`} 
                      placeholder={"Order Number*"}
                      value={orderId}
                      onChange={(e) => {
                        setOrderId(e.target.value);
                        setErrors(prev => ({ ...prev, orderId: undefined }));
                        // Reset ASIN when orderId changes, so it needs re-validation
                        setAsin(null);
                      }}
                      required
                      onBlur={handleOrderIdBlur} // Call validation/fetch on blur
                    />
                    {errors.orderId && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.orderId}
                      </p>
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
                        setErrors(prev => ({ ...prev, fullName: undefined }));
                      }}
                      required
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.fullName}
                      </p>
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
                        setErrors(prev => ({ ...prev, email: undefined }));
                      }}
                      required
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      type="tel"
                      className={`w-full p-3 rounded-lg border ${
                        errors.phoneNumber
                          ? "border-red-500"
                          : "border-gray-300"
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm`}
                      placeholder="Phone Number*"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        setErrors(prev => ({ ...prev, phoneNumber: undefined }));
                      }}
                      required
                    />
                    {errors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    // Disable if ASIN is null, or if either API call is in progress
                    disabled={asin === null || isLoadingOrderIdValidation || isSubmittingForm}
                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-md ${ /* Added shadow-md */
                      (isLoadingOrderIdValidation || isSubmittingForm) ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isSubmittingForm ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : asin ? (
                      "Share & Continue"
                    ) : (
                      "Continue"
                    )}
                  </button>
                  {errors.reviewScreenshot && (
                    <p className="mt-1 text-sm text-red-500 text-center">
                      {errors.reviewScreenshot}
                    </p>
                  )}
                </div>
              </form>
            </div>

            {/* Prize Details */}
            <div className="flex-1 space-y-6 py-8">
              <div className="bg-blue-800 rounded-xl shadow-lg p-8 text-white">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2 text-blue-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                  Prize Details
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <svg
                      className="w-5 h-5 text-blue-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    <span>4 Disney World Park Hopper Tickets</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <svg
                      className="w-5 h-5 text-blue-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    <span>3-Night Stay at a Disney Resort Hotel</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <svg
                      className="w-5 h-5 text-blue-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    <span>$500 Disney Gift Card</span>
                  </li>
                </ul>
              </div>

              {/* Stay Connected */}
              <div className="bg-rose-800 rounded-xl shadow-lg p-8 text-white">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2 text-rose-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM12 11v9m-4-9v9m8-9v9M3 13h18"
                    />
                  </svg>
                  Stay Connected
                </h2>
                <p className="mb-6">
                  Follow us on Instagram to stay updated about the official
                  rules and winner announcement! 📢
                </p>
                <button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-3 rounded-full text-lg font-semibold flex items-center justify-center transition-all duration-300 transform hover:scale-[1.02] shadow-lg"> {/* Rounded button */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-instagram mr-2"
                  >
                    <rect
                      x="2"
                      y="2"
                      width="20"
                      height="20"
                      rx="5"
                      ry="5"
                    ></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
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
                  <span>One entry per person ☝️</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-blue-600 font-bold">3.</span>
                  <span>Contest ends on December 31, 2025 🗓️</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-blue-600 font-bold">4.</span>
                  <span>Winner will be notified via email 📧</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-blue-600 font-bold">5.</span>
                  <span>
                    Prize must be claimed within 30 days of winning 🏆
                  </span>
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
                Experience the magic of Disney World with this exclusive
                giveaway opportunity. ✨
              </p>
            </div>
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
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101m-.757 4.898l-4 4v.001"
                  />
                </svg>
                Quick Links
              </h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors flex items-center"
                  >
                    <span className="mr-2">•</span>Terms & Conditions 📜
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors flex items-center"
                  >
                    <span className="mr-2">•</span>Privacy Policy 🔒
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors flex items-center"
                  >
                    <span className="mr-2">•</span>Contact Us 📞
                  </a>
                </li>
              </ul>
            </div>
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
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684L10 9l-2 2m0 0l2 2m-2-2l-2 2m2-2h4m3 0h3M10 13l2 2m0 0l2 2m-2-2v4m-4-4l-1 1M14 10l-1 1"
                  />
                </svg>
                Contact 📧
              </h3>
              <ul className="space-y-2 text-gray-400">
                <li>Email: support@disneygiveaway.com</li>
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
