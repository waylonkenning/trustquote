document.addEventListener('DOMContentLoaded', async () => {
    // DOM Elements
    const generateKeysBtn = document.getElementById('generateKeysBtn');
    const publishBtn = document.getElementById('publishBtn');
    // const verifyBtn = document.getElementById('verifyBtn'); // verifyBtn event listener is separate

    // const publishForm = document.getElementById('publishForm'); // Not used directly for submit, button click is used
    const verifyForm = document.getElementById('verifyForm');

    const publicKeyPemDisplay = document.getElementById('publicKeyPemDisplay');
    const privateKeyPemDisplay = document.getElementById('privateKeyPemDisplay'); // Caution: Displaying private key
    const didDisplay = document.getElementById('didDisplay');
const publicKeySection = document.getElementById('publicKeySection');
    const privateKeySection = document.getElementById('privateKeySection');
    const statusMessages = document.getElementById('statusMessages'); // New status display area

    const publishContentText = document.getElementById('publishContentText');
    const publishSourceUrl = document.getElementById('publishSourceUrl');
    const publishResponseArea = document.getElementById('publishResponseArea');

    const verifyDid = document.getElementById('verifyDid');
    const verifySourceUrl = document.getElementById('verifySourceUrl');
    const verifyContentText = document.getElementById('verifyContentText');
    const verifyTimestamp = document.getElementById('verifyTimestamp');
    const verifySignature = document.getElementById('verifySignature');
    const verifyPublicKeyPem = document.getElementById('verifyPublicKeyPem');
    const verifyResponseArea = document.getElementById('verifyResponseArea');

    let currentPrivateKey; // To store the CryptoKey object for the private key

    const LS_PUBLIC_KEY_PEM = 'publicKeyPem';
    const LS_PRIVATE_KEY_PEM = 'privateKeyPem';
    const LS_DID_KEY = 'didKey';

    // --- Helper Functions ---

    function arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    function arrayBufferToPem(buffer, type) {
        const base64String = arrayBufferToBase64(buffer);
        let pemString = `-----BEGIN ${type}-----\n`;
        let offset = 0;
        while (offset < base64String.length) {
            pemString += base64String.substring(offset, offset + 64) + '\n';
            offset += 64;
        }
        pemString += `-----END ${type}-----\n`;
        return pemString;
    }
    
    function pemToBinary(pem) {
        const lines = pem.split('\n');
        let base64 = '';
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('-----BEGIN') || lines[i].startsWith('-----END') || lines[i].trim() === '') {
                continue;
            }
            base64 += lines[i].trim();
        }
        return base64;
    }

    function base64ToArrayBuffer(base64) {
        const binary_string = window.atob(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }

    async function importPrivateKeyPem(pemKey) {
        try {
            const binaryKey = pemToBinary(pemKey);
            const arrayBufferKey = base64ToArrayBuffer(binaryKey);
            return await window.crypto.subtle.importKey(
                'pkcs8',
                arrayBufferKey,
                { name: 'ECDSA', namedCurve: 'P-256' },
                true,
                ['sign']
            );
        } catch (e) {
            console.error("Failed to import private key:", e);
            setStatusMessage(`Error importing private key: ${e.message}`, 'error');
            return null;
        }
    }

    function base64urlEncode(str) {
        return btoa(str)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }

    function arrayBufferToBase64Url(buffer) {
        return base64urlEncode(String.fromCharCode.apply(null, new Uint8Array(buffer)));
    }
    
    // Not strictly needed for current flow if public CryptoKey object isn't used elsewhere, but good for completeness
    async function importPublicKeyPem(pemKey) {
        try {
            const binaryKey = pemToBinary(pemKey);
            const arrayBufferKey = base64ToArrayBuffer(binaryKey);
            return await window.crypto.subtle.importKey(
                'spki',
                arrayBufferKey,
                { name: 'ECDSA', namedCurve: 'P-256' },
                true,
                ['verify']
            );
        } catch (e) {
            console.error("Failed to import public key:", e);
            // setStatusMessage(`Error importing public key: ${e.message}`, 'error'); // Less critical for status
            return null;
        }
    }


    function base58btcEncode(buffer) {
        const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
        const BASE = ALPHABET.length;
        const bytes = new Uint8Array(buffer);
        let value = BigInt(0);
        for (let i = 0; i < bytes.length; i++) {
            value = (value * BigInt(256)) + BigInt(bytes[i]);
        }

        let result = '';
        while (value > 0) {
            result = ALPHABET[Number(value % BigInt(BASE))] + result;
            value /= BigInt(BASE);
        }
        for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
            result = ALPHABET[0] + result;
        }
        return result;
    }

    async function generateDidKeyFromRawPublicKey(rawPublicKeyBuffer) {
        const multicodecPrefix = new Uint8Array([0x12, 0x01]); // P-256 uncompressed public key (secp256r1-pub) is 0x1201, not 0xeb51 or 0x1301
                                                              // 0x12 = varint encoded P-256, 0x01 = uncompressed
                                                              // The previous 0x1301 was for secp256k1-pub. P-256 is secp256r1.
                                                              // Correct multicodec for secp256r1 uncompressed is 0x1201 (for did:key).
                                                              // However, the common practice for did:key with P-256 (secp256r1) is to use the multicodec 'zQ3s' prefix
                                                              // which corresponds to a raw public key (uncompressed, 65 bytes: 0x04 + X + Y)
                                                              // Let's use the direct raw key approach for did:key:z...
                                                              // The multicodec for P-256 public key is 0x1201.
                                                              // For did:key, the multiformats prefix for P-256 (secp256r1) uncompressed public key is `zQ3s`.
                                                              // This `zQ3s` implies a certain encoding.
                                                              // The `did:key` spec often uses `z` + base58btc(multicodec_prefix + key_bytes).
                                                              // For P-256 (secp256r1) uncompressed public key, the multicodec prefix is 0x1201.
        const p256UncompressedPrefix = new Uint8Array([0x12, 0x01]); // This is the multicodec prefix for secp256r1 public key.
        const publicKeyBytes = new Uint8Array(rawPublicKeyBuffer); // Should be 65 bytes (0x04 + X + Y)
        
        const prefixedKeyBytes = new Uint8Array(p256UncompressedPrefix.length + publicKeyBytes.length);
        prefixedKeyBytes.set(p256UncompressedPrefix);
        prefixedKeyBytes.set(publicKeyBytes, p256UncompressedPrefix.length);

        const base58EncodedKey = base58btcEncode(prefixedKeyBytes);
        return `did:key:z${base58EncodedKey}`;
    }
    
