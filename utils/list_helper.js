const dummy = (blogs) => {
	return 1
}

const totalLikes = (blogs) => {
	let sum = blogs.reduce((sum, curr) => sum + curr.likes, 0)
	return sum
}

module.exports = {
	dummy,
	totalLikes,
}
