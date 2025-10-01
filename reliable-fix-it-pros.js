// Reliable Fix It Pros - Interactive JavaScript

// Global variables
let currentStep = 1;
let bookingData = {
    service: '',
    description: '',
    urgency: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    date: '',
    time: ''
};

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

// Initialize website functionality
function initializeWebsite() {
    // Set minimum date for booking to today
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('preferredDate');
    if (dateInput) {
        dateInput.min = today;
    }

    // Initialize mobile menu
    initializeMobileMenu();
    
    // Initialize smooth scrolling
    initializeSmoothScrolling();
    
    // Initialize contact form
    initializeContactForm();
    
    // Initialize booking modal event listeners
    initializeBookingModal();
    
    // Initialize service option listeners
    initializeServiceOptions();
    
    // Initialize urgency option listeners
    initializeUrgencyOptions();
    
    // Initialize time slot listeners
    initializeTimeSlots();
}

// Mobile menu functionality
function initializeMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }
}

// Smooth scrolling for navigation links
function initializeSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Contact form handling
function initializeContactForm() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const name = this.querySelector('input[name="name"]').value;
            const phone = this.querySelector('input[name="phone"]').value;
            const message = this.querySelector('textarea[name="message"]').value;
            
            // Basic validation
            if (!name || !phone || !message) {
                showNotification('Please fill in all required fields.', 'error');
                return;
            }
            
            if (!isValidPhone(phone)) {
                showNotification('Please enter a valid phone number.', 'error');
                return;
            }
            
            // Show loading state
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            
            // Submit to Netlify
            const formData = new FormData(this);
            
            fetch('/', {
                method: 'POST',
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams(formData).toString()
            })
            .then(() => {
                showNotification('Thank you for your message! We\'ll contact you within 30 minutes.', 'success');
                this.reset();
                
                // Track conversion event for analytics
                trackEvent('contact_form_submit', {
                    form_type: 'quick_contact'
                });
            })
            .catch((error) => {
                console.error('Error:', error);
                showNotification('There was an error sending your message. Please try again or call us directly.', 'error');
            })
            .finally(() => {
                // Reset button state
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            });
        });
    }
}

// Booking modal functionality
function initializeBookingModal() {
    const modal = document.getElementById('bookingModal');
    
    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeBookingModal();
            }
        });
    }
    
    // Close modal with escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.style.display === 'block') {
            closeBookingModal();
        }
    });
}

// Open booking modal - now redirects to lead form
function openBookingModal(preselectedService = '') {
    // Track event for analytics
    trackEvent('booking_initiated', {
        preselected_service: preselectedService || 'none'
    });
    
    // Redirect to lead form with service parameter
    let leadUrl = 'lead.html';
    if (preselectedService) {
        leadUrl += `?service=${encodeURIComponent(preselectedService)}`;
    }
    
    window.location.href = leadUrl;
}

// Close booking modal
function closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Reset booking data
        resetBookingData();
        
        // Track modal close event
        trackEvent('booking_modal_close', {
            completed_step: currentStep
        });
    }
}

// Reset booking data
function resetBookingData() {
    bookingData = {
        service: '',
        description: '',
        urgency: '',
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        address: '',
        date: '',
        time: ''
    };
    currentStep = 1;
    
    // Clear form inputs
    const inputs = document.querySelectorAll('#bookingModal input, #bookingModal textarea');
    inputs.forEach(input => {
        input.value = '';
        input.checked = false;
    });
    
    // Clear selections
    const selections = document.querySelectorAll('.service-option.selected, .time-slot.selected');
    selections.forEach(selection => {
        selection.classList.remove('selected');
    });
}

// Show specific step
function showStep(stepNumber) {
    // Hide all steps
    const steps = document.querySelectorAll('.booking-step');
    steps.forEach(step => {
        step.classList.remove('active');
    });
    
    // Show current step
    const currentStepElement = document.getElementById(`step${stepNumber}`);
    if (currentStepElement) {
        currentStepElement.classList.add('active');
    }
    
    currentStep = stepNumber;
}

// Navigate to next step
function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < 5) {
            showStep(currentStep + 1);
            
            // Track step progression
            trackEvent('booking_step_progress', {
                from_step: currentStep - 1,
                to_step: currentStep
            });
            
            // Handle final step
            if (currentStep === 5) {
                submitBooking();
            }
        }
    }
}

// Navigate to previous step
function previousStep() {
    if (currentStep > 1) {
        showStep(currentStep - 1);
        
        // Track step regression
        trackEvent('booking_step_back', {
            from_step: currentStep + 1,
            to_step: currentStep
        });
    }
}

