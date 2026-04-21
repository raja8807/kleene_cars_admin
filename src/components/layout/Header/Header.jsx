import React, { useState, useEffect, useRef } from "react";
import { BellFill, ArrowClockwise, CircleFill } from "react-bootstrap-icons";
import { useRouter } from "next/router";
import styles from "./Header.module.scss";
import { useAuth } from "@/components/auth/AuthContext";
import { useRefresh } from "@/context/RefreshContext";
import { supabase } from "@/lib/supabaseClient";

const Header = () => {
  const router = useRouter();
  const { user, role } = useAuth();
  const { triggerRefresh } = useRefresh();
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    if (!user?.id) return;

    fetchNotifications();

    const channel = supabase
      .channel(`admin_notifications_${user.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications', 
        filter: `user_id=eq.${user.id}` 
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev]);
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [user?.id]);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  };

  const markAsRead = async () => {
    if (unreadCount === 0) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  const toggleNotifications = () => {
    if (!showNotifications) {
      markAsRead();
    }
    setShowNotifications(!showNotifications);
  };

  const getTitle = () => {
    const path = router.pathname;
    if (path === "/") return "Dashboard";
    if (path === "/orders") return "Orders Management";
    if (path === "/catalog") return "Catalog Management";
    if (path === "/customers") return "Customer Management";
    if (path === "/workers") return "Worker Management";
    if (path === "/payments") return "Payments Overview";
    if (path === "/admins") return "Admin Management";
    return "Admin Panel";
  };

  const handleRefresh = () => {
    setRefreshing(true);
    triggerRefresh();
    setTimeout(() => setRefreshing(false), 1000);
  };


  return (
    <header className={styles.header}>
      <div className={styles.title}>
        <h1>{getTitle()}</h1>
      </div>

      <div className={styles.actions}>
        <button
          className={`${styles.iconBtn} ${refreshing ? styles.refreshing : ""}`}
          onClick={handleRefresh}
          title="Refresh Data"
        >
          <ArrowClockwise />
        </button>

        <div className={styles.notificationWrapper} ref={notificationRef}>
          <button className={styles.iconBtn} onClick={toggleNotifications}>
            <BellFill />
            {unreadCount > 0 && <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className={styles.notificationsDropdown}>
              <div className={styles.dropdownHeader}>
                Notifications
              </div>
              <div className={styles.dropdownContent}>
                {notifications.length === 0 ? (
                  <div className={styles.emptyState}>No notifications</div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className={styles.notificationItem}>
                      <div className={styles.notifInfo}>
                        <span className={styles.notifTitle}>{notif.title}</span>
                        <span className={styles.notifBody}>{notif.body}</span>
                        <span className={styles.notifTime}>
                          {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {!notif.is_read && <CircleFill className={styles.unreadDot} />}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className={styles.profile}>
          <div className={styles.avatar}>{user?.name?.charAt?.(0)?.toUpperCase?.() || "A"}</div>
          <div className={styles.info}>
            <span className={styles.name}>{user?.name || "Admin User"}</span>
            <span className={styles.role}>{role}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
