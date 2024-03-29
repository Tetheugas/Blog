// Carregando os módulos
    const express = require('express')
    const handlebars = require('express-handlebars')
    const bodyParser = require('body-parser')
    const app = express()
    const admin = require('./routes/admin')
    const path = require('path')
    const mongoose = require('mongoose')
    mongoose.set('strictQuery', false)
    const session = require('express-session')
    const flash = require('connect-flash')
    require('./models/Postagem')
    const Postagem = mongoose.model('postagens')
    require('./models/Categoria')
    const Categoria = mongoose.model('categorias')
    const usuarios = require('./routes/usuario')
    
    const passport = require('passport')
    const db = require('./config/db')
    // Validação de postagens
    const validator = require('validator')
// Configurações
    // Sessão
        app.use(session({
            secret: 'cursodenode',
            resave: true,
            saveUninitialized: true
        }))


        app.use(passport.initialize())
        //  ReferenceError: Cannot access 'passport' before initialization
        require('./config/auth')(passport)
        app.use(passport.session())
        app.use(flash())

    // Middleware
        app.use((req, res, next)=>{
            res.locals.success_msg = req.flash('success_msg')
            res.locals.error_msg = req.flash('error_msg')
            res.locals.error = req.flash('error')
            res.locals.user = req.user || null
            next()
        })
    // BodyParser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())
    // Handlebars
        app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars')
    // Mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect(db.mongoURI).then(() => {
           console.log('Conectado ao banco de dados') 
        }).catch((erro)=>{
            console.log('Não foi possivel se conectar ' + erro)
        })
    // Public
        app.use(express.static(path.join(__dirname,'public')))
// Rotas
    app.get('/', (req, res)=>{
        Postagem.find().lean().populate('categoria').sort({data: 'desc'}).then((postagens)=>{
            res.render('index', {postagens: postagens})
        }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro interno')
            res.redirect('/404')
        })  
    })
    app.get('/postagem/:slug', (req, res)=>{
        const slug = req.params.slug

        Postagem.findOne({slug}).then((postagem)=>{
            
            if(postagem){
                const post ={
                    titulo: postagem.titulo,
                    data: postagem.data,
                    conteudo: postagem.conteudo
                }
                res.render('postagem/index', post)
            }else{
                req.flash('error_msg', 'Essa postagem não existe')
                res.redirect('/')
            }
        }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro interno')
            res.redirect('/')
        })

    })
    app.get('/categorias', (req, res)=>{
        Categoria.find().lean().then((categorias)=>{
            res.render('categorias/index', {categorias: categorias})


        }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro interno ao listar as categorias')
            res.redirect('/')
        })
    })
    app.get('/categorias/:slug', (req, res)=>{
        Categoria.findOne({slug: req.params.slug}).then((categoria)=>{
            if(categoria){
                Postagem.find({categoria: categoria._id}).lean().then((postagens)=>{
                    res.render('categorias/postagens', {postagens: postagens, categoria: categoria})
                }).catch((err)=>{
                    req.flash('error_msg', 'Houve um erro ao listar os posts')
                })
            }else{
                req.flash('error_msg','Est categoria não existe')
                res.redirect('/')
            }
            
            

        }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro interno ao carregar a página desta categoria')
            res.redirect('/')
        })
    })

    app.get('/404', (req, res)=>{
      res.send('Erro 404!')  
    })
    app.use('/admin', admin)
    app.use('/usuarios', usuarios)
// Outros
    const PORT = process.env.port || 8081
    app.listen(PORT, () => {
    console.log('Servidor rodando')
    })