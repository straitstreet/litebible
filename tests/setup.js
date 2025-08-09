// Test setup and global mocks
global.console.warn = jest.fn();
global.console.error = jest.fn();

// Mock Bible data for testing
global.mockBibleData = [
  ["Genesis", [
    ["In the beginning God created the heavens and the earth.", "Now the earth was formless and void."],
    ["Thus the heavens and the earth were completed.", "And by the seventh day God had finished."],
    ["Now the serpent was more crafty than any beast.", "The woman answered the serpent."]
  ]],
  ["Exodus", [
    ["These are the names of the sons of Israel.", "Now Joseph and all his brothers died."],
    ["But the midwives feared God and did not do.", "So God dealt well with the midwives."]
  ]],
  ["Leviticus", [
    ["Then the LORD called to Moses.", "Speak to the Israelites and say to them."]
  ]]
];

// Mock DOM elements that might be missing in jsdom
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true
});

Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: jest.fn(),
  writable: true
});

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now())
  },
  writable: true
});