// Validate current step
function validateCurrentStep() {
    switch (currentStep) {
        case 1:
            if (!bookingData.service) {
                showNotification('Please select a service.', 'error');
                return false;
            }
            break;
            
        case 2:
            const description = document.getElementById('projectDescription').value;
            const urgency = document.querySelector('input[name="urgency"]:checked');
            
            if (!description.trim()) {
                showNotification('Please describe your project.', 'error');
                return false;
            }
            
            if (!urgency) {
                showNotification('Please select urgency level.', 'error');
                return false;
            }
            
            bookingData.description = description;
            bookingData.urgency = urgency.value;
            break;
            
        case 3:
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const phone = document.getElementById('phone').value;
            const email = document.getElementById('email').value;
            const address = document.getElementById('address').value;
            
            if (!firstName || !lastName || !phone || !email || !address) {
                showNotification('Please fill in all contact information.', 'error');
                return false;
            }
            
            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address.', 'error');
                return false;
            }
            
            if (!isValidPhone(phone)) {
                showNotification('Please enter a valid phone number.', 'error');
                return false;
            }
            
            bookingData.firstName = firstName;
            bookingData.lastName = lastName;
            bookingData.phone = phone;
            bookingData.email = email;
            bookingData.address = address;
            break;
            
        case 4:
            const date = document.getElementById('preferredDate').value;
            const selectedTime = document.querySelector('.time-slot.selected');
            
            if (!date) {
                showNotification('Please select a preferred date.', 'error');
                return false;
            }
            
            if (!selectedTime) {
                showNotification('Please select a preferred time.', 'error');
                return false;
            }
            
            bookingData.date = date;
            bookingData.time = selectedTime.dataset.time;
            break;
    }
    
    return true;
}

// Initialize service option listeners
function initializeServiceOptions() {
    const serviceOptions = document.querySelectorAll('.service-option');
    
    serviceOptions.forEach(option => {
        option.addEventListener('click', function() {
            selectServiceOption(this);
        });
    });
}

// Select service option
function selectServiceOption(option) {
    // Remove previous selections
    const serviceOptions = document.querySelectorAll('.service-option');
    serviceOptions.forEach(opt => opt.classList.remove('selected'));
    
    // Add selection to clicked option
    option.classList.add('selected');
    bookingData.service = option.dataset.service;
    
    // Track service selection
    trackEvent('service_selected', {
        service_type: bookingData.service
    });
}

// Initialize urgency option listeners
function initializeUrgencyOptions() {
    const urgencyOptions = document.querySelectorAll('input[name="urgency"]');
    
    urgencyOptions.forEach(option => {
        option.addEventListener('change', function() {
            if (this.checked) {
                // Update parent label styling
                const labels = document.querySelectorAll('.radio-option');
                labels.forEach(label => label.classList.remove('selected'));
                
                this.closest('.radio-option').classList.add('selected');
                
                // Track urgency selection
                trackEvent('urgency_selected', {
                    urgency_level: this.value
                });
            }
        });
    });
}

// Initialize time slot listeners
function initializeTimeSlots() {
    const timeSlots = document.querySelectorAll('.time-slot');
    
    timeSlots.forEach(slot => {
        slot.addEventListener('click', function() {
            // Remove previous selections
            timeSlots.forEach(s => s.classList.remove('selected'));
            
            // Add selection to clicked slot
            this.classList.add('selected');
            
            // Track time selection
            trackEvent('time_slot_selected', {
                time_slot: this.dataset.time
            });
        });
    });
}

// Submit booking
function submitBooking() {
    // Display booking summary
    displayBookingSummary();
    
    // Simulate booking submission
    setTimeout(() => {
        // Track booking completion
        trackEvent('booking_completed', {
            service: bookingData.service,
            urgency: bookingData.urgency,
            date: bookingData.date,
            time: bookingData.time
        });
        
        // Send booking data (in real implementation, this would go to your backend)
        console.log('Booking submitted:', bookingData);
        
        // Show confirmation message
        showNotification('Booking request submitted successfully!', 'success');
        
    }, 1000);
}

// Display booking summary
function displayBookingSummary() {
    const summaryContainer = document.getElementById('bookingSummary');
    if (summaryContainer) {
        const timeSlotText = getTimeSlotText(bookingData.time);
        const urgencyText = getUrgencyText(bookingData.urgency);
        const serviceText = getServiceText(bookingData.service);
        
        summaryContainer.innerHTML = `
            <div class="summary-item">
                <strong>Service:</strong> ${serviceText}
            </div>
            <div class="summary-item">
                <strong>Customer:</strong> ${bookingData.firstName} ${bookingData.lastName}
            </div>
            <div class="summary-item">
                <strong>Phone:</strong> ${bookingData.phone}
            </div>
            <div class="summary-item">
                <strong>Email:</strong> ${bookingData.email}
            </div>
            <div class="summary-item">
                <strong>Address:</strong> ${bookingData.address}
            </div>
            <div class="summary-item">
                <strong>Preferred Date:</strong> ${formatDate(bookingData.date)}
            </div>
            <div class="summary-item">
                <strong>Preferred Time:</strong> ${timeSlotText}
            </div>
            <div class="summary-item">
                <strong>Urgency:</strong> ${urgencyText}
            </div>
        `;
    }
}

