import Vue from 'vue'
import axios from 'axios';

export default {
  namespaced: true,
  state: {

      user: [],
      total: 0

  },
  actions: {
    saveUser({commit, dispatch, state, rootState}, user) {

      console.log('the saving old state user record is:', state.user)
        Vue.axios.post('/user', user)
          .then((resp) => {
            commit('addUserToState', user)
            dispatch('getUser')
            console.log('iam entering store to make changes')
          })
          .catch((err) => {
            console.log('Error saving user')
            console.log(err)
          })
    },
    updateUser({commit, dispatch, state}, user) {
      // Update user in  the database
      const cartItem = state.user.find(item => item.id === user.id)
      if (cartItem) {
        // user._id = this.state.user._id
        Vue.axios.put('/user/' + user.id, user)
          .then((resp) => {
            console.log('The Upadating Record Is:', resp)
            commit('updateUserInState', user)
            dispatch('getUser')
          })
          .catch((err) => {
            console.log('Error Updating user')
            console.log(err)
          })
      }
    },
    deleteUser({commit, dispatch, state}, user) {
      // Update user in  the database
      const cartItem = state.user.find(item => item.id === user.id)
      console.log('The deleting Record Is:', cartItem)

      if (cartItem) {
        // user._id = this.state.user._id
        Vue.axios.delete('/user/' + cartItem.id, user)
          .then((resp) => {
            console.log('The Deleting Record Is:', user.id)
            commit('deleteUserInState', user)
            dispatch('getUser')
            console.log('iam entering store to make changes')
          })
          .catch((err) => {
            console.log('Error delete user')
            console.log(err)
          })
      }
    },
    getUser({commit, state, dispatch},pagination) {
      console.log('iam entered' ,pagination);
      Vue.axios.get('/user',{
        params: {
          page: pagination.page === 0 ? 0 : parseInt(pagination.page,10) - 1,
          limit: pagination.rowsPerPage,
          sort:pagination.sortBy,
          order: pagination.orderBy,
          filter:pagination.filter ? pagination.filter : ''
        }
      })
        .then((resp) => {
          let data = resp.data.docs
          let tot = resp.data.count
          console.log('promise :' , resp.data , tot)
          if (data && data.length > 0) {
            commit('displayUserToState', data ,tot)
          }
        })
        .catch((err) => {
          console.log('Darn! There was an error getting user: ' + err)
        })
    }
  },
  mutations: {
    displayUserToState(state, data ,tot ) {
      state.user = []

      if (data && data.length > 0) {
        state.user = data//.push(data)
        state.total = tot //.push(data)

      }
    },
    setPagination (state, payload) {
      state.pagination = payload
    },
    deleteUserInState(state, user) {
      state.user.splice(state.user.indexOf(user.id), 1)
    },
    addUserToState(state, user) {
      state.user.push(user)
    },
    updateUserInState(state, user) {
      state.user.splice(state.user.indexOf(user.id), 1, user)
    }
  }

}

