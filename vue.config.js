module.exports = {
  devServer: {
    proxy: {
      '/gapi': {
        target: 'https://www.googleapis.com',
        changeOrigin: true,
        pathRewrite: { '^/gapi': '' },
        secure: false,
      },
    },
    headers: {
      'Content-Security-Policy':
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://apis.google.com https://accounts.google.com; " +
        "connect-src 'self' https://www.googleapis.com https://accounts.google.com; " +
        "img-src 'self' https://www.gstatic.com https://apis.google.com; " +
        "frame-src 'self' https://accounts.google.com; " +
        "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; " +
        "object-src 'none';",
    },
  },
};
