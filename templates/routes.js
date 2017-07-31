exports.default = (subdomains) => {
	let { www } = subdomains;
	www.get('/', async function (ctx) {
			await ctx.render('index.html');
		})
		.get('/login', async function (ctx) {
			await ctx.render('login.html');
		});
};
