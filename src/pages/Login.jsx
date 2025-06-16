"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaEye, FaEyeSlash, FaUser, FaLock, FaBuilding } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Login failed";

      if (error.code === "auth/user-not-found") {
        errorMessage = "User not found. Please check your email.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (userType) => {
    if (userType === "admin") {
      setEmail("admin@diskumperindag.com");
      setPassword("admin123");
    } else if (userType === "sumowono") {
      setEmail("sumowono@diskumperindag.com");
      setPassword("user123");
    } else if (userType === "bandarjo") {
      setEmail("bandarjo@diskumperindag.com");
      setPassword("user123");
    }
  };

  return (
    <div
      style={{ minHeight: "100vh", overflowY: "auto" }}
      className="bg-gradient-to-br from-blue-50 via-white to-blue-100"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-4 shadow-lg">
              <FaBuilding className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Diskumperindag
            </h1>
            <p className="text-gray-600 text-lg">Kabupaten Semarang</p>
            <div className="w-24 h-1 bg-blue-600 mx-auto mt-3 rounded-full"></div>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600">Please sign in to your account</p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Demo Accounts Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center mb-4">
                <p className="text-sm font-semibold text-gray-600">
                  Demo Accounts - Click to Auto Fill:
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => fillCredentials("admin")}
                  className="w-full text-left p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition duration-200 disabled:opacity-50"
                  disabled={loading}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                      <FaUser className="text-white text-sm" />
                    </div>
                    <div>
                      <p className="font-semibold text-purple-800">
                        Admin Account
                      </p>
                      <p className="text-sm text-purple-700">
                        admin@diskumperindag.com
                      </p>
                      <p className="text-sm text-purple-700">
                        Password: admin123
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => fillCredentials("sumowono")}
                  className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition duration-200 disabled:opacity-50"
                  disabled={loading}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                      <FaBuilding className="text-white text-sm" />
                    </div>
                    <div>
                      <p className="font-semibold text-blue-800">
                        User Sumowono
                      </p>
                      <p className="text-sm text-blue-700">
                        sumowono@diskumperindag.com
                      </p>
                      <p className="text-sm text-blue-700">Password: user123</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => fillCredentials("bandarjo")}
                  className="w-full text-left p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition duration-200 disabled:opacity-50"
                  disabled={loading}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <FaBuilding className="text-white text-sm" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-800">
                        User Bandarjo
                      </p>
                      <p className="text-sm text-green-700">
                        bandarjo@diskumperindag.com
                      </p>
                      <p className="text-sm text-green-700">
                        Password: user123
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pb-8">
            <p className="text-sm text-gray-500">
              © 2024 Diskumperindag Kabupaten Semarang. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
