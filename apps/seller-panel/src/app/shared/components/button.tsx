interface CustomButtonProps {
  label: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

const CustomButton = ({
  label,
  className,
  disabled = false,
  onClick,
  type = "button",
}: CustomButtonProps) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`items-center bg-blue-600 hover:bg-blue-500 p-2 rounded-sm transition-colors text-white text-sm disabled:bg-gray-400 disabled:cursor-not-allowed min-w-full ${
        disabled ? "" : "hover:cursor-pointer"
      } ${className}`}
    >
      {label}
    </button>
  );
};

export default CustomButton;
