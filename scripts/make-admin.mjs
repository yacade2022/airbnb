// Grants admin rights to an existing account. This is the only way to create an admin:
// registration always creates regular users. Run it on a machine with access to the database:
//
//   npm run make-admin -- someone@example.com            promote, and give them listings that have no owner
//   npm run make-admin -- someone@example.com --revoke   turn an admin back into a regular user
import { PrismaClient } from '@prisma/client';

const [email, flag] = process.argv.slice(2);
if (!email || (flag && flag !== '--revoke')) {
  console.error('Usage: npm run make-admin -- <email> [--revoke]');
  process.exit(1);
}

const db = new PrismaClient();
try {
  const user = await db.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user) {
    console.error(`No account with the email ${email}. Register it on the site first, then run this again.`);
    process.exitCode = 1;
  } else if (flag === '--revoke') {
    await db.user.update({ where: { id: user.id }, data: { role: 'USER' } });
    console.log(`${user.email} is now a regular user.`);
  } else {
    await db.user.update({ where: { id: user.id }, data: { role: 'ADMIN' } });
    // Listings from before accounts existed have no owner; the admin takes them over
    const { count } = await db.home.updateMany({ where: { ownerId: null }, data: { ownerId: user.id } });
    // Shown so you can confirm this is the account you registered, not one someone else created
    console.log(`${user.email} (${user.name}, registered ${user.createdAt.toISOString()}) is now an admin.`);
    console.log(`Assigned ${count} listing(s) with no owner to this account.`);
  }
} finally {
  await db.$disconnect();
}
