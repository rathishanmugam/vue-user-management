<template>
  <div v-if="user">

    <v-snackbar v-model="snackbar" :timeout="3000" top color="success">
      <span>{{text}}</span>
      <v-btn flat color="white" @click="snackbar = false">close</v-btn>
    </v-snackbar>
    <v-toolbar flat color="white">
      <v-toolbar-title>User</v-toolbar-title>
      <v-divider
        class="mx-2"
        inset
        vertical
      ></v-divider>
      <v-text-field
        v-model="search"
        append-icon="search"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
      <v-spacer></v-spacer>
      <v-dialog v-model="dialog" max-width="500px">
        <template v-slot:activator="{ on }">
          <v-btn color="primary" dark class="mb-2" v-on="on">New Item</v-btn>
        </template>
        <v-card>
          <v-card-title>
            <span class="headline">{{ formTitle }}</span>
          </v-card-title>

          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12 sm6 md4>
                  <v-text-field v-model="editedItem.first" label="first name"
                                :counter="10" required :rules="nameRules"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-text-field v-model="editedItem.last"
                                :counter="10" required :rules="nameRules"

                                label="last name"></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-text-field v-model="editedItem.email"
                                required :rules="emailRules"
                                @change='checkEmptyEmail($event, "email")'
                                label="email "></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-text-field v-model="editedItem.phone"
                                v-bind:rules="phoneRules"
                                v-bind:type="'editedItem.phone'" label="phone "></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-text-field v-model="editedItem.location"
                                :counter="10" required :rules="nameRules"

                                label="location"></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-text-field v-model="editedItem.hobby"
                                :counter="10" required :rules="nameRules"

                                label="hobby"></v-text-field>
                </v-flex>


              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click="close">Cancel</v-btn>
            <v-btn
              :disabled=" editedItem.email == '' || (editedItem.first == '' || editedItem.last == '' || editedItem.password == '') "
              color="blue darken-1" flat @click="save" @Added="snackbar = true">Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-toolbar>

    <v-data-table
      :headers="headers"
      :items="user"
      class="elevation-1"

      :total-items="total"
      :rows-per-page-items="rowsPerPageItems"
      :pagination.sync="pagination"
    >
      <template v-slot:items="props">
        <td class="text-xs-left">{{ props.item.first }}</td>
        <td class="text-xs-left">{{ props.item.last }}</td>
        <td class="text-xs-left">{{ props.item.email }}</td>
        <td class="text-xs-left">{{ props.item.phone }}</td>
        <td class="text-xs-left">{{ props.item.location }}</td>
        <td class="text-xs-left">{{ props.item.hobby }}</td>
        <!--        <td class="text-xs-left">{{new Date(props.item.added).getUTCDate() + '-' + (new-->
        <!--          Date(props.item.added).getUTCMonth()+1) + '-' + new-->
        <!--          Date(props.item.added).getUTCFullYear()}}-->
        <!--        </td>-->
        <td class="justify-center layout px-0">
          <v-icon
            small
            class="mr-2"
            @click="editItem(props.item)"
          >
            save
          </v-icon>
          <v-icon
            small
            @click="deleteItem(props.item)"
          >
            delete
          </v-icon>
        </td>

      </template>
      <template v-slot:no-results>
        <v-alert :value="true" color="error" icon="warning">
          Your search for "{{ search }}" found no results.
        </v-alert>
      </template>
    </v-data-table>
  </div>
</template>


