const initTabs = () => {
  document.querySelectorAll("[data-tabs]").forEach((tabs) => {
    const triggers = tabs.querySelectorAll(
      ":scope > .tabs-list > [data-tabs-trigger]",
    );
    const panels = tabs.querySelectorAll(":scope > [data-tabs-panel]");

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

function initSelects() {
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-select-trigger]");
    const option = e.target.closest(".select-option");
    const openSelects = document.querySelectorAll(".select.is-open");

    if (trigger) {
      const select = trigger.closest("[data-select]");
      const isOpen = select.classList.contains("is-open");
      openSelects.forEach((s) => {
        if (s !== select) closeSelect(s);
      });
      isOpen ? closeSelect(select) : openSelect(select);
      return;
    }

    if (option && !option.classList.contains("is-disabled")) {
      const select = option.closest("[data-select]");
      selectOption(select, option);
      closeSelect(select);
      return;
    }

    openSelects.forEach((s) => {
      if (!s.contains(e.target)) closeSelect(s);
    });
  });
}

function openSelect(select) {
  const trigger = select.querySelector("[data-select-trigger]");
  const options = select.querySelector("[data-select-options]");
  select.classList.add("is-open");
  options.hidden = false;
  trigger.setAttribute("aria-expanded", "true");
}

function closeSelect(select) {
  const trigger = select.querySelector("[data-select-trigger]");
  const options = select.querySelector("[data-select-options]");
  select.classList.remove("is-open");
  options.hidden = true;
  trigger.setAttribute("aria-expanded", "false");
}

function selectOption(select, option) {
  const valueEl = select.querySelector("[data-select-value]");
  select
    .querySelectorAll(".select-option")
    .forEach((o) => o.classList.remove("is-selected"));
  option.classList.add("is-selected");
  valueEl.textContent = option.textContent.trim();
  select.dataset.value = option.dataset.value;

  select.dispatchEvent(
    new CustomEvent("select:change", {
      detail: { value: option.dataset.value, label: option.textContent.trim() },
      bubbles: true,
    }),
  );
}

function initDatepickers() {
  document.querySelectorAll("[data-datepicker]").forEach((datepicker) => {
    const input = datepicker.querySelector("[data-datepicker-input]");
    const calendar = datepicker.querySelector("[data-datepicker-calendar]");
    const title = datepicker.querySelector("[data-datepicker-title]");
    const daysGrid = datepicker.querySelector("[data-datepicker-days]");
    const prevBtn = datepicker.querySelector("[data-datepicker-prev]");
    const nextBtn = datepicker.querySelector("[data-datepicker-next]");

    let viewDate = new Date();
    let selectedDate = null;

    function formatDate(date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }

    function dayButton(date, isOutside, todayStr, selectedStr) {
      const dateStr = formatDate(date);
      const classes = ["datepicker-day"];
      if (isOutside) classes.push("is-outside");
      if (dateStr === todayStr) classes.push("is-today");
      if (dateStr === selectedStr) classes.push("is-selected");
      return `<button type="button" class="${classes.join(" ")}" data-date="${dateStr}">${date.getDate()}</button>`;
    }

    function render() {
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      title.textContent = `${monthNames[month]} ${year}`;

      const firstDay = new Date(year, month, 1);
      const startOffset = firstDay.getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const daysInPrevMonth = new Date(year, month, 0).getDate();
      const today = new Date();
      const todayStr = formatDate(today);
      const selectedStr = selectedDate ? formatDate(selectedDate) : null;

      let html = "";
      for (let i = startOffset; i > 0; i--) {
        html += dayButton(
          new Date(year, month - 1, daysInPrevMonth - i + 1),
          true,
          todayStr,
          selectedStr,
        );
      }
      for (let day = 1; day <= daysInMonth; day++) {
        html += dayButton(
          new Date(year, month, day),
          false,
          todayStr,
          selectedStr,
        );
      }
      const totalCells = startOffset + daysInMonth;
      const trailing = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
      for (let day = 1; day <= trailing; day++) {
        html += dayButton(
          new Date(year, month + 1, day),
          true,
          todayStr,
          selectedStr,
        );
      }
      daysGrid.innerHTML = html;
    }

    input.addEventListener("click", () => {
      const isHidden = calendar.hidden;
      calendar.hidden = !isHidden;
      if (isHidden) render();
    });

    document.addEventListener("click", (e) => {
      if (!datepicker.contains(e.target)) calendar.hidden = true;
    });

    prevBtn.addEventListener("click", () => {
      viewDate.setMonth(viewDate.getMonth() - 1);
      render();
    });
    nextBtn.addEventListener("click", () => {
      viewDate.setMonth(viewDate.getMonth() + 1);
      render();
    });

    daysGrid.addEventListener("click", (e) => {
      const dayBtn = e.target.closest(".datepicker-day");
      if (!dayBtn || dayBtn.classList.contains("is-disabled")) return;
      selectedDate = new Date(dayBtn.dataset.date);
      input.value = dayBtn.dataset.date;
      calendar.hidden = true;

      datepicker.dispatchEvent(
        new CustomEvent("datepicker:change", {
          detail: { date: dayBtn.dataset.date },
          bubbles: true,
        }),
      );
    });

    render();
  });
}

function initTimepickers() {
  document.querySelectorAll("[data-timepicker]").forEach((timepicker) => {
    const input = timepicker.querySelector("[data-timepicker-input]");
    const panel = timepicker.querySelector("[data-timepicker-panel]");

    input.addEventListener("click", () => {
      panel.hidden = !panel.hidden;
    });
    document.addEventListener("click", (e) => {
      if (!timepicker.contains(e.target)) panel.hidden = true;
    });

    panel.addEventListener("click", (e) => {
      const item = e.target.closest(".timepicker-item");
      if (!item) return;
      const col = item.closest("[data-timepicker-col]");
      col
        .querySelectorAll(".timepicker-item")
        .forEach((i) => i.classList.remove("is-selected"));
      item.classList.add("is-selected");
      updateTimeValue(timepicker, input);
    });

    updateTimeValue(timepicker, input);
  });
}

function updateTimeValue(timepicker, input) {
  const cols = timepicker.querySelectorAll("[data-timepicker-col]");
  const parts = [];
  cols.forEach((col) => {
    const selected = col.querySelector(".timepicker-item.is-selected");
    if (selected) parts.push(selected.dataset.value);
  });
  if (parts.length === cols.length) {
    const value = `${parts[0]}:${parts[1]} ${parts[2] || ""}`.trim();
    input.value = value;
    timepicker.dispatchEvent(
      new CustomEvent("timepicker:change", {
        detail: { value, parts },
        bubbles: true,
      }),
    );
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initDialogs();
  initTabs();
  initPopovers();
  initTooltips();
  initAccordion();
  initSelects();
  initDatepickers();
  initTimepickers();
});
