'use client';

import { 
  FieldErrors, 
  FieldValues, 
  UseFormRegister 
} from "react-hook-form";
import { BiDollar } from "react-icons/bi";

interface InputProps {
  id: string;
  label: string;
  type?: string;
  disabled?: boolean;
  formatPrice?: boolean;
  required?: boolean;
  register?: UseFormRegister<FieldValues> | any;
  errors?: FieldErrors | any;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({
  id,
  label,
  type = "text", 
  disabled, 
  formatPrice,
  register,
  required,
  errors,
  value,
  onChange
}) => {
  const registerProps = register ? register(id, { required }) : {};

  return (
    <div className="w-full relative">
      {formatPrice && (
        <span
          className="
            text-neutral-700
            absolute
            top-5
            left-2
            font-bold
            text-base
          "
        >
          ₦
        </span>
      )}
      <input
        id={id}
        disabled={disabled}
        {...registerProps}
        {...(value !== undefined ? { value } : {})}
        {...(onChange !== undefined ? { onChange } : {})}
        placeholder=" "
        type={type}
        className={`
          peer
          w-full
          p-4
          pt-6 
          font-light 
          bg-white 
          border-2
          rounded-md
          outline-none
          transition
          disabled:opacity-70
          disabled:cursor-not-allowed
          ${formatPrice ? 'pl-9' : 'pl-4'}
          ${errors && errors[id] ? 'border-rose-500' : 'border-neutral-300'}
          ${errors && errors[id] ? 'focus:border-rose-500' : 'focus:border-black'}
        `}
      />
      <label 
        htmlFor={id}
        className={`
          absolute 
          text-md
          duration-150 
          transform 
          -translate-y-3 
          top-5 
          z-10 
          origin-[0] 
          ${formatPrice ? 'left-9' : 'left-4'}
          peer-placeholder-shown:scale-100 
          peer-placeholder-shown:translate-y-0 
          peer-focus:scale-75
          peer-focus:-translate-y-4
          ${errors && errors[id] ? 'text-rose-500' : 'text-zinc-400'}
        `}
      >
        {label}
      </label>
    </div>
   );
}
 
export default Input;
