module.exports = {
  apps: [{
    name: 'team-master-backend',
    script: './src/server.js',
    cwd: '/var/www/team-master/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    log_file: '/var/log/team-master/combined.log',
    out_file: '/var/log/team-master/out.log',
    error_file: '/var/log/team-master/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
