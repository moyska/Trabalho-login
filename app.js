const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = 3000;

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


//sessões
app.use(
  session({
    secret: 'chave-secreta', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, 
  })
);

//autenticação
function authMiddleware(req, res, next) {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.status(401).send('Acesso negado! Por favor, faça login.');
  }
}

//  paginas HTML
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'public')));

// Rota inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Rota de login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'login' && password === '12345678') {
    req.session.isAuthenticated = true;
    req.session.user = { username };
    res.redirect('/protected.html');
  } else {
    res.status(401).send('Login ou senha Incorreto!');
  }
});

// Rota de logout
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Erro ao sair.');
    }
    res.clearCookie('connect.sid'); // Limpa o cookie de sessão
    res.redirect('/');
  });
});

// Rota protegida
app.get('/protected', authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'protected.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
