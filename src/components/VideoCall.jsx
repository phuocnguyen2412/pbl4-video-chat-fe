import { Button, message as MessageComponent } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { Peer } from 'peerjs';
import { useSocket } from '../hooks/useSocket';

import { useSelector } from 'react-redux';
import { authSelector } from '../redux/features/auth/authSelections';
import StreamsGrid from './VideoCall/StreamsGrid';

const VideoCall = () => {
    const { chatRoomId: currentChatRoomId } = useParams();
    const [searchParams] = useSearchParams();
    const typeCall = searchParams.get('type');

    const myVideoRef = useRef(null);

    const myStreamRef = useRef(null);
    const { socket } = useSocket();
    const peerRef = useRef(null);
    const { user: currentUser } = useSelector(authSelector);

    const [isMuted, setIsMuted] = useState(false);
    const [peerStreams, setPeerStreams] = useState([]);
    const [isVideoStopped, setIsVideoStopped] = useState(false);
    const [callStatus, setCallStatus] = useState(() => (typeCall === 'answer' ? 'connected' : 'calling')); // calling, connected, end-calling
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    useEffect(() => {
        if (peerStreams.length > 1) {
            setCallStatus('connected');
        }
    }, [peerStreams]);

    useEffect(() => {
        if (!socket) return;
        if (typeCall === 'calling') {
            console.log('calling');
            console.log(socket);
            socket.emit('caller:start_new_call', { chatRoomId: currentChatRoomId });
            return;
        }

        if (typeCall === 'answer') {
            console.log('answer');
            socket.emit('callee:accept_call', { chatRoomId: currentChatRoomId, peerId: peerRef.current?.id });
            return;
        }
    }, [currentChatRoomId, socket, typeCall]);

    console.log(peerStreams);

    const addVideoStream = useCallback(({ peerId, stream, user }) => {
        setPeerStreams((prevPeerStreams) => {
            // Check if the peerId already exists in the current state
            if (prevPeerStreams.some((ps) => ps.user._id === user._id)) {
                return prevPeerStreams; // Return the current state if the peerId exists
            }

            // Add the new peerId and stream to the array
            return [...prevPeerStreams, { peerId, stream, user }];
        });
    }, []);

    const updatePeerStreams = useCallback(() => {
        const connections = peerRef.current?.connections || {};
        const currentStream = myStreamRef.current;

        for (let peerId in connections) {
            connections[peerId].forEach((connection) => {
                const sender = connection.peerConnection.getSenders().find((s) => s.track.kind === 'video');
                if (sender) {
                    sender.replaceTrack(currentStream.getVideoTracks()[0]);
                }
            });
        }

        // Cập nhật lại danh sách `peerStreams` để đảm bảo UI đồng bộ
        setPeerStreams((prevPeerStreams) =>
            prevPeerStreams.map((peerStream) => ({
                ...peerStream,
                stream: peerStream.peerId === peerRef.current.id ? currentStream : peerStream.stream
            }))
        );
    }, []);

    const stopScreenShare = useCallback(async () => {
        try {
            const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

            // Cập nhật stream local
            myStreamRef.current?.getTracks().forEach((track) => track.stop());
            myStreamRef.current = cameraStream;

            if (myVideoRef.current) {
                myVideoRef.current.srcObject = cameraStream;
                myVideoRef.current.play();
            }

            updatePeerStreams();
            setIsScreenSharing(false);
        } catch (err) {
            console.error('Error switching back to camera:', err);
        }
    }, [updatePeerStreams]);

    const toggleScreenShare = useCallback(async () => {
        if (!isScreenSharing) {
            try {
                // Bắt đầu chia sẻ màn hình
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });

                // Gắn màn hình vào video local
                const videoTrack = screenStream.getVideoTracks()[0];
                videoTrack.onended = () => {
                    // Khi dừng chia sẻ màn hình, trở về camera
                    stopScreenShare();
                };

                // Cập nhật trạng thái
                myStreamRef.current?.getVideoTracks().forEach((track) => track.stop());
                myStreamRef.current = screenStream;

                if (myVideoRef.current) {
                    myVideoRef.current.srcObject = screenStream;
                    myVideoRef.current.play();
                }
                updatePeerStreams();

                setIsScreenSharing(true);
            } catch (err) {
                console.error('Error sharing screen:', err);
            }
        } else {
            stopScreenShare();
        }
    }, [isScreenSharing, stopScreenShare]);

    const removePeer = useCallback((userId) => {
        setPeerStreams((prevPeerStreams) => prevPeerStreams.filter((ps) => ps.user._id !== userId)); // Remove peer by peerId
    }, []);

    const connectToNewUser = useCallback(
        (peerId, stream, user) => {
            if (!peerRef.current) return;
            console.log(`Connecting to ${user.name} (${peerId})`);

            const call = peerRef.current.call(peerId, stream, { metadata: { user: currentUser } });

            if (!call) return;

            call.on('stream', (remoteStream) => {
                console.log(`Received stream from ${user.name}`);
                addVideoStream({ peerId, stream: remoteStream, user });
            });

            call.on('close', () => {
                console.log(`Call with ${user.name} closed`);
                removePeer(user._id);
            });
        },
        [addVideoStream, currentUser, removePeer]
    );

    const leaveCall = useCallback(() => {
        myStreamRef.current?.getTracks().forEach((track) => track.stop());
        socket.emit('user:leave_call');
        window.close();
        // Destroy the peer connection
        peerRef.current?.destroy();
    }, [socket]);

    const toggleVideo = useCallback(() => {
        const videoTrack = myStreamRef.current?.getVideoTracks()?.[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoStopped(!videoTrack.enabled);
        }
    }, []);

    const toggleMute = useCallback(() => {
        const audioTrack = myStreamRef.current?.getAudioTracks()?.[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            setIsMuted(!audioTrack.enabled);
        }
    }, []);

    const joinRoom = useCallback(
        (peerId) => {
            console.log('Joining room');
            socket?.emit('user:join-room', { roomId: currentChatRoomId, peerId, user: currentUser });
        },
        [currentChatRoomId, currentUser, socket]
    );

    useEffect(() => {
        const handleUserConnected = ({ peerId, user }) => {
            console.log(`${user.name} connected with Peer ID: ${peerId}`);
            connectToNewUser(peerId, myStreamRef.current, user); // Gửi stream của bạn đến người mới
        };

        const handleUserDisconnected = ({ userId }) => {
            console.log(`User ${userId} disconnected`);
            removePeer(userId); // Loại bỏ peer khi người dùng rời khỏi
        };

        socket?.on('user-connected', handleUserConnected);
        socket?.on('user:leave_call', handleUserDisconnected);

        return () => {
            socket?.off('user-connected', handleUserConnected);
            socket?.off('user:leave_call', handleUserDisconnected);
        };
    }, [connectToNewUser, removePeer, socket]);

    useEffect(() => {
        (async () => {
            try {
                if (!socket || !currentUser) return;
                const myStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (myStream.getAudioTracks().length === 0) {
                    console.error('No audio track found in stream.');
                    MessageComponent.error('Không có micro khả dụng. Vui lòng kiểm tra thiết bị.');
                }
                myStreamRef.current = myStream;

                if (myVideoRef.current) {
                    myVideoRef.current.srcObject = myStream;
                    myVideoRef.current.play();
                }

                // Initialize PeerJS
                peerRef.current = new Peer();

                // When PeerJS connection is opened
                peerRef.current.on('open', (peerId) => {
                    console.log('My Peer ID:', peerId);
                    joinRoom(peerId);
                    addVideoStream({ peerId, stream: myStream, user: currentUser });
                });

                // Handle incoming calls
                peerRef.current.on('call', (call) => {
                    console.log('Call received with metadata:', call.metadata);
                    const { user } = call.metadata;
                    call.answer(myStreamRef.current); // Answer the call with current user's stream
                    call.on('stream', (remoteStream) => {
                        addVideoStream({ peerId: call.peer, stream: remoteStream, user });
                    });
                });
            } catch (error) {
                console.error('Failed to access mic:', error);
                MessageComponent.error('Không thể truy cập micro. Vui lòng kiểm tra quyền hoặc kết nối thiết bị.');
            }
        })();

        // Cleanup on unmount
        return () => {
            peerRef.current?.destroy();
        };
    }, [addVideoStream, currentUser, joinRoom, socket]);

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            leaveCall();
            // Ngăn trình duyệt đóng tab ngay lập tức
            event.preventDefault();
            event.returnValue = ''; // Cách làm cũ để hiển thị thông báo rời trang
        };

        // Lắng nghe sự kiện beforeunload
        window.addEventListener('beforeunload', handleBeforeUnload);

        // Cleanup listener khi component unmount
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [leaveCall]);

    return (
        <div>
            <>
                {callStatus === 'calling' && <audio src='/sounds/calling-state.mp3' loop autoPlay />}
                {callStatus === 'end-calling' && <audio src='/sounds/end-calling-state.mp3' autoPlay />}

                <div className='flex h-lvh flex-col justify-between overflow-auto bg-black-default px-10 pt-10'>
                    <StreamsGrid peerStreams={peerStreams} />
                    {callStatus !== 'end-calling' && (
                        <div className='flex items-center justify-center gap-4 p-10'>
                            <Button onClick={toggleMute}>{isMuted ? 'Unmute' : 'Mute'}</Button>
                            <Button onClick={toggleVideo}>{isVideoStopped ? 'Start Video' : 'Stop Video'}</Button>
                            <Button onClick={toggleScreenShare}>
                                {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
                            </Button>
                            <Button onClick={leaveCall}>Leave Call</Button>
                        </div>
                    )}

                    {callStatus === 'end-calling' && (
                        <>
                            <div>Đã kết thúc cuộc gọi</div>
                            <div className='flex items-center justify-center gap-4 p-10'>
                                <Button onClick={leaveCall}>Thoát</Button>
                                <Button onClick={() => window.location.reload()}>Gọi lại</Button>
                            </div>
                        </>
                    )}
                </div>
            </>
        </div>
    );
};

VideoCall.propTypes = {};

export default VideoCall;
