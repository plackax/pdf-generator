import clsx from "clsx";
import React, { createContext, useContext, useEffect, useReducer } from "react";
import { v4 as uuidv4 } from "uuid";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}

type ToastAction =
  | {
      type: "ADD_TOAST";
      payload: {
        message: string;
        type: "success" | "error";
      };
    }
  | { type: "REMOVE_TOAST"; payload: string };

const toastReducer = (state: Toast[], action: ToastAction) => {
  switch (action.type) {
    case "ADD_TOAST":
      return [
        ...state,
        {
          id: uuidv4(),
          message: action.payload.message,
          type: action.payload.type,
        },
      ];
    case "REMOVE_TOAST":
      return state.filter((toast) => toast.id !== action.payload);
    default:
      return state;
  }
};

const ToastContext = createContext<{
  toasts: Toast[];
  addToast: (message: string, type: "success" | "error") => void;
  removeToast: (id: string) => void;
}>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const addToast = (message: string, type: "success" | "error") => {
    dispatch({
      type: "ADD_TOAST",
      payload: {
        message,
        type,
      },
    });
  };

  const removeToast = (id: string) => {
    dispatch({ type: "REMOVE_TOAST", payload: id });
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToasts = () => useContext(ToastContext);

export function ToastContainer() {
  const { toasts, removeToast } = useToasts();

  useEffect(() => {
    const interval = setInterval(() => {
      if (toasts.length > 0) {
        removeToast(toasts[0].id);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [toasts]);

  return (
    <div className="fixed top-6 right-6 z-50">
      {toasts.map((toast) => (
        <div
          key={uuidv4()}
          className={clsx(
            "mb-3 text-white py-2 pl-4 pr-14 rounded-md shadow-md relative",
            {
              "bg-green-900": toast.type === "success",
              "bg-red-900": toast.type === "error",
            }
          )}
        >
          {toast.message}
          <button
            onClick={() => removeToast(toast.id)}
            className="absolute text-white top-0 right-0 h-full px-2 rounded-md w-10"
          >
            X
          </button>
        </div>
      ))}
    </div>
  );
}
