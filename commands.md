## Koaton-CLI Commands
if you write `koaton` `koaton -h` in your terminal you will get this output.
* [adapter](#adapter)
* [build](#build)
* [ember](#ember)
* [forever](#forever)
* [install](#install)
* [model](#model)
* [modulify](#modulify)
* [new](#new)
* [nginx](#nginx)
* [publish](#publish)
* [seed](#seed)
* [semver](#semver)
* [serve](#serve)

## koaton adapter <driver> [options] <a name="adapter"/>
> Install the especified driver adapter.

*[options]*:
```
-h	-h	Show the help for this command
-l	--list	Show the adapters installed in the current application. koaton adapter -l
-u	--uninstall	Removes the driver
-g	--generate	Creates an adapter template for the especified driver
--host	--host <hostname> <asa>	Default is localhost. Use this with -g
--port	--port <port>	Default driver port. Use this with -g
--user	--user <username>	User to connect to database default is ''. Use this with -g
--db	--db <databse>	Database name for the connection default is ''. Use this with -g
--pass	--pass <password>	Password to login in your database default is ''. Use this with -g
```

## koaton build <config_file> [options] <a name="build"/>
> Make bundles of your .js .scss .css files and output to public folder.
   Default value is ./config/bundles.js

*[options]*:
```
-h	-h	Show the help for this command
-p	--prod	builds for production
```

## koaton ember <app_name> [options] <a name="ember"/>
> Creates a new ember app with the especified named.

*[options]*:
```
-h	-h	Show the help for this command
-l	--list	Shows all the ember apps of the project
-f	--force	Overrides the current app.
-u	--use <ember_addon>	Install the especified addon in the especified app.
-m	--mount <path>	(Default: /) Sets the mounting path in the koaton app. Can be used with -n or alone.
-b	--build <env>	[ development | production] Builds the especified ember app in the Koaton app.
--subdomain	--subdomain <subdomain>	(Default: www) Sets the subdomain to mount the application.
--port	--port <port>	port to build
```

## koaton forever [options] <a name="forever"/>
> Runs your awsome Koaton on production mode with forever.

*[options]*:
```
-h	-h	Show the help for this command
-l	--list	Lists all Koaton running applicactions.
-o	--logs <app>	Shows the logs for the selected app.
-s	--stop <app>	Stops all the forever running servers.
--port	--port <port>	(Default: 62626) Run on the especified port (port 80 requires sudo).
```

## koaton install [options] <a name="install"/>
> SetUps a recent clonned proyect. (root/Administrator permission needed to work with nginx)

*[options]*:
```
-h	-h	Show the help for this command
```

## koaton model <name> <fields|linkaction> <[destmodel]> <as> <[relation_property]> <[foreign_key]> [options] <a name="model"/>
> Creates a new model. fields must be sourrounded by "".
	Fields syntax:
		field_name:type	[ mongoose | mysql | postgres | redis | sqlite3 | couchdb | neo4j | riak | firebird | tingodb | rethinkdb | mongo | couch | mariadb ]
	example:
		koaton model User "active:integer name email password note:text created:date"
		koaton model User hasmany Phone as Phones
koaton model User hasmany Phone phones phoneId


*[options]*:
```
-h	-h	Show the help for this command
-e	--ember <app>	Generates the model also for the app especified.
-f	--force	Deletes the model if exists.
-r	--rest	Makes the model REST enabled.
```

## koaton modulify [options] <a name="modulify"/>
> Run the needed commands to

*[options]*:
```
-h	-h	Show the help for this command
```

## koaton new <app_name> [options] <a name="new"/>
> Creates a new koaton aplication.

*[options]*:
```
-h	-h	Show the help for this command
-d	--db <driver>	A value from [ mongoose | mysql | postgres | redis | sqlite3 | couchdb | neo4j | riak | firebird | tingodb | rethinkdb | mongo | couch | mariadb ]
-e	--view-engine <engine>	A value from [ handlebars ]
-f	--force	Overrides the existing directory.
-n	--skip-npm	Omits npm install
-b	--skip-bower	Omits bower install
```

## koaton nginx [options] <a name="nginx"/>
> helps bind the server to nginx

*[options]*:
```
-h	-h	Show the help for this command
-g	--generate	create a .conf file for the project
```

## koaton publish [options] <a name="publish"/>
> Take the actions needed to commit and publish a new version of your app.

*[options]*:
```
-h	-h	Show the help for this command
-t	--tag <tag>	[latest | alpha | beta] Optional taganame to publish on npm
-v	--semver <version>	[major | minor | patch] Select if you want to increse your pakage version
-m	--message <message>	This is the message that would be added to the commit
```

## koaton seed <model> [options] <a name="seed"/>
> Creates or run seed in your project.

*[options]*:
```
-h	-h	Show the help for this command
-g	--generate	Generete a seed file for the specified model.
```

## koaton semver <mode> [options] <a name="semver"/>
> mode can be major, minor, patch

*[options]*:
```
-h	-h	Show the help for this command
```

## koaton serve [options] <a name="serve"/>
> Runs your awsome Koaton applicaction using nodemon

*[options]*:
```
-h	-h	Show the help for this command
-s	--skip-build	
-p	--production	Runs with NODE_ENV = production
--port	--port <port>	Run on the especified port (port 80 requires sudo).
```

