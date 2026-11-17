import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "../candidate/CandidateDashboard.css";
import "./EmployerDashboard.css";
import "../../styles/dashboard/theme-boost.css";
import "../../styles/dashboard/addons.css";
import { EmployerIcon as Icon } from "../../components/ui/Icon";
import MyInvitations from "../candidate/components/MyInvitations";
import { FEED_URL, feedPost } from "../../services/feedService";
import { filters, menuGroups, showPostJobShortcutOn } from "./employerConfig";
import { getCompanyKey } from "./employerHelpers";
import { API_PHP } from "../../config/env";
import { USER_KEY } from "../../config/storageKeys";
import { useTheme } from "../../hooks/useTheme";
import { empPath } from "./paths";

const titles = {
    dashboard: "Hire your next star.",
    postjob: "Post a Job",
    myjobs: "My Jobs",
    applicants: "Applicants",
    shortlisted: "Shortlisted",
    notifications: "Notifications",
    messages: "Messages",
    settings: "Settings",
    profile: "Company Profile",
    users: "Team & Users",
    connections: "My Network",
};

const pick = (obj, keys) => {
    for (const k of keys) {
        const v = obj?.[k];
        if (v && String(v).trim() && String(v).toLowerCase() !== "not specified") return v;
    }
    return "";
};

