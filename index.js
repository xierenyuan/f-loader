var loaderUtils = require("loader-utils");

module.exports = function(content) {
    this.cacheable && this.cacheable();
    if (!this.emitFile) throw new Error("emitFile is required from module system");

    var query = loaderUtils.parseQuery(this.query);
    var configKey = query.config || "fLoader";
    var options = this.options[configKey] || {};

    var config = {
        publicPath: false,
        name: "[hash].[ext]",
        //替换的url
        replaceUrl: 'static/'
    };

    // options takes precedence over config
    Object.keys(options).forEach(function(attr) {
        config[attr] = options[attr];
    });

    // query takes precedence over config and options
    Object.keys(query).forEach(function(attr) {
        config[attr] = query[attr];
    });
    //替换掉 static
    var newName = config.name.replace(config.replaceUrl, '../');
    var url = loaderUtils.interpolateName(this, newName, {
        context: config.context || this.options.context,
        content: content,
        regExp: config.regExp
    });

    var publicPath = "__webpack_public_path__ + " + JSON.stringify(url);

    if (config.publicPath) {
        // support functions as publicPath to generate them dynamically
        publicPath = JSON.stringify(
            typeof config.publicPath === "function" ? config.publicPath(url) : config.publicPath + url
        );
    }

    if (query.emitFile === undefined || query.emitFile) {
        //生成文件的时候  的换回 上一次替换的url
        var nUrl = url.replace('../', config.replaceUrl);
        this.emitFile(nUrl, content);
    }

    return "module.exports = " + publicPath + ";";
};
module.exports.raw = true;