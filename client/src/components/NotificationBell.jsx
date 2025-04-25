import { useState, useEffect, useRef } from 'react';
import { Bell, BellFill } from 'react-bootstrap-icons';
import { Badge, Overlay, Popover, Spinner, ListGroup, Button } from 'react-bootstrap';
import { getUserNotifications, markNotificationAsRead, markAllAsRead } from '../services/api';
import { formatDistanceToNow } from 'date-fns';

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
    <div className="notification-bell">
      <div
        ref={target}
        onClick={() => setShowPopover(!showPopover)}
        style={{ cursor: 'pointer' }}
      >
        {unreadCount > 0 ? (
          <>
            <BellFill size={20} className="text-primary" />
            <Badge 
              bg="danger" 
              pill 
              style={{ 
                position: 'absolute', 
                top: '-5px', 
                right: '-5px',
                fontSize: '0.6rem'
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          </>
        ) : (
          <Bell size={20} />
        )}
      </div>

      <Overlay
        show={showPopover}
        target={target.current}
        placement="bottom"
        rootClose
        onHide={() => setShowPopover(false)}
      >
        <Popover id="notifications-popover" style={{ maxWidth: '350px', width: '350px' }}>
          <Popover.Header className="d-flex justify-content-between align-items-center">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 text-decoration-none"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </Button>
            )}
          </Popover.Header>
          <Popover.Body className="p-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {loading ? (
              <div className="text-center py-3">
                <Spinner animation="border" size="sm" />
              </div>
            ) : error ? (
              <div className="text-center text-danger py-3">{error}</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-3">No notifications</div>
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
                      cursor: 'pointer'
                    }}
                  >
                    <div className="d-flex flex-column">
                      <small className="text-primary mb-1">
                        {notification.title}
                      </small>
                      <div>{notification.message}</div>
                      <small className="text-muted mt-1">
                        {formatTime(notification.createdAt)}
                      </small>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Popover.Body>
        </Popover>
      </Overlay>
    </div>
  );
};

export default NotificationBell; 