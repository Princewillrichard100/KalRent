"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title?: string;
  body?: React.ReactElement;
  footer?: React.ReactElement;
  actionLabel: string;
  disabled?: boolean;
  secondaryAction?: () => void;
  secondaryActionLabel?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  body,
  footer,
  actionLabel,
  disabled,
  secondaryAction,
  secondaryActionLabel,
}) => {
  const [showModal, setShowModal] = useState(isOpen);

  useEffect(() => {
    setShowModal(isOpen);
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (disabled) {
      return;
    }

    setShowModal(false);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [disabled, onClose]);

  const handleSubmit = useCallback(() => {
    if (disabled) {
      return;
    }

    onSubmit();
  }, [disabled, onSubmit]);

  const handleSecondaryAction = useCallback(() => {
    if (disabled || !secondaryAction) {
      return;
    }

    secondaryAction();
  }, [disabled, secondaryAction]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="
        justify-center 
        items-center 
        flex 
        overflow-x-hidden 
        overflow-y-auto 
        fixed 
        inset-0 
        z-50 
        outline-none 
        focus:outline-none 
        bg-neutral-900/60
        backdrop-blur-sm
      "
      onClick={handleClose}
    >
      <div
        className="
          relative 
          w-full
          md:w-4/6
          lg:w-3/6
          xl:w-2/5
          my-6
          mx-auto 
          h-full 
          lg:h-auto
          md:h-auto
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Content */}
        <div
          className={`
            translate
            duration-300
            h-full
            ${showModal ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}
          `}
        >
          <div
            className="
              translate
              h-full
              lg:h-auto
              md:h-auto
              border-0 
              rounded-2xl 
              shadow-2xl 
              relative 
              flex 
              flex-col 
              w-full 
              bg-white 
              outline-none 
              focus:outline-none
              overflow-hidden
            "
          >
            {/* Header */}
            <div
              className="
                flex 
                items-center 
                p-5
                rounded-t
                justify-center
                relative
                border-b
                border-slate-100
              "
            >
              <button
                onClick={handleClose}
                className="
                  p-1.5
                  border-0 
                  hover:bg-slate-100
                  rounded-full
                  transition
                  absolute
                  left-5
                  cursor-pointer
                  text-slate-600
                "
              >
                <X className="w-4 h-4" />
              </button>
              <div className="text-base font-bold text-slate-900">{title}</div>
            </div>

            {/* Body */}
            <div className="relative p-6 flex-auto max-h-[70vh] overflow-y-auto">
              {body}
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-2 p-6 border-t border-slate-100 bg-slate-50/50">
              <div className="flex flex-row items-center gap-4 w-full">
                {secondaryAction && secondaryActionLabel && (
                  <Button
                    variant="outline"
                    disabled={disabled}
                    onClick={handleSecondaryAction}
                    className="w-full rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 py-3 text-sm font-semibold h-11 cursor-pointer"
                  >
                    {secondaryActionLabel}
                  </Button>
                )}
                <Button
                  disabled={disabled}
                  onClick={handleSubmit}
                  className="w-full rounded-xl bg-rose-500 hover:bg-rose-600 text-white py-3 text-sm font-semibold h-11 cursor-pointer shadow-sm transition-all"
                >
                  {actionLabel}
                </Button>
              </div>
              {footer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
