const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
	const users = await User.find({}).populate('blogs', {
		title: 1,
		author: 1,
		url: 1,
	})
	response.json(users)
})

usersRouter.post('/', async (request, response) => {
	const body = request.body

	if (!body.username || !body.password) {
		return response
			.status(400)
			.json({ error: 'username or password not given' })
	}

	if (body.username.length < 3 || body.password.length < 3) {
		return response
			.status(400)
			.json({ error: 'username or password length less than 3' })
	}

	const passwordHash = await bcrypt.hash(body.password, 10)

	const user = new User({
		username: body.username,
		name: body.name,
		passwordHash,
	})

	const savedUser = await user.save()

	response.status(201).json(savedUser)
})

module.exports = usersRouter
