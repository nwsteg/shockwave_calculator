import { createContext, useContext, useMemo, useState } from "react";

const DEFAULT_PROFILE = {
  p0: "350",
  t0: "650",
  mach: "7.2",
};

const ProfileContext = createContext({
  profile: DEFAULT_PROFILE,
  setProfile: () => {},
});

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const value = useMemo(() => ({ profile, setProfile }), [profile]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  return useContext(ProfileContext);
}
