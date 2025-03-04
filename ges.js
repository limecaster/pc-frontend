const fs = require('fs');
const path = require('path');
const treeify = require('treeify');

function generateTree(dir, tree) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        if (file === 'node_modules') return; // Skip node_modules directory
        if (file === '.next') return; // Skip .next directory
        if (file === '.git') return; // Skip .git directory
        
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            tree[file] = {};
            generateTree(filePath, tree[file]);
        } else {
            tree[file] = null;
        }
    });
}

const projectRoot = path.resolve(__dirname);
const tree = {};
generateTree(projectRoot, tree);
console.log(treeify.asTree(tree, true));
