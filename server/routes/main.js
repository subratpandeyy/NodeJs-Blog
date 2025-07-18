const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Contact = require('../models/Contact');

// ------------------
// EJS ROUTES
// ------------------

// Home Page
router.get('', async (req, res) => {
    try {
        const locals = {
            title: 'Nodejs Blog',
            description: 'Simple Blog created with nodejs, expressjs and mongodb'
        }

        let perPage = 10;
        let page = req.query.page || 1;

        const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec();

        const count = await Post.countDocuments();
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);

        res.render('index', {
            locals,
            data,
            current: page,
            nextPage: hasNextPage ? nextPage : null,
            currentRoute: '/'
        });
    } catch (error) {
        console.log(error);
    }
});

// View a single post
router.get('/post/:id', async (req, res) => {
    try {
        let slug = req.params.id;

        const data = await Post.findById({ _id: slug });

        const locals = {
            title: data.title,
            description: "Simple Blog created with Nodejs, Express & MongoDB."
        }

        res.render('post', {
            locals,
            data,
            currentRoute: `/post/${slug}`
        });
    } catch (error) {
        console.log(error);
    }
});

// Search route
router.post('/search', async (req, res) => {
    try {
        const locals = {
            title: "Search",
            description: "Simple Blog created with Nodejs, Express & MongoDB."
        }

        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "");

        const data = await Post.find({
            $or: [
                { title: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
                { body: { $regex: new RegExp(searchNoSpecialChar, 'i') } }
            ]
        });

        res.render("search", {
            locals,
            data,
            currentRoute: '/'
        });
    } catch (error) {
        console.log(error);
    }
});

// Static pages
router.get('/about', (req, res) => {
    res.render('about', {
        currentRoute: '/about'
    });
});

router.get('/contact', (req, res) => {
    res.render('contact', {
        currentRoute: '/contact'
    });
});

// ------------------
// API ROUTES (JSON)
// ------------------

// Get paginated posts as JSON
router.get('/api/posts', async (req, res) => {
    try {
        let perPage = 10;
        let page = parseInt(req.query.page) || 1;

        const posts = await Post.aggregate([{ $sort: { createdAt: -1 } }])
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec();

        const count = await Post.countDocuments();
        const hasNextPage = (page + 1) <= Math.ceil(count / perPage);

        res.json({
            posts,
            pagination: {
                currentPage: page,
                nextPage: hasNextPage ? page + 1 : null,
                totalPosts: count
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// Get a single post by ID
router.get('/api/posts/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        res.json(post);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch post' });
    }
});

// Search API
router.post('/api/search', async (req, res) => {
    try {
        let searchTerm = req.body.searchTerm || '';
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "");

        const data = await Post.find({
            $or: [
                { title: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
                { body: { $regex: new RegExp(searchNoSpecialChar, 'i') } }
            ]
        });

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Search failed' });
    }
});

// contact page

router.post('/contact', async (req,res) => {
    try {
        try{
            const contact_data = new Contact({
                name: req.body.name,
                email: req.body.email,
                message: req.body.message
            })
            await Contact.create(contact_data);
            res.redirect('/contact');

        }
        catch(error) {
            console.log(error);
        }
        res.redirect('/contact');
    }
    catch(error) {
        console.log(error);
    }
});

module.exports = router;
