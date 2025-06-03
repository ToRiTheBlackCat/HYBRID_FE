import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { FaUser, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaCrown } from 'react-icons/fa';
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
    return <p className="text-center mt-10">Loading profile...</p>;
  }

  const InfoCard = ({ icon, label, value }: { icon: React.ReactElement; label: string; value?: string | number }) => (
    <div className="border rounded-lg p-4 flex items-center gap-3 bg-gray-50">
      <div className="text-xl text-gray-700">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium text-gray-900">{value || 'N/A'}</p>
      </div>
    </div>
  );

  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto mt-25 mb-25 px-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <img
            src="/avatar-placeholder.png"
            alt="avatar"
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h2 className="text-xl font-semibold">{profileData.fullName}</h2>
            <p className="text-sm uppercase text-gray-500">{profileData.tierName}</p>
          </div>
        </div>

        {/* Tabs replacement: just sections */}
        <div className="mt-6 rounded-md bg-white">
          <div className="flex border rounded-md overflow-hidden">
            <button className="flex items-center gap-2 px- زنجانی py-2 bg-blue-500 text-white font-semibold w-1/2 justify-center">
              <FaUser />
              Profile
            </button>
            <button className="flex items-center gap-2 px-4 py-2 w-1/2 justify-center text-gray-700">
              <FaCalendarAlt />
              My activities
            </button>
          </div>

          {/* Profile Card */}
          <div className="mt-6 border rounded-md bg-white shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">User information</h3>
              <button
                onClick={openModal}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Update Profile
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard icon={<FaUser />} label="Name" value={profileData?.fullName} />
              <InfoCard icon={<FaPhone />} label="Phone" value={profileData?.phone} />
              <InfoCard icon={<FaCalendarAlt />} label="Year of birth" value={profileData?.yearOfBirth} />
              <InfoCard icon={<FaMapMarkerAlt />} label="Area" value={profileData?.address} />
              <InfoCard icon={<FaCrown />} label="Tier" value={profileData?.tierName} />
            </div>
          </div>
        </div>

        {/* Update Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4">Update Profile</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500">Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName || ''}
                    onChange={handleInputChange}
                    className="w-full border rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    className="w-full border rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500">Year of Birth</label>
                  <input
                    type="number"
                    name="yearOfBirth"
                    value={formData.yearOfBirth || ''}
                    onChange={handleInputChange}
                    className="w-full border rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleInputChange}
                    className="w-full border rounded-md p-2"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ProfilePage;