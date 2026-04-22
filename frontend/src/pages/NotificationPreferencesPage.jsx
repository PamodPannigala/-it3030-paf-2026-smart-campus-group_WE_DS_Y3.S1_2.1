import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { Bell, ShieldCheck, Mail, Calendar, Building2, Ticket, CheckCircle2, Loader2, Save, Smartphone } from "lucide-react";
import { clsx } from "clsx";

const PreferenceToggle = ({ id, label, icon: Icon, checked, onChange, description }) => {
  const ToggleIcon = Icon;
  return (
    <motion.div
    whileHover={{ scale: 1.01 }}
    className={clsx(
      "d-flex align-items-center justify-content-between p-4 rounded-xl border mb-3 transition-all",
      checked ? "bg-white border-primary shadow-sm" : "bg-light border-transparent"
    )}
  >
    <div className="d-flex align-items-start gap-3">
      <div className={clsx(
        "p-2 rounded-lg",
        checked ? "bg-primary text-white" : "bg-white text-muted shadow-xs"
      )}>
        <ToggleIcon className="w-5 h-5" />
      </div>
      <div>
        <label className="fw-bold mb-0 d-block cursor-pointer" htmlFor={id}>
          {label}
        </label>
        <p className="small text-muted mb-0">{description}</p>
      </div>
    </div>
    <div className="form-check form-switch mb-0">
      <input
        className="form-check-input h5 mb-0 cursor-pointer"
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </div>
    </motion.div>
  );
};

const NotificationPreferencesPage = () => {
  const MotionDiv = motion.div;
  const MotionForm = motion.form;
  const [form, setForm] = useState({
    systemEnabled: true,
    bookingEnabled: true,
    facilityEnabled: true,
    ticketStatusEnabled: true,
    ticketCommentEnabled: true,
    emailEnabled: false,
    pushEnabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadPreferences = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/notifications/preferences");
      setForm(response.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load preferences");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  const savePreferences = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      setMessage("");
      await api.patch("/notifications/preferences", form);
      setMessage("Preferences saved successfully!");
      
      // Handle Browser Notification Permission request if push enabled
      if (form.pushEnabled && Notification.permission === "default") {
        await Notification.requestPermission();
      }
      
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container-fluid py-4 min-vh-100 animate-fade-in">
      <div className="row justify-content-center">
        <div className="col-xl-8 col-lg-10">
          
          <div className="card m4-glass-card border-0 overflow-hidden shadow-lg">
            <div className="card-header bg-white p-4 border-0 d-flex align-items-center gap-3">
              <div className="bg-primary-subtle p-3 rounded-circle">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="fw-bold mb-1">Notification Settings</h3>
                <p className="text-muted small mb-0">Control how and when you want to be notified</p>
              </div>
            </div>

            <div className="card-body p-4 pt-0">
              <AnimatePresence mode="wait">
                {loading ? (
                  <MotionDiv
                    key="loading"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="d-flex flex-column align-items-center justify-content-center py-5"
                  >
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
                    <span className="text-muted fw-medium">Configuring your dashboard...</span>
                  </MotionDiv>
                ) : (
                  <MotionForm
                    key="form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={savePreferences}
                    className="pt-3"
                  >
                    <div className="row g-4">
                       <div className="col-12">
                         <h5 className="fw-bold text-muted small mb-3 tracking-wider uppercase">Delivery Methods</h5>
                         <div className="row g-2">
                           <div className="col-md-6">
                             <PreferenceToggle 
                                id="emailEnabled"
                                label="Email Delivery"
                                description="Receive a copy of important alerts in your inbox"
                                icon={Mail}
                                checked={form.emailEnabled}
                                onChange={(val) => updateField("emailEnabled", val)}
                             />
                           </div>
                           <div className="col-md-6">
                             <PreferenceToggle 
                                id="pushEnabled"
                                label="Browser (Push)"
                                description="Real-time alerts directly in your browser"
                                icon={Smartphone}
                                checked={form.pushEnabled}
                                onChange={(val) => updateField("pushEnabled", val)}
                             />
                           </div>
                         </div>
                       </div>

                       <div className="col-12">
                         <h5 className="fw-bold text-muted small mb-3 tracking-wider uppercase">Topic Preferences</h5>
                         <div className="row g-2">
                           <div className="col-12">
                             <PreferenceToggle 
                                id="systemEnabled"
                                label="System Notifications"
                                description="Critical alerts, security updates, and account announcements"
                                icon={Bell}
                                checked={form.systemEnabled}
                                onChange={(val) => updateField("systemEnabled", val)}
                             />
                           </div>
                           <div className="col-12">
                             <PreferenceToggle 
                                id="bookingEnabled"
                                label="Bookings & Reservations"
                                description="Confirmation of space bookings, reminders, and cancellations"
                                icon={Calendar}
                                checked={form.bookingEnabled}
                                onChange={(val) => updateField("bookingEnabled", val)}
                             />
                           </div>
                           <div className="col-12">
                             <PreferenceToggle 
                                id="facilityEnabled"
                                label="Facility & Assets"
                                description="Updates regarding campus facilities and equipment status"
                                icon={Building2}
                                checked={form.facilityEnabled}
                                onChange={(val) => updateField("facilityEnabled", val)}
                             />
                           </div>
                           <div className="col-md-6">
                             <PreferenceToggle 
                                id="ticketStatusEnabled"
                                label="Ticket Status Updates"
                                description="When our team updates the status of your request"
                                icon={Ticket}
                                checked={form.ticketStatusEnabled}
                                onChange={(val) => updateField("ticketStatusEnabled", val)}
                             />
                           </div>
                           <div className="col-md-6">
                             <PreferenceToggle 
                                id="ticketCommentEnabled"
                                label="New Support Comments"
                                description="When a technician replies to your support ticket"
                                icon={Mail}
                                checked={form.ticketCommentEnabled}
                                onChange={(val) => updateField("ticketCommentEnabled", val)}
                             />
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex justify-content-end align-items-center gap-3 mt-5 p-3 bg-light rounded-xl">
                      <AnimatePresence>
                        {message && (
                          <MotionDiv
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="text-success small fw-bold d-flex align-items-center gap-1"
                          >
                            <CheckCircle2 className="w-4 h-4" /> {message}
                          </MotionDiv>
                        )}
                      </AnimatePresence>
                      {error && <span className="text-danger small fw-bold">{error}</span>}
                      
                      <button 
                        className="btn btn-primary px-5 py-2 fw-bold rounded-pill shadow-sm d-flex align-items-center gap-2" 
                        type="submit" 
                        disabled={saving}
                      >
                        {saving ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                        ) : (
                          <><Save className="w-4 h-4" /> Save Preferences</>
                        )}
                      </button>
                    </div>
                  </MotionForm>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferencesPage;
