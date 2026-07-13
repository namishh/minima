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

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initTooltips();
  initAccordion();
});
