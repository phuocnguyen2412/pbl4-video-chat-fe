import { Avatar, Button, Card } from 'antd';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useRef } from 'react';
import userApi from '../../apis/userApi';
import _ from 'lodash';

const FriendRequestCard = ({ request }) => {
    const { _id, sender, caption, createdAt } = request;
    const navigate = useNavigate();
    const buttonRef = useRef(null);

    const handleButtonClick = (type) => {
        userApi.acceptFriendRequest(_id, type);

        if (buttonRef.current) {
            buttonRef.current.innerHTML =
                type === 'DECLINED'
                    ? `<div class="e"><p>Bạn đã từ chối</p></div>`
                    : `<div class="e"><p>Bạn đã chấp nhận</p></div>`;
        }
    };

    return (
        <Card
            className='cursor-pointer transition-transform duration-300 ease-in-out hover:shadow-md'
            onClick={() => {
                navigate(`/user/${sender._id}`);
            }}
            key={_id}
            bordered={false}
        >
            <div className='flex items-center gap-x-4'>
                <Avatar src={sender.avatar} szie={100} />
                <div>
                    <h1>{sender.name}</h1>
                    <h1>{dayjs(createdAt).format('DD/MM/YYYY')}</h1>
                </div>
            </div>
            <p className='py-4'>{caption}</p>
            <div className='flex gap-x-4' ref={buttonRef}>
                <Button
                    onClick={() => {
                        handleButtonClick('DECLINED');
                    }}
                >
                    Từ chối
                </Button>
                <Button
                    onClick={() => {
                        handleButtonClick('ACCEPTED');
                    }}
                >
                    Đồng ý
                </Button>
            </div>
        </Card>
    );
};

FriendRequestCard.propTypes = {
    request: PropTypes.object.isRequired
};

export default FriendRequestCard;
