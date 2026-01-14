import JSEncrypt from 'jsencrypt'

const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmME0xwIKIWtmKoelvD17
YlvKkexnTkRf/CNlggyV8IA1AYVDXeBliuEBcqPoE3lW9zEaeBn7U87U3P7WNJx+
pbuPgg/N9JPxAIe8G8nJsouy2jINA+g/JWbSisuIcxODmpZ+FPODdE35MvrbHyx9
cFsDB88wiJPZpjLQQgfkMm5C9mJY0Qx15FoTJ/K5HxidTZTeMBo+a3UE2Pi6sGIS
TI3wWOPXc8Tq6SkQDwZW15n9KyVsziYiNXKCxxrdZoiFrhfRuNNI5bDj/6BWrnJH
FYzpZlXAZkG2WpOCJUUE1eLesZ0bESYkr7SU1PKzwr06nJU1eH0JAbW2nubq971a
PwIDAQAB
-----END PUBLIC KEY-----`

const encryptor = new JSEncrypt()
encryptor.setPublicKey(PUBLIC_KEY)

export function encryptPassword(password: string): string {
  const encrypted = encryptor.encrypt(password)
  if (!encrypted) {
    throw new Error('密码加密失败')
  }
  return encrypted
}
