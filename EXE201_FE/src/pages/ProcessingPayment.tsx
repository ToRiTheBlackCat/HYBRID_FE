import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import ClipLoader from "react-spinners/ClipLoader";
import { createPaymentRequest, checkPayment, acceptHistory, cancelHistory, createStudentSupscription, createTeacherSupscription, upgradeTier } from "../services/userService";
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
  const { transactionId, amount, userId, tierId, days} = location.state || {};

  const isTeacher = useSelector((state: RootState) => state.user.roleId) === "3";
  const [status, setStatus] = useState<PayStatus>("pending");
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [orderCode, setOrderCode] = useState<number | null>(null);

  // ────────────────────────────────────────────────────────
  // 1. Tạo Payment Request ngay khi vào trang
  // ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!transactionId || !amount || !userId) {
      toast.error("Thiếu thông tin thanh toán");
      navigate("/payment");
      return;
    }

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
          setStatus("pending");
        } else {
          setStatus("failed");
        }
      } catch (err) {
        console.error("createPaymentRequest error", err);
        setStatus("failed");
      }
    };

    createRequest();
  }, [transactionId, amount, userId, isTeacher, navigate]);

  // ────────────────────────────────────────────────────────
  // 2. Poll checkPaymentStatus(orderCode)
  // ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!orderCode || status !== "pending") return;

    const interval = setInterval(async () => {
      try {
        const res = await checkPayment(orderCode);
        const ps = (res?.status || "").toUpperCase();

        switch (ps) {
          case "PAID": {
            await acceptHistory(transactionId);
            if (isTeacher) {
              await createTeacherSupscription({ userId, tierId, transactionId, days });
              await upgradeTier({userId, orderCode, isTeacher, tierId});
            } else {
              await createStudentSupscription({ userId, tierId, transactionId, days });
              await upgradeTier({userId, orderCode, isTeacher, tierId});
            }
            setStatus("succeeded");
            break;
          }
          case "CANCELLED": {
            await cancelHistory(transactionId);
            setStatus("failed");
            break;
          }
          case "PENDING":
          default:
            break;
        }
      } catch (err) {
        console.error("checkPaymentStatus error", err);
      }
    }, pollInterval);

    return () => clearInterval(interval);
  }, [orderCode, status, pollInterval, transactionId, isTeacher, userId, tierId, days]);

  // ────────────────────────────────────────────────────────
  // 3. Handlers
  // ────────────────────────────────────────────────────────
  const handlePayNow = () => {
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  // ────────────────────────────────────────────────────────
  // 4. UI
  // ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
      {/* Pending */}
      {status === "pending" && (
        <>
          <ClipLoader color="#3b82f6" size={64} aria-label="Processing payment spinner" />
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

      {/* Succeeded */}
      {status === "succeeded" && (
        <>
          <CheckCircle2 size={64} className="text-emerald-500" />
          <h2 className="mt-6 text-xl font-semibold text-gray-700">Thanh toán đã sẵn sàng</h2>
          <p className="mt-2 text-gray-500">Nhấn "Thanh toán ngay" để chuyển tới cổng PayOS</p>

          <div className="mt-6 flex gap-6">
            <button onClick={handlePayNow} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
              Thanh toán ngay
            </button>
            <button onClick={handleCancel} className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600">
              Quay lại
            </button>
          </div>
        </>
      )}

      {/* Failed */}
      {status === "failed" && (
        <>
          <XCircle size={64} className="text-red-500" />
          <h2 className="mt-6 text-xl font-semibold text-gray-700">Thanh toán bị hủy</h2>
          <p className="mt-2 text-gray-500">Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>
        </>
      )}
    </div>
  );
};

export default ProcessingPayment;