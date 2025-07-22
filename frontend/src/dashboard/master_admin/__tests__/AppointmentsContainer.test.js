import React from "react";
import { render, screen } from "@testing-library/react";
import AppointmentsContainer from "../AppointmentsContainer";
import { MemoryRouter } from "react-router-dom";

describe("AppointmentsContainer - Admin Cards", () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <AppointmentsContainer />
      </MemoryRouter>
    );
  });

  it("renders doctor appointment card", () => {
    expect(screen.getByText(/Doctor Appointments/i)).toBeInTheDocument();
    expect(screen.getByText(/Manage all doctor bookings/i)).toBeInTheDocument();
  });

  it("renders dietitian appointment card", () => {
    expect(screen.getByText(/Dietitian Appointments/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Manage all dietitian bookings/i)
    ).toBeInTheDocument();
  });

  it("renders physio appointment card", () => {
    expect(screen.getByText(/Physio Appointments/i)).toBeInTheDocument();
    expect(screen.getByText(/Manage all physio bookings/i)).toBeInTheDocument();
  });

  it("renders counselor appointment card", () => {
    expect(screen.getByText(/Counselor Appointments/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Manage all counselor bookings/i)
    ).toBeInTheDocument();
  });

  it("renders phlebotomist appointment card", () => {
    expect(screen.getByText(/Phlebotomist Appointments/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Manage all phlebotomist bookings/i)
    ).toBeInTheDocument();
  });

  it("renders correct number of view buttons", () => {
    const buttons = screen.getAllByRole("button", { name: /View/i });
    expect(buttons.length).toBe(5); // 1 for each appointment type
  });
});
