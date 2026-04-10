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

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ fullName: "", email: "", password: "", role: "USER" });
  const [forgotForm, setForgotForm] = useState({ email: "" });
  const [resetForm, setResetForm] = useState({ token: "", newPassword: "" });

  const goAfterAuth = (user) => {
    if (user?.role === "ADMIN") navigate("/admin", { replace: true });
    else navigate("/home", { replace: true });
  };

  const onLogin = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    try {
      const user = await loginWithPassword(loginForm);
      goAfterAuth(user);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Login failed");
    }
  };

  const onSignup = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    try {
      await signup(signupForm);
      setInfo("Account created. Please log in.");
      setMode("login");
      setLoginForm({ email: signupForm.email, password: "" });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Signup failed");
    }
  };

  const onForgot = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    try {
      const token = await forgotPassword(forgotForm);
      setResetToken(token);
      setResetForm({ token, newPassword: "" });
      setInfo("Reset token generated (demo). Paste it below to reset your password.");
      setMode("reset");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Request failed");
    }
  };

  const onReset = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    try {
      await resetPassword(resetForm);
      setInfo("Password reset successful. You can log in now.");
      setMode("login");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Reset failed");
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-7 col-xl-6">
        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <h2 className="mb-2">Welcome</h2>
            <p className="text-muted mb-4">Log in or create a new user/admin account.</p>

            <div className="d-flex flex-wrap gap-2 mb-3">
              <button
                className={`btn ${mode === "login" ? "btn-primary" : "btn-outline-primary"}`}
                type="button"
                onClick={() => setMode("login")}
              >
                Login
              </button>
              <button
                className={`btn ${mode === "signup" ? "btn-primary" : "btn-outline-primary"}`}
                type="button"
                onClick={() => setMode("signup")}
              >
                Sign up
              </button>
              <button
                className={`btn ${mode === "forgot" ? "btn-primary" : "btn-outline-primary"}`}
                type="button"
                onClick={() => setMode("forgot")}
              >
                Forgot password
              </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {info && <div className="alert alert-info">{info}</div>}

            {mode === "login" && (
              <form onSubmit={onLogin} className="d-grid gap-3">
                <div>
                  <label className="form-label">Email / Username</label>
                  <input
                    className="form-control"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Password</label>
                  <input
                    className="form-control"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                  />
                </div>
                <button className="btn btn-primary" type="submit">
                  Login
                </button>
                <div className="text-center text-muted">or</div>
                <button className="btn btn-outline-dark" type="button" onClick={loginWithGoogle}>
                  Continue with Google
                </button>
              </form>
            )}

            {mode === "signup" && (
              <form onSubmit={onSignup} className="d-grid gap-3">
                <div>
                  <label className="form-label">Full name</label>
                  <input
                    className="form-control"
                    value={signupForm.fullName}
                    onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input
                    className="form-control"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Password</label>
                  <input
                    className="form-control"
                    type="password"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Account type</label>
                  <select
                    className="form-select"
                    value={signupForm.role}
                    onChange={(e) => setSignupForm({ ...signupForm, role: e.target.value })}
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <button className="btn btn-primary" type="submit">
                  Create account
                </button>
              </form>
            )}

            {mode === "forgot" && (
              <form onSubmit={onForgot} className="d-grid gap-3">
                <div>
                  <label className="form-label">Email</label>
                  <input
                    className="form-control"
                    value={forgotForm.email}
                    onChange={(e) => setForgotForm({ ...forgotForm, email: e.target.value })}
                    required
                  />
                </div>
                <button className="btn btn-primary" type="submit">
                  Generate reset token
                </button>
                {resetToken && (
                  <div className="small text-muted">
                    Token: <code>{resetToken}</code>
                  </div>
                )}
              </form>
            )}

            {mode === "reset" && (
              <form onSubmit={onReset} className="d-grid gap-3">
                <div>
                  <label className="form-label">Token</label>
                  <input
                    className="form-control"
                    value={resetForm.token}
                    onChange={(e) => setResetForm({ ...resetForm, token: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">New password</label>
                  <input
                    className="form-control"
                    type="password"
                    value={resetForm.newPassword}
                    onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
                    required
                  />
                </div>
                <button className="btn btn-primary" type="submit">
                  Reset password
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

