const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categoria')
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')
const {eAdmin} = require('../helpers/eAdmin')


router.get('/', eAdmin, (req, res) => {
    res.render('admin/index')
})

router.get('/posts', eAdmin, (req, res) => {
    res.send('Pagina de posts')
})

router.get('/categorias', eAdmin, (req, res) => {
    Categoria.find().lean().sort({date:'desc'}).then((categorias) =>{
        res.render('admin/categorias', {categorias: categorias})
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listas categorias')
        res.redirect('/admin')
    })
    
})
router.get('/categorias/add', eAdmin, (req, res)=>{
    res.render('admin/addcategorias')
})
router.post('/categorias/nova', eAdmin, (req, res) => {
    
    var erros = []
    
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({text: 'Nome inválido'})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){   
        erros.push({texto: 'Slug inválido!'})

    }
    if(req.body.nome.length < 2){
        erros.push({texto: 'Nome da categoria é muito pequeno!'})
    }
    if(erros.length > 0){
        res.render('admin/addcategorias', {erros: erros})
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        
        new Categoria(novaCategoria).save().then(()=>{
            req.flash('success_msg', 'Categoria criada com sucesso!')
            res.redirect('/admin/categorias')
        }).catch((erro) => {
            req.flash('error_msg', 'Não foi possivel criar categoria')
            res.redirect('/admin')
            
        })
    }  
})
router.get('/categorias/edit/:id', eAdmin, (req, res) => {
    Categoria.findOne({_id:req.params.id}).lean().then((categoria) =>{
        res.render("admin/editcategorias", {categoria: categoria})
    }).catch((err) =>{
        req.flash('error_msg', "Está categoria não existe")
        res.redirect('/admin/categorias')
    })
})
router.post('/categorias/edit', eAdmin, (req,res)=>{
    Categoria.findOne({_id:req.body.id}).then((categoria)=>{
      var erros = []
  
      if(!req.body.nome || typeof req.body.nome==undefined || req.body.nome== null){
        erros.push({texto:'Nome inválido'})
      }
      if(!req.body.slug || typeof req.body.slug== undefined || req.body.slug== null){
        erros.push({texto: 'Slug inválido'})
      }
      if(req.body.nome.length < 2){
        erros.push({texto: 'Nome da categoria é muito curto'})
      }
      if(req.body.nome.length > 20){
        erros.push({texto: 'Nome da categoria é muito longo!'})
      }
      if(erros.length>0){
        res.render('admin/editcategorias', {Categoria:categoria, erros:erros})
      }else{
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug
        categoria.save().then(()=>{
          req.flash('success_msg', 'Categoria editada com sucesso!')
          res.redirect('/admin/categorias')
        }).catch((err)=>{
          req.flash('error_msg', 'Houve um erro ao salvar a categoria!')
          res.redirect('/admin/categorias')
        })
        }
    }).catch((err)=>{
      req.flash('error_msg', 'Houve um erro ao editar a categoria!')
      res.redirect('/admin/categorias')
    })
  })

router.post('/categorias/deletar', eAdmin, (req, res) =>{
    Categoria.deleteOne({_id: req.body.id}).then(()=>{
        req.flash("success_msg", "Categoria deletada com sucesso!")
        res.redirect('/admin/categorias')
    }).catch((err)=>{
        req.flash('error_msg', 'Houve um erro a o deletar a categoria')
        res.redirect('/admin/categorias')
    })
})
router.get('/postagens', eAdmin, (req, res)=>{

    /*StrictPopulateError: Cannot populate path `categorias` because it is not in your schema. Set the `strictPopulate` option to false to override.*/

    Postagem.find().lean().populate({path: 'categoria', strictPopulate: false}).sort({data: 'desc'}).then((postagens)=>{
        res.render('admin/postagens', {postagens: postagens})
    }).catch((err) =>{
        req.flash('error_msg', 'Houve um erro ao listar as postagens')
        res.redirect('/admin')
    })

    
})

