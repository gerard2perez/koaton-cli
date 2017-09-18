'use strict';

const koaton = require('koaton').default;

koaton.use(koaton.localization);
koaton.use(koaton.cached);
koaton.use(koaton.helmet);
koaton.use(koaton.bodyparser);
koaton.use(koaton.jsurl);
koaton.use(koaton.static);
koaton.use(koaton.session(koaton));
koaton.use(koaton.passport.initialize());
koaton.use(koaton.passport.session());
koaton.use(koaton.oAuth2Server);
koaton.use(koaton.i18nHelper);
koaton.use(koaton.views);
koaton.use(koaton.subdomainrouter);
// ============================================
// io.attach(koaton);
// io.on('join', (ctx, data) => {
// 	console.log('join event fired', data)
// });
// ============================================
koaton.start(configuration.server.port);
