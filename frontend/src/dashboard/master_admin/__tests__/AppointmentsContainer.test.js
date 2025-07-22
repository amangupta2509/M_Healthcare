// src/dashboard/master_admin/__tests__/AppointmentsContainer.test.js

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AppointmentsContainer from "../AppointmentsContainer";
import { MemoryRouter } from "react-router-dom";

// Mock child components to prevent rendering full internals
jest.mock("../CounselorAppointments", () => () => (
  <div data-testid="counselor-component">Counselor View</div>
));
jest.mock("../DoctorAppointments", () => () => (
  <div data-testid="doctor-component">Doctor View</div>
));
jest.mock("../DietitianAppointments", () => () => (
  <div data-testid="dietitian-component">Dietitian View</div>
));
jest.mock("../PhysioAppointments", () => () => (
  <div data-testid="physio-component">Physio View</div>
));
jest.mock("../PhlebotomistAppointments", () => () => (
  <div data-testid="phlebo-component">Phlebotomist View</div>
));

describe("AppointmentsContainer", () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <AppointmentsContainer />
      </MemoryRouter>
    );
  });

  it("renders all tabs", () => {
    expect(screen.getByText("Counselor Appointments")).toBeInTheDocument();
    expect(screen.getByText("Doctor Appointments")).toBeInTheDocument();
    expect(screen.getByText("Dietitian Appointments")).toBeInTheDocument();
    expect(screen.getByText("Physio Appointments")).toBeInTheDocument();
    expect(screen.getByText("Phlebotomist Appointments")).toBeInTheDocument();
  });

  it("renders CounselorAppointments by default", () => {
    expect(screen.getByTestId("counselor-component")).toBeInTheDocument();
  });

  it("renders correct component when Doctor tab is clicked", () => {
    fireEvent.click(screen.getByText("Doctor Appointments"));
    expect(screen.getByTestId("doctor-component")).toBeInTheDocument();
  });

  it("renders correct component when Dietitian tab is clicked", () => {
    fireEvent.click(screen.getByText("Dietitian Appointments"));
    expect(screen.getByTestId("dietitian-component")).toBeInTheDocument();
  });

  it("renders correct component when Physio tab is clicked", () => {
    fireEvent.click(screen.getByText("Physio Appointments"));
    expect(screen.getByTestId("physio-component")).toBeInTheDocument();
  });

  it("renders correct component when Phlebotomist tab is clicked", () => {
    fireEvent.click(screen.getByText("Phlebotomist Appointments"));
    expect(screen.getByTestId("phlebo-component")).toBeInTheDocument();
  });
});
