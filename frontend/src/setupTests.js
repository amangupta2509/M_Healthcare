// Importing the necessary extensions for jest-dom
import '@testing-library/jest-dom';

// Mocking the submit method globally to avoid errors during tests
beforeAll(() => {
  HTMLFormElement.prototype.submit = jest.fn();  // Mocking the form submit method
});
