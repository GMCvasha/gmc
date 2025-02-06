const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const crypto = require('crypto');
const { generateAlphanumericVerificationCode } = require('../service/verificationcode');
const sendEmail = require('../service/emailService');
require('dotenv').config();

const registerUser = async (req, res) => {
  const { firstName,lastname, email, password, confirmPassword, } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/.test(password)) {
    return res.status(400).json({ message: 'Password must be at least 8 characters, with an uppercase letter, a lowercase letter, a number, and a special character.' });
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }] });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate verification code and send email
    const alphanumericCode = generateAlphanumericVerificationCode(6);
    const subject = `Verification - ${alphanumericCode}`;
    const churchMessage = `Dear ${firstName},

    Welcome to our Church App! We're honored to have you as part of our family. 
    
    To get started, please use the verification code below to activate your account:
    
    Verification Code: ${alphanumericCode}
    
    Alternatively, you can verify your account by clicking the link below:  
    <a href="https://admin-bgmc.web.app/verification" target="_blank">Verify My Account</a>
    
    If you have any questions or need help, don’t hesitate to contact us.
    
    Blessings,  
    Berean Global Methodist Church Naivasha Team`;

    const htmlMessage = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.8; max-width: 650px; margin: auto; border: 1px solid #e0e0e0; padding: 30px; border-radius: 12px; background-color: #f9f9f9; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">

      <div style="text-align: center; margin-bottom: 25px;">
        <h1 style="color: #2D6A4F; font-size: 28px; margin: 0;">Welcome to the Church App, ${firstName}!</h1>
        <p style="font-size: 16px; color: #555;">We’re excited to welcome you to our community.</p>
      </div>
  

      <div style="background: #DFF6E8; padding: 20px; border: 1px solid #2D6A4F; border-radius: 8px; text-align: center; margin-bottom: 20px;">
        <p style="font-size: 18px; font-weight: bold; color: #2D6A4F; margin: 0;">Your Verification Code:</p>
        <p style="font-size: 24px; font-weight: bold; color: #1B4332; margin: 10px 0;">${alphanumericCode}</p>
      </div>
  

      <div style="text-align: center; margin-bottom: 25px;">
        <p style="font-size: 16px; color: #555;">Click the button below to verify your account and complete your registration:</p>
        <a href="https://admin-bgmc.web.app/verification" style="display: inline-block; padding: 14px 30px; font-size: 16px; color: #ffffff; background-color: #2D6A4F; text-decoration: none; border-radius: 6px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); font-weight: bold;">
          Verify My Account
        </a>
      </div>
  
      <!-- Footer Section -->
      <div style="text-align: center; border-top: 1px solid #e0e0e0; padding-top: 15px; margin-top: 20px;">
        <p style="font-size: 16px; color: #555; margin: 10px 0;">Blessings,<br><strong> Berean Global Methodist Church Naivasha Team</strong></p>
      </div>
    </div>
  `;
  

    try {
      await sendEmail(email, subject, churchMessage, htmlMessage);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ message: 'Error sending verification email' });
    }


    user = new User({
      firstName,
      lastname,
      email,
      password,
      verificationCode: alphanumericCode,
      isVerified: false,
      active: false,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Server error during registration:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ $or: [{ email: username }, { firstName: username } ] });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your account first' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    user.active = true;
    await user.save();

    const token = jwt.sign({ id: user._id, username: user.firstName, email: user.email, category: 'category' }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({
      message: 'Login successful',
      token,
      category: 'user',
      username: user.firstName,
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in', error });
  }
};

const verifyUser = async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: 'Account verified successfully' });
  } catch (error) {
    console.error('Server error during verification:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const updateEmail = async (req, res) => {
  const { oldEmail, newEmail } = req.body;

  try {
    const user = await User.findOne({ email: oldEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.email = newEmail;
    await user.save();
    const subject = "Verification - " + user.verificationCode;

    const vermessage = `Dear ${user.firstName},

    Welcome to our Church App! We're honored to have you as part of our family. 
    
    To get started, please use the verification code below to activate your account:
    
    Verification Code: ${user.verificationCode}
    
    Alternatively, you can verify your account by clicking the link below:  
    <a href="https://admin-bgmc.web.app/verification" target="_blank">Verify My Account</a>
    
    If you have any questions or need help, don’t hesitate to contact us.
    
    Blessings,  
    Berean Global Methodist Church Naivasha Team`;

    const htmlMessage = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.8; max-width: 650px; margin: auto; border: 1px solid #e0e0e0; padding: 30px; border-radius: 12px; background-color: #f9f9f9; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">

      <div style="text-align: center; margin-bottom: 25px;">
        <h1 style="color: #2D6A4F; font-size: 28px; margin: 0;">Welcome to the Church App, ${user.firstName}!</h1>
        <p style="font-size: 16px; color: #555;">We’re excited to welcome you to our community.</p>
      </div>
  

      <div style="background: #DFF6E8; padding: 20px; border: 1px solid #2D6A4F; border-radius: 8px; text-align: center; margin-bottom: 20px;">
        <p style="font-size: 18px; font-weight: bold; color: #2D6A4F; margin: 0;">Your Verification Code:</p>
        <p style="font-size: 24px; font-weight: bold; color: #1B4332; margin: 10px 0;">${user.verificationCode}</p>
      </div>
  

      <div style="text-align: center; margin-bottom: 25px;">
        <p style="font-size: 16px; color: #555;">Click the button below to verify your account and complete your registration:</p>
        <a href="https://admin-bgmc.web.app/verification" style="display: inline-block; padding: 14px 30px; font-size: 16px; color: #ffffff; background-color: #2D6A4F; text-decoration: none; border-radius: 6px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); font-weight: bold;">
          Verify My Account
        </a>
      </div>
  
      <!-- Footer Section -->
      <div style="text-align: center; border-top: 1px solid #e0e0e0; padding-top: 15px; margin-top: 20px;">
        <p style="font-size: 16px; color: #555; margin: 10px 0;">Blessings,<br><strong> Berean Global Methodist Church Naivasha Team</strong></p>
      </div>
    </div>
  `;

    try {
      await sendEmail(user.email, subject, vermessage, htmlMessage);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ message: 'Error sending verification email' });
    }
    try {
      const token = jwt.sign({ id: user._id, username: user.firstName, email: user.email, category: 'category' }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
  
      res.status(200).json({ message: 'Email updated successfully', token });
    } catch (error) {
      res.status(500).json({ message: 'An error occurred token' });
    }

  } catch (error) {
    res.status(500).json({ message: 'An error occurred while updating email' });
  }
};

