import {get, post, put, del, upload, isAuthenticated, getToken, setToken, removeToken} from './api.js';

new Vue({
   el: '#app',
    data: {
        currentView: 'login', // Possible views: 'login', 'checkout', 'home', 'myCourses', 'cart'
        isSignUp: false,
        errorName: false,
        errorEmail: false,
        errorPassword: false,
        registerError:false,
        loginError: false,
        errorLoginMessage:"",
        registerName: '',
        registerEmail: '',
        registerPassword: '',
        registerRole: 'student',
        loginEmail: '',
        loginPassword: '',
        searchQuery: '',
        selectedSubjects: [],
        selectedLocations: [],
        selectedRatings: [],
        priceMin: null,
        priceMax: null,
        cart: [],
        sidebarCollapsed: false,
        lessons: [],
        filteredLessons: [],
        total: 0.00,
        userId:''
    },
    computed: {
        subjects() {
            return [...new Set(this.lessons.map(l => l.subject))];
        },
        locations() {
            return [...new Set(this.lessons.map(l => l.location))];
        },
        cartCount() {
            return this.cart.length;
        },
        subtotal() {
            return this.cart.reduce((sum, item) => sum + (item.price * item.spacesBooked), 0);
        },
        total() {
            return this.subtotal; // Can add tax or fees here if needed
        }
    },
    methods: {
        changeView(view) {
            if(view == 'home'){
                this.fetchLessons();
            }
            this.currentView = view;
        },
        ToggleSignUp() {
            this.isSignUp = !this.isSignUp;
        },
        toggleSidebar() {
            this.sidebarCollapsed = !this.sidebarCollapsed;
        },
        removeColorClass(){
            document.getElementById('studentLabel').classList.remove('default-checked');
        },
        async SignUp() {
            // Check if name, email and password are valid
            this.errorName = this.registerName.trim() === '';
            this.errorEmail = !this.registerEmail.includes('@');
            this.errorPassword = !this.isPasswordValid(this.registerPassword);

            this.registerError = false;
            if (this.errorName || this.errorEmail || this.errorPassword) {
                return;
            }else{
                // If no errors, proceed with registration
                // Send register data to backend 
                try {

                    const data = {
                        name: this.registerName,
                        email: this.registerEmail,
                        password: this.registerPassword,
                        role: this.registerRole
                    };
                    // Using fetch to send POST request
                    const result = await post('/users/register', data);

                    // Add error handling based on response status
                    if(result.status && (result.status !== 200 || result.status !== 201)){
                        console.log('Registration failed:', result.message);
                        this.registerError = true;
                        
                        return;
                    }else{
                        console.log('Registration successful, new User:', result.message);
                    }

                    console.log(result);

                    alert('Registration successful!');
                    this.changeView('login');
                    
                    // Changing back the form data to default
                    this.errorName = false;
                    this.errorEmail = false;
                    this.errorPassword = false;
                    this.registerName = '';
                    this.registerEmail = '';
                    this.registerPassword = '';
                    this.registerRole = 'student';

                    console.log('Registered user:', data);

                } catch (error) {
                    console.error('Error during registration:', error);
                    alert('An error occurred during registration. Please try again later.');
                }

            }
        },
        async Login() {
            // Check if email and password are valid
            this.errorEmail = !this.loginEmail.includes('@');
            this.errorPassword = !this.isPasswordValid(this.loginPassword);

            this.loginError = false;
            this.errorLoginMessage = "";

            if (this.errorName || this.errorEmail || this.errorPassword) {
                return;
            }else{
                // If no errors, proceed with login
                try {

                    const data = {  
                        email: this.loginEmail,
                        password: this.loginPassword
                    };
                    // Using fetch to send POST request
                    const result = await post('/users/login', data);
                    
                    // Add error handling based on response status
                    if(result.status && (result.status !== 200 || result.status !== 201)){
                        console.log('Login failed:', result.message);
                        this.loginError = true;
                        this.errorLoginMessage = result.message;

                        return;
                    }else{
                        console.log('Login successful, token:', result.token);
                        setToken(result.token);
                    }
                    
                    console.log(result);
                    // Assign current userId
                    this.userId = result._id;
                    console.log('Current login user:', data);

                    // Changing back the form data to default
                    this.errorEmail = false;
                    this.errorPassword = false;
                    this.loginEmail = '';
                    this.loginPassword = '';

                    this.changeView('home');

                } catch (error) {
                    console.error('Error during login:', error);
                    alert('An error occurred during login. ' + error.message);
                }
            }

        },
        DummyFunction() {
          return;
        },
        isPasswordValid(password) {
            // Check for at least 8 characters, one uppercase letter, and one number
            const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
            return regex.test(password);
        },
        filterLessons() {
            let filtered = this.lessons;

            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                filtered = filtered.filter(lesson => 
                    lesson.title.toLowerCase().includes(query) ||
                    lesson.subject.toLowerCase().includes(query) ||
                    lesson.tutor.toLowerCase().includes(query)
                );
            }

            if (this.selectedSubjects.length > 0) {
                filtered = filtered.filter(lesson => 
                    this.selectedSubjects.includes(lesson.subject)
                );
            }

            if (this.selectedLocations.length > 0) {
                filtered = filtered.filter(lesson => 
                    this.selectedLocations.includes(lesson.location)
                );
            }

            if (this.priceMin !== null && this.priceMin !== '') {
                filtered = filtered.filter(lesson => lesson.price >= this.priceMin);
            }

            if (this.priceMax !== null && this.priceMax !== '') {
                filtered = filtered.filter(lesson => lesson.price <= this.priceMax);
            }

            if (this.selectedRatings.length > 0) {
                const minRating = Math.min(...this.selectedRatings);
                filtered = filtered.filter(lesson => lesson.rating >= minRating);
            }

            this.filteredLessons = filtered;
        },
        calculateTotal(){
            const sum = this.cart.reduce((total, item) => {
                return total + (item.price * item.spacesBooked);
            }, 0);

            this.total = sum;
        },
        addToCart(lesson) {
            if (!this.isInCart(lesson._id)) {
                if (lesson.spacesBooked == 0) {
                    lesson.spacesBooked++;
                }
                this.cart.push(lesson);
                console.log(this.cart)
            }
            this.calculateTotal()
        },
        updateCart(lesson){

            const itemIndex = this.cart.findIndex(item => item._id === lesson._id);

            if (itemIndex !== -1) {
            this.$set(this.cart[itemIndex], 'spacesBooked', lesson.spacesBooked);
            }

            console.log(this.cart); 
            this.calculateTotal()
        },
        removeFromCart(lessonId){
            this.cart = this.cart.filter(lesson => lesson._id != lessonId)
        },
        wrapperIncCartPage(lesson){
            this.incSpacesBooked(lesson);
            this.updateCart(lesson);

        },
        wrapperDecCartPage(lesson){
            this.decSpacesBooked(lesson);
            this.updateCart(lesson);


        },
        incSpacesBooked(lesson){

            if (lesson.spaces > 0) {
                this.$set(lesson, 'spacesBooked', lesson.spacesBooked + 1);
                this.$set(lesson, 'spaces', lesson.spaces - 1);

                return false;
            }else{
                return true;
            }
        },
        decSpacesBooked(lesson){
            if(!((lesson.spaces + 1) > (lesson.spaces + lesson.spacesBooked))){
                this.$set(lesson, 'spacesBooked', lesson.spacesBooked - 1);
                this.$set(lesson, 'spaces', lesson.spaces + 1);
            }
        },
        checkDecSpaces(lesson){
            if(lesson.spacesBooked == 0){
                return true;
            }else{
                return false;
            }

        },  
        checkSpaces(lesson){
            if (lesson.spaces > 0) {
                return false;
            }else{
                return true;
            }
        },
        isInCart(lessonId) {
            return this.cart.some(item => item._id === lessonId);
        },
        clearFilters() {
            this.searchQuery = '';
            this.selectedSubjects = [];
            this.selectedLocations = [];
            this.selectedRatings = [];
            this.priceMin = null;
            this.priceMax = null;
            this.filterLessons();
        },
        async checkout(){
            const newOrder = {
                userId : this.userId,
                lessons : this.cart,
                totalPrice: this.total
            }

            // Using fetch to send POST request
            const result = await post('/orders', newOrder);
            // using fetch to send PUT request to update number of spaces in lessons collection
            for(const lesson of this.cart){
                const {spacesBooked, _id, ...restOflesson} = lesson;
                console.log(restOflesson);
                const resultPut = await put(`/lessons/${lesson._id}`, restOflesson)
                console.log(resultPut);
            }
            console.log(result);
            this.cart=[];
            this.total = 0.00;

            
            if(result.orderId){
                alert("Your purchase was successful, redirecting to Home page");
                this.changeView('home');
            }

                    
        },
        async fetchLessons() {
            try {
                // Fetch lessons from backend API
                this.lessons = await get('/lessons')
                this.lessons.forEach(lesson => {
                   lesson.spacesBooked = 0; 
                });
                this.filterLessons();
                console.log('Fetched lessons:', this.lessons);

            } catch (error) {
                console.error('Error fetching lessons:', error);
            }

        }
    },
    async created() {
        await this.fetchLessons();
    },
    mounted() {
        this.filteredLessons = this.lessons;
    }
})