import { Avatar, Button, Card, Modal, Input, Badge, Tooltip, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import RoomChatApi from '../../apis/RoomChatApi';
import userApi from '../../apis/userApi';
import useFetch from '../../hooks/useFetch';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { authSelector } from '../../redux/features/auth/authSelections';
import './UserCard.css';

const UserCard = ({ data }) => {
    const { name, avatar } = data;
    const { fetchData } = useFetch({ showError: false, showSuccess: false });
    const navigate = useNavigate();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [friendStatus, setFriendStatus] = useState(data.isFriend);
    const [sentRequestStatus, setSentRequestStatus] = useState(data.isSentRequest);
    const { user: currentUser } = useSelector(authSelector);
    const [caption, setCaption] = useState(
        `Hello, I am ${currentUser.name}, I know you through Connectica. Let's be friends!`
    );

    useEffect(() => {
        setFriendStatus(data.isFriend);
        setSentRequestStatus(data.isSentRequest);
    }, [data.isFriend, data.isSentRequest]);

    const handleChatClick = async (e) => {
        e.stopPropagation();
        if (friendStatus) {
            const response = await fetchData(() => RoomChatApi.getOneToOneChatRoom(data._id));
            const roomId = response.data._id;
            navigate(`/message/${roomId}`, {
                state: {
                    name: name,
                    chatRoomImage: avatar,
                    typeRoom: 'OneToOne'
                }
            });
        } else if (sentRequestStatus) {
            const response = await fetchData(() => userApi.revokeRequest(data._id));
            if (response.isOk) {
                setSentRequestStatus(false);
                notification.success({
                    message: 'Request Revoked',
                    description: 'Your friend request has been revoked successfully.'
                });
            } else {
                notification.error({
                    message: 'Revoke Failed',
                    description: 'There was an error revoking your friend request. Please try again.'
                });
            }
        } else {
            setIsModalVisible(true);
        }
    };

    const handleAddFriend = async () => {
        const response = await fetchData(() => userApi.addFriend({ friendId: data._id, caption }));
        if (response.isOk) {
            setSentRequestStatus(true);
            setIsModalVisible(false);
            notification.success({
                message: 'Request Sent',
                description: 'Your friend request has been sent successfully.'
            });
        } else {
            notification.error({
                message: 'Request Failed',
                description: 'There was an error sending your friend request. Please try again.'
            });
        }
    };

    return (
        <>
            <Card
                size='small'
                hoverable={true}
                onClick={() => {
                    navigate(`/user/${data._id}`);
                }}
                className='list-item cursor-pointer bg-white-default transition-transform duration-300 ease-in-out hover:shadow-md dark:bg-black-light dark:hover:shadow-md'
            >
                <div className='flex items-center gap-2.5 rounded-lg p-4 dark:bg-black-light'>
                    <Badge dot={true} color={friendStatus ? '#52c41a' : '#B6B6B6'} offset={[-7, 36]}>
                        <Avatar src={data.avatar} size={40} />
                    </Badge>
                    <div className='flex-1'>
                        <div className='flex flex-row items-center'>
                            <h1 className='text-black text-lg dark:text-white-default'>{data.name}</h1>
                            <span className='ml-2 text-sm text-blue'>
                                &#8226; {data.isFriend ? 'Friend' : 'User on Connectica'}
                            </span>
                        </div>
                        <h2 className='text-md text-gray'>{data.introduction}</h2>
                    </div>
                    <Button onClick={handleChatClick}>
                        {friendStatus ? 'Message' : sentRequestStatus ? 'Cancel Request' : 'Add Friend'}
                    </Button>
                </div>
            </Card>
            <Modal
                title='Enter Description'
                visible={isModalVisible}
                onOk={handleAddFriend}
                onCancel={() => setIsModalVisible(false)}
            >
                <Input.TextArea
                    style={{ height: '100px', width: '100%' }}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder='Enter a description for the friend request'
                    maxLength={150}
                />
            </Modal>
        </>
    );
};

UserCard.propTypes = {
    data: PropTypes.object.isRequired
};

export default UserCard;