// Utility functions
function getServiceText(service) {
    const serviceNames = {
        'plumbing': 'Plumbing Repairs',
        'electrical': 'Electrical Work',
        'carpentry': 'Carpentry & Repair',
        'painting': 'Painting & Drywall',
        'maintenance': 'Home Maintenance',
        'tech': 'TV & Tech Setup'
    };
    return serviceNames[service] || service;
}

function getUrgencyText(urgency) {
    const urgencyNames = {
        'same-day': 'Same Day (+$50)',
        'next-day': 'Next Day',
        'this-week': 'This Week',
        'flexible': 'I\'m Flexible'
    };
    return urgencyNames[urgency] || urgency;
}

function getTimeSlotText(timeSlot) {
    const timeSlots = {
        '8-10': '8:00 AM - 10:00 AM',
        '10-12': '10:00 AM - 12:00 PM',
        '12-14': '12:00 PM - 2:00 PM',
        '14-16': '2:00 PM - 4:00 PM',
        '16-18': '4:00 PM - 6:00 PM'
    };
    return timeSlots[timeSlot] || timeSlot;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 1rem;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Add animation styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.25rem;
                cursor: pointer;
                padding: 0;
                margin: 0;
                line-height: 1;
            }
            .notification-message {
                flex: 1;
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Analytics tracking
function trackEvent(eventName, parameters = {}) {
    // Google Analytics 4 tracking
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, parameters);
    }
    
    // Facebook Pixel tracking
    if (typeof fbq !== 'undefined') {
        fbq('track', 'CustomEvent', {
            event_name: eventName,
            ...parameters
        });
    }
    
    // Console log for debugging
    console.log('Event tracked:', eventName, parameters);
}

// Scroll animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.service-card, .testimonial, .about-feature');
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// Initialize scroll animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add CSS for scroll animations
    if (!document.querySelector('#scroll-animation-styles')) {
        const styles = document.createElement('style');
        styles.id = 'scroll-animation-styles';
        styles.textContent = `
            .service-card,
            .testimonial,
            .about-feature {
                opacity: 0;
                transform: translateY(30px);
                transition: opacity 0.6s ease-out, transform 0.6s ease-out;
            }
            
            .service-card.animate-in,
            .testimonial.animate-in,
            .about-feature.animate-in {
                opacity: 1;
                transform: translateY(0);
            }
        `;
        document.head.appendChild(styles);
    }
    
    setTimeout(initializeScrollAnimations, 100);
});

// Performance optimization
function optimizeImages() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        // Add loading="lazy" if not present
        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }
        
        // Add error handling
        img.addEventListener('error', function() {
            console.warn('Failed to load image:', this.src);
            // You could set a fallback image here
            // this.src = 'path/to/fallback-image.jpg';
        });
    });
}

// Initialize performance optimizations
document.addEventListener('DOMContentLoaded', optimizeImages);

// SEO and accessibility enhancements
function enhanceAccessibility() {
    // Add skip navigation link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: #000;
        color: #fff;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 9999;
        transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', function() {
        this.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main content landmark
    const mainContent = document.querySelector('.hero');
    if (mainContent) {
        mainContent.id = 'main-content';
    }
}

// Initialize accessibility enhancements
document.addEventListener('DOMContentLoaded', enhanceAccessibility);

// Cookie consent (basic implementation)
function initializeCookieConsent() {
    if (!localStorage.getItem('cookieConsent')) {
        const banner = document.createElement('div');
        banner.innerHTML = `
            <div style="position: fixed; bottom: 0; left: 0; right: 0; background: #1F2937; color: white; padding: 1rem; z-index: 9999; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                <span>We use cookies to improve your experience. By using our site, you agree to our cookie policy.</span>
                <button onclick="acceptCookies()" style="background: #FF6B35; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">Accept</button>
            </div>
        `;
        document.body.appendChild(banner);
    }
}

function acceptCookies() {
    localStorage.setItem('cookieConsent', 'true');
    const banner = document.querySelector('[style*="position: fixed; bottom: 0"]');
    if (banner) {
        banner.remove();
    }
}

// Initialize cookie consent
document.addEventListener('DOMContentLoaded', initializeCookieConsent);

// Export functions for global access
window.openBookingModal = openBookingModal;
window.closeBookingModal = closeBookingModal;
window.nextStep = nextStep;
window.previousStep = previousStep;
window.acceptCookies = acceptCookies;