import axios from 'axios'

export default {
  state: {
    subject: {},
    classify: '',
    directors: '',
    casts: '',
    genres: '',
    countries: '',
    aka: '',
    posts: [],
    editScore: ''
  },
  mutations: {
    getSingleSubject (state, payload) {
      state.classify = payload.classify
      state.subject = payload.res
      if (payload.classify !== 'book') {
        state.directors = payload.res.directors
        state.casts = payload.res.casts
        state.genres = payload.res.genres.join('/')
        state.countries = payload.res.countries.join('/')
        state.aka = payload.res.aka.join(',')
      }
    },
    getSubjectComment (state, payload) {
      state.posts = payload.res
    },
    editScore (state, payload) {
      state.editScore = payload.score
    },
    resetEditScore (state) {
      state.editScore = ''
    }
  },
  actions: {
    getSingleSubject ({commit}, payload) {
      return new Promise((resolve, reject) => {
        let url = '/doubanapi/v2/' + payload.classify + (payload.classify === 'book' ? '/' : '/subject/') + payload.id
        axios.all([axios.get(url), axios.get(`/api/comments?item_id=${payload.id}`)])
        .then(axios.spread((res1, res2) => {
          commit({
            type: 'getSingleSubject',
            classify: payload.classify,
            res: res1.data
          })
          commit({
            type: 'getSubjectComment',
            res: res2.data
          })
          resolve(res1)
        }))
        .catch((err) => {
          console.log(err)
        })
        // axios.get(url)
        // .then((res) => {
        //   commit({
        //     type: 'getSingleSubject',
        //     classify: payload.classify,
        //     res: res.data
        //   })
        //   resolve(res)
        // })
      })
    },
    submitComment ({commit}, payload) {
      return new Promise((resolve, reject) => {
        let url = '/api/comments'
        axios.post(url, {
          user_id: payload.user_id,
          item_id: payload.item_id,
          comment: payload.comment,
          username: payload.username,
          score: payload.score,
          vote: 0,
          date: payload.date
        })
        .then((res) => {
          commit({
            type: 'resetEditScore'
          })
          resolve()
        })
        .catch((err) => {
          reject(err)
        })
      })
    },
    getNewComment ({commit}, payload) {
      axios.get(`/api/comments?item_id=${payload.item_id}`)
      .then((res) => {
        commit({
          type: 'getSubjectComment',
          res: res.data
        })
      })
      .catch((err) => {
        console.log(err)
      })
    },
    votePost ({commit}, payload) {
      return new Promise((resolve, reject) => {
        console.log(payload)
        axios.patch(`/api/comments/${payload.post_id}`, {
          vote: payload.vote
        })
        .then(() => {
          resolve()
        })
        .catch((err) => {
          console.log(err)
        })
      })
    }
  }
}
