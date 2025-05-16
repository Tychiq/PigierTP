// app/waiting-for-approval/page.tsx

import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/user.actions";

const WaitingForApproval = async () => {
  const currentUser = await getCurrentUser();

  // ✅ If user is approved, redirect to dashboard
  if (currentUser?.dashboardAccess) {
    redirect("/");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-light-300 dark:bg-dark-100 text-center px-4">
      <Image
        src="/assets/animations/hourglass.gif"
        alt="Waiting for approval"
        width={570}
        height={570}
        className="mb-6"
      />
      <h1 className="text-2xl font-semibold text-dark-500 dark:text-light-300 mb-2">
        Votre compte a bien été enregistré !
      </h1>
      <p className="text-base text-gray-600 dark:text-gray-400 max-w-md">
        Vous devez attendre que l’administrateur vous accorde l’accès au tableau de bord. Veuillez réessayer plus tard. 
        Merci pour votre patience !
      </p>
    </div>
  );
};

export default WaitingForApproval;
