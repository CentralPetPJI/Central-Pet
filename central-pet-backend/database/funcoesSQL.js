const db = require('./db');

const UserModel = {

    // ==========================================
    // CONSULTAS
    // ==========================================

    // Buscar por e-mail em qualquer uma das tabelas
    findByEmail: async (email, tabela) => {
        const sql = 'SELECT * FROM ${tabela} WHERE email = ?';
        const [results] = await db.query(sql, [email]);
        return results[0];
    },

    /// Buscar todos os registros da tbe,la    
    findAll: async (tabela) => {
        const sql = 'SELECT * FROM ${tabela}';
        const [results] = await db.query(sql);
        return results;
    },


    // ==========================================
    // VALIDAÇÕES
    // ==========================================

    // Validar duplicidade de E-mail ou CPF, CNPJ antes de realizar o Cadastro
    checkExists: async (email, doc, tabela, campoDoc) => {
        const sql = 'SELECT id FROM ${tabela} WHERE email = ? OR ${campoDoc} = ?';
        const [results] = await db.query(sql, [email, doc]);
        return results.length > 0;
    },

    // ==========================================
    // INSERÇÕES
    // ==========================================

    // Adicionar os dados de adotantes ao Banco central-pet > adotantes
    createAdotante: async (nome, nascimento, cpf, email, senha) => {
        const sql = "INSERT INTO adotantes (nome_completo, data_nascimento, cpf, email, senha) VALUES (?, ?, ?, ?, ?)";
        return await db.query(sql, [nome, nascimento, cpf, email, senha]);
    },

    // Adicionar os dados de Ongs ao Banco central-pet > ongs
    createOng: async (nomeOng, cnpj, email, senha) => {
        const sql = "INSERT INTO ongs (nome_ong, cnpj, email, senha) VALUES (?, ?, ?, ?)";
        return await db.query(sql, [nomeOng, cnpj, email, senha]);
    },

    // Funcao para ONG adicionar um novo PET, ainda nao está em uso, deixei para usarmos futuramente 
    createPet: async (nome, especie, raca, idade, status, ongId) => {
        const sql = "INSERT INTO pets (nome, especie, raca, idade, status, ong_id) VALUES (?, ?, ?, ?, ?, ?)";
        return await db.query(sql, [nome, especie, raca, idade, status, ongId]);
    },
   
    // ==========================================
    // ATUALIZAÇÕES DA BASE (UPDATE)
    // ==========================================

    // Atualizar dados do perfil (Adotante ou ONG)
    updateUser: async (id, tabela, dados) => {
        // 'dados' deve ser um objeto ex: { nome_completo: 'Novo Nome' }
        const sql = 'UPDATE ${tabela} SET ? WHERE id = ?';
        return await db.query(sql, [dados, id]);
    },

    // Atualizar status de um pet (ex: de 'disponível' para 'adotado')
    updatePetStatus: async (petId, novoStatus) => {
        const sql = "UPDATE pets SET status = ? WHERE id = ?";
        return await db.query(sql, [novoStatus, petId]);
    },

    // ==========================================
    // 5. DELEÇÕES (DELETE)
    // ==========================================

    // Remover um registro ************(CUIDADO, nao queremos apagar todos os dados kkkk)
    deleteById: async (id, tabela) => {
        const sql = 'DELETE FROM ${tabela} WHERE id = ?';
        return await db.query(sql, [id]);
    }

};

module.exports = FuncoesSQL;