import 'dotenv/config';

try {
  const appModule = await import('./src/app.js');
  const app = appModule.default;

  await import('./jobs/expirePremium.js');

  const PORT = process.env.PORT || 8080;

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });

} catch (err) {
  console.error("🔥 STARTUP CRASH:", err);
  process.exit(1);
}
