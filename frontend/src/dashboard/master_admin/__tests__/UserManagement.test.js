// Import necessary testing libraries
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserManagement from '../UserManagement';  // Adjust the import path if necessary
import axios from 'axios';

// Mock axios to simulate API requests
jest.mock('axios');

// Test for rendering the component
test('renders UserManagement page', () => {
  render(<UserManagement />);
  // Check if a key element is present, such as the title
  const userManagementTitle = screen.getByText(/User Management/i);
  expect(userManagementTitle).toBeInTheDocument();
});

// Test for adding a user
test('can add a new user', async () => {
  render(<UserManagement />);

  // Get input field and submit button
  const usernameInput = screen.getByPlaceholderText(/Enter username/i);
  const submitButton = screen.getByText(/Add User/i);

  // Simulate user input
  fireEvent.change(usernameInput, { target: { value: 'newuser' } });
  fireEvent.click(submitButton);

  // Verify the user was added to the list (replace with your actual UI behavior)
  await waitFor(() => screen.getByText(/newuser/i));
  expect(screen.getByText(/newuser/i)).toBeInTheDocument();
});

// Test for fetching user data from an API
test('loads and displays user data from API', async () => {
  // Mock the API response
  axios.get.mockResolvedValueOnce({
    data: [{ id: 1, username: 'testuser' }]
  });

  render(<UserManagement />);

  // Check if the user data is displayed on the page
  const user = await screen.findByText(/testuser/i);
  expect(user).toBeInTheDocument();
});

// Test for error handling in API request
test('shows error message if API request fails', async () => {
  // Mock API failure
  axios.get.mockRejectedValueOnce(new Error('Failed to fetch users'));

  render(<UserManagement />);

  // Check if error message is displayed
  const errorMessage = await screen.findByText(/Failed to load users/i);
  expect(errorMessage).toBeInTheDocument();
});

// Test for user deletion (if applicable in your component)
test('can delete a user', async () => {
  // Assuming the component has a delete button
  render(<UserManagement />);
  
  // Mock an API response for users
  axios.get.mockResolvedValueOnce({
    data: [{ id: 1, username: 'testuser' }]
  });

  // Simulate delete button click (replace with actual delete action in your component)
  const deleteButton = screen.getByText(/Delete/i); // Adjust if the button text is different
  fireEvent.click(deleteButton);

  // Verify that the user has been deleted (adjust based on how your UI behaves)
  await waitFor(() => expect(screen.queryByText(/testuser/i)).not.toBeInTheDocument());
});
