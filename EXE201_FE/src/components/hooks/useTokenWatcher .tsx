import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { RefreshToken } from '../../services/userService';
import { setUserRedux, logout } from '../../store/userSlice';
import Cookies from 'js-cookie';

export function useTokenWatcher() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const [warned, setWarned] = useState(false);
  const [tokenStartTime, setTokenStartTime] = useState<number | null>(null);

  // Cấu hình thời gian (tính bằng milliseconds)
  const TOKEN_LIFETIME_MS = 30 * 60 * 1000; // 30 phút
  const WARN_BEFORE_MS = 1 * 60 * 1000; // Cảnh báo trước 1 phút (9 phút sau khi bắt đầu)

  useEffect(() => {
    if (!user?.accessToken) {
      setTokenStartTime(null);
      setWarned(false);
      return;
    }
    // console.log("token", user.refreshToken)

    // Nếu chưa có thời gian bắt đầu hoặc token thay đổi, set thời gian mới
    if (!tokenStartTime) {
      const now = Date.now();
      setTokenStartTime(now);
      setWarned(false);
      // console.log("Token timer started at:", new Date(now).toISOString());
    }

  }, [user?.accessToken, tokenStartTime]);

  useEffect(() => {
    if (!user?.accessToken || !tokenStartTime) return;

    const now = Date.now();
    const timeElapsed = now - tokenStartTime;
    const timeUntilWarn = TOKEN_LIFETIME_MS - WARN_BEFORE_MS - timeElapsed;

    // console.log("Token started at:", new Date(tokenStartTime).toISOString());
    // console.log("Time elapsed:", Math.floor(timeElapsed / 1000 / 60), "minutes");
    // console.log("Time until warning:", Math.floor(timeUntilWarn / 1000 / 60), "minutes");

    if (timeUntilWarn > 0) {
      const timer = setTimeout(async () => {
        if (warned) return;

        setWarned(true);
        const userConfirmed  = window.confirm("Phiên đăng nhập sắp hết hạn. Bạn có muốn tiếp tục không?");

        if (userConfirmed ) {
          try {
            // const fallbackToken = localStorage.getItem("refreshToken");
            const refreshToken = user.refreshToken;
            // console.log("Using refresh token:", refreshToken);

            if (!refreshToken) throw new Error('No refresh token found');

            const refreshData = await RefreshToken(refreshToken);
            // console.log("result", refreshData);
            if (refreshData?.accessToken) {
              const updatedUser = {
                ...user,
                accessToken: refreshData.accessToken,
                refreshToken: refreshData.refreshToken,
              };

              // localStorage.removeItem("refreshToken");
              dispatch(setUserRedux(updatedUser));
              Cookies.set('user', JSON.stringify(updatedUser), { expires: 7 });

              // Reset timer cho token mới
              setTokenStartTime(Date.now());
              setWarned(false);

              // console.log("Token refreshed successfully, timer reset");
            } else {
              throw new Error('Token refresh failed');
            }
          } catch (err) {
            console.log("Token refresh error:", err);
            dispatch(logout());
            Cookies.remove('user');
            setTokenStartTime(null);
            setWarned(false);
          }
        } else {
          dispatch(logout());
          Cookies.remove('user');
          window.location.href = "/login"
          setTokenStartTime(null);
          setWarned(false);
        }
      }, timeUntilWarn);

      return () => clearTimeout(timer);
    } else if (timeUntilWarn <= 0 && !warned) {
      // Nếu đã quá thời gian cảnh báo mà chưa warn, warn ngay lập tức
      // console.log("Token should be warned immediately");
      setWarned(true);

      const userConfirmed = window.confirm("Phiên đăng nhập sắp hết hạn. Bạn có muốn tiếp tục không?");

      if (userConfirmed) {
        (async () => {
          try {
            const refreshToken = user.refreshToken;

            if (!refreshToken) throw new Error('No refresh token found');

            const refreshData = await RefreshToken(refreshToken);
            if (refreshData?.accessToken) {
              const updatedUser = {
                ...user,
                accessToken: refreshData.accessToken,
                refreshToken: refreshData.refreshToken,
              };

              // localStorage.removeItem("refreshToken");
              dispatch(setUserRedux(updatedUser));
              Cookies.set('user', JSON.stringify(updatedUser), { expires: 7 });

              setTokenStartTime(Date.now());
              setWarned(false);
            } else {
              throw new Error('Token refresh failed');
            }
          } catch (err) {
            console.log("Token refresh error:", err);
            dispatch(logout());
            Cookies.remove('user');
            setTokenStartTime(null);
            setWarned(false);
          }
        })();
      } else {
        dispatch(logout());
        Cookies.remove('user');
        window.location.href = "/login";
        setTokenStartTime(null);
        setWarned(false);
      }

    }

  }, [dispatch, user, user?.accessToken, user.refreshToken, warned, tokenStartTime, TOKEN_LIFETIME_MS, WARN_BEFORE_MS]);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      setTokenStartTime(null);
      setWarned(false);
    };
  }, []);
}