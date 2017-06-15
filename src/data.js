const videoA = {
  id: '1',
  title: 'asdA',
  duration: 180,
  watched: true,
}

const videoB = {
  id: '2',
  title: 'asdB',
  duration: 180,
  watched: true,
}
const videos = [videoA, videoB];

const getVideos = () => new Promise(resolve => resolve(videos))
const getVideoById = (id) => new Promise(resolve => {
  const [video] = videos.filter(video => video.id === id)
  resolve(video);
})
const createVideo = ({title, duration, released}) => {
  const video = {
    id: title,
    title,
    duration,
    released,
  }
  videos.push(video);
  return video;
}
const getObjectById = (type, id) => {
  const types = {
    video: getVideoById,
  }

  return types[type](id);
}

exports.getVideoById = getVideoById;
exports.getVideos = getVideos;
exports.createVideo = createVideo;
exports.getObjectById = getObjectById;
