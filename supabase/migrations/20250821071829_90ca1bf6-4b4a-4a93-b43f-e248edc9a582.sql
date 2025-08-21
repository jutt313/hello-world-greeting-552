
-- First, let's populate the project_templates table with real templates
INSERT INTO project_templates (
  name, 
  description, 
  template_type, 
  programming_language, 
  framework, 
  template_structure, 
  default_files, 
  dependencies, 
  build_commands, 
  deployment_config
) VALUES 
-- Web Application Templates
(
  'React TypeScript Web App',
  'Modern React application with TypeScript, Vite, and Tailwind CSS',
  'web',
  'TypeScript',
  'React',
  '{"src": {"components": {}, "pages": {}, "hooks": {}, "utils": {}}, "public": {}, "package.json": true, "tsconfig.json": true, "tailwind.config.js": true}',
  '{"src/App.tsx": "import React from ''react'';\n\nfunction App() {\n  return (\n    <div className=\"min-h-screen bg-gray-100\">\n      <h1 className=\"text-3xl font-bold text-center py-8\">Welcome to React App</h1>\n    </div>\n  );\n}\n\nexport default App;", "src/main.tsx": "import React from ''react'';\nimport ReactDOM from ''react-dom/client'';\nimport App from ''./App.tsx'';\nimport ''./index.css'';\n\nReactDOM.createRoot(document.getElementById(''root'')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n);"}',
  '{"react": "^18.3.1", "react-dom": "^18.3.1", "@types/react": "^18.3.1", "@types/react-dom": "^18.3.1", "typescript": "^5.5.3", "vite": "^5.4.8", "tailwindcss": "^3.4.13"}',
  '{"dev": "vite", "build": "tsc && vite build", "preview": "vite preview"}',
  '{"platform": "vercel", "buildCommand": "npm run build", "outputDirectory": "dist"}'
),
(
  'Node.js Express API',
  'RESTful API built with Node.js, Express, and TypeScript',
  'web',
  'TypeScript',
  'Express',
  '{"src": {"controllers": {}, "routes": {}, "middleware": {}, "models": {}, "utils": {}}, "package.json": true, "tsconfig.json": true}',
  '{"src/index.ts": "import express from ''express'';\nimport cors from ''cors'';\n\nconst app = express();\nconst PORT = process.env.PORT || 3000;\n\napp.use(cors());\napp.use(express.json());\n\napp.get(''/api/health'', (req, res) => {\n  res.json({ status: ''OK'', message: ''Server is running'' });\n});\n\napp.listen(PORT, () => {\n  console.log(`Server running on port ${PORT}`);\n});"}',
  '{"express": "^4.19.2", "cors": "^2.8.5", "@types/express": "^4.17.21", "@types/cors": "^2.8.17", "typescript": "^5.5.3", "ts-node": "^10.9.2", "nodemon": "^3.1.4"}',
  '{"dev": "nodemon src/index.ts", "build": "tsc", "start": "node dist/index.js"}',
  '{"platform": "railway", "buildCommand": "npm run build", "startCommand": "npm start"}'
),
-- Mobile Application Templates
(
  'React Native iOS App',
  'Cross-platform iOS application built with React Native and TypeScript',
  'mobile',
  'TypeScript',
  'React Native',
  '{"src": {"components": {}, "screens": {}, "navigation": {}, "services": {}, "utils": {}}, "ios": {}, "package.json": true, "tsconfig.json": true}',
  '{"src/App.tsx": "import React from ''react'';\nimport { View, Text, StyleSheet } from ''react-native'';\n\nconst App = () => {\n  return (\n    <View style={styles.container}>\n      <Text style={styles.title}>Welcome to React Native</Text>\n    </View>\n  );\n};\n\nconst styles = StyleSheet.create({\n  container: {\n    flex: 1,\n    justifyContent: ''center'',\n    alignItems: ''center'',\n    backgroundColor: ''#f5f5f5'',\n  },\n  title: {\n    fontSize: 24,\n    fontWeight: ''bold'',\n    color: ''#333'',\n  },\n});\n\nexport default App;"}',
  '{"react": "^18.3.1", "react-native": "^0.74.5", "@types/react": "^18.3.1", "typescript": "^5.5.3", "@react-native-community/cli": "^13.6.9"}',
  '{"ios": "react-native run-ios", "android": "react-native run-android", "start": "react-native start"}',
  '{"platform": "expo", "buildCommand": "expo build:ios", "distribution": "app-store"}'
),
(
  'React Native Android App',
  'Cross-platform Android application built with React Native and TypeScript',
  'mobile',
  'TypeScript',
  'React Native',
  '{"src": {"components": {}, "screens": {}, "navigation": {}, "services": {}, "utils": {}}, "android": {}, "package.json": true, "tsconfig.json": true}',
  '{"src/App.tsx": "import React from ''react'';\nimport { View, Text, StyleSheet } from ''react-native'';\n\nconst App = () => {\n  return (\n    <View style={styles.container}>\n      <Text style={styles.title}>Welcome to React Native</Text>\n    </View>\n  );\n};\n\nconst styles = StyleSheet.create({\n  container: {\n    flex: 1,\n    justifyContent: ''center'',\n    alignItems: ''center'',\n    backgroundColor: ''#f5f5f5'',\n  },\n  title: {\n    fontSize: 24,\n    fontWeight: ''bold'',\n    color: ''#333'',\n  },\n});\n\nexport default App;"}',
  '{"react": "^18.3.1", "react-native": "^0.74.5", "@types/react": "^18.3.1", "typescript": "^5.5.3", "@react-native-community/cli": "^13.6.9"}',
  '{"ios": "react-native run-ios", "android": "react-native run-android", "start": "react-native start"}',
  '{"platform": "expo", "buildCommand": "expo build:android", "distribution": "play-store"}'
),
-- CLI Application Templates
(
  'Node.js CLI Tool',
  'Command-line interface tool built with Node.js and TypeScript',
  'cli',
  'TypeScript',
  'Node.js',
  '{"src": {"commands": {}, "utils": {}, "types": {}}, "bin": {"cli.js": true}, "package.json": true, "tsconfig.json": true}',
  '{"src/index.ts": "#!/usr/bin/env node\nimport { program } from ''commander'';\n\nprogram\n  .name(''my-cli'')\n  .description(''CLI tool description'')\n  .version(''1.0.0'');\n\nprogram\n  .command(''hello'')\n  .description(''Say hello'')\n  .action(() => {\n    console.log(''Hello from CLI!'');\n  });\n\nprogram.parse();"}',
  '{"commander": "^12.1.0", "@types/node": "^22.7.4", "typescript": "^5.5.3", "ts-node": "^10.9.2"}',
  '{"build": "tsc", "start": "node dist/index.js", "dev": "ts-node src/index.ts"}',
  '{"platform": "npm", "registry": "https://registry.npmjs.org/", "access": "public"}'
),
(
  'Python CLI Application',
  'Command-line interface application built with Python and Click',
  'cli',
  'Python',
  'Click',
  '{"src": {"commands": {}, "utils": {}, "__init__.py": true}, "setup.py": true, "requirements.txt": true}',
  '{"src/main.py": "import click\n\n@click.group()\ndef cli():\n    \"\"\"My CLI Application\"\"\"\n    pass\n\n@cli.command()\ndef hello():\n    \"\"\"Say hello\"\"\"\n    click.echo(''Hello from Python CLI!'')\n\nif __name__ == ''__main__'':\n    cli()"}',
  '{"click": "^8.1.7", "setuptools": "^75.1.0"}',
  '{"install": "pip install -e .", "build": "python setup.py build"}',
  '{"platform": "pypi", "registry": "https://pypi.org/", "access": "public"}'
),
-- Additional Templates
(
  'Next.js Full-stack App',
  'Full-stack web application with Next.js, TypeScript, and Prisma',
  'web',
  'TypeScript',
  'Next.js',
  '{"src": {"app": {"api": {}, "components": {}, "lib": {}}, "prisma": {"schema.prisma": true}}, "package.json": true, "tsconfig.json": true, "next.config.js": true}',
  '{"src/app/page.tsx": "export default function Home() {\n  return (\n    <main className=\"min-h-screen p-24\">\n      <h1 className=\"text-4xl font-bold\">Welcome to Next.js</h1>\n    </main>\n  );\n}"}',
  '{"next": "^14.2.13", "react": "^18.3.1", "react-dom": "^18.3.1", "@prisma/client": "^5.20.0", "prisma": "^5.20.0", "typescript": "^5.5.3"}',
  '{"dev": "next dev", "build": "next build", "start": "next start", "db:push": "prisma db push"}',
  '{"platform": "vercel", "buildCommand": "npm run build", "outputDirectory": ".next"}'
),
(
  'Vue.js TypeScript App',
  'Modern Vue.js application with TypeScript and Composition API',
  'web',
  'TypeScript',
  'Vue.js',
  '{"src": {"components": {}, "views": {}, "composables": {}, "utils": {}}, "public": {}, "package.json": true, "tsconfig.json": true, "vite.config.ts": true}',
  '{"src/App.vue": "<template>\n  <div class=\"min-h-screen bg-gray-100\">\n    <h1 class=\"text-3xl font-bold text-center py-8\">Welcome to Vue.js</h1>\n  </div>\n</template>\n\n<script setup lang=\"ts\">\n// Vue 3 Composition API\n</script>"}',
  '{"vue": "^3.4.38", "@vitejs/plugin-vue": "^5.1.4", "typescript": "^5.5.3", "vite": "^5.4.8"}',
  '{"dev": "vite", "build": "vue-tsc && vite build", "preview": "vite preview"}',
  '{"platform": "netlify", "buildCommand": "npm run build", "outputDirectory": "dist"}'
);
