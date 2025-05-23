import { useEffect, useState } from 'react';
import { Tabs, Skeleton, Row, Col, Button, message } from 'antd';
import useFetch from '../../../hooks/useFetch';
import userApi from '../../../apis/userApi';
import FriendRequestCard from '../../../components/FriendRequest/FriendRequestCard';
import SentFriendRequestCard from '../../../components/FriendRequest/SentFriendRequestCard';

const { TabPane } = Tabs;

const FriendRequestPage = () => {
    const [requestCount, setRequestCount] = useState(0);
    const [sentRequestCount, setSentRequestCount] = useState(0);
    const [suggestionCount, setSuggestionCount] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div
            className='space-y-4 rounded-lg bg-white-default px-2 py-2 dark:bg-black-light md:space-y-6 md:px-3 md:py-3'
            style={{ height: '100vh' }}
        >
            <div className='m-0 rounded-lg bg-white-default p-2 dark:bg-black-light md:p-5' style={{ height: '100%' }}>
                <Tabs defaultActiveKey='1' size={isMobile ? 'small' : 'default'}>
                    <TabPane tab={`Received Requests (${requestCount})`} key='1'>
                        <FriendRequestBox setRequestCount={setRequestCount} isMobile={isMobile} />
                    </TabPane>
                    <TabPane tab={`Sent Requests (${sentRequestCount})`} key='2'>
                        <SentRequests setSentRequestCount={setSentRequestCount} isMobile={isMobile} />
                    </TabPane>
                    <TabPane tab={`Friend Suggestions (${suggestionCount})`} key='3'>
                        <FriendSuggestions setSuggestionCount={setSuggestionCount} isMobile={isMobile} />
                    </TabPane>
                </Tabs>
            </div>
        </div>
    );
};

const FriendRequestBox = ({ setRequestCount, isMobile }) => {
    const { fetchData, isLoading } = useFetch({ showSuccess: false, showError: false });
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        (async () => {
            const data = await fetchData(() => userApi.getFriendRequest(0, 10));
            if (data.isOk) {
                setRequests(data.data);
                setRequestCount(data.data.length);
            }
        })();
    }, [fetchData, setRequestCount]);

    return (
        <div className='space-y-4 overflow-y-auto pb-16 pt-2 md:pb-0'>
            {isLoading ? (
                <Row gutter={[16, 16]}>
                    {Array.from({ length: 4 }).map((_, index) => (
                        <Col key={index} xs={24} sm={24} md={24} lg={24} xl={24}>
                            <Skeleton active avatar paragraph={{ rows: 2 }} />
                        </Col>
                    ))}
                </Row>
            ) : requests.length > 0 ? (
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-1 md:grid-cols-2 md:gap-4 lg:grid-cols-2'>
                    {requests.map((request) => (
                        <FriendRequestCard key={request._id} request={request} />
                    ))}
                </div>
            ) : (
                <div className='text-gray-500 flex items-center justify-center rounded-md border border-dashed py-4 dark:text-white-dark'>
                    No friend requests
                </div>
            )}
        </div>
    );
};

const SentRequests = ({ setSentRequestCount, isMobile }) => {
    const { fetchData, isLoading } = useFetch({ showSuccess: false, showError: false });
    const [sentRequests, setSentRequests] = useState([]);

    useEffect(() => {
        (async () => {
            const data = await fetchData(() => userApi.getSentRequests());
            if (data.isOk) {
                setSentRequests(data.data);
                setSentRequestCount(data.data.length);
            }
        })();
    }, [fetchData, setSentRequestCount]);

    const handleRevokeRequest = async (receiverId) => {
        const response = await fetchData(() => userApi.revokeRequest(receiverId));
        if (response.isOk) {
            setSentRequests((prevRequests) => prevRequests.filter((request) => request.receiver._id !== receiverId));
            setSentRequestCount((prevCount) => prevCount - 1);
            message.success('Friend request revoked successfully');
        } else {
            message.error('Failed to revoke friend request');
        }
    };

    return (
        <div className='space-y-4 overflow-y-auto pb-16 pt-2 md:pb-0'>
            {isLoading ? (
                <Row gutter={[16, 16]}>
                    {Array.from({ length: 4 }).map((_, index) => (
                        <Col key={index} xs={24} sm={24} md={24} lg={24} xl={24}>
                            <Skeleton active avatar paragraph={{ rows: 2 }} />
                        </Col>
                    ))}
                </Row>
            ) : sentRequests.length > 0 ? (
                sentRequests.map((request) => (
                    <SentFriendRequestCard
                        key={request._id}
                        request={request}
                        onRevoke={() => handleRevokeRequest(request.receiver._id)}
                    />
                ))
            ) : (
                <div className='text-gray-500 flex items-center justify-center rounded-md border border-dashed py-4 dark:text-white-dark'>
                    No sent requests
                </div>
            )}
        </div>
    );
};

const FriendSuggestions = ({ setSuggestionCount, isMobile }) => {
    const { fetchData, isLoading } = useFetch({ showSuccess: false, showError: false });
    const [suggestions, setSuggestions] = useState([]);

    // useEffect(() => {
    //     (async () => {
    //         const data = await fetchData(() => userApi.getFriendSuggestions(0, 10)); // API not available yet
    //         if (data.isOk) {
    //             setSuggestions(data.data);
    //             setSuggestionCount(data.data.length);
    //         }
    //     })();
    // }, [fetchData, setSuggestionCount]);

    return (
        <div className='space-y-4 overflow-y-auto pb-16 pt-2 md:pb-0'>
            {isLoading ? (
                <Row gutter={[16, 16]}>
                    {Array.from({ length: 4 }).map((_, index) => (
                        <Col key={index} xs={24} sm={24} md={24} lg={24} xl={24}>
                            <Skeleton active avatar paragraph={{ rows: 2 }} />
                        </Col>
                    ))}
                </Row>
            ) : suggestions.length > 0 ? (
                suggestions.map((suggestion) => <FriendRequestCard key={suggestion._id} request={suggestion} />)
            ) : (
                <div className='text-gray-500 flex items-center justify-center rounded-md border border-dashed py-4 dark:text-white-dark'>
                    No friend suggestions
                </div>
            )}
        </div>
    );
};

export default FriendRequestPage;
