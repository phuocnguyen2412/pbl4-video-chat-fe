import { Button, Checkbox, Form, Input } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import useFetch from '../../hooks/useFetch';
import { authActions } from '../../redux/features/auth/authSlice';
import authApi from '../../apis/authApi';
import { useNavigate } from 'react-router-dom';
import 'tailwindcss/tailwind.css';
import { store } from '../../redux/store';
import { useState } from 'react';
import OTPModal from '../OTPModal/OTPModal';
import GoogleLoginComponent from './GoogleLoginComponent';

const LoginForm = () => {
    const navigate = useNavigate();
    const { isLoading, fetchData, contextHolder } = useFetch();
    const [isOtpVisible, setIsOtpVisible] = useState(false);
    const [email, setEmail] = useState('');

    const onFinish = async (values) => {
        setEmail(values.email);
        try {
            const { isOk, data, message } = await fetchData(() => authApi.login(values));

            if (isOk) {
                const { accessToken, refreshToken } = data;
                store.dispatch(
                    authActions.setCredentials({
                        accessToken,
                        refreshToken
                    })
                );
                navigate('/');
            } else if (message.includes("Your account hasn't been verified")) {
                setIsOtpVisible(true);
            }
        } catch (error) {
            console.log('Login failed:', error);
        }
    };

    const handleForgotPasswordClick = (e) => {
        e.preventDefault();
        navigate('/forgot-password');
    };

    const handleOtpSuccess = () => {
        setIsOtpVisible(false);
        navigate('/');
    };

    return (
        <>
            {contextHolder}
            <div className={isOtpVisible ? 'pointer-events-none blur-sm filter' : ''}>
                <Form
                    name='login'
                    layout='vertical'
                    style={{
                        maxWidth: 600,
                        margin: '0 auto'
                    }}
                    initialValues={{
                        remember: true
                    }}
                    requiredMark='optional'
                    onFinish={onFinish}
                    autoComplete='on'
                >
                    <Form.Item
                        label='Email'
                        name='email'
                        rules={[
                            {
                                required: true,
                                type: 'email',
                                message: 'Please input a valid email!'
                            }
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined />}
                            placeholder='Enter your email'
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Form.Item>

                    <Form.Item
                        label='Password'
                        name='password'
                        rules={[
                            {
                                required: true,
                                message: 'Please input your password!'
                            }
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder='Enter your password' />
                    </Form.Item>

                    <Form.Item>
                        <Form.Item name='remember' valuePropName='checked' noStyle>
                            <Checkbox>Remember me</Checkbox>
                        </Form.Item>
                        <a
                            style={{
                                float: 'right',
                                color: '#1890ff'
                            }}
                            href=''
                            onClick={handleForgotPasswordClick}
                        >
                            Forgot password?
                        </a>
                    </Form.Item>

                    <Form.Item
                        wrapperCol={{
                            span: 24
                        }}
                    >
                        <Button
                            type='primary'
                            htmlType='submit'
                            loading={isLoading}
                            style={{
                                width: '100%',
                                borderRadius: 30,
                                padding: '15px 20px'
                            }}
                        >
                            Submit
                        </Button>
                    </Form.Item>

                    <div className='relative my-5 flex items-center'>
                        <div
                            className='border-gray-100 red flex-grow border-t'
                            style={{ borderColor: '#e0e0e0' }}
                        ></div>
                        <span className='text-gray-600 bg-white px-2 text-sm'>Or</span>
                        <div className='border-gray-100 flex-grow border-t' style={{ borderColor: '#e0e0e0' }}></div>
                    </div>
                </Form>
            </div>
            <GoogleLoginComponent />
            <OTPModal
                isVisible={isOtpVisible}
                email={email}
                handleCloseOtpModal={() => setIsOtpVisible(false)}
                onSuccess={handleOtpSuccess}
            />
        </>
    );
};

export default LoginForm;
