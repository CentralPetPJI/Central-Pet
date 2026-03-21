const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const saltRounds = 10;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pet_central'
});

db.connect(err => {
    if (err) return console.error('Erro no banco:', err);
    console.log('✅ Servidor e Banco conectados!');
});


//LOGIN
app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    const sqlAdotante = "SELECT * FROM adotantes WHERE email = ?";
    
    db.query(sqlAdotante, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: "Erro interno no servidor" });

        if (results.length > 0) {
            const user = results[0];
            const match = await bcrypt.compare(senha, user.senha);
            
            if (match) {
                return res.status(200).json({ 
                    message: "Login realizado! Bem-vindo(a), " + user.nome_completo,
                    tipo: 'adotante',
                    user: { nome: user.nome_completo, email: user.email }
                });
            } else {
                return res.status(401).json({ message: "Senha incorreta!" });
            }
        }

        const sqlOng = "SELECT * FROM ongs WHERE email = ?";
        db.query(sqlOng, [email], async (err, ongResults) => {
            if (err) return res.status(500).json({ error: "Erro interno no servidor" });

            if (ongResults.length > 0) {
                const ong = ongResults[0];
                const match = await bcrypt.compare(senha, ong.senha);

                if (match) {
                    return res.status(200).json({ 
                        message: "Login realizado! Bem-vinda, ONG " + ong.nome_ong,
                        tipo: 'ong',
                        user: { nome: ong.nome_ong, email: ong.email }
                    });
                } else {
                    return res.status(401).json({ message: "Senha incorreta!" });
                }
            }
            return res.status(404).json({ message: "Nenhum cadastro localizado com os dados informados!" });
        });
    });
});


//***********************ADOTANTE
app.post('/registrar/adotante', async (req, res) => {
    const { nome, nascimento, cpf, email, senha } = req.body;

    //Validar se já existe
    const checkSql = "SELECT id FROM adotantes WHERE email = ? OR cpf = ?";
    
    db.query(checkSql, [email, cpf], async (err, results) => {
        if (err) return res.status(500).json({ error: "Erro na consulta ao banco." });
        if (results.length > 0) return res.status(400).json({ message: "E-mail ou CPF já cadastrados!" });

        try {
            //Criptografas a senha
            const hashedPassword = await bcrypt.hash(senha, saltRounds);

            // 3. Inserir
            const sql = "INSERT INTO adotantes (nome_completo, data_nascimento, cpf, email, senha) VALUES (?, ?, ?, ?, ?)";
            db.query(sql, [nome, nascimento, cpf, email, hashedPassword], (insertErr) => {
                if (insertErr) return res.status(500).json({ error: "Erro ao inserir no banco." });
                return res.status(201).json({ message: "Cadastro realizado com sucesso! ✨" });
            });
        } catch (e) {
            return res.status(500).json({ message: "Erro ao processar senha." });
        }
    });
});

// ROTA ONG
app.post('/registrar/ong', async (req, res) => {
    const { nomeOng, cnpj, email, senha } = req.body;

    const checkSql = "SELECT id FROM ongs WHERE email = ? OR cnpj = ?";
    db.query(checkSql, [email, cnpj], async (err, results) => {
        if (err) return res.status(500).json({ error: "Erro na consulta." });
        if (results.length > 0) return res.status(400).json({ message: "E-mail ou CNPJ já cadastrados!" });

        try {
            const hashedPassword = await bcrypt.hash(senha, saltRounds);
            const sql = "INSERT INTO ongs (nome_ong, cnpj, email, senha) VALUES (?, ?, ?, ?)";
            db.query(sql, [nomeOng, cnpj, email, hashedPassword], (insertErr) => {
                if (insertErr) return res.status(500).json({ error: "Erro ao inserir." });
                return res.status(201).json({ message: "ONG cadastrada com sucesso! 🏢" });
            });
        } catch (e) {
            return res.status(500).json({ message: "Erro ao processar senha." });
        }
    });
});

const PORT = 3001;
app.listen(PORT, () => console.log(`🚀 Back-end online na porta ${PORT}`));