const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

const initialBlogs = [
	{
		title: 'React patterns',
		author: 'Michael Chan',
		url: 'https://reactpatterns.com/',
		likes: 7,
	},
	{
		title: 'Go To Statement Considered Harmful',
		author: 'Edsger W. Dijkstra',
		url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
		likes: 5,
	},
]

beforeEach(async () => {
	await Blog.deleteMany({})

	for (let blog of initialBlogs) {
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
	expect(res.body).toHaveLength(initialBlogs.length + 1)
	expect(titles).toContain('Canonical string reduction')
})

afterAll(() => {
	mongoose.connection.close()
})
