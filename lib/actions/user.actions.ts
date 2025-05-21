"use server";

import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { Query, ID } from "node-appwrite";
import { parseStringify } from "@/lib/utils";
import { cookies } from "next/headers";
import { avatarPlaceholderUrl } from "@/constants";
import { redirect } from "next/navigation";

// Get user by email from the database
const getUserByEmail = async (email: string) => {
  const { databases } = await createAdminClient();

  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollectionId,
    [Query.equal("email", [email])]
  );

  return result.total > 0 ? result.documents[0] : null;
};

// Handle errors globally
const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

// Send OTP email for sign-in or sign-up
export const sendEmailOTP = async ({ email }: { email: string }) => {
  const { account } = await createAdminClient();

  try {
    const session = await account.createEmailToken(ID.unique(), email);
    return session.userId; // Return the user ID from the session
  } catch (error) {
    handleError(error, "Échec de l'envoi de l'OTP par e-mail");
  }
};

// Create a new user account and send OTP email
export const createAccount = async ({
  fullName,
  email,
  isStudent,
}: {
  fullName: string;
  email: string;
  isStudent: boolean;
}) => {
  const existingUser = await getUserByEmail(email);

  // Send OTP email to the user
  const accountId = await sendEmailOTP({ email });
  if (!accountId) throw new Error("Échec de l'envoi d'un OTP");

  // If user doesn't exist, create a new user in the database
  if (!existingUser) {
    const { databases } = await createAdminClient();

    await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      ID.unique(),
      {
        fullName,
        email,
        avatar: avatarPlaceholderUrl,
        accountId,
        isStudent,
        dashboardAccess: false, // Default value for non-students
      }
    );
  }

  return parseStringify({ accountId });
};

export const verifySecret = async ({
  accountId,
  password,
}: {
  accountId: string;
  password: string;
}) => {
  try {
    const { account, databases } = await createAdminClient();

    const session = await account.createSession(accountId, password);

    // Store the session token in cookies
    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    // Get full user info from DB
    const userDoc = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("accountId", [accountId])]
    );

    const user = userDoc.total > 0 ? userDoc.documents[0] : null;

    if (!user) {
      throw new Error("Utilisateur introuvable après la vérification de session.");
    }

    // Force dashboardAccess to true for students
    if (user.isStudent) {
      return parseStringify({
        sessionId: session.$id,
        isStudent: true,
        dashboardAccess: true,
      });
    }

    return parseStringify({
      sessionId: session.$id,
      isStudent: false,
      dashboardAccess: user.dashboardAccess,
    });
  } catch (error) {
    handleError(error, "Échec de la vérification de l'OTP");
  }
};




// Get the current authenticated user
export const getCurrentUser = async () => {
  try {
    const { databases, account } = await createSessionClient();

    const result = await account.get();

    const userDoc = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("accountId", [result.$id])]
    );

    if (userDoc.total <= 0) return null;

    // Ensure fileAccessKeyword is included correctly in the returned user data
    const user = userDoc.documents[0];

    return parseStringify({
      ...user,
      fileAccessKeyword: user.fileAccessKeyword || null, // Ensure it defaults to null if undefined
    });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.log("No session or user found");
    return null; // Return null if there's no session or user
  }
};
// Sign out the current user
export const signOutUser = async () => {
  const { account } = await createSessionClient();

  try {
    await account.deleteSession("current");
    (await cookies()).delete("appwrite-session");
  } catch (error) {
    handleError(error, "Échec de la déconnexion de l'utilisateur");
  } finally {
    redirect("/sign-in");
  }
};

// Sign in an existing user and send OTP email
export const signInUser = async ({ email }: { email: string }) => {
  try {
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      // Send OTP email if user exists
      await sendEmailOTP({ email });
      return parseStringify({
        accountId: existingUser.accountId,
        isStudent: existingUser.isStudent ?? false, // ✅ include this
        dashboardAccess: existingUser.dashboardAccess ?? false, 
      });
    }

    return parseStringify({ accountId: null, error: "Utilisateur introuvable" });
  } catch (error) {
    handleError(error, "Échec de la connexion de l'utilisateur");
  }
};

// Get non-student users from the database
export const getNonStudentUsers = async () => {
  const { databases } = await createAdminClient();

  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollectionId,
    [Query.equal("isStudent", [false])]
  );

  return result.documents; // List of non-student users
};

// Update user dashboard access status
export const updateUserDashboardAccess = async (userId: string, access: boolean) => {
  const { databases } = await createAdminClient();

  await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollectionId,
    userId, // The user's document ID
    {
      dashboardAccess: access, // Set to true/false
    }
  );
};


// ✅ Update user-specific file access keyword
export const updateUserFileAccessKeyword = async (
  userId: string,
  keyword: string
) => {
  const { databases } = await createAdminClient();

  try {
    // Update the user's fileAccessKeyword in the database
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      userId,
      {
        fileAccessKeyword: keyword,
      }
    );
  } catch (error) {
    handleError(error, "Échec de la mise à jour du mot-clé d'accès au fichier");
  }
};


// ✅ Delete user from Auth + users collection
export const deleteNonStudentUser = async (userId: string) => {
  const { databases, users } = await createAdminClient();

  try {
    // Get the user document to retrieve the Auth accountId
    const userDoc = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      userId
    );

    const accountId = userDoc.accountId;

    // Delete the Auth user (from Appwrite Console > Users)
    if (accountId) {
      await users.delete(accountId);
    }

    // Delete the user document from your own DB
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      userId
    );
  } catch (error) {
    handleError(error, "Échec de la suppression complète de l'utilisateur");
  }
};



