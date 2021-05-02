const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const config = require('../utils/config')

blogsRouter.get('/', async (request, response, next) => {
    const blogs = await Blog.find({}).populate('user', {username:1, name:1})
    response.json(blogs)
  })

blogsRouter.post('/', async (request, response, next) => {
  const body = request.body
  const decodedToken = jwt.verify(request.token, config.SECRET)
  if(!request.token || !decodedToken.id){
    return response.status(401).json({error:'token missing or invalid'})
  }
  const user = await User.findById(decodedToken.id)

  const blog = new Blog ({
    likes : body.likes,
    title : body.title,
    author : body.author,
    url : body.url,
    user : user._id

  })
  
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response, next) => {

    const decodedToken = jwt.verify(request.token, config.SECRET)
    if(!request.token || !decodedToken.id){
      return response.status(401).json({error:'token missing or invalid'})
    }

    const blog = await Blog.findById(request.params.id)
    if(!blog){
      return response.status(401).json({error:"blog could not be found"})
    }

    const user = await User.findById(decodedToken.id)
    if (blog.user.toString() === user.toJSON().id.toString()){
      await Blog.findByIdAndRemove(request.params.id)
      await User.updateOne({ _id: decodedToken.id }, { $pullAll: { blogs: [request.params.id] } })
      response.status(204).end()
    } 
    else {
      response.status(401).json({error:"Sorry, you can only delete your own blogs"})
    }
})

blogsRouter.put('/:id', async (request, response, next) => {
  
  const body = request.body
  const newBlog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  }
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, newBlog, {runValidators: true, new: true, context: 'query'})
    response.json(updatedBlog)

})

module.exports = blogsRouter

