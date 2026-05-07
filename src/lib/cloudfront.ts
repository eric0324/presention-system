import { getSignedUrl } from "@aws-sdk/cloudfront-signer"

const DOMAIN = process.env.CLOUDFRONT_DOMAIN!
const KEY_PAIR_ID = process.env.CLOUDFRONT_KEY_PAIR_ID!
// PEM 私鑰以 base64 編碼存在環境變數，使用時解碼
const PRIVATE_KEY = Buffer.from(
  process.env.CLOUDFRONT_PRIVATE_KEY_BASE64!,
  "base64"
).toString("utf-8")

/** 產生有時效的 CloudFront signed URL（預設 60 秒） */
export function signCloudfrontUrl(s3Key: string, ttlSeconds = 60): string {
  const url = `https://${DOMAIN}/${s3Key}`
  const dateLessThan = new Date(Date.now() + ttlSeconds * 1000).toISOString()

  return getSignedUrl({
    url,
    keyPairId: KEY_PAIR_ID,
    dateLessThan,
    privateKey: PRIVATE_KEY,
  })
}
