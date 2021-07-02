const dummy = (blogs) => {
	return 1
}

const totalLikes = (blogs) => {
	let sum = blogs.reduce((sum, curr) => sum + curr.likes, 0)
	return sum
}

const favoriteBlog = (blogs) => {
	let max = 0
	let mostLiked = {}
	blogs.map((blog) => {
		if (blog.likes > max) {
			max = blog.likes
			mostLiked = blog
		}
	})
	return {
		title: mostLiked.title,
		author: mostLiked.author,
		likes: mostLiked.likes,
	}
}

const mostBlogs = (blogs) => {
	const authors = blogs.map((blog) => blog.author)
	const obj = {} // object which has the authors name with its frequency
	authors.forEach((author) => {
		if (obj[author] === undefined) obj[author] = 1
		else obj[author] += 1
	})

	let max = 0,
		pos = 0
	let keys = Object.keys(obj)
	let values = Object.values(obj)
	for (let i = 0; i < values.length; i++) {
		if (values[i] > max) {
			max = values[i]
			pos = i
		}
	}
	const returnObj = {
		author: keys[pos],
		blogs: values[pos],
	}
	return returnObj
}

const mostLikes = (blogs) => {
	const obj = {}
	blogs.forEach((blog) => {
		if (obj[blog.author] === undefined) obj[blog.author] = blog.likes
		else obj[blog.author] += blog.likes
	})
	const authors = Object.keys(obj)
	const likes = Object.values(obj)
	let max = 0,
		pos = 0
	for (let i = 0; i < likes.length; i++) {
		if (likes[i] > max) {
			max = likes[i]
			pos = i
		}
	}
	const returnObj = {
		author: authors[pos],
		likes: likes[pos],
	}
	return returnObj
}

module.exports = {
	dummy,
	totalLikes,
	favoriteBlog,
	mostBlogs,
	mostLikes,
}
