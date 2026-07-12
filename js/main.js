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

  // 4. Form Submission Control (Web3 Forms Integration)
  const formsToHandle = [
    { formId: 'contactForm', feedbackId: 'formFeedback' },
    { formId: 'subscribeForm', feedbackId: 'subscribeFeedback' }
  ];

  formsToHandle.forEach(({ formId, feedbackId }) => {
    const form = document.getElementById(formId);
    const feedback = document.getElementById(feedbackId);

    if (form && feedback) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Submit';

        // Retrieve inputs inside the submitted form
        const requiredInputs = form.querySelectorAll('[required]');
        let isValid = true;

        requiredInputs.forEach(input => {
          if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error');
          } else {
            input.classList.remove('error');
          }
        });

        if (!isValid) {
          feedback.className = 'form-feedback error';
          feedback.textContent = 'Please fill out all required fields.';
          feedback.style.display = 'block';
          return;
        }

        // Show loading state
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = formId === 'subscribeForm' ? 'Subscribing...' : 'Sending Message...';
        }

        // Prepare Web3 Forms JSON payload
        const formData = new FormData(form);
        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);

        fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: json
        })
          .then(async (response) => {
            const result = await response.json();
            if (response.status === 200) {
              feedback.className = 'form-feedback success';
              feedback.textContent = result.message || 'Submitted successfully!';
              feedback.style.display = 'block';
              form.reset();
            } else {
              feedback.className = 'form-feedback error';
              feedback.textContent = result.message || 'Something went wrong. Please try again.';
              feedback.style.display = 'block';
            }
          })
          .catch((error) => {
            console.error('Submission error:', error);
            feedback.className = 'form-feedback error';
            feedback.textContent = 'Network error. Please try again later.';
            feedback.style.display = 'block';
          })
          .finally(() => {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = originalBtnText;
            }
            // Hide feedback after 7 seconds
            setTimeout(() => {
              feedback.style.display = 'none';
            }, 7000);
          });
      });
    }
  });
});
