// Validation utilities for frontend
//gender validation
export const validateGender = (gender) => {
  const allowed = ["male", "female", "other"];
  if (!allowed.includes(gender)) {
    return "Giới tính không hợp lệ";
  }
  return "";
};


// Email validation
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return 'Email không được để trống';
  }
  if (!re.test(email)) {
    return 'Email không hợp lệ';
  }
  return '';
};

// Password validation
export const validatePassword = (password) => {
  if (!password) {
    return 'Mật khẩu không được để trống';
  }
  if (password.length < 8) {
    return 'Mật khẩu phải có ít nhất 8 ký tự';
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return 'Mật khẩu phải chứa ít nhất 1 chữ thường';
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return 'Mật khẩu phải chứa ít nhất 1 chữ hoa';
  }
  if (!/(?=.*\d)/.test(password)) {
    return 'Mật khẩu phải chứa ít nhất 1 chữ số';
  }
  if (!/(?=.*[!@#$%^&*])/.test(password)) {
    return 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*)';
  }
  return '';
};

// Confirm password validation
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return 'Xác nhận mật khẩu không được để trống';
  }
  if (password !== confirmPassword) {
    return 'Mật khẩu xác nhận không khớp';
  }
  return '';
};

// Name validation
export const validateName = (name) => {
  if (!name || !name.trim()) {
    return 'Tên không được để trống';
  }
  if (name.trim().length < 2) {
    return 'Tên phải có ít nhất 2 ký tự';
  }
  if (name.trim().length > 50) {
    return 'Tên không được vượt quá 50 ký tự';
  }
  if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(name)) {
    return 'Tên chỉ được chứa chữ cái';
  }
  return '';
};

// Phone validation
export const validatePhone = (phone) => {
  if (!phone) {
    return ''; // Phone is optional
  }
  const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return 'Số điện thoại không hợp lệ (VD: 0912345678)';
  }
  return '';
};

// Date of birth validation
export const validateDateOfBirth = (dateOfBirth) => {
  if (!dateOfBirth) {
    return ''; // Optional field
  }
  
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  
  if (isNaN(birthDate.getTime())) {
    return 'Ngày sinh không hợp lệ';
  }
  
  if (age < 13) {
    return 'Bạn phải trên 13 tuổi';
  }
  
  if (age > 120) {
    return 'Ngày sinh không hợp lệ';
  }
  
  return '';
};

// OTP validation
export const validateOTP = (otp) => {
  if (!otp) {
    return 'OTP không được để trống';
  }
  if (otp.length !== 6) {
    return 'OTP phải có 6 chữ số';
  }
  if (!/^\d{6}$/.test(otp)) {
    return 'OTP chỉ được chứa số';
  }
  return '';
};

// File validation
export const validateImageFile = (file) => {
  if (!file) {
    return ''; // File is optional
  }
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return 'Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP)';
  }
  
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return 'Kích thước file không được vượt quá 5MB';
  }
  
  return '';
};

// Validate entire login form
export const validateLoginForm = (email, password) => {
  const errors = {};
  
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  
  if (!password) {
    errors.password = 'Mật khẩu không được để trống';
  }
  
  return errors;
};

// Validate entire register form
export const validateRegisterForm = (formData) => {
  const errors = {};
  
  const nameError = validateName(formData.name);
  if (nameError) errors.name = nameError;
  
  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;
  
  const passwordError = validatePassword(formData.password);
  if (passwordError) errors.password = passwordError;
  
  const confirmPasswordError = validateConfirmPassword(
    formData.password, 
    formData.confirmPassword
  );
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
  
  const phoneError = validatePhone(formData.phone);
  if (phoneError) errors.phone = phoneError;
  
  const dobError = validateDateOfBirth(formData.dateOfBirth);
  if (dobError) errors.dateOfBirth = dobError;

  const genderError = validateGender(formData.gender);
  if (genderError) errors.gender = genderError;

  
  return errors;
};

// Validate profile update form
export const validateProfileForm = (formData) => {
  const errors = {};
  
  const nameError = validateName(formData.name);
  if (nameError) errors.name = nameError;
  
  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;
  
  const phoneError = validatePhone(formData.phone);
  if (phoneError) errors.phone = phoneError;
  
  const dobError = validateDateOfBirth(formData.dateOfBirth);
  if (dobError) errors.dateOfBirth = dobError;
  
  return errors;
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

// Sanitize form data
export const sanitizeFormData = (formData) => {
  const sanitized = {};
  
  for (const key in formData) {
    if (typeof formData[key] === 'string') {
      sanitized[key] = sanitizeInput(formData[key]);
    } else {
      sanitized[key] = formData[key];
    }
  }
  
  return sanitized;
};