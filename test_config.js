try {
    require('./metro.config.js');
    console.log("Success");
} catch (e) {
    console.log(e.toString());
    console.log(e.stack);
}
