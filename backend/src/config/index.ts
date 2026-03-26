export const config = {
  port: parseInt(process.env.PORT || '4000'),
  jwtSecret: process.env.JWT_SECRET || 'romula-secret-key-change-in-production',
  jwtExpiry: '7d',
  uploadDir: './uploads',
  maxFileSize: 50 * 1024 * 1024, // 50MB
};
