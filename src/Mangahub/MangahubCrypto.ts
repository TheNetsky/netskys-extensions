import { gcm } from '@noble/ciphers/aes'

// MangaHub now returns chapter pages encrypted as:
//   enc:v1:<keyId>:<iv>:<authTag>:<ciphertext>   (all base64url, AES-GCM)
// The key comes from https://mangahub.io/api/chapter-crypto, which returns
//   { keyId?, key?, expiresAt?, keys?: { [keyId]: key } }
// Paperback's JS runtime has no WebCrypto/atob/TextDecoder, so everything here is pure JS.

export interface ChapterCryptoParams {
    keyId?: string
    key?: string
    expiresAt?: number
    keys?: Record<string, string>
}

export const isEncryptedPages = (pages: string): boolean => pages.startsWith('enc:v1')

export const getEncryptedKeyId = (pages: string): string => pages.split(':')[2] ?? ''

export const decryptPages = (pages: string, params: ChapterCryptoParams): string => {
    const parts = pages.split(':')
    if (parts.length < 6) throw new Error('Unrecognized encrypted pages format')

    const keyId = parts[2] ?? ''
    const iv = parts[3] ?? ''
    const authTag = parts[4] ?? ''
    const ciphertext = parts[5] ?? ''

    let keyData = params.keys?.[keyId]
    if (!keyData && params.key && (!params.keyId || params.keyId === keyId)) keyData = params.key
    if (!keyData) throw new Error(`Decryption key not found for keyId: ${keyId}`)

    const keyBytes = base64UrlDecode(keyData)
    const ivBytes = base64UrlDecode(iv)
    const tagBytes = base64UrlDecode(authTag)
    const cipherBytes = base64UrlDecode(ciphertext)

    // noble expects ciphertext with the auth tag appended
    const sealed = new Uint8Array(cipherBytes.length + tagBytes.length)
    sealed.set(cipherBytes, 0)
    sealed.set(tagBytes, cipherBytes.length)

    const plain = gcm(keyBytes, ivBytes).decrypt(sealed)
    return utf8Decode(plain)
}

const B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
const B64_LOOKUP: Record<string, number> = {}
for (let i = 0; i < B64_CHARS.length; i++) B64_LOOKUP[B64_CHARS.charAt(i)] = i
B64_LOOKUP['-'] = 62
B64_LOOKUP['_'] = 63

// Accepts both base64url and standard base64, with or without padding
export const base64UrlDecode = (input: string): Uint8Array => {
    const clean = input.replace(/[=\s]/g, '')
    const out: number[] = []
    let buffer = 0
    let bits = 0
    for (let i = 0; i < clean.length; i++) {
        const value = B64_LOOKUP[clean.charAt(i)]
        if (value === undefined) throw new Error('Invalid base64 character')
        buffer = (buffer << 6) | value
        bits += 6
        if (bits >= 8) {
            bits -= 8
            out.push((buffer >> bits) & 0xff)
        }
    }
    return new Uint8Array(out)
}

export const utf8Decode = (bytes: Uint8Array): string => {
    let out = ''
    let i = 0
    while (i < bytes.length) {
        const b1 = bytes[i++] ?? 0
        let code: number
        if (b1 < 0x80) {
            code = b1
        } else if (b1 < 0xe0) {
            code = ((b1 & 0x1f) << 6) | ((bytes[i++] ?? 0) & 0x3f)
        } else if (b1 < 0xf0) {
            code = ((b1 & 0x0f) << 12) | (((bytes[i++] ?? 0) & 0x3f) << 6) | ((bytes[i++] ?? 0) & 0x3f)
        } else {
            code = ((b1 & 0x07) << 18) | (((bytes[i++] ?? 0) & 0x3f) << 12) | (((bytes[i++] ?? 0) & 0x3f) << 6) | ((bytes[i++] ?? 0) & 0x3f)
        }
        out += String.fromCodePoint(code)
    }
    return out
}
