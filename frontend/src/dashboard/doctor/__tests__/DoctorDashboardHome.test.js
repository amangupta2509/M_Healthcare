import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DoctorDashboardHome from '../DoctorDashboardHome';
import { useTheme } from '../../../ThemeProvider';
import { toast } from 'react-toastify';

// Mocking the theme and toast to avoid errors in testing
jest.mock('../../../ThemeProvider', () => ({
  useTheme: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
  ToastContainer: jest.fn(),
}));

// Mocking global fetch correctly for the tests
global.fetch = jest.fn((url) => {
  if (url === "http://localhost:3001/appointments") {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            mrn: 'MRN001',
            patientName: 'John Doe',
            time: '10:00 AM',
            status: 'Pending',
          },
        ]),
    });
  }
  return Promise.reject(new Error('API Not Found'));
});

describe('DoctorDashboardHome', () => {
  beforeEach(() => {
    useTheme.mockReturnValue({ theme: 'light' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders the DoctorDashboardHome component', async () => {
    render(<DoctorDashboardHome />);

    // Check if quote and appointment data are rendered
    const quoteElement = await screen.findByText(/Every patient is a story/i);
    expect(quoteElement).toBeInTheDocument();

    const appointmentTable = await screen.findByRole('table');
    expect(appointmentTable).toBeInTheDocument();
  });

  test('fetches and displays appointments', async () => {
    render(<DoctorDashboardHome />);

    // Wait for the appointments to appear
    await waitFor(() => screen.getByText(/MRN001/i));
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
  });

  test('shows an error if fetch fails', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Failed to fetch')));
    render(<DoctorDashboardHome />);

    await waitFor(() => screen.findByText(/Could not fetch appointments/i));
    expect(toast.error).toHaveBeenCalledWith('Could not fetch appointments');
  });

  test('shows a warning if MRN is empty when searching', () => {
    render(<DoctorDashboardHome />);
    
    const searchButton = screen.getByText(/Search/i);
    fireEvent.click(searchButton);

    expect(toast.warning).toHaveBeenCalledWith('Please enter a valid MRN');
  });
});
