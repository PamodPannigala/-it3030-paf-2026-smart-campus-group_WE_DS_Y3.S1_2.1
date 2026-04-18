import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, UserPlus, Key, Eye, EyeOff, Github, Globe, Sparkles, Rocket, ShieldCheck } from "lucide-react";
import { clsx } from "clsx";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const LoginPage = () => {
  const query = useQuery();
  const initialMode = query.get("mode") === "signup" ? "signup" : "login";
  const [mode, setMode] = useState(initialMode); // login | signup | forgot | reset
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { loginWithGoogle, loginWithPassword, signup, resetPassword, forgotPassword } = useAuth();

  const [loginForm, setLoginForm] = useState({ usernameOrEmail: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });
  const [forgotForm, setForgotForm] = useState({ email: "" });
  const [resetForm, setResetForm] = useState({ token: "", newPassword: "" });

  const goAfterAuth = (user) => {
    if (user?.role === "ADMIN" || user?.role === "TECHNICIAN") {
      navigate("/admin", { replace: true });
    } else {
      navigate("/home", { replace: true });
    }
  };

  const handleError = (err, fallback) => {
    setError(err?.response?.data?.message || err?.message || fallback);
  };

  const onLogin = async (e) => {
    e.preventDefault();
    setError(""); setInfo("");
    try {
      const user = await loginWithPassword({
        usernameOrEmail: loginForm.usernameOrEmail,
        password: loginForm.password,
      });
      goAfterAuth(user);
    } catch (err) { handleError(err, "Login failed"); }
  };

  const onSignup = async (e) => {
    e.preventDefault();
    setError(""); setInfo("");
    try {
      await signup(signupForm);
      setInfo("Account created. Please log in.");
      setMode("login");
      setLoginForm({ usernameOrEmail: signupForm.username, password: "" });
    } catch (err) { handleError(err, "Signup failed"); }
  };

  const onForgot = async (e) => {
    e.preventDefault();
    setError(""); setInfo("");
    try {
      const token = await forgotPassword(forgotForm);
      setResetToken(token);
      setResetForm({ token, newPassword: "" });
      setInfo("Reset token generated (demo). Paste it below to reset your password.");
      setMode("reset");
    } catch (err) { handleError(err, "Request failed"); }
  };

  const onReset = async (e) => {
    e.preventDefault();
    setError(""); setInfo("");
    try {
      await resetPassword(resetForm);
      setInfo("Password reset successful. You can log in now.");
      setMode("login");
    } catch (err) { handleError(err, "Reset failed"); }
  };

  return (
    <div className="auth-surface-premium min-vh-100 d-flex align-items-center justify-content-center p-3">
      <div className="auth-split-layout container-xl shadow-2xl animate-fade-in">
        
        {/* Left Branding Panel */}
        <div className="auth-branding d-none d-lg-flex">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="branding-content text-white"
          >
            <div className="d-flex align-items-center gap-2 mb-4">
              <div className="bg-white text-primary p-2 rounded-xl shadow-lg">
                <Globe className="w-8 h-8" />
              </div>
              <h2 className="fw-bold mb-0 text-white" style={{ letterSpacing: "-1px" }}>Smart Campus</h2>
            </div>
            
            <h1 className="display-4 fw-bold mb-4 tracking-tight">The unified digital experience.</h1>
            <p className="lead text-white-50 mb-5">
              Access your tools, connections, and campus spaces all in one seamless interface.
            </p>

            <div className="d-grid gap-3">
              <div className="auth-feature-pill">
                <Rocket className="w-5 h-5" /> Fast & Secure SSO
              </div>
              <div className="auth-feature-pill">
                <Sparkles className="w-5 h-5" /> Unified Notification Center
              </div>
              <div className="auth-feature-pill">
                <ShieldCheck className="w-5 h-5" /> Role-Based Access Control
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Form Panel */}
        <div className="auth-form-wrapper bg-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-100"
              style={{ maxWidth: "400px", margin: "0 auto" }}
            >
              <div className="auth-header mb-5 text-center text-lg-start">
                <h2 className="fw-bold mb-2">
                  {mode === "login" && "Welcome back"}
                  {mode === "signup" && "Create account"}
                  {mode === "forgot" && "Reset access"}
                  {mode === "reset" && "Secure account"}
                </h2>
                <p className="text-muted">
                  {mode === "login" && "Enter your credentials to continue."}
                  {mode === "signup" && "Join the central hub for our campus."}
                  {mode === "forgot" && "We'll help you get back in."}
                  {mode === "reset" && "Set a strong new password."}
                </p>
              </div>

              {error && <div className="alert alert-danger border-0 bg-danger-subtle text-danger py-2 small mb-4">{error}</div>}
              {info && <div className="alert alert-success border-0 bg-success-subtle text-success py-2 small mb-4">{info}</div>}

              {mode === "login" && (
                <form onSubmit={onLogin} className="d-grid gap-3">
                  <div className="form-group mb-2">
                    <label className="small fw-bold text-muted mb-2 d-block">Username or Email</label>
                    <div className="premium-input-wrapper">
                      <LogIn className="input-icon" />
                      <input 
                        className="form-control premium-input ps-5" 
                        placeholder="Username or email" 
                        value={loginForm.usernameOrEmail} 
                        onChange={(e) => setLoginForm({ ...loginForm, usernameOrEmail: e.target.value })} 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="form-group mb-2">
                    <div className="d-flex justify-content-between">
                      <label className="small fw-bold text-muted mb-2">Password</label>
                      <button type="button" className="btn btn-link p-0 small text-decoration-none fw-semibold" onClick={() => setMode("forgot")}>Forgot password?</button>
                    </div>
                    <div className="premium-input-wrapper">
                      <Key className="input-icon" />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        className="form-control premium-input ps-5 pe-5" 
                        placeholder="Enter password" 
                        value={loginForm.password} 
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} 
                        required 
                      />
                      <button type="button" className="btn input-action-btn" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button className="btn btn-primary btn-lg py-3 fw-bold rounded-xl shadow-lg mt-3" type="submit">Sign In</button>
                  
                  <div className="d-flex align-items-center gap-3 my-4">
                    <hr className="flex-grow-1 opacity-25" /> <span className="text-muted small fw-medium">OR</span> <hr className="flex-grow-1 opacity-25" />
                  </div>

                  <button className="btn btn-outline-secondary btn-lg py-3 fw-bold rounded-xl d-flex align-items-center justify-content-center gap-3 border-2 transition-all hover:bg-light" type="button" onClick={loginWithGoogle}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </button>
                  
                  <p className="text-center small mt-5 text-muted">
                    New to campus? <button type="button" className="btn btn-link p-0 text-decoration-none fw-bold" onClick={() => setMode("signup")}>Create an account</button>
                  </p>
                </form>
              )}

              {mode === "signup" && (
                <form onSubmit={onSignup} className="d-grid gap-3">
                  <div className="form-group">
                    <label className="small fw-bold text-muted mb-2">Full Name</label>
                    <input className="form-control premium-input" placeholder="John Doe" value={signupForm.fullName} onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="small fw-bold text-muted mb-2">Username</label>
                    <input className="form-control premium-input" placeholder="johndoe" value={signupForm.username} onChange={(e) => setSignupForm({ ...signupForm, username: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="small fw-bold text-muted mb-2">Email Address</label>
                    <input type="email" className="form-control premium-input" placeholder="john@university.edu" value={signupForm.email} onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="small fw-bold text-muted mb-2">Password</label>
                    <input type="password" className="form-control premium-input" placeholder="Min 6 characters" value={signupForm.password} onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })} required />
                  </div>
                  <button className="btn btn-primary btn-lg py-3 fw-bold rounded-xl shadow-lg mt-3" type="submit">Get Started</button>
                  <p className="text-center small text-muted mt-3">
                    Already have an account? <button type="button" className="btn btn-link p-0 text-decoration-none fw-bold" onClick={() => setMode("login")}>Sign in here</button>
                  </p>
                </form>
              )}

              {mode === "forgot" && (
                <form onSubmit={onForgot} className="d-grid gap-3">
                  <div className="form-group">
                    <label className="small fw-bold text-muted mb-2">Email Address</label>
                    <input type="email" className="form-control premium-input" placeholder="name@example.com" value={forgotForm.email} onChange={(e) => setForgotForm({ ...forgotForm, email: e.target.value })} required />
                  </div>
                  <button className="btn btn-primary btn-lg py-3 fw-bold rounded-xl shadow-lg mt-2" type="submit">Send Reset Token</button>
                  {resetToken && (
                    <div className="premium-alert mt-4">
                      <span className="d-block mb-2 text-muted small fw-bold uppercase">Demo Access Token:</span>
                      <code className="fs-5 fw-bold text-primary">{resetToken}</code>
                    </div>
                  )}
                  <p className="text-center small text-muted mt-4">
                    Take me back to <button type="button" className="btn btn-link p-0 text-decoration-none fw-bold" onClick={() => setMode("login")}>Login</button>
                  </p>
                </form>
              )}

              {mode === "reset" && (
                <form onSubmit={onReset} className="d-grid gap-3">
                  <div className="form-group">
                    <label className="small fw-bold text-muted mb-2">Reset Token</label>
                    <input className="form-control premium-input text-center fs-5 fw-bold tracking-widest" placeholder="••••••••" value={resetForm.token} onChange={(e) => setResetForm({ ...resetForm, token: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="small fw-bold text-muted mb-2">New Password</label>
                    <input type="password" className="form-control premium-input" placeholder="Enter new password" value={resetForm.newPassword} onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })} required />
                  </div>
                  <button className="btn btn-primary btn-lg py-3 fw-bold rounded-xl shadow-lg mt-2" type="submit">Update Password</button>
                  <button type="button" className="btn btn-link w-100 p-0 text-decoration-none small text-muted" onClick={() => setMode("login")}>Cancel</button>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
