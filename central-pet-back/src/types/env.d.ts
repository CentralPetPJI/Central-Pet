declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: 'development' | 'test' | 'production';
    PORT?: string;
    FRONTEND_URL?: string;
    DATABASE_URL?: string;
    THROTTLE_TTL?: string;
    THROTTLE_LIMIT?: string;
  }
}
