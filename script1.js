/* ==========================================================================
   Blender Masterclass – Freelance Edition
   script.js
   --------------------------------------------------------------------------
   Vanilla JS only. Handles:
   1. Sticky navbar shadow on scroll
   2. Mobile hamburger menu open/close
   3. Smooth scroll + auto-close menu on link click
   4. Scroll-triggered fade-in animations (IntersectionObserver)
   ========================================================================== */

/* ---------------------------------------------------------------------
   REPLACE HERE: Set this to your own WhatsApp number (country code + number,
   digits only, no +, spaces, or dashes). This is the number the contact
   form's generated message gets sent to.
   --------------------------------------------------------------------- */
const OWNER_WHATSAPP_NUMBER = '916297179352';

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------------------
     1. Navbar shadow on scroll
     --------------------------------------------------------------------- */
  const navbar = document.getElementById('navbar');

  const handleNavbarScroll = () => {
    if (window.scrollY > 12) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll(); // run once on load

  /* ---------------------------------------------------------------------
     2. Mobile hamburger menu
     --------------------------------------------------------------------- */
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');

  const toggleMenu = () => {
    const isOpen = navMenu.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  hamburger.addEventListener('click', toggleMenu);

  /* ---------------------------------------------------------------------
     3. Close mobile menu when a nav link is clicked
        (smooth scrolling itself is handled by CSS `scroll-behavior: smooth`)
     --------------------------------------------------------------------- */
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('open')) {
        toggleMenu();
      }
    });
  });

  /* ---------------------------------------------------------------------
     4. Scroll-triggered fade-in animations
     --------------------------------------------------------------------- */
  const fadeElements = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // animate once
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    fadeElements.forEach((el) => observer.observe(el));
  } else {
    // Fallback for very old browsers without IntersectionObserver support
    fadeElements.forEach((el) => el.classList.add('visible'));
  }

  /* ---------------------------------------------------------------------
     5. Contact form → generates a WhatsApp message and opens wa.me
        There is no backend here: the browser builds the message text and
        hands it straight to WhatsApp, which the user then sends themselves.
     --------------------------------------------------------------------- */
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    const fields = {
      fullName: document.getElementById('fullName'),
      state: document.getElementById('state'),
      experience: document.getElementById('experience'),
      email: document.getElementById('email'),
      phone: document.getElementById('phone'),
    };

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[6-9]\d{9}$/; // 10-digit Indian mobile number

    // Clears the error state on a single field
    const clearFieldError = (field) => {
      field.classList.remove('field-invalid');
      const errorEl = contactForm.querySelector(`[data-error-for="${field.id}"]`);
      if (errorEl) errorEl.classList.remove('visible');
    };

    // Flags a single field as invalid and shows its message
    const setFieldError = (field) => {
      field.classList.add('field-invalid');
      const errorEl = contactForm.querySelector(`[data-error-for="${field.id}"]`);
      if (errorEl) errorEl.classList.add('visible');
    };

    // Remove the error state as soon as the user starts fixing a field
    Object.values(fields).forEach((field) => {
      field.addEventListener('input', () => clearFieldError(field));
      field.addEventListener('change', () => clearFieldError(field));
    });

    const validateForm = () => {
      let isValid = true;

      if (!fields.fullName.value.trim()) {
        setFieldError(fields.fullName);
        isValid = false;
      }

      if (!fields.state.value) {
        setFieldError(fields.state);
        isValid = false;
      }

      if (!fields.experience.value) {
        setFieldError(fields.experience);
        isValid = false;
      }

      if (!emailPattern.test(fields.email.value.trim())) {
        setFieldError(fields.email);
        isValid = false;
      }

      if (!phonePattern.test(fields.phone.value.trim())) {
        setFieldError(fields.phone);
        isValid = false;
      }

      return isValid;
    };

    // Builds the pre-filled WhatsApp message from the form values
    const buildWhatsappMessage = () => {
      const lines = [
        'Hi, I am interested in the Blender Masterclass – Freelance Edition.',
        '',
        `Name: ${fields.fullName.value.trim()}`,
        `State: ${fields.state.value}`,
        `Email: ${fields.email.value.trim()}`,
        `Phone: ${fields.phone.value.trim()}`,
        `Blender Experience: ${fields.experience.value}`,
      ];
      return lines.join('\n');
    };

    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();

      if (!validateForm()) {
        // Focus the first invalid field so the user can fix it right away
        const firstInvalid = contactForm.querySelector('.field-invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const message = buildWhatsappMessage();
      const whatsappUrl = `https://wa.me/${OWNER_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

      // Open WhatsApp (web or app) in a new tab with the message pre-filled
      window.open(whatsappUrl, '_blank', 'noopener');

      contactForm.reset();
    });
  }

});


/* ==========================================================================
   Customer Reviews Carousel
   Manual navigation only — no autoplay. Prev/Next buttons + pagination dots.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('reviewsTrack');
  const prevBtn = document.getElementById('prevSlideBtn');
  const nextBtn = document.getElementById('nextSlideBtn');
  const dotsContainer = document.getElementById('carouselDots');

  if (!track || !prevBtn || !nextBtn || !dotsContainer) return;

  const slides = Array.from(track.children);
  const totalSlides = slides.length;
  let currentIndex = 0;

  // Build one dot per slide
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.classList.add('carousel-dot');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.children);

  const updateCarousel = () => {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === currentIndex));

    // Disable Prev on the first slide and Next on the last — no looping
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === totalSlides - 1;
  };

  const goToSlide = (index) => {
    currentIndex = Math.max(0, Math.min(index, totalSlides - 1));
    updateCarousel();
  };

  prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
  nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

  updateCarousel(); // set initial state (Prev disabled on slide 1, is-active on slide 1)
});