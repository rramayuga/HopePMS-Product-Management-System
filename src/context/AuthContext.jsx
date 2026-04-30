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

  useEffect(() => {
    const fetchAndMergeUser = async (currentSession) => {
      if (!currentSession?.user) {
        lastFetchedUid.current = null;
        setCurrentUser(null);
        setLoading(false);
        setInitialized(true);
        return;
      }

      const uid = currentSession.user.id;

      // ✅ FIX: do NOT touch loading here
      if (lastFetchedUid.current === uid) {
        return;
      }
      lastFetchedUid.current = uid;

      try {
        const { data: userRow, error } = await supabase
          .from('user')
          .select('userid, username, firstname, lastname, user_type, record_status')
          .eq('userid', uid)
          .single();

        if (error || !userRow) {
          console.error('Error fetching user row:', error);
          setCurrentUser({
            ...currentSession.user,
            user_type: 'USER',
            record_status: 'PENDING',
          });
        } else {
          setCurrentUser({ ...currentSession.user, ...userRow });
        }
      } catch (err) {
        console.error('fetchAndMergeUser threw:', err);
        setCurrentUser({
          ...currentSession.user,
          user_type: 'USER',
          record_status: 'PENDING',
        });
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    // Initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      fetchAndMergeUser(session);
    });

    // Auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);

        if (event === 'SIGNED_OUT') {
          lastFetchedUid.current = null;
          setCurrentUser(null);
          setLoading(false);
          setInitialized(true);
          return;
        }

        if (event === 'TOKEN_REFRESHED') {
          return;
        }

        fetchAndMergeUser(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{
      currentUser,
      session,
      loading,
      initialized,
      userType: currentUser?.user_type ?? 'USER',
    }}>
      {children}
    </AuthContext.Provider>
  );
};
