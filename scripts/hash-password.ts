import { hashPassword } from "../lib/auth/password";

async function main() {
  const password = process.argv[2];
  if (!password) {
    console.error("사용법: npm run hash-password -- <새 비밀번호>");
    process.exitCode = 1;
    return;
  }
  console.log(await hashPassword(password));
}

main().catch(() => {
  console.error("비밀번호 해시를 생성하지 못했습니다.");
  process.exitCode = 1;
});
