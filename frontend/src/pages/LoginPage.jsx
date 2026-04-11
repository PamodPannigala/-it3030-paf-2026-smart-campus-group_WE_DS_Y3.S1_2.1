import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
    <div className="auth-surface-premium">
      <div className="auth-split-layout container">
        <div className="auth-branding">
          <div className="branding-content">
            <h1 className="display-4 fw-bold text-white mb-3 tracking-tight">Campus Hub</h1>
            <p className="lead text-white-50 mb-5">
              The unified digital experience for campus life. Access your tools, connections, and spaces all in one place.
            </p>
            <div className="d-none d-lg-block">
              <div className="auth-feature-pill">
                <span className="icon">🚀</span> Fast & Secure SSO
              </div>
              <div className="auth-feature-pill mt-3">
                <span className="icon">🎯</span> Unified Notification Center
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form-wrapper">
          <div className="auth-glass-card">
            
            <div className="auth-header mb-4">
              <h3 className="fw-bold mb-1">
                {mode === "login" && "Welcome back"}
                {mode === "signup" && "Create an account"}
                {mode === "forgot" && "Reset password"}
                {mode === "reset" && "Set new password"}
              </h3>
              <p className="text-muted small">
                {mode === "login" && "Enter your credentials to access your account."}
                {mode === "signup" && "Join the central hub for our smart campus."}
                {mode === "forgot" && "We'll help you get back into your account."}
                {mode === "reset" && "Secure your account with a new password."}
              </p>
            </div>

            {error && <div className="alert alert-danger py-2 small">{error}</div>}
            {info && <div className="alert alert-success py-2 small">{info}</div>}

            {mode === "login" && (
              <form onSubmit={onLogin} className="auth-form">
                <div className="form-floating mb-3">
                  <input className="form-control" id="floatingInput" placeholder="name@example.com" autoComplete="username" value={loginForm.usernameOrEmail} onChange={(e) => setLoginForm({ ...loginForm, usernameOrEmail: e.target.value })} required />
                  <label htmlFor="floatingInput">Username or email</label>
                </div>
                <div className="form-floating mb-3">
                  <input type="password" className="form-control" id="floatingPassword" placeholder="Password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required />
                  <label htmlFor="floatingPassword">Password</label>
                </div>
                
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="form-check">
                    <input type="checkbox" className="form-check-input" id="rememberMe" />
                    <label className="form-check-label small text-muted" htmlFor="rememberMe">Remember me</label>
                  </div>
                  <button type="button" className="btn btn-link p-0 small text-decoration-none" onClick={() => setMode("forgot")}>Forgot password?</button>
                </div>

                <button className="btn btn-primary w-100 py-2 fw-semibold mb-3 login-action-btn" type="submit">Sign In</button>
                
                <div className="auth-divider mb-3">
                  <span className="text-muted small">or continue with</span>
                </div>

                <button className="btn btn-outline-secondary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 google-btn" type="button" onClick={loginWithGoogle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
                
                <p className="text-center small mt-4 text-muted">
                  Don't have an account? <button type="button" className="btn btn-link p-0 text-decoration-none fw-semibold" onClick={() => setMode("signup")}>Sign up</button>
                </p>
              </form>
            )}

            {mode === "signup" && (
              <form onSubmit={onSignup} className="auth-form">
                <div className="form-floating mb-3">
                  <input className="form-control" id="signupName" placeholder="John Doe" value={signupForm.fullName} onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })} required />
                  <label htmlFor="signupName">Full Name</label>
                </div>
                <div className="form-floating mb-3">
                  <input className="form-control" id="signupUsername" placeholder="username" autoComplete="off" value={signupForm.username} onChange={(e) => setSignupForm({ ...signupForm, username: e.target.value })} required />
                  <label htmlFor="signupUsername">Username</label>
                </div>
                <div className="form-floating mb-3">
                  <input type="email" className="form-control" id="signupEmail" placeholder="name@example.com" value={signupForm.email} onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })} required />
                  <label htmlFor="signupEmail">Email address</label>
                </div>
                <div className="form-floating mb-4">
                  <input type="password" className="form-control" id="signupPassword" placeholder="Password" value={signupForm.password} onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })} required />
                  <label htmlFor="signupPassword">Password</label>
                </div>
                <button className="btn btn-primary w-100 py-2 fw-semibold mb-3 login-action-btn" type="submit">Create account</button>
                <p className="text-center small text-muted">
                  Already have an account? <button type="button" className="btn btn-link p-0 text-decoration-none fw-semibold" onClick={() => setMode("login")}>Sign in</button>
                </p>
              </form>
            )}

            {mode === "forgot" && (
              <form onSubmit={onForgot} className="auth-form">
                <div className="form-floating mb-4">
                  <input type="email" className="form-control" id="forgotEmail" placeholder="name@example.com" value={forgotForm.email} onChange={(e) => setForgotForm({ ...forgotForm, email: e.target.value })} required />
                  <label htmlFor="forgotEmail">Email address</label>
                </div>
                <button className="btn btn-primary w-100 py-2 fw-semibold mb-3 login-action-btn" type="submit">Send Reset Token</button>
                {resetToken && (
                  <div className="alert alert-warning py-2 small text-center mt-3">
                    <span className="d-block mb-1">Demo Token:</span>
                    <code className="fs-6 fw-bold text-dark">{resetToken}</code>
                  </div>
                )}
                <p className="text-center small text-muted mt-3">
                  Remember your password? <button type="button" className="btn btn-link p-0 text-decoration-none fw-semibold" onClick={() => setMode("login")}>Back to login</button>
                </p>
              </form>
            )}

            {mode === "reset" && (
              <form onSubmit={onReset} className="auth-form">
                <div className="form-floating mb-3">
                  <input className="form-control" id="resetToken" placeholder="Token" value={resetForm.token} onChange={(e) => setResetForm({ ...resetForm, token: e.target.value })} required />
                  <label htmlFor="resetToken">Reset Token</label>
                </div>
                <div className="form-floating mb-4">
                  <input type="password" className="form-control" id="resetPassword" placeholder="New Password" value={resetForm.newPassword} onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })} required />
                  <label htmlFor="resetPassword">New Password</label>
                </div>
                <button className="btn btn-primary w-100 py-2 fw-semibold mb-3 login-action-btn" type="submit">Set New Password</button>
                <button type="button" className="btn btn-link w-100 p-0 text-decoration-none small" onClick={() => setMode("login")}>Cancel</button>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
