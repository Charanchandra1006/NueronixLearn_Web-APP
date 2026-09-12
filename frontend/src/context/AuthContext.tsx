import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

/* =========================
   USER INTERFACE
========================= */

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  onboardingCompleted?: boolean;
  profile?: {
    grade?: string;
    subjectInterests?: string[];
    weakAreas?: string[];
    preferredLearningStyle?: string;
    learningGoals?: string[];
    currentPerformanceLevel?: string;
    pacePreference?: string;
  };
}

/* =========================
   CONTEXT TYPE
========================= */

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role?: string,
    phone?: string,
    learningPace?: 'slow' | 'moderate' | 'fast',
    experienceLevel?: 'beginner' | 'intermediate' | 'professional',
    subjects?: string[]
  ) => Promise<void>;
  sendOTP: (email: string) => Promise<void>;
  verifyOTPRegister: (data: { email: string; otp: string; name: string; password: string; role: string; phone?: string }) => Promise<void>;
  sendLoginOTP: (email: string) => Promise<void>;
  verifyOTPLogin: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

/* =========================
   CONTEXT CREATION
========================= */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* =========================
   PROVIDER
========================= */

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  /* -------------------------
     REFRESH USER
  ------------------------- */

  const refreshUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.user);
    } catch (error) {
      console.error("Failed to refresh user");
    }
  };

  /* -------------------------
     CHECK TOKEN ON LOAD
  ------------------------- */

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      api
        .get("/auth/me")
        .then((res) => {
          setUser(res.data.user);
        })
        .catch(() => {
          localStorage.removeItem("token");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  /* -------------------------
     LOGIN
  ------------------------- */

  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });

    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);

    if (res.data.user.role === 'teacher') {
      navigate("/teacher");
    } else if (!res.data.user.onboardingCompleted) {
      navigate("/onboarding");
    } else {
      navigate("/dashboard");
    }
  };

  /* -------------------------
      REGISTER
   ------------------------- */

  const register = async (
    name: string,
    email: string,
    password: string,
    role: string = "student",
    phone?: string,
    learningPace?: 'slow' | 'moderate' | 'fast',
    experienceLevel?: 'beginner' | 'intermediate' | 'professional',
    subjects?: string[]
  ) => {
    const res = await api.post("/auth/register", {
      name,
      email,
      password,
      role,
      phone,
      learningPace,
      experienceLevel,
      subjects,
    });

    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);

    if (role === 'teacher') {
      navigate("/teacher");
    } else {
      navigate("/onboarding");
    }
  };

  /* -------------------------
      OTP FUNCTIONS
   ------------------------- */

  const sendOTP = async (email: string) => {
    await api.post("/auth/send-otp", { email });
  };

  const verifyOTPRegister = async (data: { email: string; otp: string; name: string; password: string; role: string; phone?: string }) => {
    const res = await api.post("/auth/verify-otp-register", data);
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
    if (data.role === 'teacher') {
      navigate("/teacher");
    } else {
      navigate("/onboarding");
    }
  };

  const sendLoginOTP = async (email: string) => {
    await api.post("/auth/send-login-otp", { email });
  };

  const verifyOTPLogin = async (email: string, otp: string) => {
    const res = await api.post("/auth/verify-otp-login", { email, otp });
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
    const token = localStorage.getItem("token");
    if (token) {
      const userRes = await api.get("/auth/me");
      if (!userRes.data.user.onboardingCompleted) {
        navigate("/onboarding");
      } else {
        navigate(userRes.data.user.role === 'teacher' ? '/teacher' : '/dashboard');
      }
    }
  };

  /* -------------------------
      LOGOUT
   ------------------------- */

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  /* -------------------------
     RETURN PROVIDER
  ------------------------- */

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        sendOTP,
        verifyOTPRegister,
        sendLoginOTP,
        verifyOTPLogin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* =========================
   CUSTOM HOOK
========================= */

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};