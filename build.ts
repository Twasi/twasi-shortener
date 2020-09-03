import {existsSync, rmdirSync} from "fs";
import {execSync} from "child_process";
import {ArgumentParser} from "merlins-argument-parser";

const args = new ArgumentParser(process.argv.slice(2));

console.log('Checking backend:')

if (existsSync('node_modules')) {
    console.log('"node_modules"-folder exists. Skipping installation.')
} else {
    execSync('npm i', {stdio: 'inherit'});
    console.log('Backend-dependencies installed.');
}

const buildBackend = args.get('rebuild').asBool() || args.get('rebuild-backend').asBool();
if (existsSync('dist') && existsSync('dist/index.js') && !buildBackend) {
    console.log('"dist/index.js" exists. Skipping compilation.');
} else {
    if (existsSync('dist')) {
        rmdirSync('dist', {recursive: true});
    }
    execSync('npm run build', {stdio: 'inherit'});
    console.log('Backend built to "./dist".');
}

console.log('Checking frontend:');

if (!existsSync('frontend')) {
    console.log('Frontend folder missing. Please make sure to clone with "--recursive" flag or create empty frontend folder.')
    process.exit(0);
}

if (!existsSync('frontend/package.json')) {
    console.log('Frontend package.json missing. Recloning frontend...');
    execSync('git clone https://github.com/twasi/twasi-shortener-frontend.git .', {
        stdio: 'inherit',
        cwd: './frontend'
    });
}

if (existsSync('frontend/node_modules')) {
    console.log('"node_modules"-folder exists. Skipping installation.');
} else {
    execSync('npm i', {stdio: 'inherit', cwd: './frontend'});
    console.log('Frontend-dependencies installed.');
}

const buildFrontend = args.get('rebuild').asBool() || args.get('rebuild-frontend').asBool();
if (existsSync('frontend/build') && existsSync('frontend/build/index.html') && !buildFrontend) {
    console.log('"frontend/build/index.html" exists. Skipping compilation.')
} else {
    if (existsSync('frontend/build')) {
        rmdirSync('frontend/build', {recursive: true});
    }
    execSync('npm run build', {stdio: 'inherit', cwd: './frontend'});
    console.log('Frontend built to "./frontend/build".')
}
