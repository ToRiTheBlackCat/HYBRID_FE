import React, { useEffect, useState } from 'react';
import { CheckCircle, Star, Crown, Zap, ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Logo from "../assets/Logo2.jpg";
import Header from '../components/HomePage/Header';
import { fetchStudentTier, fetchTeacherTier } from '../services/userService';
import { RootState } from '../store/store';

// Giả định Tier type
type Tier = {
  tierId: string;
  tierName: string;
  description: string;
};

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const roleName = useSelector((state: RootState) => state.user.roleName);
  const userId = useSelector((state: RootState) => state.user.userId);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTiers = async () => {
      try {
        setLoading(true);
        let data: Tier[] = [];
        if (roleName === 'Student') {
          data = await fetchStudentTier();
        } else if (roleName === 'Teacher') {
          data = await fetchTeacherTier();
        }
        setTiers(data);
      } catch (error) {
        console.error('Error fetching tiers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTiers();
  }, [roleName]);

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case "1":
        return <Star className="w-8 h-8 text-blue-500" />;
      case "2":
        return <Crown className="w-8 h-8 text-yellow-500" />;
      default:
        return <Zap className="w-8 h-8 text-purple-500" />;
    }
  };

  const getTierColor = (tierId: string) => {
    switch (tierId) {
      case "1":
        return "from-blue-400 to-blue-600";
      case "2":
        return "from-yellow-400 to-orange-500";
      default:
        return "from-purple-400 to-purple-600";
    }
  };

  const getTierBadge = (tierId: string) => {
    switch (tierId) {
      case "1":
        return { text: "Basic", color: "bg-blue-100 text-blue-800" };
      case "2":
        return { text: "Premium", color: "bg-yellow-100 text-yellow-800" };
      default:
        return { text: "Pro", color: "bg-purple-100 text-purple-800" };
    }
  };

  const getPrice = (tierId: string) => {
    return tierId === "2" ? (roleName === "Student" ? 70000 : 30000) : 0;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading pricing plans...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden mt-10">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
          {/* Header Section */}
          <div className="text-center mb-12 pt-8">
            <div className="inline-flex items-center gap-3 mb-6">
              <img src={Logo} alt="logo" className="h-16 w-50 rounded-2xl shadow-lg" />
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-400" />
                <h1 className="text-4xl md:text-5xl font-bold text-white">
                  Choose Your Plan
                </h1>
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Unlock your potential with our flexible pricing options designed for {roleName?.toLowerCase()}s
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="flex-1 flex items-center justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full">
              {tiers.map((tier, index) => {
                const price = getPrice(tier.tierId);
                const isPopular = tier.tierId === "2";
                const badge = getTierBadge(tier.tierId);
                
                return (
                  <div
                    key={tier.tierId}
                    className={`relative transform transition-all duration-300 hover:scale-105 ${
                      isPopular ? 'md:scale-110 z-10' : ''
                    }`}
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    {/* Popular badge */}
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                          ⭐ Most Popular
                        </div>
                      </div>
                    )}
                    
                    <div className={`relative bg-white rounded-3xl shadow-2xl overflow-hidden ${
                      isPopular ? 'ring-4 ring-yellow-400 ring-opacity-50' : ''
                    }`}>
                      {/* Gradient header */}
                      <div className={`h-2 bg-gradient-to-r ${getTierColor(tier.tierId)}`}></div>
                      
                      <div className="p-8">
                        {/* Tier header */}
                        <div className="text-center mb-6">
                          <div className="flex justify-center mb-4">
                            {getTierIcon(tier.tierId)}
                          </div>
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <h2 className="text-2xl font-bold text-gray-800">
                              {tier.tierName.trim()}
                            </h2>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                              {badge.text}
                            </span>
                          </div>
                          
                          {/* Price */}
                          <div className="mb-4">
                            {price === 0 ? (
                              <div className="text-4xl font-bold text-gray-800">
                                Free
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-1">
                                <span className="text-4xl font-bold text-gray-800">
                                  {price.toLocaleString('vi-VN')}
                                </span>
                                <div className="text-left">
                                  <div className="text-sm text-gray-600">VND</div>
                                  <div className="text-xs text-gray-500">/month</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-4 mb-8">
                          {tier.description
                            .split(/\s*\/\s*/g)
                            .map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex items-start gap-3">
                                <CheckCircle className="text-green-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700 text-sm leading-relaxed">
                                  {feature.trim()}
                                </span>
                              </div>
                            ))}
                        </div>

                        {/* Action button */}
                        <div className="text-center">
                          {tier.tierId === "2" ? (
                            <button
                              onClick={() => {
                                const months = 1;
                                navigate("/payment-page", {
                                  state: {
                                    price: 3000,
                                    tierId: tier.tierId,
                                    days: months * 30,
                                    userId,
                                  },
                                });
                              }}
                              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                              <span className="flex items-center justify-center gap-2">
                                <Crown className="w-5 h-5" />
                                Upgrade Now
                              </span>
                            </button>
                          ) : (
                            <button
                              disabled
                              className="w-full bg-gray-100 text-gray-500 font-bold py-4 px-6 rounded-2xl cursor-not-allowed"
                            >
                              Current Plan
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom section */}
          <div className="text-center mt-12 pb-8">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white font-semibold py-3 px-8 rounded-2xl hover:bg-white/20 transition-all duration-300 border border-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>
            
            <div className="mt-6 text-gray-300 text-sm">
              <p>✨ All plans include 24/7 customer support</p>
              <p className="mt-1">🔒 Secure payment processing</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PricingPage;