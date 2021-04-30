const dummy = (blogs) => 1;

const totalLikes = (blogs) => {
    let likes = 0;
    blogs.forEach(blog => {
        likes += blog.likes
    });

    return likes;
}

const mostLikes = (blogs) => {
    let mostliked = {
        title: '',
        author: '',
        likes: 0
      }
      if (blogs.length === 0){
          return {}
      }
      blogs.forEach(blog => {
          if(blog.likes >= mostliked.likes){
              mostliked = blog
          }
      })

      return mostliked
}


module.exports = {
    dummy,
    totalLikes,
    mostLikes
}
