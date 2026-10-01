import fs from 'fs';
import path from 'path';

fs.mkdirSync('frontend', { recursive: true });
fs.mkdirSync('backend', { recursive: true });

const copyRecursiveSync = (src, dest) => {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest);
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else if (exists) {
    fs.copyFileSync(src, dest);
  }
};

const move = (src, dest) => {
    if (fs.existsSync(src)) {
        console.log(`Copying ${src} to ${dest}`);
        copyRecursiveSync(src, dest);
    }
}

// Frontend
move('src', 'frontend/src');
move('public', 'frontend/public');
move('index.html', 'frontend/index.html');
move('vite.config.js', 'frontend/vite.config.js');
move('dist', 'frontend/dist');

// Backend
move('server', 'backend/src');

// Read root package.json
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

const frontendPkg = {
    name: "nexora-frontend",
    private: true,
    version: "0.2.0",
    type: "module",
    scripts: {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview"
    },
    dependencies: {
        "react": pkg.dependencies.react,
        "react-dom": pkg.dependencies["react-dom"],
        "react-router-dom": pkg.dependencies["react-router-dom"]
    },
    devDependencies: {
        "@tailwindcss/vite": pkg.devDependencies["@tailwindcss/vite"],
        "@vitejs/plugin-react": pkg.devDependencies["@vitejs/plugin-react"],
        "tailwindcss": pkg.devDependencies.tailwindcss,
        "vite": pkg.devDependencies.vite
    }
};

const backendPkg = {
    name: "nexora-backend",
    private: true,
    version: "0.2.0",
    type: "module",
    scripts: {
        "start": "NODE_ENV=production node src/index.js",
        "dev": "node src/index.js"
    },
    dependencies: {
        "bcryptjs": pkg.dependencies.bcryptjs,
        "cors": pkg.dependencies.cors,
        "express": pkg.dependencies.express,
        "jsonwebtoken": pkg.dependencies.jsonwebtoken
    }
};

fs.writeFileSync('frontend/package.json', JSON.stringify(frontendPkg, null, 2));
fs.writeFileSync('backend/package.json', JSON.stringify(backendPkg, null, 2));

// Update Root package.json to use workspaces
const rootPkg = {
    name: "nexora-workspace",
    private: true,
    workspaces: [
        "frontend",
        "backend"
    ],
    scripts: {
        "dev": "concurrently \"npm run dev -w frontend\" \"npm run dev -w backend\"",
        "build": "npm run build -w frontend",
        "start": "npm run start -w backend"
    },
    devDependencies: {
        "concurrently": pkg.devDependencies.concurrently
    }
};

fs.writeFileSync('package.json', JSON.stringify(rootPkg, null, 2));

if (fs.existsSync('scripts/dev.mjs')) {
    fs.renameSync('scripts/dev.mjs', 'scripts/dev.mjs.bak');
}

// Update backend/src/index.js
let serverCode = fs.readFileSync('backend/src/index.js', 'utf-8');
serverCode = serverCode.replace(
    "const dist = path.join(__dirname, '..', 'dist')",
    "const dist = path.join(__dirname, '..', '..', 'frontend', 'dist')"
);
fs.writeFileSync('backend/src/index.js', serverCode);

console.log("Structure updated successfully via copy!");
