import { TbPhoneCall, TbWorldSearch } from 'react-icons/tb';
import { Avatar, Badge, Dropdown, Layout, Menu } from 'antd';
import { RiLogoutCircleRLine } from 'react-icons/ri';
import { BiMessageSquareDots } from 'react-icons/bi';
import { IoSettingsOutline } from 'react-icons/io5';
import { LuContact2 } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import { handleLogout } from '../../components/Logout';
import { authSelector } from '../../redux/features/auth/authSelections';
import { useSelector } from 'react-redux';
import assets from '../../assets/index';
import './SideBar.css';

const { Sider } = Layout;

const Sidebar = () => {
    const logout = handleLogout();
    const navigate = useNavigate();
    const { user } = useSelector(authSelector);

    const menuItems = [
        {
            key: 'setting',
            icon: <IoSettingsOutline size={15} />,
            label: <span>Setting</span>
        },
        {
            key: 'logout',
            icon: <RiLogoutCircleRLine size={15} />,
            label: <span>Logout</span>,
            onClick: logout
        }
    ];

    const sidebarItems = [
        {
            key: 'message',
            icon: <BiMessageSquareDots size={20} />,
            className: 'custom-menu-item'
        },
        {
            key: 'call',
            icon: <TbPhoneCall size={20} />,
            className: 'custom-menu-item'
        },
        {
            key: 'contact/friend-list',
            icon: <LuContact2 size={20} />,
            className: 'custom-menu-item'
        },
        {
            key: 'search/users',
            icon: <TbWorldSearch size={20} />,
            className: 'custom-menu-item'
        }
    ];

    return (
        <Sider
            width={72}
            className='flex h-full flex-col items-center justify-between border-r border-purple-100 bg-white-default py-4'
        >
            <div className='mb-5 flex items-center justify-center'>
                <img src={assets.logo_sidebar1} alt='Logo' className='h-9 w-9' />
            </div>
            <Menu
                mode='vertical'
                className='flex flex-grow flex-col items-center justify-start bg-white-default'
                onClick={(e) => {
                    navigate(e.key);
                }}
                items={sidebarItems}
            />
            <div className='mt-auto flex flex-col items-center'>
                <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                    <div className='mt-4 flex cursor-pointer flex-col items-center'>
                        <Badge count={1} status='success'>
                            <Avatar size={46} src={user?.avatar} />
                        </Badge>
                    </div>
                </Dropdown>
            </div>
        </Sider>
    );
};

export default Sidebar;
