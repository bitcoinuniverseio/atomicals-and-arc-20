(() => {
  const copy = async (button) => {
    const value = button.dataset.copy;
    if (!value) return;

    const original = button.textContent;
    try {
      await navigator.clipboard.writeText(value);
      button.textContent = "Copied";
    } catch {
      button.textContent = "Select text";
    }

    window.setTimeout(() => {
      button.textContent = original;
    }, 1200);
  };

  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", () => copy(button));
  });
})();
