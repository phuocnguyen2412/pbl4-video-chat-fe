import { useEffect, useRef, useState } from 'react';
import moment from 'moment';
import notificationApi from '../../apis/notificationApi';
import { Button, List, Typography, Layout, Avatar, Tabs, Dropdown, Menu, Spin } from 'antd';
import { CloseOutlined, EllipsisOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Content } = Layout;
const { Text } = Typography;
const { TabPane } = Tabs;

const SidebarContainer = styled.div`
    width: 385px;
    background: #fff;
    height: 100vh;
    position: fixed;
    left: 72px;
    top: 0;
    z-index: 1000;
    border-right: 1px solid #f0f0f0;
`;

const Header = styled.div`
    padding: 16px 24px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const StyledButton = styled(Button)`
    &:hover {
        color: #1890ff;
    }
`;

const ContentWrapper = styled(Content)`
    padding: 1px 24px;
    overflow-y: auto;
    height: calc(100vh - 120px);
`;

const NotificationSidebar = ({ onClose }) => {
    const sidebarRef = useRef();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            setLoading(true);
            try {
                const response = await notificationApi.getAll(page);
                setNotifications((prevNotifications) => [...prevNotifications, ...response.data]);
                setHasMore(response.data.length > 0);
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            }
            setLoading(false);
        };

        fetchNotifications();
    }, [page]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const handleMenuClick = async (key, notification) => {
        if (key === 'markAsRead') {
            await notificationApi.seenNotification(notification._id);
            setNotifications((prevNotifications) =>
                prevNotifications.map((item) => (item._id === notification._id ? { ...item, isRead: true } : item))
            );
        } else if (key === 'markAsUnread') {
            await notificationApi.unseenNotification(notification._id);
            setNotifications((prevNotifications) =>
                prevNotifications.map((item) => (item._id === notification._id ? { ...item, isRead: false } : item))
            );
        } else if (key === 'delete') {
            await notificationApi.deleteNotification(notification._id);
            setNotifications((prevNotifications) => prevNotifications.filter((item) => item._id !== notification._id));
        }
    };

    const renderNotificationItem = (item) => {
        const menu = (
            <Menu onClick={({ key }) => handleMenuClick(key, item)}>
                {item.isRead ? (
                    <Menu.Item key='markAsUnread'>Mark as Unread</Menu.Item>
                ) : (
                    <Menu.Item key='markAsRead'>Mark as Read</Menu.Item>
                )}
                <Menu.Item key='delete'>Delete</Menu.Item>
            </Menu>
        );

        return (
            <List.Item
                actions={[
                    <Dropdown key={item._id} overlay={menu} trigger={['click']}>
                        <Button shape='circle' size='small' icon={<EllipsisOutlined />} />
                    </Dropdown>
                ]}
            >
                <List.Item.Meta
                    className='hover: bg-gray-300 cursor-pointer'
                    avatar={<Avatar src={item.type === 'ChatRooms' ? item.detail.chatRoomImage : item.avatar} />}
                    title={
                        <a href={item.type === 'ChatRooms' ? `/message/${item.detail._id}` : `/message/${item.detail}`}>
                            {item.message}
                        </a>
                    }
                    description={moment(item.createdAt).fromNow()}
                />
            </List.Item>
        );
    };

    const markAllAsRead = async () => {
        await Promise.all(notifications.map((notification) => notificationApi.seenNotification(notification._id)));
        setNotifications((prevNotifications) =>
            prevNotifications.map((notification) => ({ ...notification, isRead: true }))
        );
    };

    const readNotifications = notifications.filter((item) => item.isRead);
    const unreadNotifications = notifications.filter((item) => !item.isRead);

    const loadMoreNotifications = () => {
        if (hasMore && !loading) {
            setPage((prevPage) => prevPage + 1);
        }
    };

    return (
        <SidebarContainer ref={sidebarRef}>
            <Header>
                <Text
                    className='text-blue'
                    style={{
                        fontSize: '22px',
                        fontWeight: 'bold'
                    }}
                >
                    Notifications
                </Text>
                <StyledButton type='text' icon={<CloseOutlined />} onClick={onClose} />
            </Header>
            <ContentWrapper>
                <Tabs
                    defaultActiveKey='1'
                    tabBarExtraContent={{ right: <Button onClick={markAllAsRead}>Mark All as Read</Button> }}
                >
                    <TabPane tab='Unread' key='1'>
                        <List
                            itemLayout='horizontal'
                            dataSource={unreadNotifications}
                            renderItem={renderNotificationItem}
                            loadMore={
                                hasMore && !loading ? (
                                    <div style={{ textAlign: 'center', marginTop: 12 }}>
                                        <Button onClick={loadMoreNotifications}>Load More</Button>
                                    </div>
                                ) : null
                            }
                        />
                        {loading && (
                            <div style={{ textAlign: 'center', marginTop: 12 }}>
                                <Spin />
                            </div>
                        )}
                    </TabPane>
                    <TabPane tab='Read' key='2'>
                        <List
                            itemLayout='horizontal'
                            dataSource={readNotifications}
                            renderItem={renderNotificationItem}
                            loadMore={
                                hasMore && !loading ? (
                                    <div style={{ textAlign: 'center', marginTop: 12 }}>
                                        <Button onClick={loadMoreNotifications}>Load More</Button>
                                    </div>
                                ) : null
                            }
                        />
                        {loading && (
                            <div style={{ textAlign: 'center', marginTop: 12 }}>
                                <Spin />
                            </div>
                        )}
                    </TabPane>
                </Tabs>
            </ContentWrapper>
        </SidebarContainer>
    );
};

export default NotificationSidebar;