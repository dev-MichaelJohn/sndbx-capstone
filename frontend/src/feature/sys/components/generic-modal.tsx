import type { ReactNode } from "react";
import { createPortal } from "react-dom";

export const Modal = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-linear-to-b from-black/20 to-black/75 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 shadow-xl max-w-md w-full relative mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold cursor-pointer"
        >
          <i className="text-sm ri-close-line"></i>
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
};
