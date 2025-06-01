/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Star, Sparkles, Edit3, Bot, Send, Eye, Lock, BarChart3, Hash, FileText, Clock } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import axios from "axios";
import { ScaleLoader } from "react-spinners";
import AILoader from "../Components/AILoader.jsx";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function PostForm({ post }) {
    const { register, handleSubmit, setValue, watch } = useForm({
        defaultValues: {
            title: post?.title || "",
            slug: post?.slug || "",
            content: post?.content || "",
            status: post?.status || "Public",
            rating: post?.rating || 7,
            category: post?.category || "Technology",
        },
    });

    const contentValue = watch("content");
    const userRating = watch("rating");
    const statusValue = watch("status");
    const categoryValue = watch("category");

    const [isLoading, setLoading] = useState(false);
    const [isAIContent, setAIContent] = useState(false);
    const [isAILoading, setAILoading] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);
    const [rating, setRating] = useState(3);
    const [sentiment, setSentiment] = useState("positive");

    const navigate = useNavigate();
    const movie = useSelector((state) => state.Auth.movie);
    const userData = useSelector((state) => state.Auth.userData);
    const token = localStorage.getItem("authToken");

    const wordCount = contentValue ? contentValue.trim().split(/\s+/).filter(word => word.length > 0).length : 0;
    const characterCount = contentValue ? contentValue.length : 0;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200)); // Average reading speed: 200 words per minute

    const categories = [
        "Action",
        "Adventure",
        "Animation",
        "Biography",
        "Comedy",
        "Crime",
        "Documentary",
        "Drama",
        "Family",
        "Fantasy",
        "History",
        "Horror",
        "Musical",
        "Mystery",
        "Romance",
        "Sci-Fi",
        "Sport",
        "Thriller",
        "War",
        "Western"
    ];

    useEffect(() => {
        if (!movie) navigate("/add-post");
    }, [movie, navigate]);

    useEffect(() => {
        if (post) {
            setValue("title", post?.title);
            setValue("content", post?.content);
            setValue("status", post?.status ? "Public" : "Private");
            setValue("category", post?.category || "Action");
        }
    }, [post, setValue]);

    const getAiResponse = async () => {
        setAILoading(true);
        try {
            const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_AI_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `Write a ${sentiment} review for the movie "${movie?.Title || post?.title
                }", assuming a rating of ${rating} out of 5 stars, without adding stars into content and make content simpler in min 150 words, make content beautiful with little emojis.`;
            const result = await model.generateContent(prompt);

            if (result) {
                setValue("content", result.response.text());
                setAIContent(true);
            } else {
                toast.error("Failed to get AI response...", {
                    autoClose: 1000,
                    style: {
                        backgroundColor: "#2e1065",
                        color: "#ffffff",
                    },
                    hideProgressBar: true,
                });
            }
        } catch (error) {
            console.error("Error generating AI response:", error);
            toast.error("Error occurred while getting AI response...", {
                autoClose: 1000,
                style: {
                    backgroundColor: "#2e1065",
                    color: "#ffffff",
                },
                hideProgressBar: true,
            });
        } finally {
            setAILoading(false);
            setShowAIModal(false);
        }
    };

    const improveContentWithAI = async () => {
        setAILoading(true);
        try {
            const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_AI_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `${movie?.Title || post?.title
                }, ${contentValue}, Make this content more read friendly and social media worthy, without adding stars into content and make content simpler in min 150 words, make content beautiful with little emojis.`;
            const result = await model.generateContent(prompt);

            if (result) {
                setValue("content", result.response.text());
                setAIContent(true);
            } else {
                toast.error("Failed to get AI response...", {
                    autoClose: 1000,
                    style: {
                        backgroundColor: "#2e1065",
                        color: "#ffffff",
                    },
                    hideProgressBar: true,
                });
            }
        } catch (error) {
            console.error("Error generating AI response:", error);
            toast.error("Error occurred while getting AI response...", {
                autoClose: 1000,
                style: {
                    backgroundColor: "#2e1065",
                    color: "#ffffff",
                },
                hideProgressBar: true,
            });
        } finally {
            setAILoading(false);
        }
    };

    const submit = async (data) => {
        setLoading(true);
        if (data?.content.trim() == "") {
            toast.error("Content cannot be empty. Please write something.", {
                autoClose: 2000,
                style: {
                    backgroundColor: "#2e1065",
                    color: "#ffffff",
                },
                hideProgressBar: true,
            });
            setLoading(false);
            return;
        }
        try {
            const postData = post
                ? {
                    title: data?.title,
                    content: data?.content,
                    status: data?.status === "Public",
                    rating: Number(data?.rating),
                }
                : {
                    userId: userData?._id,
                    title: movie?.Title,
                    content: data?.content,
                    status: data?.status === "Public",
                    image: movie?.Poster,
                    rating: Number(data?.rating),
                };

            let response;
            if (post) {
                response = await axios.put(
                    `${import.meta.env.VITE_REACT_APP_API_BASE_URL
                    }/api/v1/posts/update-post/${post._id}`,
                    postData,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                toast.success("Post updated successfully...", {
                    autoClose: 1000,
                    style: {
                        backgroundColor: "#2e1065",
                        color: "#ffffff",
                    },
                    hideProgressBar: true,
                });
            } else {
                response = await axios.post(
                    `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/api/v1/posts/create`,
                    postData,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                toast.success("Post created successfully...", {
                    autoClose: 1000,
                    style: {
                        backgroundColor: "#2e1065",
                        color: "#ffffff",
                    },
                    hideProgressBar: true,
                });
            }
            setLoading(false);
            navigate(`/post/${response.data.data._id}`);
        } catch (error) {
            setLoading(false);
            toast.error(
                error.response?.data?.message || "An error occurred. Please try again.",
                {
                    autoClose: 1000,
                    style: {
                        backgroundColor: "#2e1065",
                        color: "#ffffff",
                    },
                    hideProgressBar: true,
                }
            );
        }
    };

    if (isAILoading) {
        return <AILoader />;
    }

    if (isLoading) {
        return (
            <div className="w-full flex flex-col justify-center items-center bg-gradient-to-b from-black via-[#14061F] to-black py-12">
                <div className="p-4 w-full flex flex-col justify-center items-center">
                    <h1 className="text-4xl font-semibold text-white">
                        &quot;Patience, the Best Stories Are Worth the Wait.&quot;
                    </h1>
                    <p className="text-lg mt-2 text-gray-300">
                        We're brewing something great! Check back soon for fresh content.
                    </p>
                </div>
                <div className="mt-[5rem]">
                    <ScaleLoader color="#ffffff" height={50} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-[#14061F] to-black p-4 flex items-center justify-center">
            <div className="w-full max-w-7xl relative flex gap-6">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 opacity-20 overflow-hidden rounded-3xl">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
                    <div className="absolute top-20 right-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute -bottom-32 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>

                {/* Sidebar */}
                <div className="hidden lg:block w-80 relative z-10">
                    <div className="sticky top-4 space-y-6">
                        {/* Word Count Card */}
                        <div className="bg-gradient-to-br from-slate-900/80 via-purple-900/20 to-slate-900/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-white">Content Stats</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Words</span>
                                    <span className="text-cyan-400 font-semibold">{wordCount}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Characters</span>
                                    <span className="text-cyan-400 font-semibold">{characterCount}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300 flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Reading Time
                                    </span>
                                    <span className="text-cyan-400 font-semibold">{readingTime} min</span>
                                </div>

                                {/* Progress Bar for word count */}
                                <div className="mt-4">
                                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                                        <span>Progress</span>
                                        <span>{Math.min(Math.round((wordCount / 150) * 100), 100)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${Math.min((wordCount / 150) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Category Selection Card */}
                        {/* <div className="bg-gradient-to-br from-slate-900/80 via-purple-900/20 to-slate-900/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                    <Hash className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-white">Movie Category</h3>
                            </div>
                            <select
                                {...register("category", { required: true })}
                                className="w-full p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                            >
                                {categories.map((category) => (
                                    <option key={category} value={category} className="bg-slate-800 text-white">
                                        {category}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-400 mt-2">
                                Selected: <span className="text-purple-400 font-medium">{categoryValue}</span>
                            </p>
                        </div> */}
                    </div>
                </div>

                {/* Main Form */}
                <div className="flex-1 relative">
                    <form
                        onSubmit={handleSubmit(submit)}
                        className="relative z-10 bg-gradient-to-br from-slate-900/80 via-purple-900/20 to-slate-900/80 backdrop-blur-xl border border-purple-500/20 rounded-3xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-8 md:p-12">
                            {/* AI Modal */}
                            {showAIModal && (
                                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 animate-fadeIn">
                                    <div className="bg-gradient-to-br from-white to-gray-50 text-gray-900 rounded-3xl p-8 w-[90%] max-w-md shadow-2xl animate-scaleIn border border-gray-200">
                                        <div className="text-center mb-8">
                                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <Bot className="w-8 h-8 text-white" />
                                            </div>
                                            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                                                AI Content Generator
                                            </h2>
                                            <p className="text-gray-600 mt-2">Customize your AI-generated review</p>
                                        </div>

                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                                <Star className="w-5 h-5 text-yellow-500" />
                                                Rating Preference
                                            </h3>
                                            <div className="flex justify-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`w-8 h-8 cursor-pointer transition-all duration-200 hover:scale-110 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                                            }`}
                                                        onClick={() => setRating(star)}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mb-8">
                                            <h3 className="text-lg font-semibold mb-4">Sentiment Tone</h3>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[
                                                    { val: 'positive', label: 'Positive', icon: '😊', color: 'from-green-400 to-emerald-500' },
                                                    { val: 'neutral', label: 'Neutral', icon: '😐', color: 'from-gray-400 to-slate-500' },
                                                    { val: 'negative', label: 'Negative', icon: '😞', color: 'from-red-400 to-rose-500' }
                                                ].map(({ val, label, icon, color }) => (
                                                    <button
                                                        key={val}
                                                        type="button"
                                                        onClick={() => setSentiment(val)}
                                                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl font-medium transition-all duration-300 hover:scale-105 ${sentiment === val
                                                            ? `bg-gradient-to-br ${color} text-white shadow-lg transform scale-105`
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        <span className="text-2xl">{icon}</span>
                                                        <span className="text-sm">{label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setShowAIModal(false)}
                                                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all duration-200"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={getAiResponse}
                                                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                                            >
                                                Generate
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Header */}
                            <div className="text-center mb-12">
                                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-full px-6 py-2 mb-6">
                                    <Sparkles className="w-5 h-5 text-cyan-400" />
                                    <span className="text-cyan-400 font-medium">Your Take Matters</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
                                    Share Your views on{" "}
                                    <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                                        {movie?.Title || post?.title}
                                    </span>
                                </h1>
                                <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                                    Express your thoughts with the help of AI-generated insights or craft your own unique review. Let your voice be heard.
                                </p>
                            </div>
                            {/* Mobile Category Selector (visible only on mobile) */}
                            {/* <div className="lg:hidden mb-8">
                                <label className="block text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                    <Hash className="w-5 h-5 text-purple-400" />
                                    Movie Category
                                </label>
                                <select
                                    {...register("category", { required: true })}
                                    className="w-full p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                                >
                                    {categories.map((category) => (
                                        <option key={category} value={category} className="bg-slate-800 text-white">
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div> */}

                            {/* Content Section */}
                            <div className="mb-12">
                                <div className="relative">
                                    <textarea
                                        className="w-full h-60 text-[14px] p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 resize-none text-lg"
                                        placeholder="Share your thoughts about this movie... What did you love or hate about it?"
                                        {...register("content")}
                                        disabled={isAIContent}
                                    />
                                </div>

                                {/* Mobile Word Count (visible only on mobile) */}
                                <div className="lg:hidden mt-4 flex justify-between text-sm text-gray-400 bg-white/5 rounded-xl p-3">
                                    <span>Words: <span className="text-cyan-400">{wordCount}</span></span>
                                    <span>Characters: <span className="text-cyan-400">{characterCount}</span></span>
                                    <span>Reading: <span className="text-cyan-400">{readingTime} min</span></span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-4 justify-center mt-6">
                                    {contentValue ? (
                                        <button
                                            type="button"
                                            onClick={improveContentWithAI}
                                            className="group px-6 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
                                        >
                                            <Sparkles className="w-5 h-5 group-hover:animate-spin" />
                                            Enhance with AI
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setShowAIModal(true)}
                                            className="group px-6 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
                                        >
                                            <Bot className="w-5 h-5 group-hover:animate-bounce" />
                                            Generate AI Content
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => setAIContent(false)}
                                        className="px-6 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-medium hover:bg-white/20 transition-all duration-300 hover:scale-105 flex items-center gap-2"
                                    >
                                        <Edit3 className="w-5 h-5" />
                                        Edit Manually
                                    </button>
                                </div>
                            </div>

                            {/* Rating and Status Section */}
                            <div className="grid md:grid-cols-2 gap-8 mb-8">
                                {/* Rating Slider */}
                                <div className="space-y-4">
                                    <label className="block text-xl font-semibold text-white flex items-center gap-2">
                                        <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                                        Your Rating
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="range"
                                            min={1}
                                            max={10}
                                            step={1}
                                            {...register("rating", { required: true })}
                                            className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                                        />
                                        <div className="flex justify-between text-sm text-gray-400 mt-2">
                                            <span>1</span>
                                            <span className="text-cyan-400 font-bold text-lg">{userRating}/10</span>
                                            <span>10</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Selector */}
                                <div className="space-y-4">
                                    <label className="block text-xl font-semibold text-white">Privacy Setting</label>
                                    <div className="flex gap-3">
                                        {[
                                            { value: 'Public', icon: Eye, label: 'Public', desc: 'Everyone can see' },
                                            { value: 'Private', icon: Lock, label: 'Private', desc: 'Only you can see' }
                                        ].map(({ value, icon: Icon, label, desc }) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => setValue("status", value)}
                                                className={`flex-1 p-2 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${statusValue === value
                                                    ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                                                    : 'border-white/20 bg-white/10 text-gray-300 hover:border-white/40'
                                                    }`}
                                            >
                                                <Icon className="w-4 h-4 mx-auto mb-2" />
                                                <div className="text-center">
                                                    <div className="font-medium text-[13px]">{label}</div>
                                                    <div className="text-[12px] opacity-70">{desc}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-3 group"
                            >
                                <Send className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                                {post ? "Update Review" : "Publish Review"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(45deg, #06b6d4, #8b5cf6);
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);
        }
        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(45deg, #06b6d4, #8b5cf6);
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);
        }
      `}</style>
        </div>
    );
}