const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const compression = require('compression')
const helmet = require('helmet')
const cors = require('cors')
const passport = require('passport')
const app = express()
const i18n = require('i18n')
const initMongo = require('./config/mongo')
const path = require('path')
const swaggerDocument = require('./swagger/swagger.json');
const swaggerUi = require('swagger-ui-express');


/* Setup express server port from ENV, default: 3000 */
app.set('port', process.env.PORT || 3000)

/* Enable only in development HTTP request logger middleware */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

/* Redis cache enabled by env variable  */
  const getExpeditiousCache = require('express-expeditious')
  const cache = getExpeditiousCache({
    namespace: 'expresscache',
    defaultTtl: '5 minute',
    engine: require('expeditious-engine-redis')({})
  })
  app.use(cache)


/* for parsing json */
app.use(
  bodyParser.json({
    limit: '20mb'
  })
)


/* For Parsing Application/x-www-form-urlencoded */
app.use(
  bodyParser.urlencoded({
    limit: '20mb',
    extended: true
  })
)

/* i18n Module Configuration */
i18n.configure({
  locales: ['en'],
  directory: `${__dirname}/locales`,
  defaultLocale: 'en',
  objectNotation: true
})
app.use(i18n.init)


/* Init Swagger Docs setup */
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


/*Init all other stuff*/
app.use(cors())
app.use(passport.initialize())
app.use(compression())
app.use(helmet())
app.use(express.static('public'))
app.set('views', path.join(__dirname, 'views'))
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')
app.use(require('./routes'))
app.listen(app.get('port'))

/*Init MongoDB */
initMongo()

module.exports = app 
