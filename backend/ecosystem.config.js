module.exports = {
  apps: [
    {
      name: "backend",
      script: "server.js",
      env: {
        NODE_ENV: "development",
      },
      env_production: {  // ✅ production 모드에서 사용할 환경 변수 추가!
        NODE_ENV: "production",
        DB_HOST: "alchanbang.cubyks8og0pk.us-east-1.rds.amazonaws.com",
        DB_USER: "admin",
        DB_PASSWORD: "woals1973",
        DB_NAME: "alchanbang",
        DB_PORT: "3306",
        JWT_SECRET: "sq0U6jjUxSnpOXLBexFqW0Cgta/08JOIPxUbk6UAtJo="
      }
    }
  ]
};
