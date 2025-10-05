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
    const textPanel = document.getElementById('text-panel') as HTMLElement;
    const testText = 'Hello, world!';
    textPanel.innerHTML = testText;

    // Directly call the save function
    window.app.saveText(textPanel);

    expect(localStorage.getItem('textUnderStudy')).toBe(testText);
  });

  test('it should load text from localStorage', () => {
    const textPanel = document.getElementById('text-panel') as HTMLElement;
    const testText = 'Hello, again!';
    localStorage.setItem('textUnderStudy', testText);

    // Directly call the load function
    window.app.loadText(textPanel);

    expect(textPanel.innerHTML).toBe(testText);
  });

  test('it should save text on input', () => {
    const textPanel = document.getElementById('text-panel') as HTMLElement;
    const testText = 'New text';
    textPanel.innerHTML = testText;

    // Dispatch an input event
    textPanel.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));

    expect(localStorage.getItem('textUnderStudy')).toBe(testText);
  });

  test('settings should have a default HSK level of 3', () => {
    // The beforeEach initializes the app, which loads settings.
    // Since localStorage is cleared, it should be the default value.
    expect(window.app.settings.hskLevel).toBe(3);
  });

  test('settings should load HSK level from localStorage', () => {
    const settings = { hskLevel: 5 };
    localStorage.setItem('settings', JSON.stringify(settings));
    window.app.initialize(); // Re-initialize to load the new settings
    expect(window.app.settings.hskLevel).toBe(5);
    const hskLevelSelect = document.getElementById('hsk-level') as HTMLSelectElement;
    expect(hskLevelSelect.value).toBe('5');
  });

  test('settings should save HSK level to localStorage when changed', () => {
    const hskLevelSelect = document.getElementById('hsk-level') as HTMLSelectElement;
    hskLevelSelect.value = '4';
    hskLevelSelect.dispatchEvent(new Event('change'));
    expect(window.app.settings.hskLevel).toBe(4);
    const savedSettings = JSON.parse(localStorage.getItem('settings')!);
    expect(savedSettings.hskLevel).toBe(4);
  });

  test('should toggle the settings panel', () => {
    const settingsButton = document.getElementById('settings-button') as HTMLElement;
    const settingsPanel = document.getElementById('settings-panel') as HTMLElement;
    expect(settingsPanel.classList.contains('hidden')).toBe(true);
    settingsButton.click();
    expect(settingsPanel.classList.contains('hidden')).toBe(false);
    settingsButton.click();
    expect(settingsPanel.classList.contains('hidden')).toBe(true);
  });
});