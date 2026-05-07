import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  const name = process.env.SEED_ADMIN_NAME ?? "Admin"

  if (!email || !password) {
    console.log("SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD 未設定，跳過 seed")
    return
  }

  const exists = await db.user.findUnique({ where: { email } })
  if (exists) {
    console.log(`管理員 ${email} 已存在，跳過`)
    return
  }

  const passwordHash = await bcrypt.hash(password, 12)
  await db.user.create({ data: { email, passwordHash, name } })
  console.log(`✓ 建立初始管理員：${email}`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
