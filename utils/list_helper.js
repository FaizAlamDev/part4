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

module.exports = {
	dummy,
	totalLikes,
	favoriteBlog,
}
