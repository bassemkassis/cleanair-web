/** @type {import('pm2').StartOptions} */
module.exports = {
  apps: [
    {
      name: 'cleanair-web',
      cwd: __dirname,
      script: 'npm',
      args: 'run preview:prod',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
