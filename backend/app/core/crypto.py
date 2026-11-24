import os
import hmac
import hashlib
import base64
from .config import settings


def _derive_keys() -> tuple[bytes, bytes]:
    master = (settings.SUPABASE_JWT_SECRET or "sentra_local_master_key_change_me").encode("utf-8")
    enc_key = hashlib.sha256(master + b":enc").digest()
    mac_key = hashlib.sha256(master + b":mac").digest()
    return enc_key, mac_key


def _keystream(enc_key: bytes, nonce: bytes, length: int) -> bytes:
    out = bytearray()
    counter = 0
    while len(out) < length:
        block = hashlib.sha256(enc_key + nonce + counter.to_bytes(4, "big")).digest()
        out.extend(block)
        counter += 1
    return bytes(out[:length])


def encrypt_secret(plaintext: str) -> str:
    """Encrypts a provider API key using authenticated SHA-256 CTR + HMAC-SHA256."""
    if not plaintext:
        return ""
    enc_key, mac_key = _derive_keys()
    nonce = os.urandom(16)
    pt_bytes = plaintext.encode("utf-8")
    stream = _keystream(enc_key, nonce, len(pt_bytes))
    ct = bytes(a ^ b for a, b in zip(pt_bytes, stream))
    tag = hmac.new(mac_key, nonce + ct, hashlib.sha256).digest()
    return "v1:" + base64.urlsafe_b64encode(nonce + tag + ct).decode("ascii")


def decrypt_secret(token: str) -> str:
    """Decrypts an encrypted provider API key. Returns empty string on failure."""
    if not token or not token.startswith("v1:"):
        return ""
    try:
        raw = base64.urlsafe_b64decode(token[3:].encode("ascii"))
        if len(raw) < 48:
            return ""
        nonce = raw[:16]
        tag = raw[16:48]
        ct = raw[48:]
        enc_key, mac_key = _derive_keys()
        expected_tag = hmac.new(mac_key, nonce + ct, hashlib.sha256).digest()
        if not hmac.compare_digest(tag, expected_tag):
            return ""
        stream = _keystream(enc_key, nonce, len(ct))
        pt = bytes(a ^ b for a, b in zip(ct, stream))
        return pt.decode("utf-8")
    except Exception:
        return ""


def mask_secret(secret: str) -> str:
    """Returns a safe masked preview (e.g. 'sk-p****9a2b') without exposing the secret."""
    s = (secret or "").strip()
    if not s:
        return ""
    if len(s) <= 8:
        return "****"
    return f"{s[:4]}****{s[-4:]}"
