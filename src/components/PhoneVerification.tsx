import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Phone, ShieldCheck, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PhoneVerificationProps {
  contestantId: string;
  category: "miss" | "master";
  onSuccess: (phone: string) => void;
  onClose: () => void;
}

const PhoneVerification = ({
  contestantId,
  category,
  onSuccess,
  onClose,
}: PhoneVerificationProps) => {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const { toast } = useToast();

  const handleRequestOtp = async () => {
    if (!phone || phone.length < 8) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.functions.invoke("vote", {
      body: { action: "request_otp", phone_number: phone },
    });
    setLoading(false);

    if (error || data?.error) {
      toast({
        title: "Error",
        description: data?.error || "Failed to send OTP",
        variant: "destructive",
      });
      return;
    }

    // Demo mode: show OTP
    if (data?.demo_otp) {
      setDemoOtp(data.demo_otp);
    }

    setStep("otp");
    toast({
      title: "OTP Sent!",
      description: "Please enter the verification code.",
    });
  };

  const handleVerifyAndVote = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit code.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.functions.invoke("vote", {
      body: {
        action: "verify_and_vote",
        phone_number: phone,
        otp_code: otp,
        contestant_id: contestantId,
        category,
      },
    });
    setLoading(false);

    if (error || data?.error) {
      toast({
        title: "Vote Failed",
        description: data?.error || "Something went wrong",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "🎉 Vote Cast Successfully!",
      description: `Your vote for the ${category} category has been recorded.`,
    });
    onSuccess(phone);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            {step === "phone" ? (
              <Phone className="w-8 h-8 text-primary" />
            ) : (
              <ShieldCheck className="w-8 h-8 text-primary" />
            )}
          </div>
          <h3 className="font-display text-2xl font-bold text-card-foreground">
            {step === "phone" ? "Verify Your Identity" : "Enter OTP Code"}
          </h3>
          <p className="text-muted-foreground font-body text-sm mt-2">
            {step === "phone"
              ? "Enter your phone number to receive a verification code."
              : "Enter the 6-digit code sent to your phone."}
          </p>
        </div>

        {step === "phone" ? (
          <div className="space-y-4">
            <div>
              <label className="font-body text-sm font-medium text-card-foreground mb-1 block">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+237 6XX XXX XXX"
                className="w-full px-4 py-3 rounded-xl border border-input bg-background font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                maxLength={15}
              />
            </div>
            <button
              onClick={handleRequestOtp}
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-body font-bold py-3 rounded-xl transition-all duration-300 hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Send Verification Code"
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {demoOtp && (
              <div className="bg-secondary/20 border border-secondary rounded-xl p-3 text-center">
                <p className="text-sm font-body text-muted-foreground">
                  Demo Mode — Your OTP code:
                </p>
                <p className="text-2xl font-display font-bold text-secondary tracking-widest mt-1">
                  {demoOtp}
                </p>
              </div>
            )}
            <div>
              <label className="font-body text-sm font-medium text-card-foreground mb-1 block">
                Verification Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))
                }
                placeholder="Enter 6-digit code"
                className="w-full px-4 py-3 rounded-xl border border-input bg-background font-body text-foreground text-center text-2xl tracking-[0.5em] placeholder:text-muted-foreground placeholder:tracking-normal placeholder:text-base focus:outline-none focus:ring-2 focus:ring-ring"
                maxLength={6}
              />
            </div>
            <button
              onClick={handleVerifyAndVote}
              disabled={loading}
              className="w-full bg-secondary text-secondary-foreground font-body font-bold py-3 rounded-xl transition-all duration-300 hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Verify & Cast Vote"
              )}
            </button>
            <button
              onClick={() => {
                setStep("phone");
                setOtp("");
                setDemoOtp(null);
              }}
              className="w-full text-muted-foreground font-body text-sm hover:text-foreground transition-colors"
            >
              Change phone number
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhoneVerification;
