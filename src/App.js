import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams, Link } from "react-router-dom";

// ====== CSS Styling ======
const appStyles = `
body {
  background: #f6f8fa;
  font-family: 'Segoe UI', Arial, sans-serif;
  margin: 0;
  padding: 0;
}
.shortener-container {
  background: #fff;
  margin: 40px auto;
  padding: 32px 28px 28px 28px;
  border-radius: 12px;
  box-shadow: 0 4px 32px rgba(50,50,93,0.07), 0 1.5px 3px rgba(0,0,0,0.03);
  max-width: 600px;
}
h2, h3 {
  color: #1a202c;
  margin-bottom: 16px;
}
form {
  margin-bottom: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
input, button {
  font-size: 1rem;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  outline: none;
}
input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px #2563eb33;
}
button {
  background: #2563eb;
  color: #fff;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
}
button:hover {
  background: #1e40af;
}
.short-url-link {
  color: #2563eb;
  font-weight: 500;
  text-decoration: none;
}
.short-url-link:hover {
  text-decoration: underline;
}
.table-links {
  width: 100%;
  max-width: 100%;
  margin-top: 8px;
  border-collapse: collapse;
  background: #f9fafb;
  border-radius: 8px;
  overflow: hidden;
  table-layout: fixed;
  word-break: break-all;
}

.table-links th, .table-links td {
  padding: 10px 8px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
}
.table-links th {
  background: #f3f4f6;
  color: #374151;
}
.table-links tr:last-child td {
  border-bottom: none;
}
.expired {
  color: #dc2626;
  font-weight: 500;
}
.log-list {
  background: #f3f4f6;
  border-radius: 6px;
  padding: 10px 16px;
  margin-top: 10px;
  font-size: 0.98rem;
  color: #374151;
  max-height: 170px;
  overflow-y: auto;
}
.auth-form-container {
  background: #fff;
  margin: 60px auto;
  padding: 36px 32px 30px 32px;
  border-radius: 12px;
  box-shadow: 0 4px 32px rgba(50,50,93,0.07), 0 1.5px 3px rgba(0,0,0,0.03);
  max-width: 350px;
}
.auth-form input, .auth-form button {
  width: 100%;
  margin-bottom: 12px;
}
.auth-form button {
  margin-bottom: 0;
}
.toggle-btn {
  background: #f3f4f6;
  color: #374151;
  border: none;
  margin-top: 0;
  margin-bottom: 0;
  cursor: pointer;
  padding: 10px;
  border-radius: 6px;
  transition: background 0.15s;
}
.toggle-btn:hover {
  background: #e0e7ef;
}
.msg-success {
  color: #059669;
  margin-bottom: 8px;
  font-weight: 500;
}
.msg-error {
  color: #dc2626;
  margin-bottom: 8px;
  font-weight: 500;
}
.logout-btn {
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  margin-left: auto;
  font-size: 0.98rem;
  transition: background 0.15s;
}
.logout-btn:hover {
  background: #e0e7ef;
}
`;

// ====== LocalStorage Helpers ======
const getUsers = () => JSON.parse(localStorage.getItem("users") || "[]");
const setUsers = (users) => localStorage.setItem("users", JSON.stringify(users));
const getLinks = () => JSON.parse(localStorage.getItem("links") || "[]");
const setLinks = (links) => localStorage.setItem("links", JSON.stringify(links));
const getLogs = () => JSON.parse(localStorage.getItem("logs") || "[]");
const setLogs = (logs) => localStorage.setItem("logs", JSON.stringify(logs));

function logAction(action, user, details = "") {
  const logs = getLogs();
  logs.push({
    time: new Date().toLocaleString(),
    user,
    action,
    details,
  });
  setLogs(logs);
}

// ====== Auth Context ======
const AuthContext = React.createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(localStorage.getItem("loggedInUser") || "");

  const login = (username, password) => {
    const users = getUsers();
    const found = users.find((u) => u.username === username && u.password === password);
    if (found) {
      localStorage.setItem("loggedInUser", username);
      setUser(username);
      logAction("Login", username);
      return true;
    }
    return false;
  };

  const register = (username, password) => {
    const users = getUsers();
    if (users.find((u) => u.username === username)) return false;
    users.push({ username, password });
    setUsers(users);
    logAction("Register", username);
    return true;
  };

  const logout = () => {
    logAction("Logout", user);
    localStorage.removeItem("loggedInUser");
    setUser("");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return React.useContext(AuthContext);
}

