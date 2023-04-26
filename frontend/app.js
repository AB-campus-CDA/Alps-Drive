const API_URL = '/api/drive';
const driveState = Vue.observable({ folderBreadcrumb: [''], items: [] });

function loadDriveItems() {
    return axios
        .get(buildItemUrl())
        .then(response => (driveState.items = response.data))
}

function buildBreadcrumb() {
    return driveState.folderBreadcrumb.join('/') + '/';
}

function buildItemUrl(itemName = '') {
    return API_URL + buildBreadcrumb() + itemName;
}


Vue.component('breadcrumb', {
    template: '<div class="breadcrumb flex-horizontal" title="Current folder">' +
        '<div v-on:click="back" title="Back" class="breadcrumb-action flex-horizontal-center"><i class="far fa-caret-square-left"></i></div>' +
        '<div class="breadcrumb-text">{{folderBreadcrumb}}</div>' +
        '</div>',
    computed: {
        folderBreadcrumb: () => buildBreadcrumb(driveState.folderBreadcrumb),
    },
    methods: {
        back() {
            driveState.folderBreadcrumb.splice(driveState.folderBreadcrumb.length - 1, 1);
            loadDriveItems();
        },
    },
});

Vue.component('item-folder', {
    template: '<div class="item-folder" title="folder" v-on:click.prevent="open"><div class="icon-wrapper"><i class="far fa-folder"></i></div> {{item.name}}</div>',
    props: ['item'],
    methods: {
        open() {
            driveState.folderBreadcrumb.push(this.item.name);
            loadDriveItems();
        },
    },
});

Vue.component('item-file', {
    template: `<a class="item-file" title="file" target="_blank" :href="href"><div class="icon-wrapper"><i class="far fa-file"></i></div>{{item.name}}<span> ({{item.size}} bytes)</span></a>`,
    props: ['item'],
    computed: {
        href() { return buildItemUrl(this.item.name) },
    },

});

Vue.component('item', {
    template: '<li class="item flex-horizontal">' +
        '<div class="item-action alert flex-horizontal-center" v-on:click="del" title="delete"><i class="far fa-trash-alt"></i></div>' +
        '<item-folder v-if="item.isFolder" v-bind:item="item"/>' +
        '<item-file v-if="!item.isFolder" v-bind:item="item"/>' +
        '<div v-if="message !== empty" class="msg-error">{{message}}</div>' +
    '</li>',
    props: ['item'],
    data: () => ({
        empty: '',
        message: '',
    }),
    methods: {
        del() {
            axios.delete(buildItemUrl(this.item.name))
                .then(() => {
                    this.message = '';
                })
                .then(() => loadDriveItems())
                .catch(error => {
                    this.message = error.response.data.message;
                });
        },
    },
});

Vue.component('add-file', {
    template: '<div class="add-file">' +
        '<label for="file">Upload a new file</label>' +
        '<input type="file" id="file" ref="file" v-on:change="handleFileUpload"/>' +
        '<div v-if="message !== empty" class="msg-error">{{message}}</div>' +
        '</div>',
    data: () => ({
        empty: '',
        message: ''
    }),
    methods: {
        handleFileUpload() {
            const file = this.$refs.file.files[0];
            const formData = new FormData();
            formData.append('file', file);

            axios.put(buildItemUrl(),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })
                .then(() => {
                    this.message = '';
                })
                .then(() => loadDriveItems())
                .catch(error => {
                    this.message = error.response.data.message;
                });
        }
    },
});

Vue.component('add-folder', {
    template: '<form class="add-folder" v-on:submit.prevent="submit">' +
        '<input v-model.trim="name" placeholder="Create a new folder">' +
        '<span v-on:click="submit"><i class="fa fa-folder-plus"></i></span>' +
        '<div v-if="message !== empty" class="msg-error">{{message}}</div>' +    '</form>',
    data: () => ({
        empty: '',
      name: '',
      message: '',
    }),
    methods: {
        submit: function () {
            if (this.name === '') {
                return;
            }
            axios
                .post(buildItemUrl(`?name=${this.name}`))
                .then(() => {
                    this.message = '';
                    this.name = '';
                })
                .then(() => loadDriveItems())
                .catch(error => {
                    this.message = error.response.data.message;
                })
        },
    },
});

Vue.component('drive', {
    template: '<div>' +
        '<add-file />' +
        '<div>' +
            '<breadcrumb />' +
            '<add-folder />' +
        '<div v-if="message !== empty" class="msg-error">{{message}}</div>' +
            '<item v-for="item in items" :key="item.name" v-bind:item="item"></item>' +
        '</div>' +
        '</div>',
    data: () => ({
        empty: '',
        message: '',
    }),
    computed: {
        items: () => driveState.items,
    },
    mounted () {
        loadDriveItems()
            .then(() => {
                this.message = '';
            })
            .catch(error => {
                this.message = error.response.data.message;
            });
    }
});

new Vue({
    el: '#app',
    template: '<drive class="app"></drive>'
});

