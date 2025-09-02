// Funciones de encriptación personalizadas sin librerías externas

// Función para obtener la palabra clave del entorno
const getEnvPassphrase = () => {
  return "jamon"; // Tu palabra clave del .env
};

// Función simple de hash (similar a SHA256 pero más simple)
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
};

// Crear clave combinada usando hash simple
const createCombinedKey = (publicKey, passphrase) => {
  const combined = publicKey + passphrase + "passdot_salt";
  return simpleHash(combined);
};

// Algoritmo XOR mejorado con múltiples pasadas
const xorEncrypt = (text, key) => {
  let result = '';
  const keyHash = simpleHash(key);
  
  // Múltiples pasadas para mayor complejidad
  let currentText = text;
  for (let pass = 0; pass < 3; pass++) {
    let passResult = '';
    for (let i = 0; i < currentText.length; i++) {
      const textChar = currentText.charCodeAt(i);
      const keyChar = keyHash.charCodeAt(i % keyHash.length);
      const shift = (pass + 1) * 17; // Valor primo para mayor entropía
      passResult += String.fromCharCode(textChar ^ keyChar ^ shift);
    }
    currentText = passResult;
  }
  
  // Convertir a Base64 para evitar caracteres especiales
  return btoa(currentText);
};

// Desencriptación XOR (proceso inverso)
const xorDecrypt = (encryptedText, key) => {
  try {
    const keyHash = simpleHash(key);
    let currentText = atob(encryptedText); // Decodificar Base64
    
    // Aplicar las mismas pasadas pero en orden inverso
    for (let pass = 2; pass >= 0; pass--) {
      let passResult = '';
      for (let i = 0; i < currentText.length; i++) {
        const textChar = currentText.charCodeAt(i);
        const keyChar = keyHash.charCodeAt(i % keyHash.length);
        const shift = (pass + 1) * 17;
        passResult += String.fromCharCode(textChar ^ keyChar ^ shift);
      }
      currentText = passResult;
    }
    
    return currentText;
  } catch (err) {
    throw new Error('Failed to decrypt: Invalid data or key');
  }
};

// Función principal de encriptación
const encryptMessage = (message, publicKey) => {
  try {
    const envPassphrase = getEnvPassphrase();
    const combinedKey = createCombinedKey(publicKey, envPassphrase);
    
    // Agregar timestamp y checksum para validación
    const timestamp = Date.now();
    const messageWithMeta = `${timestamp}:${message}:${simpleHash(message)}`;
    
    return xorEncrypt(messageWithMeta, combinedKey);
  } catch (err) {
    throw new Error('Encryption failed: ' + err.message);
  }
};

// Función principal de desencriptación
const decryptMessage = (encryptedData, publicKey) => {
  try {
    const envPassphrase = getEnvPassphrase();
    const combinedKey = createCombinedKey(publicKey, envPassphrase);
    
    const decryptedMeta = xorDecrypt(encryptedData, combinedKey);
    const parts = decryptedMeta.split(':');
    
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const timestamp = parts[0];
    const message = parts[1];
    const checksum = parts[2];
    
    // Validar checksum
    if (simpleHash(message) !== checksum) {
      throw new Error('Data integrity check failed');
    }
    
    // Validar que no sea demasiado antiguo (opcional)
    const age = Date.now() - parseInt(timestamp);
    const maxAge = 365 * 24 * 60 * 60 * 1000; // 1 año en millisegundos
    if (age > maxAge) {
      console.warn('Warning: Decrypted data is very old');
    }
    
    return message;
  } catch (err) {
    throw new Error('Decryption failed: ' + err.message);
  }
};

// Función de rotación de caracteres (algoritmo adicional)
const rotateString = (str, shift) => {
  return str.split('').map(char => {
    const code = char.charCodeAt(0);
    return String.fromCharCode(((code + shift) % 256));
  }).join('');
};

// Algoritmo alternativo usando rotación César modificada
const caesarEncrypt = (text, key) => {
  const keySum = key.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const shift = keySum % 255;
  
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const charCode = char.charCodeAt(0);
    const newCharCode = ((charCode + shift + i) % 256);
    result += String.fromCharCode(newCharCode);
  }
  
  return btoa(result);
};

const caesarDecrypt = (encryptedText, key) => {
  try {
    const decoded = atob(encryptedText);
    const keySum = key.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const shift = keySum % 255;
    
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      const char = decoded[i];
      const charCode = char.charCodeAt(0);
      const newCharCode = ((charCode - shift - i + 256) % 256);
      result += String.fromCharCode(newCharCode);
    }
    
    return result;
  } catch (err) {
    throw new Error('Caesar decryption failed');
  }
};

// Exportar funciones para usar en script.js
export {
  encryptMessage,
  decryptMessage,
  simpleHash,
  xorEncrypt,
  xorDecrypt,
  caesarEncrypt,
  caesarDecrypt
};
