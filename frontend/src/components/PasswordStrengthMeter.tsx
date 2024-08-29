import { Check, X } from "lucide-react";

type TProps = {
  password: string;
};

const PasswordCriteria = ({ password }: TProps) => {
  const criteria = [
    { label: "At least 6 characters", met: password.length >= 6 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="mt-2 space-y-1">
      {criteria.map((item) => (
        <div key={item.label} className="flex items-center text-xs">
          {item.met ? (
            <Check className="mr-2 text-green-500 size-4" />
          ) : (
            <X className="mr-2 text-gray-500 size-4" />
          )}
          <span className={item.met ? "text-green-500" : "text-gray-400"}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

const PasswordStrengthMeter = ({ password }: TProps) => {
  const getStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 6) strength++;
    if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) strength++;
    if (pass.match(/\d/)) strength++;
    if (pass.match(/[^a-zA-Z\d]/)) strength++;
    return strength;
  };

  const strength = getStrength(password);

  const getColor = (strength: number) => {
    const colors = [
      "bg-red-500",
      "bg-red-400",
      "bg-yellow-500",
      "bg-yellow-400",
      "bg-green-500",
    ];
    return colors[strength] || "bg-green-500";
  };

  const getStrengthText = (strength: number) => {
    const texts = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    return texts[strength] || "Strong";
  };

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-400">Password strength</span>
        <span className="text-xs text-gray-400">
          {getStrengthText(strength)}
        </span>
      </div>

      <div className="flex space-x-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={`h-1 w-1/4 rounded-full transition-colors duration-300 ${index < strength ? getColor(strength) : "bg-gray-600"} `}
          />
        ))}
      </div>

      <PasswordCriteria password={password} />
    </div>
  );
};

export default PasswordStrengthMeter;
