import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../db/supabase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const lastFetchedUid = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const fetchAndMergeUser = async (currentSession) => {
      if (!currentSession?.user) {
        lastFetchedUid.current = null;

        if (!mountedRef.current) return;
        setCurrentUser(null);
        setLoading(false);
        setInitialized(true);
        return;
      }

      const uid = currentSession.user.id;

      // Prevent duplicate fetch for same user
      if (lastFetchedUid.current === uid) return;
      lastFetchedUid.current = uid;

      try {
        const { data: userRow, error } = await supabase
          .from("user")
          .select("userid, username, firstname, lastname, user_type, record_status")
          .eq("userid", uid)
          .single();

        if (!mountedRef.current) return;

        if (error || !userRow) {
          setCurrentUser({
            ...currentSession.user,
            user_type: "USER",
            record_status: "PENDING",
          });
        } else {
          setCurrentUser({
            ...currentSession.user,
            ...userRow,
          });
        }
      } catch (err) {
        if (!mountedRef.current) return;

        setCurrentUser({
          ...currentSession.user,
          user_type: "USER",
          record_status: "PENDING",
        });
      } finally {
        if (!mountedRef.current) return;

        setLoading(false);
        setInitialized(true);
      }
    };

    // ✅ SINGLE SOURCE OF TRUTH (auth listener)
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((event, session) => {
        setSession(session);

        if (event === "SIGNED_OUT") {
          lastFetchedUid.current = null;
          setCurrentUser(null);
          setLoading(false);
          setInitialized(true);
          return;
        }

        // Ignore token refresh noise
        if (event === "TOKEN_REFRESHED") return;

        fetchAndMergeUser(session);
      });

    // ✅ Initial session bootstrap (only once)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      fetchAndMergeUser(session);
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        session,
        loading,
        initialized,
        userType: currentUser?.user_type ?? "USER",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
