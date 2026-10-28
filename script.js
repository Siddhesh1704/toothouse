
const $ = (id) => document.getElementById(id);

function setText(id, value) {
  const el = $(id);
  if (el) el.textContent = value;
}

function phoneLink(phone) {
  return "tel:" + phone.replace(/[^\d+]/g, "");
}

function whatsappLink(
  message = "Hello Toothouse, I would like to book a dental appointment."
) {
  return `https://wa.me/${TOOTHOUSE.whatsapp}?text=${encodeURIComponent(message)}`;
}

// Build the appointment message using the current form fields
function appointmentMessage() {
  const name = $("patientName")?.value.trim() || "";
  const phone = $("patientPhone")?.value.trim() || "";
  const email = $("patientEmail")?.value.trim() || "";
  const service = $("appointmentService")?.value || "";
  const problem = $("patientMessage")?.value.trim() || "";

  return `Hello Toothouse, I would like to book a dental home visit.

Patient Name: ${name || "Not provided"}
Phone: ${phone || "Not provided"}
Email: ${email || "Not provided"}
Dental Service: ${service || "Not specified"}
Problem / Message: ${problem || "Not provided"}

Please contact me to confirm the appointment.`;
}

function setupClinicInfo() {
  setText("address", TOOTHOUSE.address);
  setText("phone", TOOTHOUSE.phone);
  setText("email", TOOTHOUSE.email);
  setText("timings", TOOTHOUSE.timings);
  setText("footerPhone", TOOTHOUSE.phone);
  setText("footerEmail", TOOTHOUSE.email);
  setText("footerAddress", TOOTHOUSE.address);
  setText("year", new Date().getFullYear());

  ["heroCall", "contactCall", "footerPhone"].forEach((id) => {
    const el = $(id);
    if (el) el.href = phoneLink(TOOTHOUSE.phone);
  });

  [
    "heroWhatsApp",
    "contactWhatsApp",
    "footerWhatsApp",
    "floatingWhatsApp"
  ].forEach((id) => {
    const el = $(id);
    if (el) {
      el.href = whatsappLink();
      el.target = "_blank";
      el.rel = "noopener noreferrer";
    }
  });

  // WhatsApp booking button is handled separately in setupBooking()
  const directions = $("directions");
  if (directions) {
    directions.href = TOOTHOUSE.mapsUrl;
    directions.target = "_blank";
    directions.rel = "noopener noreferrer";
  }

  const mapFrame = $("mapFrame");
  if (mapFrame) {
    mapFrame.src =
      `https://www.google.com/maps?q=${encodeURIComponent(TOOTHOUSE.address)}&output=embed`;
  }
}


function renderServices() {
  const grid = $("serviceGrid");
  const select = $("appointmentService");

  if (grid) {
    grid.innerHTML = "";

    TOOTHOUSE.services.forEach(([name, description, icon]) => {
      const card = document.createElement("article");
      card.className = "service-card reveal";

      card.innerHTML = `
        <div class="service-icon">
          <img
            src="${icon}"
            alt="${name}"
            class="service-icon-img"
            loading="lazy"
          >
        </div>
        <h3>${name}</h3>
        ${description ? `<p>${description}</p>` : ""}
      `;

      grid.appendChild(card);
    });
  }

  if (select && select.options.length <= 1) {
    TOOTHOUSE.services.forEach(([name]) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      select.appendChild(option);
    });
  }
}


function renderFaqs() {
  const list = $("faqList");
  if (!list) return;

  TOOTHOUSE.faqs.forEach(([question, answer]) => {
    const item = document.createElement("div");
    item.className = "faq-item";
    item.innerHTML = `
      <button class="faq-question" aria-expanded="false">
        ${question}<span>+</span>
      </button>
      <div class="faq-answer"><p>${answer}</p></div>
    `;

    list.appendChild(item);

    const button = item.querySelector(".faq-question");

    button.addEventListener("click", () => {
      const open = item.classList.toggle("open");
      button.setAttribute("aria-expanded", String(open));
      button.querySelector("span").textContent = open ? "−" : "+";
    });
  });
}

function showToast(message) {
  const toast = $("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => toast.classList.remove("show"), 3500);
}

function validateBooking() {
  const name = $("patientName");
  const phone = $("patientPhone");
  const message = $("formMessage");

  if (!name || !phone) return false;

  if (!name.value.trim()) {
    if (message) {
      message.textContent = "Please enter the patient's name.";
      message.style.color = "#d93025";
    }
    name.focus();
    return false;
  }

  if (!/^[0-9+\-\s()]{8,18}$/.test(phone.value.trim())) {
    if (message) {
      message.textContent = "Please enter a valid phone number.";
      message.style.color = "#d93025";
    }
    phone.focus();
    return false;
  }

  if (message) message.textContent = "";
  return true;
}

function setupBooking() {
  const form = $("bookingForm");
  const whatsappButton = $("formWhatsApp");

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!validateBooking()) return;

      const message = $("formMessage");
      if (message) {
        message.textContent =
          "Your details are ready. Please use Book via WhatsApp to send your request.";
        message.style.color = "#128C7E";
      }

      showToast("Please send your appointment request via WhatsApp.");
    });
  }

  if (whatsappButton) {
    // Prevent any other default action from interfering
    whatsappButton.addEventListener("click", (event) => {
      event.preventDefault();

      if (!validateBooking()) return;

      const url = whatsappLink(appointmentMessage());

      // Open WhatsApp with the appointment details pre-filled
      const whatsappWindow = window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );

      if (!whatsappWindow) {
        // Fallback if the browser blocks opening a new tab
        window.location.href = url;
      }

      const message = $("formMessage");
      if (message) {
        message.textContent =
          "WhatsApp opened with your appointment details. Press Send in WhatsApp to submit your request.";
        message.style.color = "#128C7E";
      }
    });
  }
}

function setupMenu() {
  const toggle = $("menuToggle");
  const nav = $("navLinks");

  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.textContent = open ? "×" : "☰";
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "☰";
    });
  });
}

function setupReveal() {
  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach((el) => {
      el.classList.add("visible");
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll(".reveal").forEach((el) => {
    observer.observe(el);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupClinicInfo();
  renderServices();
  renderFaqs();
  setupBooking();
  setupMenu();
  setupReveal();
  // setupStatsCarousel();
  setupCounters()
});

// function setupStatsCarousel() {
//   const track = document.querySelector(".stats-track");

//   if (!track || track.dataset.cloned === "true") return;

//   track.innerHTML += track.innerHTML;
//   track.dataset.cloned = "true";
// }


function setupCounters() {
  const counters = document.querySelectorAll(".counter");
  if (!counters.length) return;

  const animateCounter = (counter) => {
    if (counter.dataset.animated === "true") return;
    counter.dataset.animated = "true";

    const target = Number(counter.dataset.target);
    const suffix = counter.dataset.suffix || "";
    const duration = 4000; // 4 seconds for slower counting
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth ease-out animation
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(easedProgress * target);

      counter.textContent =
        currentValue.toLocaleString("en-IN") + suffix;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target.toLocaleString("en-IN") + suffix;
      }
    }

    requestAnimationFrame(updateCounter);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => observer.observe(counter));
}
