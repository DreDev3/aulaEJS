const express = require('express');
const path = require('path');
const pdfkit = require('pdfkit');

const db = require('./models/connectDatabase');

const app = express();
const port = 3000;

//View engine

app.set('view engine', 'ejs'); //configurando o ejs como view engine
app.set('views', path.join(__dirname, 'views')); //configurando o caminho para as views 
app.use(express.static(path.join(__dirname, 'public'))); //configurando o caminho para os arquivos estaticos (css, js, imagens, etc)

//middleware para forms (body-parsear)
app.use(express.urlencoded({ extended: false }));

//Rotas da aplicação

app.get('/', (req, res) => {
  const sql = 'SELECT * FROM produtos'; //query para selecionar todos os itens

  db.query(sql, (err, results) => {
    if (err) return res.status(500).send('Erro ao buscar produtos no DB');

    res.render('index', { items: results });
  })
});

app.get('/cadastro', (req, res) => {
  res.render('cadastro'); //renderizando a view cadastro.ejs
});

app.post('/cadastro', (req, res) => {
  const { nome, descricao } = req.body; //pegando os dados do form
  const sql = 'INSERT INTO produtos (nome, descricao) VALUES (?, ?)'; //query para inserir um novo item

  db.query(sql, [nome, descricao], (err, results) => {
    if (err) return res.status(500).send('Erro ao cadastrar produto no DB');
  })

  res.redirect('/'); //redirecionando para a rota principal
});

app.get('/editar/:id', (req, res) => {
  const id = parseInt(req.params.id); //pegando o id do item a ser editado
  const sql = 'SELECT * FROM produtos WHERE id = ?'; //query para selecionar o item a ser editado

  db.query(sql, [id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).send('Item não encontrado'); //se o item não for encontrado, retorna um erro 404
    }
    res.render('editar', { item: results[0] }); //renderizando a view editar.ejs e passando o item encontrado
  });

  app.post('/editar/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { nome, descricao } = req.body;

    const sql = 'UPDATE produtos SET nome = ?, descricao = ? WHERE id = ?';

    db.query(sql, [nome, descricao, id], (err) => {
      if (err) return res.status(500).send('Erro ao atualizar produto no DB');

      res.redirect('/');

    })
  })
});

app.post('/deletar/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const sql = 'DELETE FROM produtos WHERE id = ?';

  db.query(sql, [id], (err) => {
    if (err) return res.status(500).send('Erro ao deletar produto no DB');

    res.redirect('/');
  })
});

app.get('/relatorio', (req, res) => {
  const doc = new pdfkit();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=relatorio.pdf');

  doc.pipe(res);

  // Título do relatório
  doc.fontSize(20).text('Relatório de Itens', { align: 'center' });
  doc.moveDown(2);

  // Definindo posições da tabela
  const tableTop = 100;
  const itemIdX = 50;
  const itemNomeX = 150;
  const itemDescricaoX = 350;

  // Cabeçalho da tabela
  doc
    .fontSize(12)
    .text('ID', itemIdX, tableTop)
    .text('Nome', itemNomeX, tableTop)
    .text('Descrição', itemDescricaoX, tableTop);

  // Linha abaixo do cabeçalho
  doc.moveTo(50, tableTop + 15)
    .lineTo(550, tableTop + 15)
    .stroke();

  let y = tableTop + 25;

  // Itens da tabela
  items.forEach(item => {
    // Escrevendo os campos
    doc.fontSize(10)
      .text(item.id.toString(), itemIdX, y)
      .text(item.nome, itemNomeX, y)
      .text(item.descricao, itemDescricaoX, y, { width: 180 }); // Definindo largura para a descrição

    // Calcula a altura ocupada por cada campo
    const idHeight = doc.heightOfString(item.id.toString(), { width: 100 });
    const nomeHeight = doc.heightOfString(item.nome, { width: 180 });
    const descricaoHeight = doc.heightOfString(item.descricao, { width: 180 });

    // Pega a maior altura entre os três
    const maxHeight = Math.max(idHeight, nomeHeight, descricaoHeight);

    // Linha separadora após o item
    doc.moveTo(50, y + maxHeight + 5)
      .lineTo(550, y + maxHeight + 5)
      .stroke();

    // Atualiza a posição Y para o próximo item
    y += maxHeight + 10; // Um pequeno espaço extra
  });

  // Finaliza o PDF
  doc.end();
})

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`); //exibindo mensagem no console
});