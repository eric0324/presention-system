# S3 Bucket Policy 設定說明

## 1. Bucket 設為私有

建立 bucket 時確認：
- **Block all public access**：全部啟用
- ACL：停用

## 2. CloudFront Origin Access Control (OAC)

在 CloudFront Console：
1. **Security > Origin access** → 建立新的 OAC
2. **Signing behavior**：Sign requests (recommended)
3. **Origin type**：S3

## 3. Bucket Policy（貼入 S3 → Permissions → Bucket policy）

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontOAC",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/YOUR_DISTRIBUTION_ID"
        }
      }
    }
  ]
}
```

將 `YOUR_BUCKET_NAME`、`YOUR_ACCOUNT_ID`、`YOUR_DISTRIBUTION_ID` 替換為實際值。

## 4. CloudFront Signed URL 金鑰設定

1. CloudFront Console → **Key management > Public keys** → 建立金鑰對
2. 將公鑰貼入 CloudFront
3. 建立 **Key group** 並加入上述公鑰
4. Distribution → **Behaviors** → Restrict viewer access：Yes，選擇剛建立的 Key group
5. 私鑰轉 base64 存入環境變數：
   ```bash
   cat private_key.pem | base64 | tr -d '\n'
   ```
   貼入 `.env` 的 `CLOUDFRONT_PRIVATE_KEY_BASE64`

## 5. CORS 設定（S3 → Permissions → Cross-origin resource sharing）

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET"],
    "AllowedOrigins": ["https://your-domain.com"],
    "ExposeHeaders": []
  }
]
```
