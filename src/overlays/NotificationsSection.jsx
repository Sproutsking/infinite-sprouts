import React, { useState } from 'react';
import I from '../icons/icons.jsx';
import { useNotifications } from '../context/serviceIndex.jsx';

function NotificationsSection({ onClose }) {
  const [filter, setFilter] = useState('all');
  const { notifications = [], loading, markRead, markAllRead } = useNotifications();
  const filters = [
    ['all', 'All'],
    ['return', 'Returns'],
    ['message', 'Messages'],
    ['community', 'Community'],
    ['wallet', 'Wallet'],
    ['security', 'Security'],
  ];
  const filtered = filter === 'all' ? notifications : notifications.filter(n => n.type === filter);

  return (
    <div className="sup-overlay">
      <div className="sup-hd">
        <button className="ib" onClick={onClose}><I.ArrowL/></button>
        <div style={{ fontFamily: 'var(--fd)', fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>Notifications</div>
        <div className="sub-hd-sp"/>
        <button className="btn btn-g btn-sm" onClick={markAllRead}>Mark all read</button>
      </div>
      <div className="sup-body">
        <div className="sup-content">
          <div className="chip-row">
            {filters.map(([k, l]) => (
              <span key={k} className={"chip" + (filter === k ? " on" : "")} onClick={() => setFilter(k)}>{l}</span>
            ))}
          </div>
          {loading ? (
            <div className="empty"><div className="empty-ico">⏳</div><div className="empty-t">Loading notifications…</div></div>
          ) : filtered.length === 0 ? (
            <div className="empty"><div className="empty-ico">🔔</div><div className="empty-t">No notifications</div><div className="empty-s">You are all caught up</div></div>
          ) : (
            <div className="notif-list">
              {filtered.map(n => (
                <div key={n.id} className={"notif-row" + (n.read ? '' : ' unread')} onClick={() => markRead(n.id)}>
                  <div className="notif-ico">{n.ico || '🔔'}</div>
                  <div className="notif-info">
                    <div className="notif-title-row">
                      <div className="notif-title">{n.title}</div>
                      <div className="notif-time">{n.time || 'Just now'}</div>
                    </div>
                    <div className="notif-body">{n.body}</div>
                  </div>
                  {!n.read && <div className="notif-dot"/>}
                </div>
              ))}
            </div>
          )}
          <div style={{ height: 20 }}/>
        </div>
      </div>
    </div>
  );
}

export default NotificationsSection;
