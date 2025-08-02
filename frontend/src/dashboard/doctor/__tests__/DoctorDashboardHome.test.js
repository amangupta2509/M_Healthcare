import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import DoctorDashboardHome from "../DoctorDashboardHome";
import { useTheme } from "../../../ThemeProvider";
import { toast } from "react-toastify";

jest.mock("../../../ThemeProvider", () => ({
  useTheme: jest.fn(),
}));

jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
  ToastContainer: jest.fn(),
}));

beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url === "http://localhost:3001/appointments") {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              mrn: "MRN001",
              patientName: "John Doe",
              time: "10:00 AM",
              status: "Pending",
            },
          ]),
      });
    }
    return Promise.reject(new Error("API Not Found"));
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("DoctorDashboardHome", () => {
  beforeEach(() => {
    useTheme.mockReturnValue({ theme: "light" });
  });

  test("renders the DoctorDashboardHome component", async () => {
    await act(async () => {
      render(<DoctorDashboardHome />);

      // Check if quote and appointment data are rendered
      const quoteElement = await screen.findByText(/Every patient is a story/i);
      expect(quoteElement).toBeInTheDocument();

      const appointmentTable = await screen.findByRole("table");
      expect(appointmentTable).toBeInTheDocument();
    });
  });

  test("fetches and displays appointments", async () => {
    await act(async () => {
      render(<DoctorDashboardHome />);

      // Wait for the appointments to appear
      await waitFor(() => screen.getByText(/MRN001/i));
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });
  });

  test("shows an error if fetch fails", async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error("Failed to fetch")));

    await act(async () => {
      render(<DoctorDashboardHome />);

      await waitFor(() => screen.findByText(/Could not fetch appointments/i));
      expect(toast.error).toHaveBeenCalledWith("Could not fetch appointments");
    });
  });

  test("shows a warning if MRN is empty when searching", async () => {
    await act(async () => {
      render(<DoctorDashboardHome />);

      const searchButton = screen.getByText(/Search/i);

      // Wait for the button to be rendered before firing an event
      await waitFor(() => expect(searchButton).toBeInTheDocument());

      fireEvent.click(searchButton);

      expect(toast.warning).toHaveBeenCalledWith("Please enter a valid MRN");
    });
  });
});
