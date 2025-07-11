import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const PhlebotomistBookingForm = () => {
  const initialForm = {
    name: "",
    phone: "",
    email: "",
    address: "",
    testType: "",
    isFirstTime: "yes",
    fastingDate: "",
    slot: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const [slotCounts, setSlotCounts] = useState({});
  const [isReturningUser, setIsReturningUser] = useState(null);
  const [step, setStep] = useState("phone"); // 'phone' or 'details'

  const slots = ["7:00 AM", "7:15 AM", "7:30 AM", "7:45 AM", "8:00 AM"];

  useEffect(() => {
    const counts = JSON.parse(localStorage.getItem("phleboBookings")) || {};
    setSlotCounts(counts);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneCheck = () => {
    const stored = JSON.parse(localStorage.getItem("phleboBookingsData")) || [];
    const bookingsForPhone = stored.filter((entry) => entry.phone === formData.phone);

    if (bookingsForPhone.length >= 2) {
      setIsReturningUser(true);
      setFormData((prev) => ({
        ...prev,
        name: bookingsForPhone[0].name,
        email: bookingsForPhone[0].email,
        address: bookingsForPhone[0].address,
        testType: bookingsForPhone[0].testType,
        isFirstTime: "no",
      }));
    } else {
      setIsReturningUser(false);
    }

    setStep("details");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedTime = new Date(formData.fastingDate);
    const hour = selectedTime.getHours();
    const minute = selectedTime.getMinutes();
    if (hour !== 7 && !(hour === 8 && minute === 0)) {
      toast.error("Fasting must be between 7:00 AM and 8:00 AM");
      return;
    }

    const currentSlot = formData.slot;
    const updatedCounts = { ...slotCounts };
    updatedCounts[currentSlot] = (updatedCounts[currentSlot] || 0) + 1;

    if (updatedCounts[currentSlot] > 5) {
      toast.error("Slot full. Please choose another time.");
      return;
    }

    // Save full data
    const existingData = JSON.parse(localStorage.getItem("phleboBookingsData")) || [];
    const updatedData = [...existingData, formData];
    localStorage.setItem("phleboBookingsData", JSON.stringify(updatedData));

    // Save updated slot count
    localStorage.setItem("phleboBookings", JSON.stringify(updatedCounts));
    setSlotCounts(updatedCounts);

    toast.success("Booking confirmed & notified via WhatsApp/Email!");
    console.log("Booking Info:", formData);

    // Reset
    setFormData(initialForm);
    setIsReturningUser(null);
    setStep("phone");
  };

  return (
    <div className="card">
      <h2>Phlebotomist Booking</h2>

      {step === "phone" && (
        <>
          <label>Enter Phone to Continue:</label>
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <button className="btn btn-primary" onClick={handlePhoneCheck}>
            Proceed
          </button>
        </>
      )}

      {step === "details" && (
        <form onSubmit={handleSubmit} className="form" style={{ marginTop: "1rem" }}>
          {!isReturningUser && (
            <>
              <label>Name:
                <input name="name" value={formData.name} onChange={handleChange} required />
              </label>
              <label>Email:
                <input name="email" type="email" value={formData.email} onChange={handleChange} required />
              </label>
              <label>Address:
                <textarea name="address" value={formData.address} onChange={handleChange} required />
              </label>
              <label>Test Type:
                <select name="testType" value={formData.testType} onChange={handleChange} required>
                  <option value="">Select</option>
                  <option value="Blood Test">Blood Test</option>
                  <option value="Diabetes Test">Diabetes Test</option>
                </select>
              </label>
            </>
          )}

          <label>Fasting Time:
            <input type="datetime-local" name="fastingDate" value={formData.fastingDate} onChange={handleChange} required />
            <small>Allowed between 7:00 – 8:00 AM</small>
          </label>

          <label>Slot:
            <select name="slot" value={formData.slot} onChange={handleChange} required>
              <option value="">Choose Slot</option>
              {slots.map((s) => (
                <option key={s} value={s} disabled={slotCounts[s] >= 5}>
                  {s} {slotCounts[s] >= 5 ? "(Full)" : `(Booked: ${slotCounts[s] || 0})`}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" className="btn btn-primary">Confirm Booking</button>
        </form>
      )}
    </div>
  );
};

export default PhlebotomistBookingForm;