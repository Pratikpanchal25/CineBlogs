/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { PostCard } from "../Components";
import { useSelector } from "react-redux";
import { getAllPostsByUser } from "../AppWrite/Apibase";
import { useNavigate } from "react-router-dom";
import { ScaleLoader } from "react-spinners";

function AllPosts() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate()
  const userStatus = useSelector((state) => state.Auth.status);
  const authToken = localStorage.getItem("authToken");

  const getPosts = async () => {
    setIsLoading(true);
    try {
      const response = await getAllPostsByUser(authToken);
      if (response) {
        setPosts(response);
      } else {
        setPosts([]);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setError("Error fetching posts.");
      console.error(error);
    }

  };

  useEffect(() => {
    if (authToken) {
      getPosts();
    } else {
      setError("User not authenticated.");
    }
  }, [authToken]);


  if (isLoading) {
    return (
      <div className="w-full flex flex-col justify-center items-center bg-gradient-to-b from-black via-[#14061F] to-black py-12">
        <div className="p-4 w-full flex flex-col justify-center items-center">
          <h1 className="text-4xl font-semibold text-white">
            "Patience, the Best Stories Are Worth the Wait."
          </h1>
          <p className="text-lg mt-2 text-gray-300">
            We’re brewing something great! Check back soon for fresh content.
          </p>
        </div>
        <div className='mt-[5rem]'>
          <ScaleLoader color="#ffffff" height={50} />
        </div>

      </div>
    );
  }

  if (posts.length === 0 && userStatus == true) {
    return (
      <div className="w-full h-full py-8 mt-4 flex justify-center items-center bg-gradient-to-b from-black via-[#14061F] to-black text-center">
        <div className="max-w-lg">
          <h1 className="text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mb-4">
            No Posts Yet
          </h1>
          <p className="text-lg text-gray-300 mb-6">
            Start sharing your thoughts with the world! Click the <span onClick={() => navigate('/add-post')} className="text-indigo-400 cursor-pointer">Add Post</span> button to get started.
          </p>
          <p className="text-sm text-gray-500">
            Whether it's your first blog or a new idea, we're excited to see what you create.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-b from-black via-[#14061F] to-black py-12">
      <div className="sm:ml-5 w-full h-full flex flex-wrap sm:justify-center sm:items-center justify-center items-center gap-3 transition-all duration-500">
        {posts?.map((post) => (
          <div
            key={post._id}
            className="p-4 sm:w-[18rem] lg:w-[20rem] xl:w-[22rem] transition-transform transform hover:scale-105 animate__animated animate__fadeIn animate__delay-1s"
          >
            <PostCard {...post} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default AllPosts;
