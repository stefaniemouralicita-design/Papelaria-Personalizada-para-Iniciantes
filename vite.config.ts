import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';

function mockupUploadPlugin(): Plugin {
  return {
    name: 'mockup-upload-endpoint',
    configureServer(server) {
      server.middlewares.use('/api/upload-mockup', (req, res) => {
        if (req.method === 'POST') {
          const chunks: any[] = [];
          req.on('data', chunk => chunks.push(chunk));
          req.on('end', () => {
            try {
              const body = JSON.parse(Buffer.concat(chunks).toString());
              if (!body.dataUrl) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'dataUrl is required' }));
                return;
              }
              const base64Data = body.dataUrl.replace(/^data:image\/\w+;base64,/, '');
              const buffer = Buffer.from(base64Data, 'base64');
              const targetDir = path.resolve(__dirname, 'public/assets/images');
              if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
              }
              fs.writeFileSync(path.join(targetDir, 'mockup_principal.png'), buffer);
              fs.writeFileSync(path.join(targetDir, 'mockup_principal.jpg'), buffer);

              const distDir = path.resolve(__dirname, 'dist/assets/images');
              if (fs.existsSync(path.resolve(__dirname, 'dist'))) {
                if (!fs.existsSync(distDir)) {
                  fs.mkdirSync(distDir, { recursive: true });
                }
                fs.writeFileSync(path.join(distDir, 'mockup_principal.png'), buffer);
                fs.writeFileSync(path.join(distDir, 'mockup_principal.jpg'), buffer);
              }

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, url: '/assets/images/mockup_principal.png' }));
            } catch (e: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: e.message }));
            }
          });
        } else {
          res.statusCode = 405;
          res.end();
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), mockupUploadPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