// ====== Login/Register Page ======
function LoginPage() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegister) {
      if (register(username, password)) {
        setMsg("Registered! Please log in.");
        setIsRegister(false);
      } else {
        setMsg("Username already exists.");
      }
    } else {
      if (login(username, password)) {
        navigate("/");
      } else {
        setMsg("Invalid credentials.");
      }
    }
  };

  return (
    <div className="auth-form-container">
      <h2 style={{ textAlign: "center" }}>{isRegister ? "Register" : "Login"}</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          required
          placeholder="Username"
          value={username}
          autoFocus
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          required
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">{isRegister ? "Register" : "Login"}</button>
      </form>
      <button className="toggle-btn" onClick={() => setIsRegister((r) => !r)}>
        {isRegister ? "Have an account? Login" : "No account? Register"}
      </button>
      <div className={msg.includes("Registered") ? "msg-success" : "msg-error"}>{msg}</div>
    </div>
  );
}

// ====== Main Shortener Page ======
function ShortenerPage() {
  const { user, logout } = useAuth();
  const [url, setUrl] = useState("");
  const [custom, setCustom] = useState("");
  const [expiry, setExpiry] = useState(""); // New state for expiry
  const [msg, setMsg] = useState("");
  const [links, setLinksState] = useState([]);
  const [logs, setLogsState] = useState([]);

  useEffect(() => {
    setLinksState(getLinks().filter((l) => l.user === user));
    setLogsState(getLogs().filter((l) => l.user === user));
  }, [user]);

  const handleShorten = (e) => {
    e.preventDefault();
    setMsg("");
    let slug = custom.trim() || Math.random().toString(36).substring(2, 8);
    if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
      setMsg("Shortcode must be alphanumeric or - _");
      return;
    }
    // Uniqueness check
    const allLinks = getLinks();
    if (allLinks.find((l) => l.slug === slug)) {
      setMsg("Shortcode already exists.");
      return;
    }
    // Parse expiry (default 30 min)
    let minutes = parseInt(expiry, 10);
    if (isNaN(minutes) || minutes <= 0) minutes = 30;
    const validUntil = Date.now() + minutes * 60 * 1000;
    const newLink = { slug, url, user, created: Date.now(), validUntil, expiry: minutes };
    allLinks.push(newLink);
    setLinks(allLinks);
    setLinksState(allLinks.filter((l) => l.user === user));
    logAction("Shorten", user, `Slug: ${slug}, Expiry: ${minutes} min`);
    setMsg(`Shortened: ${window.location.origin}/s/${slug} (valid ${minutes} min)`);
    setCustom("");
    setUrl("");
    setExpiry("");
  };

  return (
    <div className="shortener-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>URL Shortener</h2>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>
      <form onSubmit={handleShorten}>
        <input
          required
          placeholder="Paste your long URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ flex: 2 }}
        />
        <input
          placeholder="Custom shortcode (optional)"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          style={{ flex: 1 }}
        />
        <input
          type="number"
          min="1"
          placeholder="Expiry (min, default 30)"
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          style={{ width: 130 }}
        />
        <button type="submit" style={{ flex: "none" }}>
          Shorten
        </button>
      </form>
      {msg && (
        <div className={msg.startsWith("Shortened:") ? "msg-success" : "msg-error"}>
          {msg}
        </div>
      )}
      <h3>Your Short Links</h3>
      <table className="table-links">
        <thead>
          <tr>
            <th>Short URL</th>
            <th>Original URL</th>
            <th>Expires</th>
          </tr>
        </thead>
        <tbody>
          {links.map((l) => (
            <tr key={l.slug}>
              <td>
                <Link className="short-url-link" to={`/s/${l.slug}`}>
                  {window.location.origin}/s/{l.slug}
                </Link>
              </td>
              <td>
                <a href={l.url} target="_blank" rel="noopener noreferrer">
                  {l.url}
                </a>
              </td>
              <td>
                {new Date(l.validUntil).toLocaleTimeString()}{" "}
                {Date.now() > l.validUntil && <span className="expired">(Expired)</span>}
              </td>
      
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Your Logs</h3>
      <ul className="log-list">
        {logs.slice(-10).reverse().map((l, i) => (
          <li key={i}>
            [{l.time}] {l.action} {l.details}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ====== Redirection Handler ======
function RedirectPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    const links = getLinks();
    const link = links.find((l) => l.slug === slug);
    if (!link) {
      alert("Short link not found.");
      navigate("/");
      return;
    }
    if (Date.now() > link.validUntil) {
      alert("Short link expired.");
      navigate("/");
      return;
    }
    logAction("Redirect", link.user, `Slug: ${slug}`);
    window.location.href = link.url;
  }, [slug, navigate]);
  return <div>Redirecting...</div>;
}

// ====== App Router ======
function App() {
  // Inject CSS once
  useEffect(() => {
    if (!document.getElementById("shortener-css")) {
      const style = document.createElement("style");
      style.id = "shortener-css";
      style.innerHTML = appStyles;
      document.head.appendChild(style);
    }
  }, []);
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/s/:slug" element={<RedirectPage />} />
          <Route
            path="/*"
            element={
              <RequireAuth>
                <ShortenerPage />
              </RequireAuth>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

function RequireAuth({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);
  if (!user) return <LoginPage />;
  return children;
}

export default App;