router.get('/postagens/add', eAdmin, (req, res)=>{
    Categoria.find().lean().then((categorias)=>{
        res.render('admin/addpostagem', {categorias: categorias})
    }).catch((err)=>{
        req.flash("error_msg", 'Houve um erro ao carregar o formulário ')
        res.redirect("/admin" )
    })
})
router.post('/postagens/nova', eAdmin, (req, res) =>{
    var erros=[]

    // Validação
        // Validação Conteúdo
        if(!req.body.conteudo || typeof req.body.conteudo==undefined || req.body.conteudo== null){
            erros.push({text: "Conteúdo inválido, registre um conteúdo"})
        }
        if(req.body.conteudo.length < 10){
            erros.push({texto: 'O conteúdo é muito curto'})
        }
        if(req.body.conteudo.length > 1000){
            erros.push({texto: 'O conteúdo é muito longo'})
        }

        // Validação Título
        if(!req.body.titulo || typeof req.body.titulo==undefined || req.body.titulo==null){
            erros.push({text: "Título inválido, registre um título "})
        }
        if(req.body.titulo.length < 5){
            erros.push({texto: 'Nome do título é muito curto'})
        }
        if(req.body.titulo.length > 30){
            erros.push({texto: 'Nome do título é muito longo'})
        }

        // Validação da Descrição
        if(!req.body.descricao || typeof req.body.descricao==undefined || req.body.descricao==null){
            erros.push({text: 'Descrição Inválida, registre uma descrição '})
        }
        if(req.body.descricao.length < 10){
            erros.push({texto: 'A descrição é muito curta'})
        }
        if(req.body.descricao.length > 700){
            erros.push({texto: 'A descrição é muito longa'})
        }

        // Validação da Categoria
        if(req.body.categoria == "0"){
            erros.push({texto: "Categoria inválida, registre uma categoria"})
        }

        // Validação do Slug
        if(!req.body.slug || typeof req.body.slug== undefined || req.body.slug== null){
            erros.push({texto: 'Slug inválido'})
        }
        if(req.body.slug.length < 3){
            erros.push({texto: 'O Slug é muito curto'})
        }
        if(req.body.slug.length > 45){
            erros.push({texto: 'O Slug é muito longo'})
        }

        if(erros.length>0){
            res.render('admin/addpostagem',{erros:erros}
        )}else{
            const novaPostagem = {
                titulo: req.body.titulo,
                descricao: req.body.descricao,
                conteudo: req.body.conteudo,
                categoria: req.body.categoria,
                slug: req.body.slug
            }

            new Postagem(novaPostagem).save().then(()=>{
                req.flash("success_msg", "Postagem criada com sucesso!")
                res.redirect('/admin/postagens')
            }).catch((err)=>{
                req.flash("error_msg", "Houve um erro durante o salvamento da postagem")
                res.redirect('/admin/postagens')
            })
        }

})

router.get('/postagens/edit/:id', eAdmin, (req, res)=>{

    Postagem.findOne({_id: req.params.id}).lean().then((postagem)=>{

        Categoria.find().lean().then((categorias)=>{
            res.render('admin/editpostagens', {categorias: categorias, postagem: postagem})
        }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro ao listar as categorias')
            res.redirect('/admin/postagens')
        })

    }).catch((err)=>{
        req.flash('error_msg', 'Houve um erro ao carregar o formulário de edição')
        res.redirect('/admin/postagens')
    })
})

router.post('/postagem/edit', eAdmin, (req, res) =>{

    Postagem.findByIdAndUpdate({_id: req.body.id}).sort({data:'desc'}).then((postagem)=>{
        
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(()=>{
            req.flash('success_msg', "Postagem editada com sucesso!")
            res.redirect('/admin/postagens')
        }).catch((err)=>{
            req.flash("error_msg", "Erro interno")
            res.redirect("/admin/postagens/")
        })
        
    }).catch((err)=>{
        console.log(err)
        req.flash("error_msg", "Houve um erro ao salvar a edição")
        res.redirect("/admin/postagens/")
    })
 
})
// Deletar objetos[NÃO TÃO SEGURO!!!!]
router.get('/postagens/deletar/:id', eAdmin, (req, res) =>{
    Postagem.deleteOne({_id: req.params.id}).then(()=>{
        req.flash('success_msg', 'Postagem deletada com sucesso!')
        res.redirect('/admin/postagens')
    }).catch((err)=>{
        req.flash('error_msg', 'H ouve um erro interno')
        res.redirect('/admin/postagens')
    })
})


module.exports = router