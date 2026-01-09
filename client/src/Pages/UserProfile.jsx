/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { ScaleLoader } from 'react-spinners';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { IconButton } from "@mui/material";
import { CameraAlt as CameraAltIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { createFollow, getAllPostsByUser, getUserData, updateUserProfile } from '../AppWrite/Apibase';
import { Login } from "../Store/AuthSlice.js";
import BackButton from '../Components/BackButton.jsx';

export default function UserProfile() {
    const [userData, setUser] = useState(null);
    const { userId } = useParams();
    const authToken = localStorage.getItem('authToken');
    const [isLoading, setLoading] = useState(true);
    const [isAuthor, setIsAuthor] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [bio, setBio] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [posts, setPosts] = useState([]);
    const [postsLoader, setPostsLoader] = useState(false);
    const dispatch = useDispatch();
    const appUser = useSelector((state) => state.Auth.userData);

    // Debounce user data fetching
    useEffect(() => {
        if (appUser) {
            const timer = setTimeout(() => {
                getUser();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [userId, appUser, isFollowing, isClicked]);

    const getUser = async () => {
        if (!appUser) return;
        try {
            const data = await getUserData(userId, authToken);
            setUser(data.data);
            setBio(data.data?.bio || '');
            setUsername(data.data?.username || '');
            setEmail(data.data?.email || '');
            setIsFollowing(data.data?.is_following || false);
            setIsAuthor(data.data?._id === appUser?._id);
            setLoading(false);

            // ✅ Now fetch posts after user data is ready
            const postsResponse = await getAllPostsByUser(authToken, data.data._id);
            setPosts(postsResponse || []);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };


    const handleFollow = async () => {
        try {
            setIsFollowing((prev) => !prev);
            setUser((prevUserData) => {
                if (isFollowing) {
                    const newFollowerCount = prevUserData.followers - 1;
                    return { ...prevUserData, followers: newFollowerCount };
                } else {
                    const newFollowerCount = prevUserData.followers + 1;
                    return { ...prevUserData, followers: newFollowerCount };
                }
            });

            await createFollow(userId, authToken);
        } catch (error) {
            setIsFollowing((prev) => !prev);
            setUser((prevUserData) => {
                const revertedFollowerCount = prevUserData.followers.length - 1;
                return { ...prevUserData, followers: revertedFollowerCount };
            });
            toast.error("Error updating follow status.");
        }
    };

    const handleEdit = useCallback(async () => {
        if (isEdit) {
            setLoading(true);
            const formData = new FormData();
            formData.append('bio', bio);
            formData.append('username', username);
            formData.append('email', email);
            if (selectedImage) {
                formData.append('profileImage', selectedImage);
            }

            try {
                const response = await updateUserProfile(formData, authToken);
                setUser(response.data);
                if (isAuthor) {
                    dispatch(Login({ user: response.data, token: authToken }));
                }
                toast.success("Profile updated successfully!", {
                    autoClose: 1000,
                    style: {
                        backgroundColor: "#2e1065",
                        color: "#ffffff",
                    },
                    hideProgressBar: true,
                });
            } catch (error) {
                toast.error("Error updating profile!", {
                    autoClose: 1000,
                    style: {
                        backgroundColor: "#2e1065",
                        color: "#ffffff",
                    },
                    hideProgressBar: true,
                });
            } finally {
                setLoading(false);
            }
        }
        setIsEdit(!isEdit);
    }, [isEdit, bio, username, email, selectedImage, authToken, dispatch, isAuthor]);

    const handleFileChange = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
        }
    }, []);

    if (isLoading) {
        return (
            <div className="w-full flex flex-col justify-center items-center bg-gradient-to-b from-black via-[#14061F] to-black py-12">
                <div className='mt-[5rem]'>
                    <ScaleLoader color="#ffffff" height={50} />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-black min-h-screen text-white">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800 md:hidden">
                <BackButton />
                <h1 className="text-xl font-semibold mr-auto ml-10">{userData?.username}</h1>
            </div>

            {/* Desktop Header */}

            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className='hidden md:flex justify-between'>
                    <BackButton />
                    <div className="flex items-center gap-4">
                        {isAuthor && (
                            <Link to={`/dashboard/settings/${userData?._id}`}>
                                <IconButton sx={{ color: 'white' }}>
                                    <SettingsIcon />
                                </IconButton>
                            </Link>
                        )}
                    </div>
                </div>
                {/* Profile Header */}
                <div className="flex md:flex-row gap-8 mb-8">
                    {/* Profile Picture */}
                    <div className="flex justify-center md:justify-start">
                        <div className="flex pt-3 md:pt-0">
                            <div className="w-20 h-20 md:w-36 md:h-36 rounded-full overflow-hidden border-2 border-gray-300">
                                <img
                                    src={selectedImage ? URL.createObjectURL(selectedImage) : userData?.profileImage || '/default-avatar.png'}
                                    alt={userData?.username}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {isEdit && (
                                <IconButton
                                    sx={{
                                        position: 'absolute',
                                        bottom: -8,
                                        right: -8,
                                        color: 'white',
                                        bgcolor: '#262626',
                                        width: 32,
                                        height: 32,
                                        ':hover': { bgcolor: '#363636' },
                                    }}
                                    component="label"
                                >
                                    <CameraAltIcon fontSize="small" />
                                    <input type="file" hidden onChange={handleFileChange} />
                                </IconButton>
                            )}
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1">
                        {/* Username and Action Buttons */}
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                            <div className="flex items-center gap-4">
                                {isEdit ? (
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="bg-transparent border-b border-gray-600 text-xl font-light focus:outline-none focus:border-white"
                                    />
                                ) : (
                                    <h1 className="text-xl md:text-2xl font-light">{userData?.username}</h1>
                                )}
                            </div>

                            <div className="flex gap-2">
                                {isAuthor ? (
                                    <>
                                        {isEdit ? (
                                            <button
                                                onClick={handleEdit}
                                                className="px-4 py-1.5 bg-gradient-to-br from-[#ff4d94] to-[#8f44fd] text-white text-sm font-medium rounded-md hover:bg-blue-600 transition-colors"
                                            >
                                                Save
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setIsEdit(true)}
                                                className="px-4 py-1.5 bg-transparent border border-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
                                            >
                                                Edit profile
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleFollow}
                                            className={`px-6 py-1.5 text-sm font-medium rounded-md transition-colors ${isFollowing
                                                ? 'bg-transparent border border-gray-600 text-white hover:bg-gray-800'
                                                : 'bg-gradient-to-br from-[#ff4d94] to-[#8f44fd] text-white hover:bg-blue-600'
                                                }`}
                                        >
                                            {isFollowing ? 'Following' : 'Follow'}
                                        </button>
                                        <Link to={`/conversations/${userData?._id}`}>
                                            <button className="px-4 py-1.5 bg-gradient-to-br from-[#ff4d94] to-[#8f44fd] border border-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors">
                                                Message
                                            </button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-8 mb-4">
                            <div className="text-center md:text-left">
                                <span className="font-semibold">{posts?.length || 0}</span>
                                <span className="text-gray-400 ml-2">posts</span>
                            </div>
                            <Link to={`/followers/${userData?._id}`} className="hover:text-gray-300">
                                <div className="text-center md:text-left">
                                    <span className="font-semibold">{userData?.followers || 0}</span>
                                    <span className="text-gray-400 ml-2">followers</span>
                                </div>
                            </Link>
                            <div className="text-center md:text-left">
                                {/* <span className="font-semibold">{userData?.following || 0}</span>    */}
                                {/* <span className="text-gray-400 ml-2">following</span> */}
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="text-sm">
                            {isEdit ? (
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    className="bg-transparent border border-gray-600 rounded p-2 w-full resize-none focus:outline-none focus:border-white"
                                    rows="3"
                                    placeholder="Write a bio..."
                                />
                            ) : (
                                <div className="text-gray-300 whitespace-pre-wrap">
                                    {userData?.bio || 'No bio yet.'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Posts Grid */}
                <div className="mt-1">
                    {!postsLoader ? (
                        <>
                            {posts.length > 0 ? (
                                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-2">
                                    {posts.map((post) => (
                                        <Link to={`/post/${post._id}`} key={post._id} className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
                                            <div className="h-full bg-neutral-900">
                                                <img
                                                    src={post.image}
                                                    alt="Post"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                {/* Optional overlay like Instagram */}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white font-medium text-sm">
                                                    View Post
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                !postsLoader ?
                                    <div className="flex flex-col items-center py-16">
                                        <div className="w-16 h-16 border-2 border-gray-600 rounded-full flex items-center justify-center mb-6">
                                            <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-light mb-2">No Posts Yet</h3>
                                        <p className="text-gray-400 text-sm">When you share posts, they will appear on your profile.</p>
                                    </div> : null
                            )}
                        </>
                    ) : <div className="w-full flex flex-col justify-center items-center py-12">
                        <div className='mt-[5rem]'>
                            <ScaleLoader color="#ffffff" height={50} />
                        </div>
                    </div>}
                </div>
            </div>
        </div>
    );
}