"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { verifySecret, sendEmailOTP } from "@/lib/actions/user.actions";

type OtpModalProps = {
  accountId: string;
  email: string;
  isStudent: boolean;
  onSuccess: () => void; // Callback to parent when OTP is correct
};

const OtpModal: React.FC<OtpModalProps> = ({
  accountId,
  email,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isStudent,
  onSuccess,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false); // Track OTP sent state

  // Send OTP on mount when the modal is opened, but only once
  useEffect(() => {
          setIsOtpSent(true); // Mark OTP as sent
  }, [email]); // This effect only runs once when the modal is opened

  // Handle OTP submission
  const handleSubmit = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      // Verify OTP using the accountId and password (OTP)
      const sessionId = await verifySecret({ accountId, password: otp });

      if (sessionId) {
        setIsOpen(false);
        onSuccess(); // Notify parent to close modal and redirect
      } else {
        setMessage("Code incorrect. Veuillez réessayer.");
      }
    } catch {
      setMessage("Erreur lors de la vérification du code.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP resend
  const handleResend = async () => {
    if (isOtpSent) return; // Prevent resending if already sent once
    setMessage("Envoi du nouveau code...");
    try {
      await sendEmailOTP({ email });
      setMessage("Nouveau code envoyé !");
      setIsOtpSent(true); // OTP is successfully sent again
    } catch {
      setMessage("Échec de l'envoi du code. Veuillez réessayer.");
    }
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="shad-alert-dialog">
        <AlertDialogHeader className="relative flex justify-center">
          <AlertDialogTitle className="h2 text-center">
            Entrez votre OTP
            <Image
              src="/assets/icons/close-dark.svg"
              alt="close"
              width={20}
              height={20}
              onClick={() => setIsOpen(false)}
              className="otp-close-button absolute right-2 top-2 cursor-pointer"
            />
          </AlertDialogTitle>
          <AlertDialogDescription className="subtitle-2 text-center text-light-100">
            Un code a été envoyé à{" "}
            <span className="pl-1 text-brand">{email}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup className="shad-otp">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <InputOTPSlot key={index} index={index} className="shad-otp-slot" />
            ))}
          </InputOTPGroup>
        </InputOTP>

        {message && (
          <p className="text-center text-sm mt-2 text-red-500">{message}</p>
        )}

        <AlertDialogFooter>
          <div className="flex w-full flex-col gap-4">
            <AlertDialogAction
              onClick={handleSubmit}
              className="shad-submit-btn h-12"
              type="button"
              disabled={otp.length !== 6 || isLoading}
            >
              Soumettre
              {isLoading && (
                <Image
                  src="/assets/icons/loader.svg"
                  alt="loader"
                  width={24}
                  height={24}
                  className="ml-2 animate-spin"
                />
              )}
            </AlertDialogAction>

            {/* OTP resend link */}
            <div className="subtitle-2 mt-2 text-center text-light-100">
              Vous n&apos;avez pas reçu de code ?
              <Button
                type="button"
                variant="link"
                className="pl-1 text-brand"
                onClick={handleResend}
                disabled={isLoading || isOtpSent}
              >
                Cliquez pour renvoyer
              </Button>
            </div>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OtpModal;
