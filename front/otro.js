// Connect to MetaMask and get encryption key
  const connectWallet = async () => {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        setError('MetaMask is not installed');
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      if (accounts.length === 0) {
        setError('No accounts found');
        return;
      }

      const userAccount = accounts[0];
      setAccount(userAccount);

      // Get encryption public key
      const encryptionKey = await window.ethereum.request({
        method: 'eth_getEncryptionPublicKey',
        params: [userAccount]
      });

      setPublicKey(encryptionKey);
      setError('');
    } catch (err) {
      setError(`Connection failed: ${err.message}`);
    }
  };

  // Encrypt message using the public key
  const encryptMessage = async () => {
    try {
      if (!publicKey) {
        setError('Please connect wallet first');
        return;
      }

      if (!message.trim()) {
        setError('Please enter a message to encrypt');
        return;
      }

      // Use real encryption with eth-sig-util
      const encryptedData = encrypt(
        publicKey,
        { data: message },
        'x25519-xsalsa20-poly1305'
      );

      // Convert to hex string format expected by eth_decrypt
      const encryptedHex = bufferToHex(
        Buffer.from(JSON.stringify(encryptedData), 'utf8')
      );

      setEncryptedData(encryptedHex);
      setError('');
    } catch (err) {
      setError(`Encryption failed: ${err.message}`);
    }
  };

  // Decrypt message using eth_decrypt
  const decryptMessage = async () => {
    try {
      if (!encryptedData) {
        setError('No encrypted data to decrypt');
        return;
      }

      if (!account) {
        setError('Please connect wallet first');
        return;
      }

      if (typeof window === 'undefined' || !window.ethereum) {
        setError('MetaMask is not available');
        return;
      }

      const decrypted = await window.ethereum.request({
        method: 'eth_decrypt',
        params: [encryptedData, account]
      });

      setDecryptedMessage(decrypted);
      setError('');
    } catch (err) {
      setError(`Decryption failed: ${err.message}`);
    }
  };
