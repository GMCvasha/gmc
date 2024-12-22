import React, { useState } from "react";
import axiosInstance from './axiosInstance';

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isNextEnabled, setIsNextEnabled] = useState(false);
  const [touched, setTouched] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setIsNextEnabled(validateStep());
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        return (
          /^[a-zA-Z]{3,}$/.test(formData.firstName.trim()) &&
          /^[a-zA-Z]{3,}$/.test(formData.lastname.trim()) &&
          /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]{1,64}@[a-zA-Z0-9.-]{1,255}\.[a-zA-Z]{2,}$/.test(formData.email.trim())
        );
      case 2:
        return (
          formData.password.trim().length >= 8 &&
          /[A-Z]/.test(formData.password.trim()) &&
          /[a-z]/.test(formData.password.trim()) &&
          /[0-9]/.test(formData.password.trim()) &&
          /[!@#$%^&*(),.?":{}|<>]/.test(formData.password.trim()) &&
          formData.password === formData.confirmPassword
        );
      default:
        return false;
    }
  };

  const nextStep = () => {
    setTouched(true);
    if (validateStep()) {
      setCurrentStep(currentStep + 1);
      setTouched(false); // Reset for the next step
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (validateStep()) {
      try {
        const response = await axiosInstance.post('auth/register', formData);
  
        if (response.status === 200 || response.status === 201) {
          setMessage('Registration successful');
        } else {
          setMessage(response.data.message || 'Registration failed. Please try again.');
        }
      } catch (error) {
        setMessage(error.response?.data?.message || 'An error occurred. Please try again later.');
      }
    }
  };

  return (
    <div className="container">
      <h1>Register</h1>
      {message && <div className="divmess"><p>{message}</p></div>}

      <form onSubmit={submit}>
        {currentStep === 1 && (
          <div className="formsep">
            <label>First Name:</label>
            <input
              type="text"
              name="firstName"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            {touched && !/^[a-zA-Z]{3,}$/.test(formData.firstName.trim()) && (
              <p style={{ color: "red", fontSize: "smaller" }}>
                First Name must be at least 3 letters and contain no numbers.
              </p>
            )}

            <label>Last Name:</label>
            <input
              type="text"
              name="lastname"
              placeholder="Enter your last name"
              value={formData.lastname}
              onChange={handleChange}
              required
            />
            {touched && !/^[a-zA-Z]{3,}$/.test(formData.lastname.trim()) && (
              <p style={{ color: "red", fontSize: "smaller" }}>
                Last Name must be at least 3 letters and contain no numbers.
              </p>
            )}

            <label>Email:</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {touched &&
              !/^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]{1,64}@[a-zA-Z0-9.-]{1,255}\.[a-zA-Z]{2,}$/.test(
                formData.email.trim()
              ) && (
                <p style={{ color: "red", fontSize: "smaller" }}>
                  Please enter a valid email address.
                </p>
              )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="formsep">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {touched &&
              (!/[A-Z]/.test(formData.password.trim()) ||
                !/[a-z]/.test(formData.password.trim()) ||
                !/[0-9]/.test(formData.password.trim()) ||
                !/[!@#$%^&*(),.?":{}|<>]/.test(formData.password.trim())) && (
                <p style={{ color: "red", fontSize: "smaller" }}>
                  Password must contain at least 8 characters, one uppercase letter,
                  one lowercase letter, one number, and one special character.
                </p>
              )}

            <label>Confirm Password:</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            {touched && formData.password !== formData.confirmPassword && (
              <p style={{ color: "red", fontSize: "smaller" }}>
                Passwords do not match.
              </p>
            )}
          </div>
        )}

        <div className="button-controls">
          {currentStep > 1 && (
            <button type="button" onClick={() => setCurrentStep(currentStep - 1)}>
              Previous
            </button>
          )}

          {currentStep < 2 ? (
            <button type="button" onClick={nextStep}>
              Next
            </button>
          ) : (
            <button type="submit">Submit</button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Register;
