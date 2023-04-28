const API_URL = '/api/drive';

const orderByList = ["nothing", "type", "name", "date", "size"]


const driveState = Vue.observable(
    {
        folderBreadcrumb: [''],
        items: [],
        errorMessage:{addFile:'', addFolder:'', item:'', get:''},
        orderByIndex: 0,
        reverseOrder: false
    });

function loadDriveItems(type) {
    driveState.errorMessage = clearErrors()

    let queryParams = '?'
    if (driveState.orderByIndex) {
        queryParams += 'orderby='+ orderByList[driveState.orderByIndex]
    }

    return axios
        .get(buildItemUrl(queryParams.length>1 ? queryParams : ''))
        .then(response => {
            driveState.items = response.data
        })
        .catch(err => {
            if (type === 'folder') {
                console.log("remove last breadcrumb element")
                driveState.folderBreadcrumb.splice(driveState.folderBreadcrumb.length - 1, 1);
            }
            console.log(err)
            driveState.errorMessage.get = err.response.data.message
        })
}

function buildItemUrl(params = '') {
    return API_URL + buildBreadcrumb() + params;
}

function buildBreadcrumb() {
    return driveState.folderBreadcrumb.join('/') + '/';
}

function clearErrors() {
    return {addFile:'', addFolder:'', item:'', get:''}
}


Vue.directive('autowidth', {
    bind: function (el) {
        // set the input element's initial width based on its value
        el.style.width = (el.value.length ) * 10 + 'px';
    },
    update: function (el) {
        // update the input element's width whenever its value changes
        el.style.width = (el.value.length ) * 10 + 'px';
    }
})


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
            loadDriveItems(null);
        },
    },
});

Vue.component('item-folder', {
    template:
        '<div class="item-folder" title="folder" >' +
            '<div class="icon-wrapper"><i class="far fa-folder"></i></div>' +
            '<input v-model="item.name" v-autowidth @click.prevent @input>' +
        '</div>',
    props: ['item'],
/*    methods: {
        open() {
            driveState.folderBreadcrumb.push(this.item.name);
            loadDriveItems('folder')
        },
    },*/
});

Vue.component('item-file', {
    template: '' +
        '<div class="item-file" title="file">' +
            '<div class="icon-wrapper"><i class="far fa-file"></i></div>' +
            '<input v-model="item.name" v-autowidth @click.prevent >' +
            '<span> ({{item.size}} bytes)</span>' +
        '</div>',
    props: ['item'],
    computed: {
        href() { return buildItemUrl(this.item.name) },
    },

});

Vue.component('item', {
    template:
        '<li class="item flex-horizontal" >' +

            '<div class="item-folder" v-if="item.isFolder"  >' +
                '<div class="item-action alert flex-horizontal-center">' +
                    '<div class="icon-wrapper"><i class="far fa-trash-alt" v-on:click="del" title="delete" /></div>' +
                '</div>' +
                '<item-folder v-bind:item="item"/>' +
            '</div>' +


            '<a class="item-file" v-if="!item.isFolder" title="Fichier" target="_blank" :href="href">' +
                '<div class="item-action alert flex-horizontal-center">' +
                    '<div class="icon-wrapper"><i class="far fa-trash-alt" v-on:click="del" title="delete" /></div>' +
                '</div>' +
                '<item-file v-bind:item="item"/>' +
            '</a>' +
            '<span v-if="errorMessage" class="msg-error">{{errorMessage}}</span>' +
        '</li>',

    props: ['item', 'errorMessage'],
    computed: {
        href()  { return this.item.isFolder ? '#' : buildItemUrl(this.item.name) }
    },
    methods: {
        del() {
            axios.delete(buildItemUrl(this.item.name),{
                headers: {
                    'Content-Type': 'multipart/form-data'
                }})
                .then(() => loadDriveItems(null))
                .catch(error => {
                    driveState.errorMessage.item = error.response.data.message;
                });
        },
        rename() {},
        mainAction(isFolder) {
            if (isFolder) {
                driveState.folderBreadcrumb.push(this.item.name);
                loadDriveItems('folder')
            } else {
                //getFile() {
                //prompt("give a fuck")
            }
        }
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
                .then(() => loadDriveItems(null))
                .catch(error => {
                    driveState.errorMessage.addFile = error.response.data.message
                });
        }
    },
});

Vue.component('order-items', {
    template:
        '<div v-if="renderComp" class="order-items">' +
            '<button id="order" type="button" @click="changeOrderType">Order by {{orderList[orderByIndex]}}</button>' +
        '</div>',
    props: ['errorMessage', 'orderByIndex'],
    data: () => ({
        renderComp: true,
        orderList: orderByList
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

        changeOrderType() {
            driveState.orderByIndex = driveState.orderByIndex+1 === orderByList.length
                ? 0
                : driveState.orderByIndex+1
        }
    },
});

Vue.component('add-folder', {
    template:
        '<form v-if="renderComp" class="add-folder flex-horizontal" v-on:submit.prevent="submit">' +
            '<input v-model.trim="name" placeholder="Create a new folder">' +
            '<span v-on:click="submit"><i class="fa fa-folder-plus"/></span>' +
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
                    this.name = '';
                    loadDriveItems(null)
                })
                .catch(e => console.log("-->",e))
        },
    },
});

Vue.component('drive', {
    template: '<div v-if="renderComp">' +
        '<div class="commands">' +
            '<add-file v-bind:errorMessage="errorMessage.addFile"/>' +
            '<order-items v-bind:orderByIndex="orderByIndex" />' +
        '</div>' +
        '<div>' +
            '<breadcrumb />' +
            '<add-folder v-bind:errorMessage="errorMessage.addFolder"/>' +
            '<item v-for="item in items" :key="item.name" v-bind:item="item" v-bind:error-message=null />' +
        '</div>' +
        '<div v-if="errorMessage.get" class="msg-error fluo">{{errorMessage.get}}</div>' +
        '</div>',
    data: () => ({
        renderComp: true
    }),
    computed: {
        items: () => driveState.items,
        errorMessage: () => driveState.errorMessage,
        orderByIndex: () => driveState.orderByIndex,
        orderReverse: () => driveState.reverseOrder
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
        loadDriveItems(null)
    }
});

new Vue({
    el: '#app',
    template: '<drive class="app"></drive>'
});

