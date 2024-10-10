import React from 'react';
import PropTypes from 'prop-types';
import { SearchOutlined } from '@ant-design/icons';
import { Input, List, Avatar } from 'antd';

const SearchBar = ({ searchValue, handleSearchChange, searchResults, handleChatClick }) => {
    return (
        <>
            <div className='search-bar'>
                <SearchOutlined className='search-icon' />
                <Input
                    className='search-input'
                    placeholder='Search'
                    value={searchValue}
                    onChange={handleSearchChange}
                    autoFocus
                    allowClear
                />
            </div>

            {searchValue && (
                <div className='search-results'>
                    <List
                        itemLayout='horizontal'
                        dataSource={searchResults}
                        renderItem={(item) => (
                            <List.Item className='list-item' key={item._id} onClick={() => handleChatClick(item)}>
                                <List.Item.Meta
                                    avatar={<Avatar src={item.chatRoomImage} className='avatar' />}
                                    title={
                                        <div className='meta'>
                                            <span className='title'>{item.name}</span>
                                        </div>
                                    }
                                    description={<span className='message'>{item.message}</span>}
                                />
                            </List.Item>
                        )}
                    />
                </div>
            )}
        </>
    );
};

SearchBar.propTypes = {
    searchValue: PropTypes.string.isRequired,
    handleSearchChange: PropTypes.func.isRequired,
    searchResults: PropTypes.array.isRequired,
    handleChatClick: PropTypes.func.isRequired
};

export default SearchBar;