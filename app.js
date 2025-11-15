import {get, post, put, del, upload, isAuthenticated, getToken, setToken, removeToken} from './api.js';

new Vue({
   el: '#app',
    data: {
        currentView: 'home',
        isSignUp: false,
        errorName: false,
        errorEmail: false,
        errorPassword: false,
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
        filteredLessons: []
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
        }
    },
    methods: {
        changeView(view) {
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

            if (this.errorName || this.errorEmail || this.errorPassword) {
                return;
            }else{
                // If no errors, proceed with registration
                // Send register data to backend 
                try {
                    let url = 'http://localhost:3000/api/register';

                    const data = {
                        name: this.registerName,
                        email: this.registerEmail,
                        password: this.registerPassword,
                        role: this.registerRole
                    };
                    // Using fetch to send POST request
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    });

                    const result = await response.json();
                    // Add error handling based on response status
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

            if (this.errorName || this.errorEmail || this.errorPassword) {
                return;
            }else{
                // If no errors, proceed with login
                try {
                    let url = 'http://localhost:3000/api/login';

                    const data = {  
                        email: this.loginEmail,
                        password: this.loginPassword
                    };
                    // Using fetch to send POST request
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    });
                    const result = await response.json();
                    // Add error handling based on response status
                    
                    console.log(result);
                    alert('Login successful!');
                    console.log('Current login user:', data);

                    // Changing back the form data to default
                    this.errorEmail = false;
                    this.errorPassword = false;
                    this.loginEmail = '';
                    this.loginPassword = '';

                    this.changeView('home');

                } catch (error) {
                    console.error('Error during login:', error);
                    alert('An error occurred during login. Please try again later.');
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
        addToCart(lesson) {
            if (!this.isInCart(lesson.id)) {
                this.cart.push(lesson);
            }
        },
        isInCart(lessonId) {
            return this.cart.some(item => item.id === lessonId);
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
        async fetchLessons() {
            try {
                // Fetch lessons from backend API
                this.lessons = await get('/lessons')
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