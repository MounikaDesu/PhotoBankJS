import Post from "../models/Post.js";

export const createPost = async (req, res) => {
    try {
        const {city, image, text} = req.body;
        if (!city || !image || !text) {
            return res.status(400).json({
                message: 'Ошибка при создании поста',
            });
        }
        const newPost = new Post({
            author: req.authenticatorData.userId,
            city: city,
            image: image,
            text: text,
            view: 0,
            likes: 0,
            timestamps: new Date()
        });
        await newPost.save();
        res.status(201).json({
            newPost,
            message: 'Успешно созданный пост',
        });
    } catch {
        res.status(400).json({message: 'Ошибка при создании поста'});
    }
};

export const deletePost = async (req, res) => {
    try {
        const {postId} = req.body;
        const post = await Post.findOne({postId});
        if (!post) {
            return res.status(404).json({
                message: 'Такого поста не существует',
            });
        }
        await Post.deleteOne(postId);
        res.status(204).json({message: 'Пост был удален'});
    } catch {
        res.status(400).json({message: 'Ошибка при удалении поста'});
    }
};