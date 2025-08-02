import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import DoctorsAppointments from "../DoctorsAppointments"; // Update the path accordingly
import { toast } from "react-toastify";
import "@testing-library/jest-dom";

jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
    info: jest.fn(),
    success: jest.fn(),
  },
  ToastContainer: jest.fn(),
}));

global.fetch = jest.fn();

describe("DoctorsAppointments Component", () => {
  const mockAppointments = [
    {
      id: 1,
      mrn: "MRN001",
      patientName: "John Doe",
      appointmentType: "Online",
      date: "2024-01-01",
      time: "10:00 AM",
      notes: "Patient has a fever.",
      meetingLink: "",
      status: "Pending",
    },
  ];

  beforeEach(() => {
    // Default mock to resolve successfully
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockAppointments),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders loading state correctly", async () => {
    render(<DoctorsAppointments />);

    // Wait for appointments to be loaded
    await waitFor(() => screen.getByText(/John Doe/i));

    const loadingText = screen.queryByText(/Loading assigned patients.../i);
    expect(loadingText).not.toBeInTheDocument(); // The loading text shouldn't appear once data is loaded
  });

  test("shows error toast if fetch fails", async () => {
    fetch.mockRejectedValueOnce(new Error("Failed to fetch appointments"));

    render(<DoctorsAppointments />);

    // Wait for the error message to appear (update text if needed)
    await waitFor(() => screen.getByText(/No appointments found/i));

    // Check if the error toast was called
    expect(toast.error).toHaveBeenCalledWith("Unable to load appointments.");
  });

  test("handles delete action correctly", async () => {
    render(<DoctorsAppointments />);

    // Wait for appointments to be loaded
    await waitFor(() => screen.getByText(/John Doe/i));

    const deleteButton = screen.getByText(/Delete/i);

    // Simulate clicking the delete button to open the confirmation dialog
    fireEvent.click(deleteButton);

    // Find and click the "Confirm" button in the confirmation dialog
    const confirmButton = screen.getByText(/Confirm/i);
    fireEvent.click(confirmButton);

    // Check if the toast message for successful deletion is displayed
    expect(toast.info).toHaveBeenCalledWith("Deletion successful.");
  });

  test("handles status toggle correctly", async () => {
    render(<DoctorsAppointments />);

    // Wait for appointments to be loaded
    await waitFor(() => screen.getByText(/John Doe/i));

    const statusBadge = screen.getByText(/Pending/i);

    // Simulate status toggle
    await act(async () => {
      fireEvent.click(statusBadge);
    });

    // Check if status is updated to "Approved"
    await waitFor(() => screen.getByText(/Approved/i));
  });

  test("generates meeting link correctly", async () => {
    render(<DoctorsAppointments />);

    // Wait for appointments to be loaded
    await waitFor(() => screen.getByText(/John Doe/i));

    const generateButton = screen.getByText(/Auto/i);

    // Simulate the button click to generate a link
    await act(async () => {
      fireEvent.click(generateButton);
    });

    // Check if a meeting link is generated
    await waitFor(() => screen.getByPlaceholderText(/Enter or generate/i));
  });

  test("opens modal to view notes and closes it", async () => {
    render(<DoctorsAppointments />);

    // Wait for appointments to be loaded
    await waitFor(() => screen.getByText(/John Doe/i));

    const viewButton = screen.getByText(/View/i);

    // Simulate viewing the notes
    await act(async () => {
      fireEvent.click(viewButton);
    });

    // Check if the modal appears
    const modal = screen.getByText("Full Notes");
    expect(modal).toBeInTheDocument();

    // Close the modal
    const closeButton = screen.getByText("Close");
    await act(async () => {
      fireEvent.click(closeButton);
    });

    // Check if the modal is closed
    expect(modal).not.toBeInTheDocument();
  });
});
