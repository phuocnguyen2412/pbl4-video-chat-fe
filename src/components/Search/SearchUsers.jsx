import { Input, Typography, Skeleton, Empty, Row, Col } from 'antd';
import { useSelector } from 'react-redux';
import { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import userApi from './../../apis/userApi';
import useFetch from './../../hooks/useFetch';
import UserCard from '../../components/Search/UserCard';
import { authSelector } from '../../redux/features/auth/authSelections';

const { Search } = Input;
const { Paragraph } = Typography;

const SearchUsers = () => {
    const { user: currentUser } = useSelector(authSelector);
    const { fetchData, isLoading } = useFetch({ showSuccess: false, showError: false });
    const [users, setUsers] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (currentUser && currentUser._id) {
            const fetchUsers = async () => {
                const usersData = await fetchData(() => userApi.getAllUser());

                if (usersData.isOk) {
                    setUsers(usersData.data);
                }
            };

            fetchUsers();
        }
    }, [fetchData, currentUser]);

    const handleSearchUsers = async (value) => {
        setIsSearching(true);
        const data = await fetchData(() => userApi.searchUsers(value, 1, 10));
        setIsSearching(false);

        if (data.isOk) {
            const usersWithStatus = data.data.map((user) => ({
                ...user,
                isFriend: user.isFriend,
                isSentRequest: user.isSentRequest
            }));
            setUsers(usersWithStatus);
        }
    };

    const debouncedSearch = useCallback(debounce(handleSearchUsers, 300), []);

    return (
        <div className='bg-white rounded-lg bg-white-default p-6 dark:bg-black-light'>
            <Paragraph className='text-gray-600 mb-6 dark:text-white-dark'>
                Use the search box below to find users. You can view their profiles and connect with them.
            </Paragraph>
            <div className='mb-6 flex items-center'>
                <Search
                    placeholder='Search user'
                    onChange={(e) => debouncedSearch(e.target.value)}
                    loading={isLoading}
                    className='flex-grow'
                    size='large'
                    enterButton
                />
            </div>
            <div className='flex flex-col gap-6' style={{ height: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                {isLoading || isSearching ? (
                    <Row gutter={[16, 16]}>
                        {Array.from({ length: 3 }).map((_, index) => (
                            <Col key={index} xs={24} sm={24} md={24} lg={24}>
                                <Skeleton active avatar paragraph={{ rows: 2 }} />
                            </Col>
                        ))}
                    </Row>
                ) : users.length === 0 ? (
                    <Empty description='No users found' />
                ) : (
                    <Row gutter={[16, 16]}>
                        {users
                            .filter((user) => user._id !== currentUser._id)
                            .map((user) => (
                                <Col key={user._id} xs={24} sm={24} md={24} lg={24}>
                                    <UserCard data={user} />
                                </Col>
                            ))}
                    </Row>
                )}
            </div>
        </div>
    );
};

export default SearchUsers;
