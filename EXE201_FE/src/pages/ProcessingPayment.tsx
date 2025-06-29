import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import ClipLoader from "react-spinners/ClipLoader";
import {
  createPaymentRequest,
  checkPayment,
  acceptHistory,
  cancelHistory,
  createStudentSupscription,
  createTeacherSupscription,
  upgradeTier,
} from "../services/userService";
import { fetchUserProfile } from "../services/authService";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { toast } from "react-toastify";

interface ProcessingPaymentProps {
  pollInterval?: number;
}

type PayStatus = "pending" | "succeeded" | "failed";

const ProcessingPayment: React.FC<ProcessingPaymentProps> = ({ pollInterval = 4000 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const userId = useSelector((state: RootState) => state.user.userId);
  const isTeacher = useSelector((state: RootState) => state.user.roleId) === "3";

  // Lấy dữ liệu từ location.state hoặc URL
  const transactionId = location.state?.transactionId || searchParams.get("id");
  const amount = location.state?.amount;
  const tierId = location.state?.tierId || 2;
  const days = location.state?.days || 30;
  const orderCodeFromUrl = searchParams.get("orderCode");

  const [status, setStatus] = useState<PayStatus>("pending");
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [orderCode, setOrderCode] = useState<number | null>(orderCodeFromUrl ? Number(orderCodeFromUrl) : null);

  // Tạo mới PaymentRequest nếu chưa có orderCode
  useEffect(() => {
    if (orderCode || !transactionId || !amount || !userId) return;

    const createRequest = async () => {
      try {
        const userProfile = await fetchUserProfile(userId, isTeacher);
        if (!userProfile) {
          toast.error("Không thể lấy thông tin người dùng");
          setStatus("failed");
          return;
        }

        const paymentData = await createPaymentRequest({
          transactionId,
          amount,
          buyerName: userProfile.fullName,
        });

        if (paymentData?.checkoutUrl && paymentData?.orderCode) {
          setCheckoutUrl(paymentData.checkoutUrl);
          setOrderCode(paymentData.orderCode);
        } else {
          setStatus("failed");
        }
      } catch (err) {
        console.error("createPaymentRequest error", err);
        setStatus("failed");
      }
    };

    createRequest();
  }, [orderCode, transactionId, amount, userId, isTeacher]);

  // Poll trạng thái thanh toán
  useEffect(() => {
    if (!orderCode || !transactionId || status !== "pending") return;

    const interval = setInterval(async () => {
      try {
        const res = await checkPayment(orderCode);
        const ps = (res?.status || "").toUpperCase();

        switch (ps) {
          case "PAID": {
            await acceptHistory(transactionId);
            const tierStr = String(tierId);

            if (isTeacher) {
              await createTeacherSupscription({ userId, tierId: tierStr, transactionId, days });
              await upgradeTier({ userId, orderCode, isTeacher, tierId: tierStr });
            } else {
              await createStudentSupscription({ userId, tierId: tierStr, transactionId, days });
              await upgradeTier({ userId, orderCode, isTeacher, tierId: tierStr });
            }

            setStatus("succeeded");
            break;
          }
          case "CANCELLED":
            await cancelHistory(transactionId);
            setStatus("failed");
            break;
          default:
            break;
        }
      } catch (err) {
        console.error("checkPaymentStatus error", err);
      }
    }, pollInterval);

    return () => clearInterval(interval);
  }, [orderCode, transactionId, status, pollInterval, userId, isTeacher, tierId, days]);

  useEffect(() => {
    if (status === "succeeded") {
      const timeout = setTimeout(() => {
        navigate("/");
      }, 3000); // Chuyển sau 3 giây

      return () => clearTimeout(timeout);
    }
  }, [status, navigate]);

  const handlePayNow = () => {
    if (checkoutUrl) window.location.href = checkoutUrl;
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
      {status === "pending" && (
        <>
          <ClipLoader color="#3b82f6" size={64} />
          <h2 className="mt-6 text-xl font-semibold text-gray-700">Đang xử lý thanh toán…</h2>
          <p className="mt-2 text-gray-500">Vui lòng không tắt trang</p>
          {checkoutUrl && (
            <div className="mt-6 flex gap-6">
              <button onClick={handlePayNow} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                Thanh toán ngay
              </button>
              <button onClick={handleCancel} className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600">
                Quay lại
              </button>
            </div>
          )}
        </>
      )}

      {status === "succeeded" && (
        <>
          <CheckCircle2 size={64} className="text-emerald-500" />
          <h2 className="mt-6 text-xl font-semibold text-gray-700">Thanh toán thành công</h2>
          <p className="mt-2 text-gray-500">Cảm ơn bạn đã nâng cấp tài khoản!</p>
          <p className="mt-1 text-gray-400 text-sm">Đang chuyển về trang chủ…</p>
        </>
      )}

      {status === "failed" && (
        <>
          <XCircle size={64} className="text-red-500" />
          <h2 className="mt-6 text-xl font-semibold text-gray-700">Thanh toán thất bại</h2>
          <p className="mt-2 text-gray-500">Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>
        </>
      )}
    </div>
  );
};

export default ProcessingPayment;
