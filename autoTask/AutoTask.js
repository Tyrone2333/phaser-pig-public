//公共引用
const fs = require('fs'),
    path = require('path'),
    stat = fs.stat

/**
 * 文件复制函数 BEGIN
 *
 * 注意不要使用 copyFolderRecursiveSync("./","./temp"),这会陷入无限循环
 *
 * @param source
 * @param target
 */
function copyFileSync(source, target) {

    var targetFile = target;

    //if target is a directory a new file with the same name will be created
    if (fs.existsSync(target)) {
        if (fs.lstatSync(target).isDirectory()) {
            targetFile = path.join(target, path.basename(source));
        }
    }

    fs.writeFileSync(targetFile, fs.readFileSync(source));
    console.log(source + " => " + targetFile)
}

function copyFolderRecursiveSync(source, target) {
    var files = [];

    //check if folder needs to be created or integrated
    var targetFolder = path.join(target, path.basename(source));
    if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder);
        console.log("创建文件夹: " + targetFolder)
    }

    //copy
    if (fs.lstatSync(source).isDirectory()) {
        files = fs.readdirSync(source);
        files.forEach(function (file) {
            var curSource = path.join(source, file);
            if (fs.lstatSync(curSource).isDirectory()) {
                copyFolderRecursiveSync(curSource, targetFolder);
            } else {
                copyFileSync(curSource, targetFolder);
            }
        });
    }
}

// 文件复制函数 END

module.exports = {

    version: 1.0,
    desc: "自动任务函数",
    mergeFile(firstFile, secondFile, saveTargetFile) {
        //  同步读取
        let first = fs.readFileSync(firstFile).toString();
        console.log("第一个文件读取完成,长度: " + first.length);
        let second = fs.readFileSync(secondFile).toString();
        console.log("第二个文件读取完成,长度: " + second.length);

        console.log("准备合并文件");

        // "\uFEFF" UTF-8 doesn't require a bom, but you can add it by yourself of course.
        fs.writeFile(saveTargetFile, "\uFEFF" + first + second, 'utf8', function (err) {
            if (err) {
                return console.error(err);
            }
            console.log("合并文件写入成功！");
        });
    },

    // 复制文件夹,无法设置跳过文件
    copyFolderRecursiveSync: copyFolderRecursiveSync,

}