const resendVerificationCode = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email});
    if (!user) {
      return res.status(404).json({ message: 'User not found register first and try again.' });
    }


    const subject = "Verification - " + user.verificationCode;
    
    const vermessage = `Dear ${user.firstName},

    Welcome to our Church App! We're honored to have you as part of our family. 
    
    To get started, please use the verification code below to activate your account:
    
    Verification Code: ${user.verificationCode}
    
    Alternatively, you can verify your account by clicking the link below:  
    <a href="https://admin-bgmc.web.app/verification" target="_blank">Verify My Account</a>
    
    If you have any questions or need help, don’t hesitate to contact us.
    
    Blessings,  
    Berean Global Methodist Church Naivasha Team`;

    const htmlMessage = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.8; max-width: 650px; margin: auto; border: 1px solid #e0e0e0; padding: 30px; border-radius: 12px; background-color: #f9f9f9; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">

      <div style="text-align: center; margin-bottom: 25px;">
        <h1 style="color: #2D6A4F; font-size: 28px; margin: 0;">Welcome to the Church App, ${user.firstName}!</h1>
        <p style="font-size: 16px; color: #555;">We’re excited to welcome you to our community.</p>
      </div>
  

      <div style="background: #DFF6E8; padding: 20px; border: 1px solid #2D6A4F; border-radius: 8px; text-align: center; margin-bottom: 20px;">
        <p style="font-size: 18px; font-weight: bold; color: #2D6A4F; margin: 0;">Your Verification Code:</p>
        <p style="font-size: 24px; font-weight: bold; color: #1B4332; margin: 10px 0;">${user.verificationCode}</p>
      </div>
  

      <div style="text-align: center; margin-bottom: 25px;">
        <p style="font-size: 16px; color: #555;">Click the button below to verify your account and complete your registration:</p>
        <a href="https://admin-bgmc.web.app/verification" style="display: inline-block; padding: 14px 30px; font-size: 16px; color: #ffffff; background-color: #2D6A4F; text-decoration: none; border-radius: 6px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); font-weight: bold;">
          Verify My Account
        </a>
      </div>
  
      <!-- Footer Section -->
      <div style="text-align: center; border-top: 1px solid #e0e0e0; padding-top: 15px; margin-top: 20px;">
        <p style="font-size: 16px; color: #555; margin: 10px 0;">Blessings,<br><strong> Berean Global Methodist Church Naivasha Team</strong></p>
      </div>
    </div>
  `;
  
    try {
      await sendEmail(user.email, subject, vermessage, htmlMessage);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ message: 'Error sending verification email' });
    }

    res.status(200).json({ message: 'Verification code sent successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while sending verification code.' });
  }
};

const newrecoverPassword = async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ firstName: username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.passwordRecoveryToken = token;
    user.tokenExpiry = moment().add(1, 'hour').toDate();
    

    // Send the recovery email
    const subject = 'Password Reset Request';
    const message = `Dear ${user.firstName},

    We received a request to reset your password. To proceed, please use the token provided below:
    
    Password Reset Token: ${user.passwordRecoveryToken}
    
    Alternatively, you can reset your password by following this link: https://admin-bgmc.web.app/reset-password
    
    This token is valid for 1 hour. If you did not request a password reset, please ignore this message.
    
    Blessings,  
    Berean Global Methodist Church Naivasha Team`;
    
    const htmlMessage = `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.8; max-width: 600px; margin: auto; border: 1px solid #e1e1e1; padding: 25px; border-radius: 10px; background-color: #ffffff;">
      <h2 style="color: #1d4ed8; text-align: center; font-size: 26px; margin-bottom: 10px;">
        Password Reset Request
      </h2>
      <p style="font-size: 16px; color: #555; text-align: center; margin-top: 0;">
        Dear ${user.firstName},<br> We received a request to reset your password. To proceed, please use the token provided below:
      </p>
      <div style="margin: 25px 0; padding: 20px; background-color: #f0f5fc; border: 1px dashed #1d4ed8; text-align: center; border-radius: 8px;">
        <p style="font-size: 20px; font-weight: bold; color: #1d4ed8; letter-spacing: 1px;">
          Password Reset Token: <span style="color: #1d4ed8;">${user.passwordRecoveryToken}</span>
        </p>
      </div>
      <p style="text-align: center;">
        <a href="https://admin-bgmc.web.app/reset-password" style="display: inline-block; padding: 12px 25px; font-size: 16px; color: #ffffff; background-color: #1d4ed8; text-decoration: none; border-radius: 6px; margin-top: 15px;">
          Reset Your Password
        </a>
      </p>

      <p style="font-size: 14px; color: #888; text-align: center; margin-top: 20px;">
        This token is valid for 1 hour. If you did not request a password reset, please disregard this email.
      </p>
      <p style="font-size: 16px; color: #333; text-align: center; margin-top: 30px;">
        Blessings, <br> Berean Global Methodist Church Naivasha Team
      </p>
    </div>
  `;
  
    try {
      await sendEmail(user.email, subject, message, htmlMessage);
      await user.save();
      res.status(200).json({ message: 'Password recovery email sent successfully.' });
    } catch (error) {
      res.status(500).json({ message: 'Error sending password recovery email' });
    }
  } catch (error) {
    res.status(500).json({ message: 'An error occurred during password recovery.' });
  }
};

const resetPassword = async (req, res) => {
  const { email, verificationCode, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.passwordRecoveryToken !== verificationCode) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    if (moment().isAfter(user.tokenExpiry)) {
      return res.status(400).json({ message: 'Token has expired' });
    }

    user.password = newPassword;
    user.passwordRecoveryToken = undefined;
    user.tokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred during password reset.' });
  }
};

const logout = async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ email: username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.active = false;
    await user.save();

    res.status(200).json({ message: 'User logged out successfully.' });
  } catch (error) {
    console.error('Logout failed:', error);
    res.status(500).json({ message: 'Logout failed.' });
  }
};


const changeusername = async (req, res) => {
  const { lemail, newUsername } = req.body;

  try {
    const user = await User.findOne({ email: lemail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    let checkuser = await User.findOne({ newUsername });
    if (checkuser) {
      return res.status(400).json({ message: 'Username already exists try a different one.' });
    }
    user.username = newUsername;
    await user.save();
    const token = jwt.sign({ id: user._id, username: user.username, email: user.email, category: user.category }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.status(200).json({ message: 'Username updated successfully', token });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while updating Username' });
  }
};

const changepassword = async (req, res) => {
  const { lemail, newPassword } = req.body;

  try {
    const user = await User.findOne({ email: lemail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();
    const token = jwt.sign({ id: user._id, username: user.username, email: user.email, category: user.category }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.status(200).json({ message: 'Password updated successfully', token});
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while updating password' });
  }
};

const changephonenumber = async (req, res) => {
  const { lemail, newPhoneNumber } = req.body;

  try {
    const user = await User.findOne({ email: lemail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.phoneNumber = newPhoneNumber;
    await user.save();
    const token = jwt.sign({ id: user._id, username: user.username, email: user.email, category: user.category }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.status(200).json({ message: 'Phone number updated successfully', token });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while updating phone number' });
  }
};

const changeemail = async (req, res) => {
  const { lemail, newEmail } = req.body;

  try {
    const user = await User.findOne({ email: lemail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    let checkuser = await User.findOne({ newEmail });
    if (checkuser) {
      return res.status(400).json({ message: 'Email already exists try a different one.' });
    }
    user.email = newEmail;
    await user.save();
    const subject = "Verification - " + user.verificationCode;
    const vermessage = `Dear ${user.firstName},

    Welcome to our Church App! We're honored to have you as part of our family. 
    
    To get started, please use the verification code below to activate your account:
    
    Verification Code: ${user.verificationCode}
    
    Alternatively, you can verify your account by clicking the link below:  
    <a href="https://churchapp.web.app/verification" target="_blank">Verify My Account</a>
    
    If you have any questions or need help, don’t hesitate to contact us.
    
    Blessings,  
    Berean Global Methodist Church Naivasha Team`;

    const htmlMessage = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.8; max-width: 650px; margin: auto; border: 1px solid #e0e0e0; padding: 30px; border-radius: 12px; background-color: #f9f9f9; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">

      <div style="text-align: center; margin-bottom: 25px;">
        <h1 style="color: #2D6A4F; font-size: 28px; margin: 0;">Welcome to the Church App, ${user.firstName}!</h1>
        <p style="font-size: 16px; color: #555;">We’re excited to welcome you to our community.</p>
      </div>
  

      <div style="background: #DFF6E8; padding: 20px; border: 1px solid #2D6A4F; border-radius: 8px; text-align: center; margin-bottom: 20px;">
        <p style="font-size: 18px; font-weight: bold; color: #2D6A4F; margin: 0;">Your Verification Code:</p>
        <p style="font-size: 24px; font-weight: bold; color: #1B4332; margin: 10px 0;">${user.verificationCode}</p>
      </div>
  

      <div style="text-align: center; margin-bottom: 25px;">
        <p style="font-size: 16px; color: #555;">Click the button below to verify your account and complete your registration:</p>
        <a href="https://churchapp.web.app/verification" style="display: inline-block; padding: 14px 30px; font-size: 16px; color: #ffffff; background-color: #2D6A4F; text-decoration: none; border-radius: 6px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); font-weight: bold;">
          Verify My Account
        </a>
      </div>
  
      <!-- Footer Section -->
      <div style="text-align: center; border-top: 1px solid #e0e0e0; padding-top: 15px; margin-top: 20px;">
        <p style="font-size: 16px; color: #555; margin: 10px 0;">Blessings,<br><strong> Berean Global Methodist Church Naivasha Team</strong></p>
      </div>
    </div>
  `;

  try {
      await sendEmail(lemail, subject, vermessage, htmlMessage);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ message: 'Error sending verification email' });
    }
    const token = jwt.sign({ id: user._id, username: user.firstName, email: user.email, category: 'category' }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.status(200).json({ message: 'Email updated successfully', token});
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while updating Email' });
  }
};

module.exports = {
  registerUser,
  login,
  verifyUser,
  updateEmail,
  resendVerificationCode,
  newrecoverPassword,
  resetPassword,
  changeusername,
  changepassword,
  changephonenumber,
  changeemail,
  logout,
};