function canonicalJsonStringify(obj) {
    if (obj === null || typeof obj !== 'object' || obj instanceof Date || obj instanceof RegExp) {
        return JSON.stringify(obj);
    }
    if (Array.isArray(obj)) {
        return '[' + obj.map(item => canonicalJsonStringify(item)).join(',') + ']';
    }
    // It's an object
    const keys = Object.keys(obj).sort();
    let result = '{';
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (i > 0) {
            result += ',';
        }
        result += JSON.stringify(key) + ':' + canonicalJsonStringify(obj[key]);
    }
    result += '}';
    return result;
}

    function setStatusMessage(message, type = 'info') { // type can be 'info', 'success', 'error'
        if (statusMessages) {
            statusMessages.textContent = message;
            statusMessages.className = `status-messages ${type}`;
        }
        // Also log to console for debugging
        if (type === 'error') console.error(message);
        else console.log(message);
    }

    // --- Core Key/DID Management ---

    async function generateAndStoreKeysAndDID(isInitialLoad = false) {
        try {
            setStatusMessage(isInitialLoad ? "Generating new keys and DID..." : "Regenerating keys and DID...");
            const keyPair = await window.crypto.subtle.generateKey(
                { name: 'ECDSA', namedCurve: 'P-256' },
                true, // exportable
                ['sign', 'verify']
            );
            
            currentPrivateKey = keyPair.privateKey;

            // Public Key
            const publicKeySpki = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
            const newPublicKeyPem = arrayBufferToPem(publicKeySpki, 'PUBLIC KEY');
            localStorage.setItem(LS_PUBLIC_KEY_PEM, newPublicKeyPem);
            if (publicKeyPemDisplay) publicKeyPemDisplay.textContent = newPublicKeyPem;

            // Private Key
            const privateKeyPkcs8 = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
            const newPrivateKeyPem = arrayBufferToPem(privateKeyPkcs8, 'PRIVATE KEY');
            localStorage.setItem(LS_PRIVATE_KEY_PEM, newPrivateKeyPem);
            if (privateKeyPemDisplay) privateKeyPemDisplay.textContent = newPrivateKeyPem; // Caution

            // DID
            const rawPublicKey = await window.crypto.subtle.exportKey('raw', keyPair.publicKey);
            const newDid = await generateDidKeyFromRawPublicKey(rawPublicKey);
            localStorage.setItem(LS_DID_KEY, newDid);
            if (didDisplay) didDisplay.textContent = newDid;

            if (publishBtn) publishBtn.disabled = false;
            setStatusMessage(isInitialLoad ? "New keys and DID generated and stored successfully." : "Keys and DID regenerated and stored successfully.", 'success');

// Ensure key generation and display elements are visible after generation
            if (generateKeysBtn) generateKeysBtn.style.display = ''; // Reset to default
            if (publicKeySection) publicKeySection.style.display = ''; // Reset to default
            if (privateKeySection) privateKeySection.style.display = ''; // Reset to default
            if (didDisplay) didDisplay.style.display = 'block'; // or 'inline' or '' depending on original styling
        } catch (error) {
            console.error('Key generation/storage error:', error);
            setStatusMessage(`Error generating/storing keys: ${error.message}`, 'error');
            if (publishBtn) publishBtn.disabled = true;
        }
    }

    async function loadKeysAndDIDFromStorage() {
        setStatusMessage("Checking for existing keys and DID in storage...");
        const storedPublicKeyPem = localStorage.getItem(LS_PUBLIC_KEY_PEM);
        const storedPrivateKeyPem = localStorage.getItem(LS_PRIVATE_KEY_PEM);
        const storedDid = localStorage.getItem(LS_DID_KEY);

        if (storedPublicKeyPem && storedPrivateKeyPem && storedDid) {
            if (publicKeyPemDisplay) publicKeyPemDisplay.textContent = storedPublicKeyPem;
            if (privateKeyPemDisplay) privateKeyPemDisplay.textContent = storedPrivateKeyPem; // Caution
            if (didDisplay) didDisplay.textContent = storedDid;

            currentPrivateKey = await importPrivateKeyPem(storedPrivateKeyPem);
            
            if (currentPrivateKey) {
                if (publishBtn) publishBtn.disabled = false;
                setStatusMessage("Keys and DID loaded from storage successfully.", 'success');

                // Hide key generation and display elements
                if (generateKeysBtn) generateKeysBtn.style.display = 'none';
                if (publicKeySection) publicKeySection.style.display = 'none';
                if (privateKeySection) privateKeySection.style.display = 'none';
                // Ensure DID display is visible (though it should be by default)
                if (didDisplay) didDisplay.style.display = 'block'; // or 'inline' or '' depending on original styling

                return true;
            } else {
                setStatusMessage("Failed to import stored private key. Consider regenerating keys.", 'error');
                if (publishBtn) publishBtn.disabled = true;
                // Ensure key generation and display elements are visible if loading failed
                if (generateKeysBtn) generateKeysBtn.style.display = ''; // Reset to default
                if (publicKeySection) publicKeySection.style.display = ''; // Reset to default
                if (privateKeySection) privateKeySection.style.display = ''; // Reset to default
                return false; // Indicate failure to load properly
            }
        }
        setStatusMessage("No complete key/DID set found in storage.", 'info');
        // Ensure key generation and display elements are visible if no keys found
        if (generateKeysBtn) generateKeysBtn.style.display = ''; // Reset to default
        if (publicKeySection) publicKeySection.style.display = ''; // Reset to default
        if (privateKeySection) privateKeySection.style.display = ''; // Reset to default
        return false;
    }

    // --- Initialization on Page Load ---
    async function initializeApp() {
        if (publishBtn) publishBtn.disabled = true; // Disable initially
        const loaded = await loadKeysAndDIDFromStorage();
        if (!loaded) {
            await generateAndStoreKeysAndDID(true); // True for initial load context
        }
    }


    // --- Event Listeners ---

    if (generateKeysBtn) {
        generateKeysBtn.addEventListener('click', () => generateAndStoreKeysAndDID(false)); // False for explicit regeneration
    }

    if (publishBtn) {
        publishBtn.addEventListener('click', createAndPublishVerifiableInformation);
    }

    if (verifyForm) {
        verifyForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            try {
                const payload = {
                    did: verifyDid.value,
                    source_url: verifySourceUrl.value,
                    content_text: verifyContentText.value,
                    timestamp: verifyTimestamp.value,
                    signature: verifySignature.value,
                    public_key_pem: verifyPublicKeyPem.value,
                };

                if(verifyResponseArea) verifyResponseArea.textContent = "Verifying...";
                const response = await fetch('/api/v1/verifier/verify/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                const responseData = await response.json();
                if (verifyResponseArea) {
                    if (response.ok) {
                        verifyResponseArea.textContent = `Verification Result:\n${JSON.stringify(responseData, null, 2)}`;
                    } else {
                        verifyResponseArea.textContent = `Error ${response.status}:\n${JSON.stringify(responseData, null, 2)}`;
                    }
                }
            } catch (error) {
                console.error('Verification error:', error);
                if (verifyResponseArea) verifyResponseArea.textContent = `Error verifying: ${error.message}`;
            }
        });
    }
    
    // --- Publishing Logic (Updated to create and publish Verifiable Credential) ---
    async function createAndPublishVerifiableInformation(event) {
        if (event) event.preventDefault();

        if (!currentPrivateKey) { // Still need private key if we were to sign the VC proof
            if (publishResponseArea) publishResponseArea.textContent = "Error: Private key not available. Please ensure keys are loaded or generated.";
            setStatusMessage("Error: Private key not available for publishing.", "error");
            return;
        }

        const contentText = publishContentText ? publishContentText.value : '';
        const sourceUrl = publishSourceUrl ? publishSourceUrl.value : '';
        const issuerDid = didDisplay ? didDisplay.textContent : '';

        if (!issuerDid) {
            if (publishResponseArea) publishResponseArea.textContent = "Error: Issuer DID not available. Please ensure keys and DID are generated.";
            setStatusMessage("Error: Issuer DID not available for publishing.", "error");
            return;
        }

        try {
            setStatusMessage("Constructing Verifiable Credential...", 'info');
            const issuanceDate = new Date().toISOString();
            const credentialId = `urn:uuid:${crypto.randomUUID()}`;

            const verifiableCredential = {
                "@context": [
                    "https://www.w3.org/2018/credentials/v1"
                ],
                "id": credentialId,
                "type": ["VerifiableCredential", "WebContentAttestation"],
                "issuer": issuerDid,
                "issuanceDate": issuanceDate,
                "credentialSubject": {
                    "id": sourceUrl || `urn:uuid:${crypto.randomUUID()}`, // Use sourceUrl or a new UUID if sourceUrl is empty
                    "contentText": contentText,
                    "sourceUrl": sourceUrl
                },
                "proof": {
                    "type": "EcdsaSecp256r1Signature2019", // Placeholder, as P-256 keys are used
                    "created": issuanceDate,
                    "proofPurpose": "assertionMethod",
                    "verificationMethod": `${issuerDid}#keys-1`, // Convention for the first key
                    "jws": "signature_goes_here" // Placeholder for the actual signature
                }
            };

            // --- Sign the VC ---
            setStatusMessage("Signing Verifiable Credential...", 'info');
            const privateKeyPem = localStorage.getItem(LS_PRIVATE_KEY_PEM);
            if (!privateKeyPem) {
                setStatusMessage("Error: Private key PEM not found in local storage for signing.", "error");
                if (publishResponseArea) publishResponseArea.textContent += "\n\nError: Private key PEM not found for signing.";
                return;
            }

            const cryptoKey = await importPrivateKeyPem(privateKeyPem);
            if (!cryptoKey) {
                setStatusMessage("Error: Could not import private key for signing.", "error");
                if (publishResponseArea) publishResponseArea.textContent += "\n\nError: Could not import private key for signing.";
                return;
            }

            // Prepare the payload for signing: VC without the 'proof' object, canonicalized.
            const vcToSign = JSON.parse(JSON.stringify(verifiableCredential)); // Deep clone
            delete vcToSign.proof; // Remove the proof object before signing

            const canonicalPayloadString = canonicalJsonStringify(vcToSign);
            // console.log("Client-side canonical payload for signing:", canonicalPayloadString); // For debugging

            const jwsHeader = { alg: "ES256", typ: "JWT" };
            const encodedHeader = base64urlEncode(JSON.stringify(jwsHeader));

            // Sign the canonical payload string directly
            const payloadToSignBuffer = new TextEncoder().encode(canonicalPayloadString);

            const signatureBuffer = await window.crypto.subtle.sign(
                { name: "ECDSA", hash: { name: "SHA-256" } },
                cryptoKey, // Imported private key
                payloadToSignBuffer
            );

            const encodedSignature = arrayBufferToBase64Url(signatureBuffer);

            // Construct JWS with detached payload (empty payload part)
            const jws = `${encodedHeader}..${encodedSignature}`;
            verifiableCredential.proof.jws = jws; // Store the detached JWS

            setStatusMessage("Verifiable Credential signed successfully (detached JWS).", 'success');
            // --- End Sign the VC ---


            // Display the generated VC (now with signature) in the UI
            if (publishResponseArea) {
                publishResponseArea.textContent = `Generated Verifiable Credential (Signed):\n${JSON.stringify(verifiableCredential, null, 2)}`;
            }
            setStatusMessage("Signed Verifiable Credential constructed. Preparing to publish...", 'info');


            // Simulate a short delay before "publishing" to allow user to see the VC
            await new Promise(resolve => setTimeout(resolve, 1500));

            if (publishResponseArea) publishResponseArea.textContent = "Publishing Verifiable Credential...";
            
            const publicKeyPem = localStorage.getItem(LS_PUBLIC_KEY_PEM);
            const requestBody = {
                verifiable_credential: verifiableCredential, // Contains the VC with the detached JWS in its proof
                public_key_pem: publicKeyPem
            };

            const response = await fetch('/api/v1/publisher/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            const responseData = await response.json();
            if (publishResponseArea) {
                if (response.ok) {
                    // Append success message below the displayed VC
                    publishResponseArea.textContent += `\n\nPublishing Success:\n${JSON.stringify(responseData, null, 2)}`;
                    setStatusMessage("Verifiable Credential published successfully.", 'success');
                } else {
                     // Append error message below the displayed VC
                    publishResponseArea.textContent += `\n\nPublishing Error ${response.status}:\n${JSON.stringify(responseData, null, 2)}`;
                    setStatusMessage(`Error publishing VC: ${response.status} ${responseData.detail || ''}`, 'error');
                }
            }
        } catch (error) {
            console.error('Publishing VC error:', error);
            if (publishResponseArea) {
                 // Append error message below the (potentially partially) displayed VC
                publishResponseArea.textContent += `\n\nError constructing/publishing VC: ${error.message}`;
            }
            setStatusMessage(`Error constructing/publishing VC: ${error.message}`, 'error');
        }
    }

    // Initialize the app
    initializeApp();
});