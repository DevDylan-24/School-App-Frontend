new Vue({
    el: '#app',
    data: {
        message: 'Hello world!'
    },
    methods: {
        greet(){
            alert(this.message);
        }
    }
})