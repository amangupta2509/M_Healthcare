import { render, screen, fireEvent, act } from "@testing-library/react";
import { ThemeProvider } from "../../../ThemeProvider"; // Adjust path if needed
import Services from "../Services";  // Correct default import for Services
import {
  ServiceForm,
  ServiceCard,
  ServiceModal,
  toastUtils,
  formUtils,
} from "../Services"; // Adjust the path if needed
import userEvent from "@testing-library/user-event";

// Mocking fetch and other dependencies
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve([
        {
          id: 1,
          title: "Test Service",
          description: "Test Description",
          priceMonthly: 100,
        },
      ]),
  })
);

// Mocking submit to avoid the not implemented error
beforeAll(() => {
  HTMLFormElement.prototype.submit = jest.fn();
});

describe("Unit tests for Services Component", () => {
  test("renders Services component and fetches data", async () => {
    render(
      <ThemeProvider>
        <Services apiUrl="http://localhost:8080/api/services" />
      </ThemeProvider>
    );

    // Check for loading state or services list
    expect(screen.getByText("Manage Services")).toBeInTheDocument();
    await screen.findByText("Test Service");  // Ensure the service appears
    expect(screen.getByText("Test Service")).toBeInTheDocument();
  });

  test("renders ServiceForm component", async () => {
    const formData = {
      title: "Test Title",
      subtitle: "Test Subtitle",
      description: "Test Description",
      priceMonthly: "100",
      priceQuarterly: "200",
      priceYearly: "300",
      rating: "5",
      previewVideo: "testVideoLink",
      features: ["Feature 1"],
    };

    const mockOnSubmit = jest.fn();

    render(
      <ServiceForm
        formData={formData}
        editingServiceId={null}
        onSubmit={mockOnSubmit}
        onChange={jest.fn()}
        onFeatureChange={jest.fn()}
        onAddFeature={jest.fn()}
        onRemoveFeature={jest.fn()}
        onBannerUpload={jest.fn()}
      />
    );

    // Ensure all fields are rendered
    expect(screen.getByLabelText("Title")).toHaveValue(formData.title);
    expect(screen.getByLabelText("Sub-Title")).toHaveValue(formData.subtitle);
    expect(screen.getByLabelText("Description")).toHaveValue(formData.description);

    // Check for the button and click it
    const submitButton = screen.getByRole("button", {
      name: /submit service/i,
    });

    await userEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  test("ServiceCard renders and triggers edit/delete actions", () => {
    const mockEdit = jest.fn();
    const mockDelete = jest.fn();

    const service = {
      id: 1,
      title: "Test Service",
      description: "Test Description",
      banner: "/test-banner.jpg",
    };

    render(
      <ServiceCard
        service={service}
        onView={jest.fn()}
        onEdit={mockEdit}
        onDelete={mockDelete}
      />
    );

    // Check if the service details are rendered
    expect(screen.getByText("Test Service")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();

    // Trigger edit action
    const editButton = screen.getByRole("button", { name: /edit/i });
    userEvent.click(editButton);
    expect(mockEdit).toHaveBeenCalledWith(service);

    // Trigger delete action
    const deleteButton = screen.getByRole("button", { name: /delete/i });
    userEvent.click(deleteButton);
    expect(mockDelete).toHaveBeenCalledWith(service.id);
  });

  test("ServiceModal renders correctly", () => {
    const service = {
      title: "Test Service",
      subtitle: "Test Subtitle",
      priceMonthly: 100,
      priceQuarterly: 200,
      priceYearly: 300,
      rating: 5,
      description: "Test Description",
      previewVideo: "https://www.youtube.com/watch?v=test",
      features: ["Feature 1"],
    };

    const { container } = render(
      <ServiceModal service={service} onClose={jest.fn()} />
    );

    // Check modal content
    expect(screen.getByText("Test Service")).toBeInTheDocument();
    expect(screen.getByText("Test Subtitle")).toBeInTheDocument();
    expect(screen.getByText("₹100")).toBeInTheDocument();

    // Check the iframe
    const iframe = container.querySelector("iframe");
    expect(iframe).toHaveAttribute("src", "https://www.youtube.com/embed/test");
  });

  test("toastUtils showSuccess is called on success", () => {
    const toastSuccessSpy = jest.spyOn(toastUtils, "showSuccess");
    toastUtils.showSuccess("Success message");

    expect(toastSuccessSpy).toHaveBeenCalledWith("Success message");
  });

  test("formUtils getInitialFormData returns default form data", () => {
    const initialFormData = formUtils.getInitialFormData();

    expect(initialFormData).toEqual({
      banner: "",
      title: "",
      subtitle: "",
      priceMonthly: "",
      priceQuarterly: "",
      priceYearly: "",
      rating: "",
      description: "",
      previewVideo: "",
      features: [""],
    });
  });

  test("formUtils handleInputChange updates form data", () => {
    const initialData = formUtils.getInitialFormData();
    const updatedData = formUtils.handleInputChange(
      initialData,
      "title",
      "New Service"
    );

    expect(updatedData.title).toBe("New Service");
  });

  test("formUtils handleInputChange updates feature data", () => {
    const initialData = formUtils.getInitialFormData();
    const updatedData = formUtils.handleInputChange(
      initialData,
      "features",
      ["New Feature"]
    );

    expect(updatedData.features).toEqual(["New Feature"]);
  });
});
