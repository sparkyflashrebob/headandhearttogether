/**
 * Head & Heart Together - Client-side Interactive Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Drawer Navigation Control
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
      
      // Accessibility: toggle aria-expanded
      const isExpanded = menuToggle.classList.contains('active');
      menuToggle.setAttribute('aria-expanded', isExpanded);
    });

    // Close menu when clicking on any link
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 2. Sticky Header Styling on Scroll
  const header = document.querySelector('header');
  if (header) {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        header.classList.add('header-active');
      } else {
        header.classList.remove('header-active');
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check in case of page refresh down-scroll
  }

  // 3. Navigation Highlighting Based on Current Subpage Filename
  const currentPath = window.location.pathname;
  const navItems = document.querySelectorAll('.nav-links a, .footer-links a');
  
  navItems.forEach(item => {
    const href = item.getAttribute('href');
    if (!href) return;
    
    // Extract filename from href (e.g. "about.html" or "contact.html")
    const hrefFilename = href.split('/').pop() || 'index.html';
    const pathFilename = currentPath.split('/').pop() || 'index.html';
    
    if (hrefFilename === pathFilename) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // 4. Contact Form Simulated Submission and Verification
  const contactForm = document.getElementById('contactForm');
  const formFeedback = document.getElementById('formFeedback');

  if (contactForm && formFeedback) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Submit';
      
      // Basic client-side validation check
      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const messageInput = document.getElementById('message');
      
      if (!nameInput.value.trim() || !emailInput.value.trim() || !messageInput.value.trim()) {
        formFeedback.className = 'form-feedback error';
        formFeedback.textContent = 'Please fill out all required fields.';
        formFeedback.style.display = 'block';
        return;
      }

      // Visual feedback loading state
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending Message...';
      }

      // Simulate network request latency (1 sec)
      setTimeout(() => {
        formFeedback.className = 'form-feedback success';
        formFeedback.textContent = 'Thank you for reaching out! We will contact you soon.';
        formFeedback.style.display = 'block';
        
        // Reset the form values
        contactForm.reset();
        
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }

        // Hide notification after 7 seconds
        setTimeout(() => {
          formFeedback.style.display = 'none';
        }, 7000);
      }, 1000);
    });
  }
});
