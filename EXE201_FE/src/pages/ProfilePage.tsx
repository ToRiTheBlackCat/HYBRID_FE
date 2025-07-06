import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { FaUser, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaCrown, FaEdit, FaTimes, FaUserCircle } from 'react-icons/fa';
import { fetchUserProfile, updateUserProfile } from '../services/authService';
import { useEffect, useState } from 'react';
import { Profile } from '../types';
import Header from '../components/HomePage/Header';
import Footer from '../components/HomePage/Footer';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const user = useSelector((state: RootState) => state.user);
  const [profileData, setProfileData] = useState<Profile>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Profile>>({});
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const getProfile = async () => {
      const isTeacher = user.roleId === '3';
      try {
        const data = await fetchUserProfile(user.userId, isTeacher);
        setProfileData(data ?? undefined);
        setFormData(data ?? {});
      } catch (error) {
        console.log(error);
      }
    };

    getProfile();
  }, [user.userId, user.roleId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      const updatedProfile = {
        userId: user.userId,
        ...formData,
      };

      const response = await updateUserProfile(updatedProfile);

      if (response) {
        setProfileData((prev) => ({ ...prev, ...updatedProfile } as Profile));
        setIsModalOpen(false);
        toast.success("Cập nhật thành công");
      } else {
        toast.warn("Cập nhật thất bại");
      }
    } catch (error) {
      console.log("Update error:", error);
    }
  };

  const openModal = () => {
    setFormData(profileData ?? {});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-lg text-gray-600">Loading profile...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const InfoCard = ({ icon, label, value }: { icon: React.ReactElement; label: string; value?: string | number }) => (
    <div className="group relative overflow-hidden bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative flex items-center gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
          <p className="text-lg font-semibold text-gray-900">{value || 'N/A'}</p>
        </div>
      </div>
    </div>
  );

  const getTierColor = (tierName?: string) => {
    switch (tierName?.toLowerCase()) {
      case 'gold':
        return 'from-yellow-400 to-yellow-600';
      case 'silver':
        return 'from-gray-400 to-gray-600';
      case 'bronze':
        return 'from-orange-400 to-orange-600';
      default:
        return 'from-blue-400 to-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 mt-20">
      <Header />
      
      <div className="max-w-5xl mx-auto pt-8 pb-12 px-4">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-3xl p-8 mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
          
          <div className="relative flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                <FaUserCircle className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-4 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="text-white">
              <h1 className="text-3xl font-bold mb-2">{profileData.fullName}</h1>
              <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${getTierColor(profileData.tierName)} rounded-full text-white font-semibold text-sm shadow-lg`}>
                <FaCrown className="w-4 h-4" />
                {profileData.tierName}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
          <div className="flex">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 font-semibold transition-all duration-300 ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FaUser className="w-4 h-4" />
              Profile Information
            </button>
          </div>
        </div>

        {/* Profile Content */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">User Information</h2>
                <button
                  onClick={openModal}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <FaEdit className="w-4 h-4" />
                  Update Profile
                </button>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard icon={<FaUser />} label="Full Name" value={profileData?.fullName} />
                <InfoCard icon={<FaPhone />} label="Phone Number" value={profileData?.phone} />
                <InfoCard icon={<FaCalendarAlt />} label="Year of Birth" value={profileData?.yearOfBirth} />
                <InfoCard icon={<FaMapMarkerAlt />} label="Address" value={profileData?.address} />
              </div>
            </div>
          </div>
        )}

        {/* Activities Content */}
        {activeTab === 'activities' && (
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
            <div className="text-center py-12">
              <FaCalendarAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Activities Yet</h3>
              <p className="text-gray-500">Your recent activities will appear here.</p>
            </div>
          </div>
        )}

        {/* Update Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-3xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Update Profile</h3>
                  <button
                    onClick={closeModal}
                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName || ''}
                      onChange={handleInputChange}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors duration-200"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors duration-200"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year of Birth</label>
                    <input
                      type="number"
                      name="yearOfBirth"
                      value={formData.yearOfBirth || ''}
                      onChange={handleInputChange}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors duration-200"
                      placeholder="Enter your birth year"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address || ''}
                      onChange={handleInputChange}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors duration-200"
                      placeholder="Enter your address"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default ProfilePage;