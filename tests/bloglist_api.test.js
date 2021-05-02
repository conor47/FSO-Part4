const { TestScheduler } = require('@jest/core')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require ('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const initialBlogs = [
    {
        title: "blog 1",
        author: "conor",
        url: "test url",
        likes: 100,
        id: "608b47b08c0c7f21ad94efbc"
    },
    {
        title: "blog 2",
        author: "conor",
        url: "test url",
        likes: 100,
        id: "608b515fdf0e3225bf87b6c0"
    }
]

beforeEach(async () => {
    await Blog.deleteMany({})
    let blogObject = new Blog(initialBlogs[0])
    await blogObject.save()
    blogObject = new Blog(initialBlogs[1])
    await blogObject.save()

})

describe("we have some test blogs", () => {

    test('blogs are returned as JSON', async () => {
        await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })
    
    test ('there are two notes', async () => {
        const response  = await api.get('/api/blogs')
    
        expect(response.body).toHaveLength(initialBlogs.length)
    })
    
    test ('the first blog is titled blog 1', async () => {
        const response  = await api.get('/api/blogs')
    
        expect(response.body[0].title).toBe(initialBlogs[0].title)
    })
    
    test('id field is a string', async () => {
        const response  = await api.get('/api/blogs')
    
        expect(response.body[0].id).toBeDefined()
        expect(response.body[0]._id).not.toBeDefined()
    })
})

describe ('adding a blog', () => {

    test('a new blog can be added', async () => {

        const newBlog = {
            title : 'test blog',
            author : 'test author',
            url : "testing url",
            likes : 1000
        }
    
        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(200)
            .expect('Content-Type', /application\/json/)
    
            const response = await api.get('/api/blogs')
            const titles = response.body.map(r => r.title)
    
            expect(response.body).toHaveLength(initialBlogs.length + 1)
            expect(titles).toContain('test blog')
    })
})

describe ('adding invalid blogs', () => {

    test('adding blog with no likes field', async () => {

        const newBlog = {
            title : 'test blog no likes',
            author : 'test author',
            url : "testing url",
        }
    
        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(200)
            .expect('Content-Type', /application\/json/)
    
            const response = await api.get('/api/blogs')
            const blog = response.body.find( b => b.title === newBlog.title)
    
            expect(blog.likes).toBe(0)
    })

    test('adding blog with no title', async () => {

        const newBlog = {
            author : "test author",
            url : 'test url',
            likes : 100
        }

        await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
    })

    test('adding blog with no url', async () => {

        const newBlog = {
            title : 'test title',
            author : "test author",
            likes : 100
        }

        await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
    })
})

afterAll(() => {
    mongoose.connection.close()
})