export default function EmployerLayout({ onLogout }) {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const active = pathname.split("/")[2] || "dashboard";

    const { isDark: darkMode, setDark: setDarkMode } = useTheme();
    const [mobileMenu, setMobileMenu] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [toolsOpen, setToolsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");
    const [toast, setToast] = useState("");
    const [notifications, setNotifications] = useState([]);

    const loggedInUser = (() => {
        try { return JSON.parse(localStorage.getItem(USER_KEY) || "{}"); } catch { return {}; }
    })();
    const employerName = loggedInUser.name || "Employer";
    const initials = employerName.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

    const [company, setCompany] = useState(() => {
        try { return JSON.parse(localStorage.getItem(getCompanyKey()) || "null"); } catch { return null; }
    });
    const [memberCompany, setMemberCompany] = useState(null);

    useEffect(() => {
        fetch(`${API_PHP}/companies.php?action=my_company`, { credentials: "include" })
            .then((r) => r.json())
            .then((d) => { if (d.success && d.company) setMemberCompany(d.company); })
            .catch(() => { });
    }, []);

    const loadNotifications = () =>
        fetch(`${FEED_URL}?action=notifications`, { credentials: "include" })
            .then((r) => r.json())
            .then((d) => d.success && setNotifications(d.notifications))
            .catch(() => { });

    useEffect(() => {
        loadNotifications();
        const t = setInterval(loadNotifications, 30000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        const ping = () => fetch(`${API_PHP}/me.php`, { credentials: "include" }).catch(() => { });
        ping();
        const t = setInterval(ping, 120000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(""), 3000);
        return () => clearTimeout(t);
    }, [toast]);

    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
        feedPost({ action: "mark_all_read" }).catch(() => { });
    };

    const companyName = memberCompany?.name || company?.name || "";
    const profilePercent = (() => {
        const c = company || memberCompany;
        if (!c) return 0;
        const checks = [
            pick(c, ["name"]), pick(c, ["industry"]), pick(c, ["size", "company_size"]),
            pick(c, ["website", "website_url"]), pick(c, ["location", "city", "address"]),
            pick(c, ["about", "description"]), pick(c, ["logo_url", "logo"]),
        ];
        return Math.round((checks.filter(Boolean).length / checks.length) * 100);
    })();

    const unread = notifications.filter((n) => n.unread).length;

    // Abhi pehle jaisa: naye browser tab mein. Same tab chahiye to window.open ki jagah navigate(empPath(id))
    const handleMenu = (id) => {
        setMobileMenu(false);
        window.open(empPath(id), "_blank", "noopener,noreferrer");
    };

    const applySearch = () => {
        setToolsOpen(false);
        const qs = new URLSearchParams();
        if (search.trim()) qs.set("search", search.trim());
        if (filter !== "All") qs.set("category", filter);
        navigate(`${empPath("dashboard")}${qs.toString() ? `?${qs}` : ""}`);
    };

    const noCompanyOnProfile = !company && !memberCompany && active === "profile";

    const ctx = { setToast, notifications, markAllRead, company, setCompany, memberCompany, employerName };

    return (
        <div className={`candidate-app employer-app ${darkMode ? "dark" : ""}`}>
            <header className="candidate-topbar">
                <div className="brand-area">
                    <button className="mobile-menu-btn" onClick={() => setMobileMenu(!mobileMenu)}>
                        <span></span><span></span><span></span>
                    </button>
                    <div className="candidate-logo">
                        <span>Startup</span><b>Hire</b><i>.</i>
                        <em className="role-tag">Employer</em>
                    </div>
                </div>

                <div className="top-actions">
                    <div className="notification-wrapper">
                        <button className="theme-btn" title="Search & Filter"
                            onClick={() => { setToolsOpen(!toolsOpen); setNotificationsOpen(false); }}>
                            <Icon name="search" size={20} />
                        </button>

                        {toolsOpen && (
                            <div className="notification-dropdown tools-dropdown">
                                <div className="notification-head"><h3>Search &amp; Filter</h3></div>
                                <div style={{ padding: "0 16px 6px" }}>
                                    <div className="top-search" style={{ width: "100%", margin: "0 0 12px" }}>
                                        <Icon name="search" size={18} />
                                        <input
                                            autoFocus
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && applySearch()}
                                            placeholder="Search candidates, skills or cities..."
                                        />
                                    </div>
                                    <p style={{ margin: "0 0 8px", fontSize: 12, opacity: 0.7 }}>Filter by category</p>
                                    <div className="filter-chips" style={{ margin: 0 }}>
                                        {filters.map((f) => (
                                            <button key={f} className={`chip ${filter === f ? "active" : ""}`}
                                                onClick={() => setFilter(f)}>{f}</button>
                                        ))}
                                    </div>
                                    <button className="all-notifications" style={{ marginTop: 12 }} onClick={applySearch}>
                                        Apply &amp; view results
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button className="theme-btn" onClick={onLogout} title="Back to Home">
                        <Icon name="home" size={20} />
                    </button>

                    <button className="theme-btn" onClick={() => setDarkMode(!darkMode)}>
                        <Icon name={darkMode ? "sun" : "moon"} size={20} />
                    </button>

                    <div className="notification-wrapper">
                        <button className="notification-btn"
                            onClick={() => { setNotificationsOpen(!notificationsOpen); setToolsOpen(false); }}>
                            <Icon name="bell" size={22} />
                            <span>{unread}</span>
                        </button>

                        {notificationsOpen && (
                            <div className="notification-dropdown">
                                <div className="notification-head">
                                    <h3>Notifications</h3>
                                    <small>{unread} new</small>
                                </div>
                                {notifications.slice(0, 2).map((n) => (
                                    <div className="notification-item" key={n.id}>
                                        <div className={`notif-dot ${n.unread ? "" : "purple"}`}></div>
                                        <div>
                                            <strong>{n.title}</strong>
                                            <p>{n.desc}</p>
                                            <small>{n.time}</small>
                                        </div>
                                    </div>
                                ))}
                                <button className="all-notifications"
                                    onClick={() => { setNotificationsOpen(false); handleMenu("notifications"); }}>
                                    View all notifications
                                </button>
                            </div>
                        )}
                    </div>

                    <button className="top-profile" onClick={() => handleMenu("profile")}>
                        <div className="profile-avatar">{initials}</div>
                        <div className="top-profile-text">
                            <strong>{employerName}</strong>
                            <span>{loggedInUser.role === "employer" ? "Employer" : "Account"}</span>
                        </div>
                        <span className="profile-arrow">⌄</span>
                    </button>
                </div>
            </header>

            <div className="candidate-layout">
                <aside className={`candidate-sidebar ${mobileMenu ? "mobile-open" : ""}`}>
                    <div className="sidebar-profile">
                        <div className="large-avatar">{initials}</div>
                        <div>
                            <h3>{employerName.replace(/\b\w/g, (c) => c.toUpperCase())}</h3>
                            <p>{companyName || "No company yet"}</p>
                        </div>
                    </div>

                    <div className="profile-progress">
                        <div className="progress-top">
                            <span>Company profile</span>
                            <b>{profilePercent}%</b>
                        </div>
                        <div className="progress-line" style={{ width: "100%", overflow: "hidden" }}>
                            <span style={{
                                display: "block", height: "100%", width: `${profilePercent}%`,
                                minWidth: 0, padding: 0, flex: "none", transition: "width .4s ease",
                            }}></span>
                        </div>
                    </div>

                    <nav className="side-navigation">
                        {menuGroups.map((group) => (
                            <div className="menu-group" key={group.title}>
                                <p className="menu-title">{group.title}</p>
                                {group.items.map((item) => (
                                    <button key={item.id}
                                        className={`side-item ${active === item.id ? "active" : ""}`}
                                        onClick={() => handleMenu(item.id)}>
                                        <span className="side-icon"><Icon name={item.icon} size={21} /></span>
                                        <span className="side-label">{item.label}</span>
                                        {item.id === "notifications" && unread > 0 ? (
                                            <span className="side-count">{unread}</span>
                                        ) : item.count && item.id !== "myjobs" && item.id !== "shortlisted" ? (
                                            <span className="side-count">{item.count}</span>
                                        ) : null}
                                        {active === item.id && <span className="active-line"></span>}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </nav>

                    <div className="sidebar-bottom">
                        <button className="help-card home-card" onClick={onLogout}>
                            <div className="help-icon"><Icon name="home" size={18} /></div>
                            <div>
                                <strong>Back to Home</strong>
                                <p>Return to StartupHire.in</p>
                            </div>
                        </button>
                    </div>
                </aside>

                {mobileMenu && <div className="sidebar-overlay" onClick={() => setMobileMenu(false)}></div>}

                <main className="candidate-main">
                    {noCompanyOnProfile ? (
                        <Outlet context={ctx} />
                    ) : (
                        <>
                            <MyInvitations onAccepted={() => window.location.reload()} />

                            {!company && !memberCompany && (
                                <div className="setup-banner">
                                    <div>
                                        <strong>Set up your company page</strong>
                                        <p>Candidates need to see who is hiring before you post a job.</p>
                                    </div>
                                    <button className="primary-btn" onClick={() => navigate(empPath("profile"))}>
                                        Set up now
                                    </button>
                                </div>
                            )}

                            <div className="page-heading">
                                <div>
                                    <span className="welcome-text">WELCOME BACK, {employerName.toUpperCase()}</span>
                                    <h1>{titles[active] || "Dashboard"}</h1>
                                    <p>Find, shortlist and hire the right talent for your startup.</p>
                                </div>
                                {showPostJobShortcutOn.includes(active) && (
                                    <button className="edit-profile-btn" onClick={() => navigate(empPath("postjob"))}>
                                        <Icon name="plus" size={18} /> Post a Job
                                    </button>
                                )}
                            </div>

                            <Outlet context={ctx} />
                        </>
                    )}
                </main>
            </div>

            {toast && <div className="toast">{toast}</div>}
        </div>
    );
}