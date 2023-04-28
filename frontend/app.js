const API_URL = '/api/drive';
const driveState = Vue.observable(
    { folderBreadcrumb: [''], items: [], errorMessage:{addFile:'', addFolder:'', item:'', get:''} });

function loadDriveItems(type) {
    driveState.errorMessage = clearErrors()
    return axios
        .get(buildItemUrl())
        .then(response => {
            driveState.items = response.data
        })
        .catch(err => {
            if (type === 'folder') {
                console.log("remove last breadcrumb element")
                driveState.folderBreadcrumb.splice(driveState.folderBreadcrumb.length - 1, 1);
            }
            driveState.errorMessage.get = err.message
        })
}

function buildItemUrl(itemName = '') {
    return API_URL + buildBreadcrumb() + itemName;
}

function buildBreadcrumb() {
    return driveState.folderBreadcrumb.join('/') + '/';
}

function clearErrors() {
    return {addFile:'', addFolder:'', item:'', get:''}
}


Vue.component('breadcrumb', {
    template:
        '<div class="breadcrumb flex-horizontal" title="Current folder">' +
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
    template:
        '<div class="item-folder" title="folder" v-on:click.prevent="open">' +
            '<div class="icon-wrapper"><i class="far fa-folder"></i></div>{{item.name}}' +
        '</div>',
    props: ['item'],
    methods: {
        open() {
            driveState.folderBreadcrumb.push(this.item.name);
            loadDriveItems('folder')
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
    template:
        '<li class="item flex-horizontal">' +
            '<div class="item-action alert flex-horizontal-center" v-on:click="del" title="delete"><i class="far fa-trash-alt"></i></div>' +
            '<item-folder v-if="item.isFolder" v-bind:item="item"/>' +
            '<item-file v-if="!item.isFolder" v-bind:item="item"/>' +
            '<div v-if="errorMessage" class="msg-error">{{errorMessage}}</div>' +
        '</li>',
    props: ['item', 'errorMessage'],
/*    data: () => ({
        empty: '',
        message: '',
    }),*/
    methods: {
        del() {
            axios.delete(buildItemUrl(this.item.name),{
                headers: {
                    'Content-Type': 'multipart/form-data'
                }})
                .then(() => {
                    //this.message = '';
                    //driveState.errorMessage = clearErrors()
                })
                .then(() => loadDriveItems())
                .catch(error => {
                    //this.message = error.response.data.message;
                    driveState.errorMessage.item = error.response.data.message;
                });
        },
    },
});

Vue.component('add-file', {
    template:
        '<div v-if="renderComp" class="add-file">' +
            '<label for="file">Upload a new file</label>' +
            '<input type="file" id="file" ref="file" v-on:change="handleFileUpload"/>' +
            '<div v-if="errorMessage" class="msg-error">{{errorMessage}}</div>' +
        '</div>',
    props: ['errorMessage'],
    data: () => ({
        renderComp: true
    }),
    methods: {
        async forceRender() {
            // Remove MyComponent from the DOM
            this.renderComp = false;

            // Then, wait for the change to get flushed to the DOM
            await this.$nextTick();

            // Add MyComponent back in
            this.renderComp = true;
        },

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
                    console.log('PUT')
                    //this.message = '';
                    //driveState.errorMessage = clearErrors()
                })
                .then(() => loadDriveItems())
                .catch(error => {
                    driveState.errorMessage.addFile = error.response.data.message
                });
        }
    },
});

Vue.component('add-folder', {
    template:
        '<form v-if="renderComp" class="add-folder" v-on:submit.prevent="submit">' +
            '<input v-model.trim="name" placeholder="Create a new folder">' +
            '<span v-on:click="submit"><i class="fa fa-folder-plus"></i></span>' +
            '<div v-if="errorMessage" class="msg-error">{{errorMessage}}</div>' +
        '</form>',
    props: ['errorMessage'],
    data: () => ({
        name: '',
        renderComp: true
    }),
    methods: {
        async forceRender() {
            // Remove MyComponent from the DOM
            this.renderComp = false;

            // Then, wait for the change to get flushed to the DOM
            await this.$nextTick();

            // Add MyComponent back in
            this.renderComp = true;
        },

        submit: function () {
            if (this.name === '') {
                return;
            }
            axios
                .post(buildItemUrl(`?name=${this.name}`),null,
                    {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }})
                .then(() => {
                    //this.message = '';
                    this.name = '';
                    //driveState.errorMessage = clearErrors()
                })
                .then(() => loadDriveItems())
                .catch(error => {
                    driveState.errorMessage.addFolder = error.response.data.message
                })
        },
    },
});

Vue.component('drive', {
    template: '<div v-if="renderComp">' +
        '<add-file v-bind:errorMessage="errorMessage.addFile"/>' +
        '<div>' +
            '<breadcrumb />' +
            '<add-folder v-bind:errorMessage="errorMessage.addFolder"/>' +
            '<div v-if="errorMessage.get" class="msg-error fluo">{{errorMessage.get}}</div>' +
            '<item v-for="item in items" :key="item.name" v-bind:item="item" v-bind:error-message=null ></item>' +
        '</div>' +
        '</div>',
    data: () => ({
        renderComp: true
    }),
    computed: {
        items: () => driveState.items,
        errorMessage: () => driveState.errorMessage
    },
    methods: {
        async forceRender() {
            // Remove MyComponent from the DOM
            this.renderComp = false;

            // Then, wait for the change to get flushed to the DOM
            await this.$nextTick();

            // Add MyComponent back in
            this.renderComp = true;
        }
    },

    mounted () {
        loadDriveItems()
            .then(() => {
                //this.message = '';
                console.log("here we should clear error messages")
            })
            .catch(error => {
                console.log("here wa have some errors :",error)
                //this.message = error.response.data.message;
            });
    }
});

new Vue({
    el: '#app',
    template: '<drive class="app"></drive>'
});

