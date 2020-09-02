import {existsSync} from "fs";
import {execSync} from "child_process";

console.log('Checking backend:')

if (existsSync('node_modules')) {
    console.log('"node_modules"-folder exists. Skipping installation.')
} else {
    execSync('npm i', {stdio: 'inherit'});
    console.log('Backend-dependencies installed.');
}

if (existsSync('dist') && existsSync('dist/index.js')) {
    console.log('"dist/index.js" exists. Skipping compilation.');
} else {
    execSync('npm run build', {stdio: 'inherit'});
    console.log('Backend built to "./dist".');
}

console.log('Checking frontend:');

if (!existsSync('frontend')) {
    console.log('Frontend folder missing. Please make sure to clone with "--recursive" flag.')
    process.exit(0);
}

if (existsSync('frontend/node_modules')) {
    console.log('"node_modules"-folder exists. Skipping installation.')
} else {
    execSync('npm i', {stdio: 'inherit', cwd: './frontend'});
    console.log('Frontend-dependencies installed.');
}

if (existsSync('frontend/build') && existsSync('frontend/build/index.html')) {
    console.log('"frontend/build/index.html" exists. Skipping compilation.')
} else {
    execSync('npm run build', {stdio: 'inherit', cwd: './frontend'});
    console.log('Frontend built to "./frontend/build".')
}
