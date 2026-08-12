import CryptoJS from "crypto-js";

export const decryptResponse = (cipherText) => {
    try {

        if (!cipherText) {
            throw new Error("Decryption failed");
        }
        const bytes = CryptoJS.AES.decrypt(cipherText, process.env.NEXT_PUBLIC_CREDENTIAL_ENCRYPTION_KEY);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    } catch (error) {
        console.log("Decrypt error:", error)

        localStorage.removeItem("user")
        localStorage.removeItem("token")
        localStorage.removeItem("accessToken")

        return null
    }
};


export const encryptData = (data) => {
    const stringData = typeof data === 'string' ? data : JSON.stringify(data)
    return CryptoJS.AES.encrypt(stringData, process.env.NEXT_PUBLIC_CREDENTIAL_ENCRYPTION_KEY).toString()
}

export const decryptData = (cipherText) => {
    try {
        if (!cipherText) return null
        const bytes = CryptoJS.AES.decrypt(cipherText, process.env.NEXT_PUBLIC_CREDENTIAL_ENCRYPTION_KEY)
        const decoded = bytes.toString(CryptoJS.enc.Utf8)
        if (!decoded) return null
        try {
            return JSON.parse(decoded)
        } catch {
            return decoded
        }
    } catch {
        return null
    }
}
