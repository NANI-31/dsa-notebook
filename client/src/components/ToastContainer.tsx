import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../app/store";
import { removeToast, type Toast } from "../features/ui/uiSlice";
import { LuCircle, LuCode, LuInfo, LuX } from "react-icons/lu";

const ToastCard: React.FC<{ toast: Toast }> = ({ toast }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const duration = toast.duration || 4000;
    const timer = setTimeout(() => {
      dispatch(removeToast(toast.id));
    }, duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, dispatch]);

  const getToastStyles = () => {
    switch (toast.type) {
      case "success":
        return {
          bg: "bg-emerald-950/85 border-emerald-500/30 text-emerald-300 shadow-emerald-950/50",
          icon: <LuCode className="text-emerald-400 shrink-0" size={18} />,
        };
      case "warning":
        return {
          bg: "bg-amber-950/85 border-amber-500/30 text-amber-300 shadow-amber-950/50",
          icon: <LuCircle className="text-amber-400 shrink-0" size={18} />,
        };
      case "error":
        return {
          bg: "bg-rose-950/85 border-rose-500/30 text-rose-300 shadow-rose-950/50",
          icon: <LuCircle className="text-rose-400 shrink-0" size={18} />,
        };
      case "info":
      default:
        return {
          bg: "bg-blue-950/85 border-blue-500/30 text-blue-300 shadow-blue-950/50",
          icon: <LuInfo className="text-blue-400 shrink-0" size={18} />,
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div
      className={`flex items-center gap-3.5 px-5 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 hover:scale-[1.02] animate-in slide-in-from-top-4 max-w-sm ${styles.bg}`}
    >
      {styles.icon}
      <p className="text-[10px] uppercase tracking-widest font-black font-mono leading-normal flex-1">
        {toast.message}
      </p>
      <button
        onClick={() => dispatch(removeToast(toast.id))}
        className="p-1 rounded-lg hover:bg-white/10 text-current/60 hover:text-current transition-colors"
      >
        <LuX size={14} />
      </button>
    </div>
  );
};

const ToastContainer: React.FC = () => {
  const toasts = useSelector((state: RootState) => state.ui.toasts);

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-auto">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

export default ToastContainer;
