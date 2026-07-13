const initTabs = () => {
  document.querySelectorAll("[data-tabs]").forEach((tabs) => {
    const triggers = tabs.querySelectorAll("[data-tabs-trigger]");
    const panels = tabs.querySelectorAll("[data-tabs-panel]");

    triggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const target = trigger.dataset.tab;

        triggers.forEach((t) => {
          t.classList.toggle("is-active", t === trigger);
          t.setAttribute("aria-selected", t === trigger ? "true" : "false");
        });

        panels.forEach((panel) => {
          const match = panel.dataset.tab === target;
          panel.classList.toggle("is-active", match);
          panel.hidden = !match;
        });

        tabs.dispatchEvent(
          new CustomEvent("tabs:change", {
            detail: { tab: target },
            bubbles: true,
          }),
        );
      });
    });
  });
};

function initTooltips() {
  document.querySelectorAll("[data-tooltip]").forEach((wrapper) => {
    wrapper.classList.add("tooltip-wrapper");
    const text = wrapper.dataset.tooltip;

    const bubble = document.createElement("span");
    bubble.className = "tooltip-bubble";
    bubble.textContent = text;
    wrapper.appendChild(bubble);

    wrapper.addEventListener("mouseenter", () =>
      bubble.classList.add("is-visible"),
    );
    wrapper.addEventListener("mouseleave", () =>
      bubble.classList.remove("is-visible"),
    );
    wrapper.addEventListener("focusin", () =>
      bubble.classList.add("is-visible"),
    );
    wrapper.addEventListener("focusout", () =>
      bubble.classList.remove("is-visible"),
    );
  });
}

function initAccordion() {
  document.querySelectorAll("[data-accordion-trigger]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const item = trigger.closest("[data-accordion-item]");
      const panel = item.querySelector("[data-accordion-panel]");
      const isOpen = item.classList.contains("is-open");

      const accordion = item.closest("[data-accordion]");
      if (accordion && accordion.hasAttribute("data-accordion-single")) {
        accordion
          .querySelectorAll("[data-accordion-item].is-open")
          .forEach((openItem) => {
            if (openItem !== item) closeAccordionItem(openItem);
          });
      }

      isOpen ? closeAccordionItem(item) : openAccordionItem(item);
    });
  });
}

function openAccordionItem(item) {
  const trigger = item.querySelector("[data-accordion-trigger]");
  const panel = item.querySelector("[data-accordion-panel]");

  item.classList.add("is-open");
  trigger.setAttribute("aria-expanded", "true");
  panel.hidden = false;
}

function closeAccordionItem(item) {
  const trigger = item.querySelector("[data-accordion-trigger]");
  const panel = item.querySelector("[data-accordion-panel]");

  item.classList.remove("is-open");
  trigger.setAttribute("aria-expanded", "false");
  panel.hidden = true;
}

function showToast(message, { type = "default", duration = 3500 } = {}) {
  const container = document.querySelector("[data-toast-container]");
  if (!container) {
    console.warn("No [data-toast-container] found in the DOM.");
    return;
  }

  const toast = document.createElement("div");
  toast.className = `toast${type !== "default" ? ` toast-${type}` : ""}`;
  toast.innerHTML = `
    <span class="toast-message"></span>
    <button class="toast-close" aria-label="Close">&times;</button>
  `;
  toast.querySelector(".toast-message").textContent = message;
  container.appendChild(toast);

  function remove() {
    toast.remove();
  }

  toast.querySelector(".toast-close").addEventListener("click", remove);

  if (duration > 0) {
    setTimeout(remove, duration);
  }

  return toast;
}

function initPopovers() {
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-popover-trigger]");
    const openPopovers = document.querySelectorAll(
      "[data-popover-panel]:not([hidden])",
    );

    if (trigger) {
      const wrapper = trigger.closest("[data-popover]");
      const panel = wrapper.querySelector("[data-popover-panel]");
      const isOpen = !panel.hidden;

      openPopovers.forEach((p) => {
        if (p !== panel) p.hidden = true;
      });
      panel.hidden = isOpen;
      return;
    }

    openPopovers.forEach((panel) => {
      const wrapper = panel.closest("[data-popover]");
      if (!wrapper.contains(e.target)) panel.hidden = true;
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    document
      .querySelectorAll("[data-popover-panel]:not([hidden])")
      .forEach((p) => {
        p.hidden = true;
      });
  });
}

function initDialogs() {
  document.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-dialog-open]");
    if (opener) {
      const overlay = document.getElementById(opener.dataset.dialogOpen);
      if (overlay) openDialog(overlay);
    }

    const closer = e.target.closest("[data-dialog-close]");
    if (closer) {
      const overlay = closer.closest("[data-dialog-overlay]");
      if (overlay) closeDialog(overlay);
    }

    if (e.target.hasAttribute("data-dialog-overlay")) {
      closeDialog(e.target);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const openDialogs = document.querySelectorAll(
      "[data-dialog-overlay]:not([hidden])",
    );
    const last = openDialogs[openDialogs.length - 1];
    if (last) closeDialog(last);
  });
}

function openDialog(overlay) {
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
  const focusable = overlay.querySelector(
    "button, [href], input, select, textarea",
  );
  if (focusable) focusable.focus();

  overlay.dispatchEvent(new CustomEvent("dialog:open", { bubbles: true }));
}

function closeDialog(overlay) {
  overlay.hidden = true;
  document.body.style.overflow = "";
  overlay.dispatchEvent(new CustomEvent("dialog:close", { bubbles: true }));
}

document.addEventListener("DOMContentLoaded", () => {
  initDialogs();
  initTabs();
  initPopovers();
  initTooltips();
  initAccordion();
});
