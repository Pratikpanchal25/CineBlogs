import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, RTE, Select } from "./index";
import postServices from "../AppWrite/CreatePost";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";


export default function PostForm({ post }) {
    const { register, handleSubmit, watch, setValue, control, getValues } = useForm({
        defaultValues: {
            title: post?.title || "",
            slug: post?.$id || "",
            content: post?.content || "",
            status: post?.status || "active",
        },
    });

    const navigate = useNavigate();
    const userData = useSelector((state) => state.Auth.userData);
    console.log(userData);

    const submit = async (data) => {
        if (post) {
            const file = data.image[0] ? await postServices.uploadFile(data.image[0]) : null;

            if (file) {
                postServices.deleteFile(post.featuredImage);
            }

            const dbPost = await postServices.updatePost(post.$id, {
                ...data,
                featuredImage: file ? file.$id : undefined,
            });

            if (dbPost) {
                
                navigate(`/post/${dbPost.$id}`)
                
            }
        } else {
            const file = await postServices.uploadFile(data.image[0]);

            if (file) {
                const fileId = file.$id;
                data.featuredImage = fileId;
                const dbPost = await postServices.createPost({ ...data ,  userId: userData.$id}   );

                if (dbPost) {
                    navigate(`/post/${dbPost.$id}`)
                   
                }
            }
        }
    };

    const slugTransform = useCallback((value) => {
        if (value && typeof value === "string")
            return value
                .trim()
                .toLowerCase()
                .replace(/[^a-zA-Z\d\s]+/g, "-")
                .replace(/\s/g, "-");

        return "";
    }, []);

    React.useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === "title") {
                setValue("slug", slugTransform(value.title), { shouldValidate: true });
            }
        });

        return () => subscription.unsubscribe();
    }, [watch, slugTransform, setValue]);

    return (
        <form onSubmit={handleSubmit(submit)} className="flex text-white flex-wrap ">
        <div className="w-full md:w-2/3 px-4 md:px-10 justify-center flex-col items-center mb-4 md:mb-0">
            <Input
                label="Movie Title :"
                placeholder="Title"
                className="mb-4 pl-2 rounded-[5px] text-black w-full"
                {...register("title", { required: true })}
            />
            <RTE label="Content :" name="content" control={control} defaultValue={getValues("content")} />
        </div>
        <div className="w-full md:w-1/3 px-4">
            <Input
                label="Featured Image :"
                type="file"
                className="mb-4 rounded italic w-full"
                accept="image/png, image/jpg, image/jpeg, image/gif"
                {...register("image", { required: post })}
            />
            {post && (
                <div className="w-full mb-4">
                    <img src={postServices.getImage(post.featuredImage)} alt={post.title} className="rounded-lg" />
                </div>
            )}
            <Select
                options={["Active", "Inactive"]}
                label="Status"
                className="mb-4 w-full"
                {...register("status", { required: true })}
            />
            <Button type="submit" bgColor={post ? "bg-green-500" : undefined} className="w-full">
                {post ? "Update" : "Submit"}
            </Button>
        </div>
    </form>
    );
}