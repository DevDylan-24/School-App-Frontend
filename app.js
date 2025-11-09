new Vue({
   el: '#app',
    data: {
        searchQuery: '',
        selectedSubjects: [],
        selectedLocations: [],
        selectedRatings: [],
        priceMin: null,
        priceMax: null,
        cart: [],
        sidebarCollapsed: false,
        lessons: [
            // Dummy data for lessons
            {
                id: 1,
                title: 'Advanced Mathematics',
                subject: 'Mathematics',
                tutor: 'Dr. Sarah Johnson',
                location: 'North Campus',
                schedule: 'Mon & Wed, 4:00 PM',
                duration: '1.5 hours',
                price: 45,
                rating: 4.9,
                reviews: 127,
                spaces: 3,
                image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop'
            },
            {
                id: 2,
                title: 'English Literature',
                subject: 'English',
                tutor: 'Prof. Michael Chen',
                location: 'South Campus',
                schedule: 'Tue & Thu, 3:30 PM',
                duration: '2 hours',
                price: 40,
                rating: 4.8,
                reviews: 93,
                spaces: 8,
                image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop'
            },
            {
                id: 3,
                title: 'Physics & Lab',
                subject: 'Science',
                tutor: 'Dr. Emily Rodriguez',
                location: 'Science Block',
                schedule: 'Wed & Fri, 4:30 PM',
                duration: '2 hours',
                price: 50,
                rating: 4.7,
                reviews: 81,
                spaces: 5,
                image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop'
            },
            {
                id: 4,
                title: 'Spanish Conversation',
                subject: 'Languages',
                tutor: 'Maria Garcia',
                location: 'Language Lab',
                schedule: 'Mon & Thu, 3:00 PM',
                duration: '1 hour',
                price: 35,
                rating: 4.9,
                reviews: 156,
                spaces: 12,
                image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop'
            },
            {
                id: 5,
                title: 'Computer Programming',
                subject: 'Technology',
                tutor: 'James Wilson',
                location: 'Computer Lab',
                schedule: 'Tue & Fri, 4:00 PM',
                duration: '2 hours',
                price: 55,
                rating: 4.8,
                reviews: 104,
                spaces: 2,
                image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop'
            },
            {
                id: 6,
                title: 'Art & Design',
                subject: 'Arts',
                tutor: 'Lisa Anderson',
                location: 'Art Studio',
                schedule: 'Wed, 3:30 PM',
                duration: '2.5 hours',
                price: 42,
                rating: 4.9,
                reviews: 89,
                spaces: 6,
                image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop'
            },
            {
                id: 7,
                title: 'Chemistry Fundamentals',
                subject: 'Science',
                tutor: 'Dr. Robert Taylor',
                location: 'Science Block',
                schedule: 'Mon & Wed, 5:00 PM',
                duration: '1.5 hours',
                price: 48,
                rating: 4.6,
                reviews: 72,
                spaces: 7,
                image: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=400&h=300&fit=crop'
            },
            {
                id: 8,
                title: 'Music Theory',
                subject: 'Arts',
                tutor: 'David Martinez',
                location: 'Music Room',
                schedule: 'Tue & Thu, 4:30 PM',
                duration: '1 hour',
                price: 38,
                rating: 4.7,
                reviews: 65,
                spaces: 10,
                image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop'
            },
            {
                id: 9,
                title: 'French Language',
                subject: 'Languages',
                tutor: 'Sophie Laurent',
                location: 'Language Lab',
                schedule: 'Wed & Fri, 3:00 PM',
                duration: '1.5 hours',
                price: 40,
                rating: 4.8,
                reviews: 98,
                spaces: 4,
                image: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=400&h=300&fit=crop'
            },
            {
                id: 10,
                title: 'Biology & Life Sciences',
                subject: 'Science',
                tutor: 'Dr. Amanda Lee',
                location: 'Bio Lab',
                schedule: 'Mon & Thu, 4:00 PM',
                duration: '2 hours',
                price: 46,
                rating: 4.9,
                reviews: 112,
                spaces: 8,
                image: 'https://images.unsplash.com/photo-1530213786676-41ad9f7736f6?w=400&h=300&fit=crop'
            },
            {
                id: 11,
                title: 'Creative Writing',
                subject: 'English',
                tutor: 'Rebecca Stone',
                location: 'South Campus',
                schedule: 'Tue, 3:30 PM',
                duration: '2 hours',
                price: 37,
                rating: 4.7,
                reviews: 76,
                spaces: 15,
                image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop'
            },
            {
                id: 12,
                title: 'Web Development',
                subject: 'Technology',
                tutor: 'Alex Kumar',
                location: 'Computer Lab',
                schedule: 'Wed & Fri, 5:00 PM',
                duration: '2 hours',
                price: 52,
                rating: 4.8,
                reviews: 91,
                spaces: 6,
                image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=400&h=300&fit=crop'
            }
        ],
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
        toggleSidebar() {
            this.sidebarCollapsed = !this.sidebarCollapsed;
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
        }
    },
    mounted() {
        this.filteredLessons = this.lessons;
    }
})