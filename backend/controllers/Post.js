import User from "../models/User.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import Reply from "../models/Reply.js";
import Vote from "../models/Vote.js";
import Save from "../models/Save.js";


function hotScore(upvotes, downvotes, time) {
    const diff = upvotes - downvotes;
    
    // Sign of the score
    const sig = Math.sign(diff);

    const order = Math.log10(Math.max(Math.abs(diff), 1));
    
    // Calculate seconds since the Unix epoch 1/1/1970
    const seconds = Math.floor((time / 1000) - 1134028003);
    
    // Calculate hotness score
    const score = order + ((sig * seconds) / 45000);
    
    return score;
}


export const hot = async (req, res) => {
    try{
        const posts = await Post.find().sort({score:-1}).limit(10);

        res.status(201).json(posts);

    } catch (error){
        console.log("Error : ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const newsort = async (req, res) => {
    try{
        const posts = await Post.find().sort({createdAt:-1}).limit(10);

        res.status(201).json(posts);

    } catch (error){
        console.log("Error : ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const top = async (req, res) => {
    try{
        const posts = await Post.find().sort({upvotes:-1}).limit(10);

        res.status(201).json(posts);

    } catch (error){
        console.log("Error : ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}


export const create = async (req,res) => {
    try{
        const {username, title, body } = req.body;
        if(!title){
            return res.status(400).json({ error: "Title cannot be empty!" });
        }

        const user = await User.findOne({_id:username});
        if(!user){
            return res.status(400).json({ error: "User does not exist." });
        }
        const date = new Date();
        const score = hotScore(60, 40, date.getTime());

        const post = await Post.create({
            username,
            title,
            body,
            score,
        });

        res.status(201).json({
            username: username,
            title: title,
            body: body,
            score: score
        });


    } catch (error){
        console.log("Error in signup controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
    }
}

export const deletepost = async (req, res) => {
    try{
        const id = req.params.id;
        const user = req.userid;        // id of username
        const post = await Post.deleteOne({_id: id, username:user});
        if(!post){
            return res.status(400).json({ error: "Post doesn't exist." });
        }

        await Comment.deleteMany({post: id});
        await Reply.deleteMany({post: id});

        res.status(200).json({
            success:true,
            message:"Post deleted successfully."
        });

    }catch (error){
        console.log("Error in post controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const getpost = async (req, res) => {
    try{
        const id = req.params.id;
        const post = await Post.findOne({_id: id}).populate("username", "username").exec();
        if(!post){
            return res.status(400).json({ error: "Post doesn't exist." });
        }

        const comment = await Comment.find({post: id}).populate("username", "username");

        const data = {
            post: post,
            comment: comment
        };

        res.status(201).json(data);

    }catch (error){
        console.log("Error in post controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
    }
}


export const comment = async (req, res) => {
    try{
        const id = req.params.id;
        const userid = req.userid;
        const {text} = req.body;
        const post = await Post.findOne({_id: id});
        if(!post){
            return res.status(400).json({ error: "Post doesn't exist." });
        }

        const user = await User.findOne({_id: userid});
        if(!user){
            return res.status(400).json({ error: "User does not exist." });
        }

        const comment = await Comment.create({
            post: id,
            username: username,
            text: text,
        });

        res.status(201).json(comment);

    }catch (error){
        console.log("Error in signup controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
    }
}

export const deletecomment = async (req, res) => {
    try{
        const postid = req.params.id1;
        const commentid = req.params.id2;
        const userid = req.userid;
        const comment = await Comment.findOne({_id: commentid, post: postid, username: userid});
        if(!comment){
            return res.status(400).json({ error: "Comment doesn't exist." });
        }

        res.status(201).json({
            success:true,
            message:"Comment deleted successfully."
        });

    }catch (error){
        console.log("Error in deleting comment", error.message);
		res.status(500).json({ error: "Internal Server Error" });
    }
}

export const castvote = async (req, res) => {
    try{
        const postid = req.params.id;
        const userid = req.userid;
        const {vote} = req.body;
        const user = await User.findOne({_id: userid});
        if(!user){
            return res.status(400).json({ error: "User does not exist." });
        }
        const post = await Post.findOne({_id: postid});
        if(!post){
            return res.status(400).json({ error: "Post doesn't exist." });
        }


        const alreadyvoted = await Vote.find({username: userid, post: postid});

        if(alreadyvoted){
            if(alreadyvoted.vote === 1){
                post.upvotes -= 1;
            }else if(alreadyvoted.vote === -1){
                post.downvotes -= 1;
            }
            alreadyvoted.vote = vote;
            if(vote === 1){
                post.upvotes += 1;
            }else if(vote === -1){
                post.downvotes += 1;
            }
            await alreadyvoted.save();                           /// 

            post.score = hotScore(post.upvotes, post.downvotes, post.createdAt.getTime());
            await post.save();
            res.status(201).json(alreadyvoted);
        }


        const newvote = await Vote.create({
            post: postid,
            username: userid,
            vote: vote,
        });

        if(vote === 1){
            post.upvotes += 1;
        }else if(vote === -1){
            post.downvotes += 1;
        }

        post.score = hotScore(post.upvotes, post.downvotes, post.createdAt.getTime());

        await post.save();

        res.status(201).json(newvote);

    }catch (error){
        console.log("Error in signup controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
    }
}


export const deletevote = async (req, res) => {
    try{
        const postid = req.params.id;
        const userid = req.userid;
        const {vote} = req.body;
        const user = await User.findOne({_id: userid});
        if(!user){
            return res.status(400).json({ error: "User does not exist." });
        }
        const post = await Post.findOne({_id: postid});
        if(!post){
            return res.status(400).json({ error: "Post doesn't exist." });
        }
        const alreadyvoted = await Vote.find({username: userid, post: postid});
        if(!alreadyvoted){
            return res.status(400).json({ error: "Vote doesn't exist." });
        }

        if(vote === 1){
            post.upvotes -= 1;
        }else if(vote === -1){
            post.downvotes -= 1;
        }

        post.score = hotScore(post.upvotes, post.downvotes, post.createdAt.getTime());

        await post.save();

        res.status(201).json({
            success:true,
            message:"Vote deleted successfully."
        });

    }catch (error){
        console.log("Error in signup controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
    }
}


export const createreply = async (req, res) => {
    try{
        const postid = req.params.id1;
        const commentid = req.params.id2;
        const userid = req.userid;
        const {text} = req.body;
        const post = await Post.findOne({_id: postid});
        if(!post){
            return res.status(400).json({ error: "Post doesn't exist." });
        }

        const comment = await Comment.findOne({_id: commentid});
        if(!comment){
            return res.status(400).json({ error: "Comment does not exist." });
        }

        const reply = await Reply.create({
            post: postid,
            comment: commentid,
            username: userid,
            text: text,
        });

        res.status(201).json(reply);

    }catch (error){
        console.log("Error in signup controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
    }
}


export const deletereply = async (req, res) => {
    try{
        const postid = req.params.id1;
        const commentid = req.params.id2;
        const replyid = req.params.id3;
        const userid = req.userid;
        const {text} = req.body;
        const post = await Post.findOne({_id: postid});
        if(!post){
            return res.status(400).json({ error: "Post doesn't exist." });
        }

        const comment = await Comment.findOne({_id: commentid});
        if(!comment){
            return res.status(400).json({ error: "Comment does not exist." });
        }

        const reply = await Reply.deleteOne({_id: replyid, post: postid, comment: commentid, username: userid});

        if(!reply){
            return res.status(400).json({ error: "Reply does not exist." });
        }

        res.status(201).json({
            success:true,
            message:"Reply deleted successfully."
        });

    }catch (error){
        console.log("Error in signup controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
    }
}


export const savepost = async (req, res) => {
    try{
        const postid = req.params.id;
        const userid = req.userid;
        const post = await Post.findOne({_id: postid});
        if(!post){
            return res.status(400).json({ error: "Post doesn't exist." });
        }

        const save = await Save.create({
            username: userid, 
            post: postid
        });

        res.status(201).json(save);

    }catch (error){
        console.log("Error : ", error.message);
		res.status(500).json({ error: "Internal Server Error" });
    }
}


export const deletesavepost = async (req, res) => {
    try{
        const postid = req.params.id;
        const userid = req.userid;
        const post = await Post.findOne({_id: postid});
        if(!post){
            return res.status(400).json({ error: "Post doesn't exist." });
        }

        const save = await Save.deleteOne({username: userid, post: postid});

        if(!save){
            return res.status(400).json({ error: "Post is not saved." });
        }

        res.status(201).json(save);

    }catch (error){
        console.log("Error : ", error.message);
		res.status(500).json({ error: "Internal Server Error" });
    }
}