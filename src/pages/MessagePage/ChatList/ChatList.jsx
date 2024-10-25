import { UsergroupAddOutlined } from '@ant-design/icons';
import { debounce } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoomChatApi from '../../../apis/RoomChatApi';
import AddRoomModal from '../../../components/ChatList/AddRoomModal';
import OnlineUsers from '../../../components/ChatList/OnlineUsers';
import RecentChats from '../../../components/ChatList/RecentChats';
import useFetch from '../../../hooks/useFetch';
import SearchBar from '../../../components/ChatList/SearchBar';
import { useSocket } from '../../../hooks/useSocket';
import './ChatList.css';
import { useSelector } from 'react-redux';
import { authSelector } from '../../../redux/features/auth/authSelections.js';

const debouncedSearch = debounce(async (value, setSearchResults) => {
    const data = await RoomChatApi.searchChatroomByName(value, true);
    if (data.isOk) setSearchResults(data.data);
}, 350);

const ChatList = () => {
    const navigate = useNavigate();
    const {user} = useSelector(authSelector);
    const { fetchData, contextHolder } = useFetch({ showSuccess: false, showError: false });
    const { socket } = useSocket();
    const [searchValue, setSearchValue] = useState('');
    const [isAddRoomModalVisible, setIsAddRoomModalVisible] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [recentChats, setRecentChats] = useState([]);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const audioRef =useRef(null);
    const handleSearchChange = (e) => {
        setSearchValue(e.target.value);
        debouncedSearch(e.target.value, setSearchResults);
    };

    const showAddRoomModal = () => {
        setIsAddRoomModalVisible(true);
    };

    const handleAddRoom = async (values) => {
        await fetchData(() => RoomChatApi.createChatRoom(values.members, values.roomName, values.privacy));
        setIsAddRoomModalVisible(false);
    };

    const handleCancel = () => {
        setIsAddRoomModalVisible(false);
    };

    const handleChatClick = (chatRoomData) => {
        navigate(`/message/${chatRoomData._id}`, {
            state: chatRoomData
        });
    };

    const fetchAndSetChatrooms = async () => {
        const data = await fetchData(() => RoomChatApi.getAllChatrooms(true));
        if (data.isOk) {
            setRecentChats(data.data);
            if (isFirstLoad) setIsFirstLoad(false);
        }
    };

    useEffect(() => {
        fetchAndSetChatrooms();
    }, []);

    useEffect(() => {
        socket?.on('updated chatroom', (updatedChatRoom) => {
            console.log(updatedChatRoom);
            if(user._id !== updatedChatRoom.lastMessage.sender._id){
                audioRef?.current?.play();
                console.log(123123123);
            }

            setRecentChats((pre) => {
                const oleList = pre.filter((chatRoom) => chatRoom._id !== updatedChatRoom._id);
                return [updatedChatRoom, ...oleList]
            })
        });

        return () => {
            socket?.off('updated chatroom', fetchAndSetChatrooms);
        };
    }, [socket]);

    return (
        <>
            {contextHolder}
            <audio src={"/sounds/tin-nhan.mp3"} ref={audioRef}/>
            <div className='chat-list bg-white-default'>
                <div className='header bg-white-default'>
                    <div className='title text-blue'>All Chats</div>
                    <div className='icons'>
                        <UsergroupAddOutlined className='icon text-gray' onClick={showAddRoomModal} />
                    </div>
                </div>
                <SearchBar
                    searchValue={searchValue}
                    handleSearchChange={handleSearchChange}
                    searchResults={searchResults}
                    handleChatClick={handleChatClick}
                />
                <OnlineUsers />
                <RecentChats recentChats={recentChats} handleChatClick={handleChatClick} isFirstLoad={isFirstLoad} />
                <AddRoomModal open={isAddRoomModalVisible} onCreate={handleAddRoom} onCancel={handleCancel} />
            </div>
        </>
    );
};

export default ChatList;