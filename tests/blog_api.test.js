const mongoose = require('mongoose')
const helper = require('./helper_blog')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')

beforeEach(async () => {
	await Blog.deleteMany({})
	await User.deleteMany({})

	for (let blog of helper.initialBlogs) {
		let blogObject = new Blog(blog)
		await blogObject.save()
	}
	for (let user of helper.initialUsers) {
		let userObject = new User(user)
		await userObject.save()
	}
})

describe('when there a 2 blogs in DB', () => {
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

	test('unique identifier property is named id', async () => {
		const res = await api.get('/api/blogs')

		expect(res.body[0].id).toBeDefined()
	})
})

describe('adding blogs', () => {
	let headers
	beforeEach(async () => {
		const newUser = {
			username: 'faizalam',
			name: 'Faiz Alam',
			password: 'alam',
		}
		await api.post('/api/users').send(newUser)

		const result = await api.post('/api/login').send(newUser)
		headers = {
			Authorization: `bearer ${result.body.token}`,
		}
	})

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
			.set(headers)
			.expect(201)
			.expect('Content-Type', /application\/json/)

		const res = await api.get('/api/blogs')
		const titles = res.body.map((t) => t.title)
		expect(res.body).toHaveLength(helper.initialBlogs.length + 1)
		expect(titles).toContain('Canonical string reduction')
	})

	test('if likes are missing, default it to 0', async () => {
		const newBlog = {
			title: 'Canonical string reduction',
			author: 'Edsger W. Dijkstra',
			url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
		}

		await api
			.post('/api/blogs')
			.send(newBlog)
			.set(headers)
			.expect(201)
			.expect('Content-Type', /application\/json/)

		const blogsAtEnd = await helper.blogsInDb()
		const blog = blogsAtEnd.find(
			(blog) => blog.title === newBlog.title && blog.url === newBlog.url
		)
		expect(blog.likes).toBe(0)
	})

	test('if title and url are missing, respond with 400 status code', async () => {
		const newBlog = {
			author: 'Edsger W. Dijkstra',
			likes: 12,
		}

		await api
			.post('/api/blogs')
			.send(newBlog)
			.set(headers)
			.expect(400)
			.expect('Content-Type', /application\/json/)
	})

	test('updating the blog', async () => {
		const blogsAtStart = await helper.blogsInDb()
		const blogToUpdate = blogsAtStart[0]

		const blog = {
			likes: 77,
		}

		await api.put(`/api/blogs/${blogToUpdate.id}`).send(blog).expect(200)

		const blogsAtEnd = await helper.blogsInDb()

		expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
		expect(blogsAtEnd[0].likes).toBe(blog.likes)
	})

	test('POST request fails if token is not provided', async () => {
		const newBlog = {
			title: 'Token',
			author: 'Faiz',
			url: 'http://localhost:3001/api/blogs/3',
			likes: 40,
		}

		const blogsAtStart = await helper.blogsInDb()

		await api
			.post('/api/blogs')
			.send(newBlog)
			.expect(401)
			.expect('Content-Type', /application\/json/)

		const blogsAtEnd = await helper.blogsInDb()

		expect(blogsAtEnd.length).toBe(blogsAtStart.length)
	})
})

describe('adding users', () => {
	test('duplicate username gives an error', async () => {
		const newUser = {
			username: 'robertdeniro',
			name: 'Robert',
			password: 'alamalam',
		}
		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)

		expect(result.body.error).toContain('`username` to be unique')
	})

	test('username length less than 3 gives an error', async () => {
		const newUser = {
			username: 'rd',
			name: 'Robert Downey',
			password: 'alamalam',
		}

		await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)
	})
})

afterAll(() => {
	mongoose.connection.close()
})
