import { useState, useEffect, useRef } from 'react';
import { Badge, Overlay, Popover, Spinner, ListGroup, Button } from 'react-bootstrap';
import { getUserNotifications, markNotificationAsRead, markAllAsRead } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import theme from '../utils/theme';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPopover, setShowPopover] = useState(false);
  
  const target = useRef(null);

  // Fetch notifications on component mount
  useEffect(() => {
    if (showPopover) {
      fetchNotifications();
    }
  }, [showPopover]);

  // Fetch unread count every minute and when component mounts
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await getUserNotifications(false);
      if (response.success) {
        setUnreadCount(response.data.length);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getUserNotifications();
      
      if (response.success) {
        setNotifications(response.data);
        setUnreadCount(response.data.filter(n => !n.isRead).length);
      }
    } catch (error) {
      setError('Failed to load notifications');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification._id);
        
        // Update the notification in our local state
        setNotifications(notifications.map(n => 
          n._id === notification._id ? { ...n, isRead: true } : n
        ));
        
        // Update unread count
        setUnreadCount(prev => prev - 1);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    
    // Navigate to the action URL if available
    if (notification.actionUrl) {
      setShowPopover(false);
      window.location.href = notification.actionUrl;
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      
      // Update all notifications in our local state
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Format the timestamp
  const formatTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'some time ago';
    }
  };

  return (
    <div className="notification-bell position-relative">
      <div
        ref={target}
        onClick={() => setShowPopover(!showPopover)}
        style={{ cursor: 'pointer' }}
      >
        {unreadCount > 0 ? (
          <>
            <i className="bi bi-bell-fill" style={{ fontSize: '20px', color: theme.colors.accent.gold }}></i>
            <Badge 
              bg="danger" 
              pill 
              style={{ 
                position: 'absolute', 
                top: '-8px', 
                right: '-8px',
                fontSize: '0.6rem'
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          </>
        ) : (
          <i className="bi bi-bell" style={{ fontSize: '20px', color: '#fff' }}></i>
        )}
      </div>

      <Overlay
        show={showPopover}
        target={target.current}
        placement="bottom"
        rootClose
        onHide={() => setShowPopover(false)}
      >
        <Popover id="notifications-popover" style={{ maxWidth: '350px', width: '350px', boxShadow: theme.shadows.md }}>
          <Popover.Header className="d-flex justify-content-between align-items-center" 
            style={{ 
              background: theme.colors.background.light, 
              borderBottom: `1px solid ${theme.colors.accent.lightGreen}` 
            }}
          >
            <span className="fw-bold">
              <i className="bi bi-bell me-2"></i>
              Notifications
            </span>
            {unreadCount > 0 && (
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 text-decoration-none"
                onClick={handleMarkAllAsRead}
                style={{ color: theme.colors.primary.main }}
              >
                Mark all as read
              </Button>
            )}
          </Popover.Header>
          <Popover.Body className="p-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {loading ? (
              <div className="text-center py-3">
                <Spinner animation="border" size="sm" style={{ color: theme.colors.primary.main }} />
              </div>
            ) : error ? (
              <div className="text-center text-danger py-3">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-4">
                <i className="bi bi-bell-slash mb-2" style={{ fontSize: '2rem', color: theme.colors.text.light }}></i>
                <p>No notifications yet</p>
              </div>
            ) : (
              <ListGroup variant="flush">
                {notifications.map(notification => (
                  <ListGroup.Item 
                    key={notification._id}
                    action
                    onClick={() => handleNotificationClick(notification)}
                    className={notification.isRead ? 'text-muted' : 'fw-semibold'}
                    style={{ 
                      backgroundColor: notification.isRead ? '#fff' : '#f8f9fa',
                      cursor: 'pointer',
                      borderLeft: notification.isRead ? 'none' : `3px solid ${theme.colors.accent.gold}`
                    }}
                  >
                    <div className="d-flex flex-column">
                      <small className="fw-bold" style={{ color: theme.colors.primary.main }}>
                        {notification.title}
                      </small>
                      <div>{notification.message}</div>
                      <small className="text-muted mt-1 d-flex align-items-center">
                        <i className="bi bi-clock me-1" style={{ fontSize: '0.8rem' }}></i>
                        {formatTime(notification.createdAt)}
                      </small>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Popover.Body>
          <div className="border-top p-2 text-center">
            <Button 
              variant="link" 
              size="sm" 
              className="text-decoration-none"
              style={{ color: theme.colors.primary.main }}
              onClick={() => setShowPopover(false)}
            >
              Close
            </Button>
          </div>
        </Popover>
      </Overlay>
    </div>
  );
};

export default NotificationBell; 