// DietMealPlanAssign.test.js

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DietMealPlanAssign from "../DietMealPlanAssign";
import { ToastContainer } from "react-toastify";

// 🛠️ Fix scrollIntoView JSDOM error
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = function () {};
});

describe("DietMealPlanAssign Component", () => {
  beforeEach(() => {
    // Scoped fetch mock
    global.fetch = jest.fn((url) => {
      if (url.includes("/mealclients?mrn=MRN123")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                mrn: "MRN123",
                name: "John Doe",
                age: 30,
                height: 170,
                weight: 70,
                bmi: 24,
                goal: "Weight Loss",
              },
            ]),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    });
  });

  test("renders the heading", () => {
    render(<DietMealPlanAssign />);
    expect(screen.getByText("Diet Plan Assignment")).toBeInTheDocument();
  });

  test("shows error when searching with empty MRN", async () => {
    render(
      <>
        <ToastContainer />
        <DietMealPlanAssign />
      </>
    );

    fireEvent.click(screen.getByText("Search"));

    expect(
      await screen.findByText(/please enter a valid mrn/i)
    ).toBeInTheDocument();
  });

  test("performs MRN search and displays client data", async () => {
    render(
      <>
        <ToastContainer />
        <DietMealPlanAssign />
      </>
    );

    const input = screen.getByPlaceholderText("Enter MRN Number");
    fireEvent.change(input, { target: { value: "MRN123" } });
    fireEvent.click(screen.getByText("Search"));

    // ✅ Flexible content matcher instead of findByDisplayValue
    expect(
      await screen.findByText((content) => content.includes("John Doe"))
    ).toBeInTheDocument();

    expect(
      await screen.findByText((content) => content.includes("Weight Loss"))
    ).toBeInTheDocument();
  });

  test("renders MODIFIED BMI popup and validates empty form", async () => {
    render(
      <>
        <ToastContainer />
        <DietMealPlanAssign />
      </>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter MRN Number"), {
      target: { value: "MRN123" },
    });
    fireEvent.click(screen.getByText("Search"));

    expect(
      await screen.findByText((content) => content.includes("John Doe"))
    ).toBeInTheDocument();

    // Open popup
    fireEvent.click(screen.getByText("Enter MODIFIED BMI"));
    expect(await screen.findByText(/MODIFIED BMI/i)).toBeInTheDocument();

    // Submit empty form
    fireEvent.click(screen.getByText("Submit"));
    expect(
      await screen.findByText(/all bmi fields are required/i)
    ).toBeInTheDocument();
  });
});
