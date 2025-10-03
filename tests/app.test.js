function runTest(testName, testFunction) {
  const resultsDiv = document.getElementById("results");
  // Reset the environment before each test
  localStorage.clear();
  const textPanel = document.getElementById("text-panel");
  if (textPanel) {
    textPanel.innerHTML = "This is where the text to be studied will be displayed.";
  }

  try {
    testFunction();
    resultsDiv.innerHTML += `<p style="color: green;">✔ ${testName}</p>`;
  } catch (error) {
    resultsDiv.innerHTML += `<p style="color: red;">✖ ${testName}: ${error.message}</p>`;
    console.error(error);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

runTest("it should save text to localStorage", () => {
  const textPanel = document.getElementById("text-panel");
  const testText = "Hello, world!";
  textPanel.innerHTML = testText;

  // Directly call the save function
  window.app.saveText(textPanel);

  assert(
    localStorage.getItem("textUnderStudy") === testText,
    "Text was not saved to localStorage"
  );
});

runTest("it should load text from localStorage", () => {
  const textPanel = document.getElementById("text-panel");
  const testText = "Hello, again!";
  localStorage.setItem("textUnderStudy", testText);

  // Directly call the load function
  window.app.loadText(textPanel);

  assert(
    textPanel.innerHTML === testText,
    "Text was not loaded from localStorage"
  );
});

// Clean up after all tests are done
localStorage.clear();