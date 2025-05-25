  import { useSelector } from 'react-redux';
  import { RootState } from '../store/store';
  import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaCrown } from 'react-icons/fa';
  import {fecthUserProfile} from "../services/authService";
  import { useEffect, useState } from 'react';
  import { Profile } from '../types';
  import Header from '../components/HomePage/Header';
  import Footer from '../components/HomePage/Footer';

  const ProfilePage = () => {
    const user = useSelector((state: RootState) => state.user);
    const [profileData, setProfileData] = useState<Profile>();

    useEffect(() => {
      const getProfile = async () => {
          const isTeacher = user.roleId === "3";
          try{
              const data = await fecthUserProfile(user.userId, isTeacher);
              setProfileData(data ?? undefined);
          }catch(error){
              console.log(error)
          }
      };

      getProfile();
    }, [user.userId, user.roleId])

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
      <Header/>
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
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold w-1/2 justify-center">
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
            <h3 className="text-xl font-semibold mb-6">User information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard icon={<FaUser />} label="Name" value={profileData?.fullName} />
              <InfoCard icon={<FaPhone />} label="Phone" value={profileData?.phone} />
              {/* <InfoCard icon={<FaEnvelope />} label="Email" value={user.email || 'triminh@gmail.com'} /> */}
              <InfoCard icon={<FaCalendarAlt />} label="Year of birth" value={profileData?.yearOfBirth} />
              <InfoCard icon={<FaMapMarkerAlt />} label="Area" value={profileData?.address} />
              <InfoCard icon={<FaCrown />} label="Tier" value={profileData?.tierName} />
            </div>
          </div>
        </div>
      </div>
      <Footer/>
      </>
    );
  };

  export default ProfilePage;
