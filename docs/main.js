// Year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Gentle reveal on scroll (skipped when reduced motion is requested)
if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.section').forEach((el) => { el.classList.add('reveal'); io.observe(el); });
}
