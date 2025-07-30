import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UserManagement from "../UserManagement"; // Adjust the import path if necessary
import { MemoryRouter } from "react-router-dom";
import axios from "axios";  // Import axios

// Mock useTheme to return a mock theme value
jest.mock("../../../ThemeProvider", () => ({
  useTheme: () => ({ theme: "light" }), // Mock theme value (e.g., 'light' or 'dark')
}));

// Mock axios to prevent real API calls during tests
jest.mock("axios");

describe("UserManagement - Admin Actions", () => {
  it("renders user management header", () => {
    render(
      <MemoryRouter>
        <UserManagement />
      </MemoryRouter>
    );
    expect(screen.getByText(/User Management/i)).toBeInTheDocument();
  });

  it("renders add user form", () => {
    render(
      <MemoryRouter>
        <UserManagement />
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByText(/Add User/i)).toBeInTheDocument();
  });

  it("can add a new user", async () => {
    const usernameInput = screen.getByLabelText(/Username/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const submitButton = screen.getByText(/Add User/i);

    fireEvent.change(usernameInput, { target: { value: "newuser" } });
    fireEvent.change(emailInput, { target: { value: "newuser@example.com" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/newuser/i)).toBeInTheDocument();
      expect(screen.getByText(/newuser@example.com/i)).toBeInTheDocument();
    });
  });

  it("can delete a user", async () => {
    axios.get.mockResolvedValueOnce({
      data: [{ id: 1, username: "testuser", email: "testuser@example.com" }],
    });

    render(
      <MemoryRouter>
        <UserManagement />
      </MemoryRouter>
    );

    // Wait for the user to be rendered
    await screen.findByText("testuser");

    const deleteButton = screen.getByRole("button", { name: /Delete/i });
    fireEvent.click(deleteButton);

    await screen.findByText("User deleted successfully");
  });

  it("displays error message if API fails to fetch users", async () => {
    axios.get.mockRejectedValueOnce(new Error("Failed to load users"));

    render(
      <MemoryRouter>
        <UserManagement />
      </MemoryRouter>
    );

    const errorMessage = await screen.findByText(/Failed to load users/i);
    expect(errorMessage).toBeInTheDocument();
  });
});
