import * as AuthSession from "expo-auth-session";

const GOOGLE_KEEP_API_URL = process.env.EXPO_PUBLIC_GOOGLE_KEEP_API_UR;
const CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

export const signInWithGoogle = async () => {
  try {
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: "exp",
    });

    const authUrl = `https://accounts.google.com/o/oauth2/auth?response_type=token&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=https://www.googleapis.com/auth/keep.readonly`;

    const response = await AuthSession.startAsync({ authUrl });

    if (response.type === "success") {
      return response.params.access_token;
    } else {
      throw new Error("Authentication failed.");
    }
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
};

export const fetchTasksFromGoogleKeep = async (authToken) => {
  try {
    const response = await fetch(GOOGLE_KEEP_API_URL, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.statusText}`);
    }

    const data = await response.json();
    return data.notes.map((note) => ({
      id: note.id,
      name: note.title || "Untitled",
      time: "Unknown",
      tags: ["Google Keep"],
    }));
  } catch (error) {
    console.error("Fetch Error:", error);
    throw error;
  }
};
