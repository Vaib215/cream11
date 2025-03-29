module.exports = {
  apps: [
    {
      name: "cream11", // Change this to your application name
      script: "npm",
      args: "start", // For Next.js application (or use "server.js" if you have a custom server)
      // Environment variables
      env: {
        NODE_ENV: "production",
        GEMINI_API_KEY: "AIzaSyCuWqEJ3Y9hE-E8gNnIXz_61blxineHfR0",
        NEXT_PUBLIC_POSTHOG_KEY: "phc_xOt9irsi0I72CkmEdBQG57yoOwe1VjvRIsLf1NidIES",
        // Add any other environment variables your app needs
      },
      
      
      // Auto restart configuration
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      
      // Logs
      log_date_format: "YYYY-MM-DD HH:mm Z",
      error_file: "logs/error.log",
      out_file: "logs/out.log",
      merge_logs: true,
      kill_timeout: 5000, 
      // Deployment related (optional)
      // deploy: {
      //   production: {
      //     user: "your-server-user",
      //     host: "your-server-ip",
      //     ref: "origin/main",
      //     repo: "git@github.com:username/repository.git",
      //     path: "/var/www/production",
      //     "post-deploy": "npm install && npm run build && pm2 reload ecosystem.config.js --env production"
      //   }
      // }
    }
  ]
};
