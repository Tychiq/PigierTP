"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import OtpModal from "@/components/OTPModal";
import { createAccount, signInUser } from "@/lib/actions/user.actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type FormType = "sign-in" | "sign-up";

const authFormSchema = (formType: FormType) =>
  z.object({
    email: z.string().email("Email invalide"),
    fullName:
      formType === "sign-up"
        ? z.string().min(2, "Trop court").max(50, "Trop long")
        : z.string().optional(),
    isStudent: z.enum(["yes", "no"], {
      required_error: "Veuillez indiquer si vous êtes étudiant",
    }),
  });

const AuthForm = ({ type }: { type: FormType }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [accountId, setAccountId] = useState<string | null>(null);
  const [showOtpModal, setShowOtpModal] = useState(false);

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPasskey, setAdminPasskey] = useState("");

  const router = useRouter();

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      isStudent: "no",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const user =
        type === "sign-up"
          ? await createAccount({
              fullName: values.fullName || "",
              email: values.email,
              isStudent: values.isStudent === "yes",
            })
          : await signInUser({ email: values.email });

      if (!user?.accountId) {
        setErrorMessage("Aucun compte trouvé.");
        return;
      }

      setAccountId(user.accountId);
      setShowOtpModal(true); // Always show OTP modal after form submission
    } catch {
      setErrorMessage("Échec de l'authentification. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* ✅ Admin Button */}
      <div className="flex justify-end mb-4 absolute top-4 right-6 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdminModal(true)}
          className="text-xs opacity-80 hover:opacity-100"
          style={{
            backgroundColor: "rgba(0, 123, 255, 0.1)",
            borderColor: "rgba(0, 123, 255, 0.3)",
          }}
        >
          Admin
        </Button>
      </div>

      {/* ✅ Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
          <h1 className="form-title">
            {type === "sign-in" ? "Se connecter" : "S'inscrire"}
          </h1>

          {type === "sign-up" && (
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form-label">Numéro de table</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Entrez votre numéro de table /// Nom complet pour les enseignants"
                      className="shad-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="shad-form-message" />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form-label">Email</FormLabel>
                <FormControl>
                  <Input placeholder="Entrez votre email" className="shad-input" {...field} />
                </FormControl>
                <FormMessage className="shad-form-message" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isStudent"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form-label">Êtes-vous un étudiant?</FormLabel>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="yes"
                      checked={field.value === "yes"}
                      onChange={() => field.onChange("yes")}
                    />
                    <span>Oui</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="no"
                      checked={field.value === "no"}
                      onChange={() => field.onChange("no")}
                    />
                    <span>Non</span>
                  </label>
                </div>
                <FormMessage className="shad-form-message" />
              </FormItem>
            )}
          />

          <Button type="submit" className="form-submit-button" disabled={isLoading}>
            {type === "sign-in" ? "Se connecter" : "S'inscrire"}
            {isLoading && (
              <Image
                src="/assets/icons/loader.svg"
                alt="loader"
                width={24}
                height={24}
                className="ml-2 animate-spin"
              />
            )}
          </Button>

          {errorMessage && <p className="error-message">*{errorMessage}</p>}

          <div className="body-2 flex justify-center">
            <p className="text-light-100">
              {type === "sign-in"
                ? "Vous n'avez pas de compte ?"
                : "Vous avez déjà un compte ?"}
            </p>
            <Link
              href={type === "sign-in" ? "/sign-up" : "/sign-in"}
              className="ml-1 font-medium text-brand"
            >
              {type === "sign-in" ? "S'inscrire" : "Se connecter"}
            </Link>
          </div>
        </form>
      </Form>

      {/* ✅ OTP Modal */}
      {accountId && showOtpModal && (
        <OtpModal
  email={form.getValues("email")}
  accountId={accountId}
  onSuccess={({ isStudent, dashboardAccess }) => {
    setShowOtpModal(false);

    if (isStudent) {
      router.push("/student");
    } else if (!dashboardAccess) {
      router.push("/waiting-for-approval");
    } else {
      router.push("/");
    }
  }}
/>




      )}

      {/* ✅ Admin Modal */}
      <Dialog open={showAdminModal} onOpenChange={setShowAdminModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accès Administrateur</DialogTitle>
          </DialogHeader>
          <Input
            type="password"
            placeholder="Entrez le mot de passe administrateur"
            value={adminPasskey}
            onChange={(e) => setAdminPasskey(e.target.value)}
            className="mb-4"
          />
          <Button
  onClick={async () => {
    try {
      const res = await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passkey: adminPasskey }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push("/admin");
      } else {
        alert(data.message || "Clé d'accès incorrecte.");
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      alert("Erreur de vérification du mot de passe admin.");
    }
  }}
  className="text-white bg-brand"
>
  Accès Administrateur
</Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AuthForm;
