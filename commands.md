## Koaton-CLI Commands
if you write `koaton` `koaton -h` in your terminal you will get this output.
* [adapter](#adapter)
* [build](#build)
* [ember](#ember)
* [install](#install)
* [model](#model)
* [modulify](#modulify)
* [new](#new)
* [nginx](#nginx)
* [relation](#relation)
* [seed](#seed)
* [serve](#serve)
* [translate](#translate)

## koaton adapter **driver** [options] <a name="adapter"/>
> Install the especified driver adapter.

*[options]*:
```
        -h  --help Show the help for this command
        -l  --list Show the adapters installed in the current application. koaton adapter -l
        -u  --uninstall Removes the driver
        -g  --generate Creates an adapter template for the especified driver
        --host   <hostname> Default is localhost. Use this with -g
        --port   <port> Default driver port. Use this with -g
        --user   <username> User to connect to database default is ''. Use this with -g
        --db   <databse> Database name for the connection default is ''. Use this with -g
        --pass   <password> Password to login in your database default is ''. Use this with -g
```

## koaton build [options] <a name="build"/>
> Bulds whatever your system needs to build. (bundles, nginxConf, emberapps)

*[options]*:
```
        -h  --help Show the help for this command
        --nginx   Builds nginx config only
        --bundles   Builds bundles only
        --apps   Builds ember apps only
        --images   Comprees all the images
        --static   Copy Static files
```

## koaton ember **?appName** [options] <a name="ember"/>
> Creates a new ember app with the especified named.

*[options]*:
```
        -h  --help Show the help for this command
        -l  --list Shows all the ember apps of the project
        -f  --force Overrides the current app.
        -u  --use <ember_addon> Install the especified addon in the especified app.
        -m  --mount <path> (Default: /) Sets the mounting path in the koaton app. Can be used with -n or alone.
        -b  --build <env> [ development | production] Builds the especified ember app in the Koaton app.
        --subdomain   <subdomain> (Default: www) Sets the subdomain to mount the application.
        --port   <port> port to build
```

## koaton install [options] <a name="install"/>
> SetUps a recent clonned proyect. (root/Administrator permission needed to work with nginx)

*[options]*:
```
        -h  --help Show the help for this command
```

## koaton model **name** **fields** [options] <a name="model"/>
> Creates a new model. fields must be sourrounded by "".
       Fields syntax:
         field_name:type	[ point | number | integer | float | double | real | boolean | string | text | json | date | email | password | blob ]
       example:
         koaton model User 'active:integer name email password note:text created:date'
         koaton model User hasmany Phone as Phones
         koaton model User hasmany Phone phones phoneId


*[options]*:
```
        -h  --help Show the help for this command
        -e  --ember <app> Generates the model also for the app especified.
        -f  --force Deletes the model if exists.
        -r  --rest Makes the model REST enabled.
```

## koaton modulify [options] <a name="modulify"/>
> Run the needed commands to

*[options]*:
```
        -h  --help Show the help for this command
```

## koaton new **AppName** [options] <a name="new"/>
> Creates a new koaton aplication.

*[options]*:
```
        -h  --help Show the help for this command
        -d  --db <driver> A value from [ mongoose | mysql | postgres | redis | sqlite3 | couchdb | neo4j | riak | firebird | tingodb | rethinkdb | mongo | couch | mariadb ]
        -e  --view-engine <engine> A value from [ handlebars | nunjucks ]
        -f  --force Overrides the existing directory.
        -n  --skip-npm Omits npm install
```

## koaton nginx [options] <a name="nginx"/>
> helps bind the server to nginx

*[options]*:
```
        -h  --help Show the help for this command
        -i  --install creates and install the .conf in your nginx path.
```

## koaton relation **sourcemodel** **hasMany|hasOne** **targetmodel** [options] <a name="relation"/>
> makes a relation betwen two models
   linkmode: hasMany|belongsTo

*[options]*:
```
        -h  --help Show the help for this command
        -re  --relation-property Selects the relation property
        -fe  --foreing-key Selects the foreing key to use
        -e  --ember <app> Generates the model also for the app especified.
        -f  --force Deletes the model if exists.
        -r  --rest Makes the model REST enabled.
```

## koaton seed **model** [options] <a name="seed"/>
> Creates or run seed in your project.

*[options]*:
```
        -h  --help Show the help for this command
        -g  --generate Generete a seed file for the specified model.
```

## koaton serve [options] <a name="serve"/>
> Runs your awsome Koaton applicaction especially for development

*[options]*:
```
        -h  --help Show the help for this command
        -n  --nginx Copy the project .conf in nginx
        -s  --skip-build 
        -p  --production Runs with NODE_ENV = production
        --port   <port> Run on the especified port (port 80 requires sudo).
```

## koaton translate **?to** **?from** [options] <a name="translate"/>
> Translate your localization files

*[options]*:
```
        -h  --help Show the help for this command
        -l  --list Show a list of languages
```

