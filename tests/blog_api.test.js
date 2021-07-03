const mongoose = require('mongoose')
const helper = require('./helper_blog')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

beforeEach(async () => {
	await Blog.deleteMany({})

	for (let blog of helper.initialBlogs) {
		let blogObject = new Blog(blog)
		await blogObject.save()
	}
})

// exercise 4.8
test('blogs are returned as json', async () => {
	await api
		.get('/api/blogs')
		.expect(200)
		.expect('Content-Type', /application\/json/)
})

test('correct amount of blogs are returned', async () => {
	const res = await api.get('/api/blogs')

	expect(res.body).toHaveLength(2)
})

// exercise 4.9
test('unique identifier property is named id', async () => {
	const res = await api.get('/api/blogs')

	expect(res.body[0].id).toBeDefined()
})

// exercise 4.10
test('POST request creates a new blog post', async () => {
	const newBlog = {
		title: 'Canonical string reduction',
		author: 'Edsger W. Dijkstra',
		url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
		likes: 12,
	}
	await api
		.post('/api/blogs')
		.send(newBlog)
		.expect(201)
		.expect('Content-Type', /application\/json/)

	const res = await api.get('/api/blogs')
	const titles = res.body.map((t) => t.title)
	expect(res.body).toHaveLength(helper.initialBlogs.length + 1)
	expect(titles).toContain('Canonical string reduction')
})

// exercise 4.11
test('if likes are missing, default it to 0', async () => {
	const newBlog = {
		title: 'Canonical string reduction',
		author: 'Edsger W. Dijkstra',
		url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
	}

	await api
		.post('/api/blogs')
		.send(newBlog)
		.expect(201)
		.expect('Content-Type', /application\/json/)

	const blogsAtEnd = await helper.blogsInDb()
	const blog = blogsAtEnd.find(
		(blog) => blog.title === newBlog.title && blog.url === newBlog.url
	)
	expect(blog.likes).toBe(0)
})

// exercise 4.12
test('if title and url are missing, respond with 400 status code', async () => {
	const newBlog = {
		author: 'Edsger W. Dijkstra',
		likes: 12,
	}

	await api
		.post('/api/blogs')
		.send(newBlog)
		.expect(400)
		.expect('Content-Type', /application\/json/)
})

// exercise 4.13
test('deleting a note with valid id', async () => {
	const blogsAtStart = await helper.blogsInDb()
	const blogToDelete = blogsAtStart[0]

	await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)

	const blogsAtEnd = await helper.blogsInDb()

	expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)
})

afterAll(() => {
	mongoose.connection.close()
})
