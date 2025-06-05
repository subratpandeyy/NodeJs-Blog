const express = require('express');
const router = express.Router();
const Post  = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;


const authMiddleware = (req,res,next) => {
    const token = req.cookies.token;

    if(!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    }
    catch(error) {
        res.status(401).json({ message: 'Unauthorized' });
    }
}


router.get('/admin', async (req,res) => {
    try {
        const locals = {
            title: 'Admin',
            description: 'Simple Blog created with nodejs, expressjs and mongodb'
        }

        res.render('admin/index',{ locals, layout: adminLayout });
    }
    catch(error) {
        console.log(error);
    }
});

// Post login
router.post('/login', async (req,res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if(!user) {
            return res.status(401).json({ message: 'Invalid Credentials' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid Credentials' });
        }

        const token = jwt.sign({ userId: user._id }, jwtSecret);
        res.cookie('token', token, { httpOnly: true });

        res.redirect('/dashboard');
    }
    catch(error) {
        console.log(error);
    }
});

// admin dashboard
router.get('/dashboard', authMiddleware, async (req,res) => {
    try {
        const locals = {
            title: 'Dashboard',
            description: 'Simple Blog created with nodejs, expressjs and mongodb'
        }

        const data = await Post.find();
        res.render('admin/dashboard', {
            locals,
            data,
            layout: adminLayout
        });
    }
    catch(error) {
        console.log(error);
    }

});

// create post

router.get('/add-post', authMiddleware, async (req,res) => {
    try {
        const locals = {
            title: 'Add Post',
            description: 'Simple Blog created with nodejs, expressjs and mongodb'
        }

        const data = await Post.find();
        res.render('admin/add-post', {
            locals,
            layout: adminLayout
        });
    }
    catch(error) {
        console.log(error);
    }
});

// post save post  data

router.post('/add-post', authMiddleware, async (req,res) => {
    try {
        try{
            const newPost = new Post({
                title: req.body.title,
                body: req.body.body
            })
            await Post.create(newPost);
            res.redirect('/dashboard');
        }
        catch(error) {
            console.log(error);
        }
        res.redirect('/dashboard');
    }
    catch(error) {
        console.log(error);
    }
});


// get edit page
router.get('/edit-post/:id', authMiddleware, async (req,res) => {
    try {
        const locals = {
            title: 'Edit Post',
            description: 'Simple Blog created with nodejs, expressjs and mongodb'
        }
        const data = await Post.findOne({ _id: req.params.id });

        res.render('admin/edit-post', {
            locals, 
            data,
            layout: adminLayout
        })
    }
    catch(error) {
        console.log(error);
    }
});

// put edit page
router.put('/edit-post/:id', authMiddleware, async (req,res) => {
    try {
        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now()
        })

        res.redirect(`/edit-post/${req.params.id}`);
    }
    catch(error) {
        console.log(error);
    }
});

// Delete Admin post
router.delete('/delete-post/:id', authMiddleware, async (req,res) => {
    try {
        await Post.deleteOne({ _id: req.params.id });
        res.redirect('/dashboard');
    }
    catch(error) {
        console.log(error);
    }
})

// logout
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
})

// Post register
router.post('/register', async (req,res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        try{
            const user = await User.create({ username, password: hashedPassword });
            res.status(201).json({ message: 'user Created', user });
        }
        catch(error) {
            if(error.code === 11000) {
                res.status(409).json({ message: 'User Already in use' });
            }
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    catch(error) {
        console.log(error);
    }
});

module.exports = router;