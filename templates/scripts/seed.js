(async ()=>{
        process.env.NODE_ENV = 'development';
        require('koaton/support/globals');
        await require('./node_modules/koaton/middleware/orm').initializeORM(true);
})();

