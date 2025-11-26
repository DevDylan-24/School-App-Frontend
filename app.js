import {get, post, put, del, getToken, setToken, removeToken} from './api.js';

new Vue({
   el: '#app',
    data: {
        currentView: 'login', // Possible views: 'login','home','cart'
        isSignUp: false,
        errorName: false,
        errorEmail: false,
        errorPassword: false,
        errorPhoneNumber: false,
        registerError:false,
        loginError: false,
        errorCheckoutName: false,
        errorCheckoutPhoneNumber: false,
        errorLoginMessage:"",
        registerName: '',
        registerEmail: '',
        registerPassword: '',
        registerPhoneNumber: '',
        checkoutName:'',
        checkoutPhoneNumber:'',
        registerRole: 'student',
        loginEmail: '',
        loginPassword: '',
        sortBy: 'subject',
        sortOrder: 'asc',
         sortOptions: [
        { value: 'subject', label: 'Subject', icon: 'book-outline' },
        { value: 'location', label: 'Location', icon: 'location-outline' },
        { value: 'price', label: 'Price', icon: 'cash-outline' },
        { value: 'spaces', label: 'Availability', icon: 'people-outline' }
        ],
        cart: [],
        lessons: [],
        total: 0.00,
        userId:'',
        isDisabled:true,
        currUser:null,
        searchQuery: '',
        searchResults: [],
        loading: true,
        error: '',
        searchTimeout: null,
        defaultImage: 'default.jpg',
        checkoutLoading: false,
        showPopup: false,
        checkoutLoading: false,
        checkoutAnimation: false,
        showSuccessMessage: false,
        progress: 0
    },
    computed: {
        cartCount() {
            return this.cart.length;
        },
        isCheckoutValid(){
            return  this.checkoutName.trim() !== '' && this.checkoutPhoneNumber.trim() !== '';
        }
    },
    methods: {
        changeView(view) {
            this.currentView = view;
        },
        toggleCartAndHome(){
            if(this.currentView == 'home'){
                this.changeView('cart');
            }else{
                this.changeView('home')
            }
        },
        ToggleSignUp() {
            this.isSignUp = !this.isSignUp;
        },
        sortLessons() {
            let sorted = [...this.searchResults];
            
            sorted.sort((a, b) => {
                let compareA, compareB;
                
                switch(this.sortBy) {
                    case 'subject':
                        compareA = a.subject.toLowerCase();
                        compareB = b.subject.toLowerCase();
                        break;
                    case 'location':
                        compareA = a.location.toLowerCase();
                        compareB = b.location.toLowerCase();
                        break;
                    case 'price':
                        compareA = a.price;
                        compareB = b.price;
                        break;
                    case 'spaces':
                        compareA = a.spaces;
                        compareB = b.spaces;
                        break;
                    default:
                        return 0;
                }
                
                if (this.sortOrder === 'asc') {
                    return compareA > compareB ? 1 : compareA < compareB ? -1 : 0;
                } else {
                    return compareA < compareB ? 1 : compareA > compareB ? -1 : 0;
                }
            });
        
            this.searchResults = sorted;
        },
        resetSort() {
                    this.sortBy = 'subject';
                    this.sortOrder = 'asc';
                    this.sortLessons();
        },
        removeColorClass(){
            document.getElementById('studentLabel').classList.remove('default-checked');
        },
        async SignUp() {
            // Check if name, email and password are valid
            this.errorName = !this.isNameValid(this.registerName.trim());
            this.errorEmail = !this.registerEmail.includes('@');
            this.errorPassword = !this.isPasswordValid(this.registerPassword);
            this.errorPhoneNumber = !this.isPhoneNumberValid(this.registerPhoneNumber)

            this.registerError = false;
            if (this.errorName || this.errorEmail || this.errorPassword || this.errorPhoneNumber) {
                return;
            }else{
                // If no errors, proceed with registration
                // Send register data to backend 
                try {

                    const data = {
                        name: this.registerName,
                        email: this.registerEmail,
                        password: this.registerPassword,
                        phone: this.registerPhoneNumber,
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
                    this.errorPhoneNumber = false;
                    this.registerName = '';
                    this.registerEmail = '';
                    this.registerPassword = '';
                    this.registerPhoneNumber = '';
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

                    const response = await get(`/users/${this.userId}`)
                    this.currUser = response.user;
                    console.log('Current login user:', this.currUser);


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
        formHandler() {
          return;
        },
        isPasswordValid(password) {
            // Check for at least 8 characters, one uppercase letter, and one number
            const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
            return regex.test(password);
        },
        isNameValid(name){
            const regex = /^[A-Za-z]*$/;
            return regex.test(name);
        },
        isPhoneNumberValid(phone){
            const regex = /^5\d{7}$/;
            return regex.test(phone);
        },
        calculateTotal(){
            const sum = this.cart.reduce((total, item) => {
                return total + (item.price * item.spacesBooked);
            }, 0);

            this.total = sum;
        },
         // Search as you type with debouncing
        handleSearch() {
            console.log(this.searchQuery)
            // Clear previous timeout
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout);
            }
            
            // Set new timeout for debouncing (300ms delay)
            this.searchTimeout = setTimeout(() => {
                this.performSearch();
            }, 350);
        },
        // Function ensures spaces booked for each lesson is consistent in both cart and search results
        checkSpacesInSearchResult(){
            if(this.searchResults.length > 0){
                this.searchResults.forEach((lesson) => {
                    if(this.isInCart(lesson._id)){
                        const lessonInCart = this.cart.find(cart_lesson => cart_lesson._id == lesson._id)
                        lesson.spacesBooked = lessonInCart.spacesBooked;
                    }else{
                        lesson.spacesBooked = 0;
                    }
                });
            }
        },
        async performSearch() {
            if (this.searchQuery.trim() === '') {
                this.searchResults = [...this.lessons];
                this.checkSpacesInSearchResult()
                this.sortLessons();
                return;
            }

            this.loading = true;
            this.error = '';

            try {
                this.searchResults = await get(`/search?q=${encodeURIComponent(this.searchQuery)}`);
                this.checkSpacesInSearchResult()
                console.log(this.searchResults)
            } catch (err) {
                console.error('Search error:', err);
                this.error = 'Failed to search lessons. Please try again.';
                this.searchResults = [];
            } finally {
                this.loading = false;
            }
        },
        addToCart(lesson) {
            if (!this.isInCart(lesson._id)) {
                if (lesson.spacesBooked == 0) {
                    lesson.spacesBooked++;
                    this.$set(lesson, 'spaces', lesson.spaces - 1);
                }
                this.cart.push(lesson);
                console.log(this.cart)
            }else{
                if (lesson.spaces > 0) {
                    this.$set(lesson, 'spacesBooked', lesson.spacesBooked + 1);
                    this.$set(lesson, 'spaces', lesson.spaces - 1);
                }
                console.log(this.cart)

            }
            this.calculateTotal()
            this.isDisabled = false;
        },
        isCartEmpty(){
            if (this.cart.length == 0){
                this.isDisabled = true
            }
        },
        checkoutAnimationPopup() {
            // Reset states
            this.showPopup = true;
            this.checkoutLoading = true;
            this.checkoutAnimation = false;
            this.showSuccessMessage = false;
            this.progress = 0;
            
            // Clear any existing interval
            if (this.progressInterval) {
                clearInterval(this.progressInterval);
            }
            
            const totalDuration = 11000; 
            // Update every 100ms for smooth progress
            const updateInterval = 100; 
            const increments = totalDuration / updateInterval;
            const incrementValue = 100 / increments;

            // Simulate progress
            this.progressInterval = setInterval(() => {
                this.progress += incrementValue;
                if (this.progress >= 100) {
                    clearInterval(this.progressInterval);
                    this.progress = 100;
                }
            }, updateInterval);
            
            // First animation (loading)
            setTimeout(() => {
                this.checkoutLoading = false;
                

                    this.checkoutAnimation = true;
                    
                    // Show success message after a short delay
                    setTimeout(() => {
                        this.showSuccessMessage = true;
                    }, 500);

                
            }, 7000); // Loading animation duration
            
            // Close popup after completion
            setTimeout(() => {
                if (this.progressInterval) {
                    clearInterval(this.progressInterval);
                }
                this.progress = 100;
                
                setTimeout(() => {
                    this.closePopup();
                    this.changeView('home');
                }, 1000);
                
            }, totalDuration); // Total animation duration
        },
        closePopup() {
            this.showPopup = false;
            this.checkoutLoading = false;
            this.checkoutAnimation = false;
            this.showSuccessMessage = false;
            this.progress = 0;

            // Clear the progress interval
            if (this.progressInterval) {
                clearInterval(this.progressInterval);
                this.progressInterval = null;
            }
        },
        removeFromCart(lessonId){
            this.cart.forEach((lesson) => {
                if(lesson._id == lessonId && lesson.spacesBooked > 0){
                    lesson.spacesBooked--;
                    lesson.spaces++;
                }
            });
            this.cart = this.cart.filter(lesson => lesson.spacesBooked !== 0)
            console.log(this.cart)
            this.calculateTotal()
            this.isCartEmpty()
        },
        isInCart(lessonId) {
            return this.cart.some(item => item._id === lessonId);
        },
        async checkout(){
                // Checking for name and phone number (Validation)
              if(this.checkoutName === this.currUser.name && this.checkoutPhoneNumber === this.currUser.phone){
                this.errorCheckoutName = false;
                this.errorCheckoutPhoneNumber = false

                const newOrder = {
                    userId : this.userId,
                    name: this.checkoutName,
                    phone: this.checkoutPhoneNumber,
                    lessons : this.cart,
                    totalPrice: this.total
                }
                // Display popup animation
                this.checkoutAnimationPopup()

            try {

                // Using POST for creating order and PUT to update spaces in lessons DB
                // Using Promise.all() for parallel computation of requests
                const [orderResult, batchUpdateResult] = await Promise.all([
                    post('/orders', newOrder),
                    put('/lessons/batch-update', {
                        lessons: this.cart.map(lesson => {
                            const { spacesBooked, _id, ...restOflesson } = lesson;
                            return { _id, ...restOflesson };
                        })
                    })
                ]);

                console.log('Results:', { orderResult, batchUpdateResult });

                //  Clear cart and reset total
                this.cart = [];
                this.total = 0.00;

                //  Fetch updated lessons
                if(orderResult.orderId){
                    await this.fetchLessons();
                }else{
                    console.error("Failed to fetch lessons from Backend")
                }

            } catch (error) {
                console.error('Checkout failed:', error);
            }

            }else{
                if(this.checkoutName !== this.currUser.name){
                    this.errorCheckoutName = true

                }else if(this.checkoutPhoneNumber !== this.currUser.phone){
                    this.errorCheckoutPhoneNumber = true

                }
            }
                    
        },
        getImageUrl(imageName) {
            // Using the direct static file to serve images
            return `https://school-app-backend-zjnz.onrender.com/images/lessons/${imageName}`;
            // return `http://localhost:3000/images/lessons/${imageName}`;
            
        },
        
        handleImageError(lesson) {
            console.log(`Image failed to load: ${lesson.image}`);
            // Update the lesson's image to use default
            lesson.image = this.defaultImage;
            
            // Force Vue to update the style
            this.$forceUpdate();
        },
        async fetchLessons() {
            try {
                // Fetch lessons from backend API
                this.lessons = await get('/lessons')
                this.lessons.forEach(lesson => {
                   lesson.spacesBooked = 0; 
                });

                this.searchResults = [...this.lessons]
                console.log('Fetched lessons:', this.searchResults);

            } catch (error) {
                console.error('Error fetching lessons:', error);
            }

        }
    },
    async created() {
        await this.fetchLessons();
        this.sortLessons()
    },
    mounted() {
        this.searchResults = this.lessons;
    }
})