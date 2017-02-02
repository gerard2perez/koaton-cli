import * as livereload from 'gulp-refresh';
/* istanbul ignore next */
if (process.env.NODE_ENV === 'development') {
	livereload.listen({
		port: 62627,
		quiet: true
	});
}

export default livereload;
