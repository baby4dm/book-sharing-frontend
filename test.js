// ==UserScript==
// @name         НБУ Монети — Sniper Monitor
// @namespace    nbu-coins-sniper
// @version      2.0
// @description  Відстеження появи монети в продажу
// @match        https://coins.bank.gov.ua/*
// @grant        GM_notification
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";

  // =========================
  // НАЛАШТУВАННЯ
  // =========================

  const CHECK_INTERVAL = 1000;

  // true = автоматично натискати "Купити"
  // false = тільки повідомляти
  const AUTO_CLICK = true;

  // =========================
  // СТАН
  // =========================

  let previousAvailable = null;
  let initialized = false;

  // =========================
  // ПОШУК КНОПКИ
  // =========================

  function findBuyButton() {
    const elements = document.querySelectorAll(
      'button, input[type="button"], input[type="submit"], a',
    );

    for (const el of elements) {
      const text = (
        el.innerText ||
        el.value ||
        el.getAttribute("aria-label") ||
        ""
      )
        .trim()
        .toLowerCase();

      if (
        text.includes("купити") ||
        text.includes("додати в кошик") ||
        text.includes("добавить в корзину")
      ) {
        const disabled =
          el.disabled ||
          el.hasAttribute("disabled") ||
          el.classList.contains("disabled");

        if (!disabled) {
          return el;
        }
      }
    }

    return null;
  }

  // =========================
  // ВИЗНАЧЕННЯ НАЯВНОСТІ
  // =========================

  function isAvailable() {
    const button = findBuyButton();

    return button !== null;
  }

  // =========================
  // СПОВІЩЕННЯ
  // =========================

  function notify() {
    console.log(
      "%c НБУ — МОНЕТА СТАЛА ДОСТУПНОЮ! ",
      "background:red;color:white;font-size:18px",
    );

    try {
      GM_notification({
        title: "НБУ — Монета доступна!",
        text: "Монета щойно стала доступною для покупки.",
        timeout: 15000,
        silent: false,
      });
    } catch (e) {}

    // Кілька звукових сигналів
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;

      const ctx = new AudioContext();

      for (let i = 0; i < 5; i++) {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.connect(gain);
        gain.connect(ctx.destination);

        oscillator.frequency.value = 800;

        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.25);

        oscillator.start(ctx.currentTime + i * 0.25);

        oscillator.stop(ctx.currentTime + i * 0.25 + 0.15);
      }
    } catch (e) {}
  }

  // =========================
  // ПЕРЕВІРКА
  // =========================

  function check() {
    console.log("Перевірка наявності");

    const available = isAvailable();

    // Перша перевірка після запуску.
    // НІЧОГО НЕ НАТИСКАЄМО.
    if (!initialized) {
      previousAvailable = available;
      initialized = true;

      console.log(
        "[НБУ SNIPER] Початковий стан:",
        available ? "Є В НАЯВНОСТІ" : "НЕМАЄ",
      );

      return;
    }

    // =========================
    // ГОЛОВНИЙ МОМЕНТ
    // =========================

    // Було НЕМАЄ → стало Є
    if (previousAvailable === false && available === true) {
      console.log(
        "%c [НБУ SNIPER] !!! МОНЕТА З" + "ЯВИЛАСЯ !!! ",
        "background:red;color:white;font-size:20px",
      );

      notify();

      const button = findBuyButton();

      if (AUTO_CLICK && button) {
        console.log("[НБУ SNIPER] Натискаю КУПИТИ");

        button.click();
      }
    }

    previousAvailable = available;
  }

  // =========================
  // ЗАПУСК
  // =========================

  console.log(
    "%c НБУ SNIPER 2.0 ЗАПУЩЕНО ",
    "background:#111;color:#00ff00;font-size:18px",
  );

  console.log("Моніторинг:", CHECK_INTERVAL, "мс");

  setTimeout(check, 1000);

  setInterval(check, CHECK_INTERVAL);
})();
