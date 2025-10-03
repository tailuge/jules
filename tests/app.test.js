describe('app', () => {
  beforeEach(() => {
    // Reset the environment before each test
    localStorage.clear();
    const textPanel = document.getElementById('text-panel');
    if (textPanel) {
      textPanel.innerHTML = 'This is where the text to be studied will be displayed.';
    }
    // We also need to re-initialize the app before each test to ensure the event listeners are set up.
    window.app.initialize();
  });

  test('it should save text to localStorage', () => {
    const textPanel = document.getElementById('text-panel');
    const testText = 'Hello, world!';
    textPanel.innerHTML = testText;

    // Directly call the save function
    window.app.saveText(textPanel);

    expect(localStorage.getItem('textUnderStudy')).toBe(testText);
  });

  test('it should load text from localStorage', () => {
    const textPanel = document.getElementById('text-panel');
    const testText = 'Hello, again!';
    localStorage.setItem('textUnderStudy', testText);

    // Directly call the load function
    window.app.loadText(textPanel);

    expect(textPanel.innerHTML).toBe(testText);
  });

  test('it should save text on input', () => {
    const textPanel = document.getElementById('text-panel');
    const testText = 'New text';
    textPanel.innerHTML = testText;

    // Dispatch an input event
    textPanel.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));

    expect(localStorage.getItem('textUnderStudy')).toBe(testText);
  });
});