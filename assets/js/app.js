window.app = {
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
    const textPanel = document.getElementById("text-panel");
    if (textPanel) {
      this.loadText(textPanel);
      textPanel.addEventListener("input", () => this.saveText(textPanel));
    }
  },
};

document.addEventListener("DOMContentLoaded", function () {
  window.app.initialize();
});