<script>
  import Vue from 'vue'
  import axios from 'axios';
  import {mapState} from 'vuex'


  export default {
    created() {
      this.get()
      this.$store.dispatch('user/getUser', this.pagination)
    },
    data() {
      return {
        total: 0,
        users: [],
        rowsPerPageItems: [5, 10, 12, 15, 20, 25, 50],
        keywords: '',
        pagination: {totalItems: 50, rowsPerPage: 6, page: 0, sortBy: 'first', orderBy: '1', filter: ''},
        dialog: false,
        snackbar: false,
        text: '',
        search: '',
        clicked: [],
        emailRules: [
          v => !!v || 'E-mail is required',
          v => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'E-mail must be valid',
        ],
        phone: '',
        phoneRules: [
          v => !!v || 'Phone is required',
          v => /(\(?[0-9]{3}\)?-?\s?[0-9]{3}-?[0-9]{4})/.test(v) || 'Format must be (xxx) xxx-xxxx'
        ],
        nameRules: [
          (v) => !!v || 'Name is required',
          v => /^[a-zA-Z]*$/.test(v) || 'Must Be Alphabet'
        ],
        email: '',
        headers: [
          {text: 'first', value: 'first'},
          {text: 'last ', value: 'last'},
          {text: 'email ', value: 'email'},
          {text: 'phone ', value: 'password'},
          {text: 'location', value: 'location'},
          {text: 'hobby', value: 'hobby'},
          {text: 'Action', align: 'center'}

        ],
        desserts: [],
        editedIndex: -1,
        editedItem: {
          first: '',
          last: '',
          email: '',
          phone: '',
          location: '',
          hobby: ''
        },
        defaultItem: {
          first: '',
          last: '',
          email: '',
          phone: '',
          location: '',
          hobby: ''
        }
      }
    },

    computed: {
      ...mapState('user', {
        user: state => state.user
      }),

      formTitle() {
        return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
      }
    },

    watch: {
      pagination() {
        this.getUserByPagination()
      },
      search() {
        this.getUserByPagination()
      },
      dialog(val) {
        val || this.close()
      },

    },


    methods: {
      getUserByPagination() {
        if (this.search) {
          // this.pagination.page = pageNumber;
          this.pagination.orderBy = this.pagination.descending ? '-1' : '1';
          this.pagination.filter = this.search;
          this.$store.dispatch('user/getUser', this.pagination)
        }
        // get by sort option
        if (this.pagination.sortBy && !this.search) {
          this.pagination.filter = '';

          this.pagination.orderBy = this.pagination.descending ? '-1' : '1';
          this.$store.dispatch('user/getUser', this.pagination)

        }
        if (!this.search && !this.pagination.sortBy) {
          this.pagination.filter = '';

          // axios.get(`${environment.apiUrl}/category?page=${this.pagination.page}&per_page=${this.pagination.rowsPerPage}`)
          this.$store.dispatch('user/getUser', this.pagination)
        }
      },

      checkEmptyEmail(value, field) {
        if (!value.trim().includes('@') || !value.trim().includes('.com')) {
          this.editedItem[field] = '';
        }
      },

      editItem(item) {
        console.log('the index of', this.item)
        this.editedIndex = this.user.indexOf(item)
        this.editedItem = Object.assign({}, item)
        // this.items.splice(item.index, 1, item)
        this.dialog = true
      },

      deleteItem(item) {
        const index = this.user.indexOf(item)
        console.log('deleting  item', item)

        confirm('Are you sure you want to delete this item? ')  //&& this.items.splice(index, 1)
        this.$store.dispatch('user/deleteUser', item)
        this.text = 'user deleted successfully'
        this.snackbar = true
        this.get();
      },

      close() {
        this.dialog = false
        setTimeout(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        }, 300)
      },

      save() {
        if (this.editedIndex > -1) {
          Object.assign(this.user[this.editedIndex], this.editedItem)
          this.$store.dispatch('user/updateUser', this.editedItem)
          this.text = 'user updated successfully'
          this.get()
          this.snackbar = true


        } else {
          const id = Math.max.apply(null, this.users.map(s => s.id)) + 1;
          console.log('the item is', id)
          const added = new Date().toLocaleDateString();
          this.editedItem = Object.assign({}, this.editedItem, {id}, {added})
          console.log('Saving customer record:', this.editedItem)
          this.$store.dispatch('user/saveUser', this.editedItem)
          this.text = 'user added successfully'
          this.get()
          this.snackbar = true
        }
        this.close()
      },
      get() {
        Vue.axios.get('/user', {
          params: {
            page: '',
            limit: '',
            sort: '',
            order: '',
            filter: ''
          }
        })
          .then((resp) => {
            this.users = resp.data.docs
            this.total = resp.data.count
          })
          .catch((err) => {
            console.log(' error getting user in data logic: ' + err)
          })
      }
    }
  }
</script>

