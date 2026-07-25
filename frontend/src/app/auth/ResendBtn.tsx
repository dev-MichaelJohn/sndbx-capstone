import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface ResendBtnProps {
  resendAt: number;
  onResend: () => void;
  isLoading?: boolean;
}

export const ResendBtn = ({ resendAt, onResend, isLoading }: ResendBtnProps) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const diff = Math.max(0, Math.ceil(resendAt - Date.now()) / 1000);
      setTimeLeft(diff);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [resendAt]);

  if (timeLeft > 0) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = Math.floor(timeLeft % 60);
    const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    return (
      <p className="text-xs text-muted-foreground text-center">
        Resend code in <span className="font-semibold text-foreground">{formattedTime}</span>
      </p>
    );
  }

  return (
    <Button
      type="button"
      variant="link"
      onClick={onResend}
      disabled={isLoading}
      className="text-xs h-auto font-normal text-chart-5 underline-offset-4 hover:underline"
    >
      Didn't get a code? Resend
    </Button>
  );
};
