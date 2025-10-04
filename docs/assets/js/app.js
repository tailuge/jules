window.app = {
  settings: {
    hskLevel: 3,
    load: function () {
      const savedSettings = localStorage.getItem("settings");
      if (savedSettings) {
        Object.assign(this, JSON.parse(savedSettings));
      }
    },
    save: function () {
      localStorage.setItem("settings", JSON.stringify(this));
    },
  },

  saveText: function (element) {
    if (element) {
      localStorage.setItem("textUnderStudy", element.innerHTML);
    }
  },

  loadText: function (element) {
    if (element) {
      const savedText = localStorage.getItem("textUnderStudy");
      if (savedText) {
        element.innerHTML = savedText;
      }
    }
  },

  initialize: function () {
    this.settings.load();

    const textPanel = document.getElementById("text-panel");
    if (textPanel) {
      this.loadText(textPanel);
      textPanel.addEventListener("input", () => this.saveText(textPanel));
    }

    const settingsButton = document.getElementById("settings-button");
    const settingsPanel = document.getElementById("settings-panel");
    const hskLevelSelect = document.getElementById("hsk-level");

    if (settingsButton && settingsPanel) {
      settingsButton.addEventListener("click", () => {
        settingsPanel.classList.toggle("hidden");
      });
    }

    if (hskLevelSelect) {
      hskLevelSelect.value = this.settings.hskLevel;
      hskLevelSelect.addEventListener("change", (event) => {
        this.settings.hskLevel = parseInt(event.target.value, 10);
        this.settings.save();
      });
    }
  },
};

document.addEventListener("DOMContentLoaded", function () {
  window.app.initialize();
});