import { Avatar, Badge, Space } from 'antd';
import { useSocket } from './../../hooks/useSocket';
import { truncateString } from '../../helpers/utils';
import PropTypes from 'prop-types';

const OnlineUsers = () => {
    const { onlineUsers } = useSocket();

    return (
        <div className='online-now bg-white-default'>
            <h4 className='text-gray'>Online Now</h4>
            <div className='avatars gap-x-5 bg-white-default'>
                {onlineUsers.length === 0
                    ? 'No one online now'
                    : onlineUsers.map((user, index) => (
                          <div key={user.userId || index} className='flex flex-col items-center'>
                              <div className='relative'>
                                  <Space>
                                      <Badge dot color='#52c41a' size='small' offset={[-16, 40]}>
                                          <Avatar src={user.avatar} className='avatar' />
                                      </Badge>
                                  </Space>
                              </div>
                              <h1>{truncateString(user.name, 10)}</h1>
                          </div>
                      ))}
            </div>
        </div>
    );
};

OnlineUsers.propTypes = {};

export default OnlineUsers;
