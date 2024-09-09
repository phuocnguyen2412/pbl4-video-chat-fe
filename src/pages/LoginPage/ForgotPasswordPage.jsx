import React, { useState, useCallback } from 'react'
import { Form, Input, Button, Typography, Space, Card, notification } from 'antd'
import { MailOutlined, LockOutlined } from '@ant-design/icons'
import useFetch from '../../hooks/useFetch'
import { useNavigate } from 'react-router-dom'
import authApi from '../../apis/authApi'
import OTPModal from '../../components/OTPModal/OTPModal'
import './ForgotPasswordPage.scss'

const { Title, Text } = Typography

const ForgotPassword = () => {
    const navigate = useNavigate()
    const { isLoading, fetchData, contextHolder } = useFetch()
    const [isOtpVisible, setIsOtpVisible] = useState(false)
    const [formState, setFormState] = useState({
        email: '',
        isEmailVerified: false,
        password: '',
        confirmPassword: ''
    })

    const handleEmailSubmit = useCallback(
        async (values) => {
            setFormState((prevState) => ({ ...prevState, email: values.email }))
            const { isOk, data } = await fetchData(() => authApi.forgotPassword(values.email))
            if (isOk) {
                setIsOtpVisible(true)
            }
        },
        [fetchData]
    )

    const handleOtpSuccess = useCallback((otp) => {
        setIsOtpVisible(false)
        setFormState((prevState) => ({
            ...prevState,
            isEmailVerified: true,
            otp: otp
        }))
    }, [])

    const handlePasswordSubmit = useCallback(async () => {
        const { email, password, confirmPassword } = formState
        const otp = localStorage.getItem('verifiedOtp')
        const { isOk, data } = await fetchData(() => authApi.resetPassword(email, otp, password, confirmPassword))
        if (isOk) {
            localStorage.removeItem('verifiedOtp')
            notification.success({
                message: 'Password Changed',
                description: 'Your password has been successfully changed. Redirecting to login page...',
                duration: 4
            })
            setTimeout(() => {
                navigate('/login')
            }, 4000)
        }
    }, [fetchData, formState, navigate])

    return (
        <>
            {contextHolder}
            <div className='forgot-password-container'>
                <Card className='forgot-password-card'>
                    <Space direction='vertical' size='large' style={{ width: '100%' }}>
                        <Title level={2} style={{ textAlign: 'center' }}>
                            Forgot Password
                        </Title>
                        <Text className='forgot-password-description' type='secondary' style={{ textAlign: 'center' }}>
                            {formState.isEmailVerified
                                ? 'Enter your new password.'
                                : 'Enter your email address to receive a verification code.'}
                        </Text>
                        <Form
                            name='forgot-password'
                            layout='vertical'
                            onFinish={formState.isEmailVerified ? handlePasswordSubmit : handleEmailSubmit}
                            autoComplete='on'
                        >
                            {!formState.isEmailVerified && (
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
                                        onChange={(e) =>
                                            setFormState((prevState) => ({
                                                ...prevState,
                                                email: e.target.value
                                            }))
                                        }
                                    />
                                </Form.Item>
                            )}

                            {formState.isEmailVerified && (
                                <>
                                    <Form.Item
                                        label='New Password'
                                        name='password'
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Please input your new password!'
                                            }
                                        ]}
                                    >
                                        <Input.Password
                                            prefix={<LockOutlined />}
                                            placeholder='Enter new password'
                                            onChange={(e) =>
                                                setFormState((prevState) => ({
                                                    ...prevState,
                                                    password: e.target.value
                                                }))
                                            }
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label='Confirm Password'
                                        name='confirmPassword'
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Please confirm your new password!'
                                            }
                                        ]}
                                    >
                                        <Input.Password
                                            prefix={<LockOutlined />}
                                            placeholder='Confirm new password'
                                            onChange={(e) =>
                                                setFormState((prevState) => ({
                                                    ...prevState,
                                                    confirmPassword: e.target.value
                                                }))
                                            }
                                        />
                                    </Form.Item>
                                </>
                            )}

                            <Form.Item>
                                <Button
                                    type='primary'
                                    htmlType='submit'
                                    loading={isLoading}
                                    block
                                    className='forgot-password-submit-button'
                                >
                                    {formState.isEmailVerified ? 'Reset Password' : 'Submit'}
                                </Button>
                            </Form.Item>
                        </Form>
                    </Space>
                </Card>
            </div>

            <OTPModal
                isVisible={isOtpVisible}
                email={formState.email}
                handleCloseOtpModal={() => setIsOtpVisible(false)}
                onSuccess={handleOtpSuccess}
            />
        </>
    )
}

export default ForgotPassword
