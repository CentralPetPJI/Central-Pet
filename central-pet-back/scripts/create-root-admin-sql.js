const { execSync } = require('child_process');
const { existsSync, readFileSync, writeFileSync, unlinkSync } = require('fs');
const { join } = require('path');
const { randomBytes, scrypt: scryptCallback } = require('crypto');
const { promisify } = require('util');
const readline = require('readline');
const scrypt = promisify(scryptCallback);

const ROOT_EMAIL = 'root@centralpet.com';
const ROOT_NAME = 'Root User';
const ROOT_ROLE = 'ROOT';

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await scrypt(password, salt, 64);

  return `${salt}:${derivedKey.toString('hex')}`;
}

function getDatabaseConfig() {
  const envPath = existsSync(join(__dirname, '..', '.env'))
    ? join(__dirname, '..', '.env')
    : join(__dirname, '..', '.env.development');

  if (!existsSync(envPath)) throw new Error('Arquivo .env não encontrado');

  const content = readFileSync(envPath, 'utf8');
  const match = content.match(/^DATABASE_URL=(.+)$/m);
  if (!match) throw new Error('DATABASE_URL não encontrada');

  const url = match[1].replace(/['\"]/g, '').trim();
  const dbMatch = url.match(/^postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
  if (!dbMatch) throw new Error('Formato de DATABASE_URL inválido');

  return {
    user: dbMatch[1],
    password: dbMatch[2],
    host: dbMatch[3],
    port: dbMatch[4],
    database: dbMatch[5],
  };
}

function sqlEscape(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/'/g, "''");
}

function buildSql(rootId, passwordHash) {
  const rootName = sqlEscape(ROOT_NAME);
  const sql = [
    `BEGIN;`,
    `INSERT INTO "User" (id, "fullName", email, role, "passwordHash", "updatedAt") VALUES ('${rootId}', '${rootName}', '${ROOT_EMAIL}', '${ROOT_ROLE}', '${passwordHash}', NOW()) ON CONFLICT (email) DO UPDATE SET role = '${ROOT_ROLE}', "updatedAt" = NOW();`,
    `COMMIT;`,
  ].join('\n');
  return sql;
}

function getPasswordFromArgsOrPrompt(callback) {
  const arg = process.argv.find((a) => a.startsWith('--password='));

  if (arg) {
    const pwd = arg.split('=')[1];
    if (pwd) return callback(pwd);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.stdoutMuted = true;

  rl.question('Digite a senha: ', (password) => {
    rl.close();
    process.stdout.write('\n');
    callback(password);
  });

  rl._writeToOutput = function (stringToWrite) {
    if (rl.stdoutMuted) {
      rl.output.write('*');
    } else {
      rl.output.write(stringToWrite);
    }
  };
}

function run() {
  getPasswordFromArgsOrPrompt(async function (password) {
    try {
      if (!password) throw new Error('Senha não informada');
      const config = getDatabaseConfig();
      const rootId = require('crypto').randomUUID();
      const passwordHash = await hashPassword(password);
      const sql = buildSql(rootId, passwordHash);
      const tmpFile = `/tmp/centralpet_create_root_admin_${Date.now()}.sql`;
      writeFileSync(tmpFile, sql, { encoding: 'utf8' });
      console.log(
        `🚀 Executando SQL em ${tmpFile} contra ${config.host}:${config.port}/${config.database}`,
      );
      execSync(
        `PGPASSWORD='${config.password}' psql -h ${config.host} -p ${config.port} -U ${config.user} -d ${config.database} -f ${tmpFile}`,
        { stdio: 'inherit' },
      );
      unlinkSync(tmpFile);
      console.log('✅ Usuário root criado/atualizado com sucesso (via psql)!');
    } catch (error) {
      console.error('❌ Erro ao criar usuário root (psql):', error.message);
      process.exit(1);
    }
  });
}

run();
