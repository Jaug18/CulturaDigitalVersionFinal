interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

interface UserData {
  username?: string;
  email?: string;
  password?: string;
  fullName?: string;
}

export function validateUserData(data: UserData): ValidationResult {
  const errors: Record<string, string[]> = {};

  // Validar username
  if (data.username !== undefined) {
    if (!data.username || data.username.trim().length === 0) {
      errors.username = ['El nombre de usuario es requerido'];
    } else if (data.username.length < 3) {
      errors.username = ['El nombre de usuario debe tener al menos 3 caracteres'];
    } else if (data.username.length > 50) {
      errors.username = ['El nombre de usuario no puede tener más de 50 caracteres'];
    } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
      errors.username = ['El nombre de usuario solo puede contener letras, números y guiones bajos'];
    }
  }

  // Validar email
  if (data.email !== undefined) {
    if (!data.email || data.email.trim().length === 0) {
      errors.email = ['El email es requerido'];
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.email = ['El formato del email no es válido'];
      } else if (data.email.length > 255) {
        errors.email = ['El email no puede tener más de 255 caracteres'];
      }
    }
  }

  // Validar password
  if (data.password !== undefined) {
    if (!data.password || data.password.trim().length === 0) {
      errors.password = ['La contraseña es requerida'];
    } else if (data.password.length < 6) {
      errors.password = ['La contraseña debe tener al menos 6 caracteres'];
    } else if (data.password.length > 100) {
      errors.password = ['La contraseña no puede tener más de 100 caracteres'];
    }
  }

  // Validar fullName (opcional)
  if (data.fullName !== undefined && data.fullName.trim().length > 0) {
    if (data.fullName.length > 255) {
      errors.fullName = ['El nombre completo no puede tener más de 255 caracteres'];
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!password || password.trim().length === 0) {
    errors.push('La contraseña es requerida');
  } else {
    if (password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }
    if (password.length > 100) {
      errors.push('La contraseña no puede tener más de 100 caracteres');
    }
    // Opcional: agregar más validaciones de complejidad
    // if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    //   errors.push('La contraseña debe contener al menos una minúscula, una mayúscula y un número');
    // }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
