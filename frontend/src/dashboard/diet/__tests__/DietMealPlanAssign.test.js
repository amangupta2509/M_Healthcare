import React from "react";
import {
  act,
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import DietMealPlanAssign from "../DietMealPlanAssign";
import { ToastContainer } from "react-toastify";

// Mock scrollIntoView for hidden elements like PDF preview
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = function () {};
});

// Helper function for act-wrapped render
const customRender = async () => {
  await act(async () => {
    render(
      <>
        <ToastContainer />
        <DietMealPlanAssign />
      </>
    );
  });
};

describe("DietMealPlanAssign Component", () => {
  beforeEach(() => {
    global.fetch = jest.fn((url) => {
      if (url.includes("mealclients?mrn=MRN123")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                mrn: "MRN123",
                name: "Test User",
                age: 25,
                height: 170,
                weight: 65,
                bmi: 22,
                goal: "Muscle Gain",
              },
            ]),
        });
      }

      if (url.includes("assignedMeals?mrn=MRN123")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }

      if (url.includes("availableMeals")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                mealTime: "Breakfast",
                options: ["Oats", "Eggs"],
              },
              {
                mealTime: "Lunch",
                options: ["Rice", "Dal"],
              },
            ]),
        });
      }

      if (url.includes("dietaryGuidelines")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(["No sugar", "High protein"]),
        });
      }

      if (url.includes("assignedMeals")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    });
  });

  test("renders page title", async () => {
    await customRender();
    expect(screen.getByText(/Diet Plan Assignment/i)).toBeInTheDocument();
  });

  test("shows toast on empty MRN", async () => {
    await customRender();
    fireEvent.click(screen.getByText("Search"));
    expect(await screen.findByText(/please enter a valid mrn/i)).toBeInTheDocument();
  });

  test("fetches client by MRN and shows client info", async () => {
    await customRender();
    fireEvent.change(screen.getByPlaceholderText(/Enter MRN Number/i), {
      target: { value: "MRN123" },
    });
    fireEvent.click(screen.getByText("Search"));

    await waitFor(() => {
      expect(screen.getByText(/Muscle Gain/)).toBeInTheDocument();
    });

    const nameMatches = await screen.findAllByText(/Test User/);
    expect(nameMatches.length).toBeGreaterThanOrEqual(1);
  });

test("shows and validates BMI popup", async () => {
  await customRender();

  fireEvent.change(screen.getByPlaceholderText("Enter MRN Number"), {
    target: { value: "MRN123" },
  });
  fireEvent.click(screen.getByText("Search"));

  await waitFor(() => {
    expect(screen.getByText(/Muscle Gain/)).toBeInTheDocument();
  });

  const bmiButton = screen.getByRole("button", {
    name: /Enter MODIFIED BMI/i,
  });
  fireEvent.click(bmiButton);

  // Fix: Use role or more specific query
  const modalHeadings = await screen.findAllByText(/MODIFIED BMI/i);
  expect(modalHeadings.length).toBeGreaterThan(0);

  fireEvent.click(screen.getByText("Submit"));
  expect(await screen.findByText(/All BMI fields are required/i)).toBeInTheDocument();
});

test("selects date range and meal time", async () => {
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

  // Wait until client loads
  await waitFor(() => {
    expect(screen.getByText(/Muscle Gain/i)).toBeInTheDocument();
  });

  // Wait until the meal options render
  await waitFor(() =>
    expect(screen.getByRole("option", { name: "Breakfast" })).toBeInTheDocument()
  );

  // Set dates
  const dateInputs = screen.getAllByPlaceholderText(/DD-MM-YYYY/i);
  fireEvent.change(dateInputs[0], { target: { value: "2025-07-01" } });
  fireEvent.change(dateInputs[1], { target: { value: "2025-07-15" } });

  // Select meal
  const select = screen.getByRole("combobox");
  fireEvent.change(select, { target: { value: "Breakfast" } });

  expect(select.value).toBe("Breakfast");
});

  test("shows buttons for Generate PDF and Complete Assignment", async () => {
    await customRender();
    fireEvent.change(screen.getByPlaceholderText("Enter MRN Number"), {
      target: { value: "MRN123" },
    });
    fireEvent.click(screen.getByText("Search"));

    await waitFor(() => {
      expect(screen.getByText(/Complete Assignment/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Generate PDF/i)).toBeInTheDocument();
    expect(screen.getByText(/Complete Assignment/i)).toBeInTheDocument();
  });
});
// Note: The test for PDF generation is not included as it requires additional setup for the PDF library.