import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'stash.db';

async function getDatabase() {
  return await SQLite.openDatabaseAsync(DATABASE_NAME);
}

/* =========================================================
   INICIALIZACIÓN
   ========================================================= */

export async function initDatabase() {
  const db = await getDatabase();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      correo TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cuentas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      nombre TEXT NOT NULL,
      tipo TEXT NOT NULL,
      saldo_inicial REAL NOT NULL DEFAULT 0,
      saldo_actual REAL NOT NULL DEFAULT 0,
      color TEXT,

      FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      nombre TEXT NOT NULL,
      color TEXT,

      FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS gastos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      cuenta_id INTEGER NOT NULL,
      categoria_id INTEGER,
      monto REAL NOT NULL CHECK (monto > 0),
      fecha TEXT NOT NULL,
      nota TEXT,

      FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

      FOREIGN KEY (cuenta_id)
        REFERENCES cuentas(id)
        ON DELETE CASCADE,

      FOREIGN KEY (categoria_id)
        REFERENCES categorias(id)
        ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS presupuestos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      categoria_id INTEGER,
      monto_limite REAL NOT NULL CHECK (monto_limite > 0),
      periodo TEXT NOT NULL,

      FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

      FOREIGN KEY (categoria_id)
        REFERENCES categorias(id)
        ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS metas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      nombre TEXT NOT NULL,
      monto_objetivo REAL NOT NULL CHECK (monto_objetivo > 0),
      monto_acumulado REAL NOT NULL DEFAULT 0,

      FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
    );
  `);

  console.log('Base de datos STASH inicializada');

  return db;
}

/* =========================================================
   USUARIOS
   ========================================================= */

export async function createUser(
  nombre: string,
  correo: string,
  password: string
) {
  const db = await getDatabase();

  const result = await db.runAsync(
    `
    INSERT INTO usuarios (
      nombre,
      correo,
      password
    )
    VALUES (?, ?, ?)
    `,
    nombre.trim(),
    correo.trim().toLowerCase(),
    password
  );

  const userId = result.lastInsertRowId;

  await createDefaultCategories(userId);

  return userId;
}

export async function getUserByEmail(correo: string) {
  const db = await getDatabase();

  return await db.getFirstAsync(
    `
    SELECT *
    FROM usuarios
    WHERE correo = ?
    `,
    correo.trim().toLowerCase()
  );
}

export async function getUserById(usuarioId: number) {
  const db = await getDatabase();

  return await db.getFirstAsync(
    `
    SELECT id, nombre, correo
    FROM usuarios
    WHERE id = ?
    `,
    usuarioId
  );
}

/* =========================================================
   CATEGORÍAS
   ========================================================= */

export async function createDefaultCategories(
  usuarioId: number
) {
  const db = await getDatabase();

  const categories = [
    ['Comida', '#8DBD91'],
    ['Transporte', '#76AEDD'],
    ['Servicios', '#E5A3C2'],
    ['Entretenimiento', '#E8D27C'],
    ['Renta', '#E56A70'],
    ['Otros', '#B49ADE'],
  ];

  for (const category of categories) {
    await db.runAsync(
      `
      INSERT INTO categorias (
        usuario_id,
        nombre,
        color
      )
      SELECT ?, ?, ?
      WHERE NOT EXISTS (
        SELECT 1
        FROM categorias
        WHERE usuario_id = ?
        AND nombre = ?
      )
      `,
      usuarioId,
      category[0],
      category[1],
      usuarioId,
      category[0]
    );
  }
}

export async function getCategories(
  usuarioId: number
) {
  const db = await getDatabase();

  return await db.getAllAsync(
    `
    SELECT *
    FROM categorias
    WHERE usuario_id = ?
    ORDER BY nombre
    `,
    usuarioId
  );
}

/* =========================================================
   CUENTAS FINANCIERAS
   ========================================================= */

export async function createAccount(
  usuarioId: number,
  nombre: string,
  tipo: string,
  saldoInicial: number,
  color: string
) {
  const db = await getDatabase();

  const result = await db.runAsync(
    `
    INSERT INTO cuentas (
      usuario_id,
      nombre,
      tipo,
      saldo_inicial,
      saldo_actual,
      color
    )
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    usuarioId,
    nombre.trim(),
    tipo,
    saldoInicial,
    saldoInicial,
    color
  );

  return result.lastInsertRowId;
}

export async function getAccounts(
  usuarioId: number
) {
  const db = await getDatabase();

  return await db.getAllAsync(
    `
    SELECT *
    FROM cuentas
    WHERE usuario_id = ?
    ORDER BY id DESC
    `,
    usuarioId
  );
}

export async function getAccountById(
  cuentaId: number,
  usuarioId: number
) {
  const db = await getDatabase();

  return await db.getFirstAsync(
    `
    SELECT *
    FROM cuentas
    WHERE id = ?
    AND usuario_id = ?
    `,
    cuentaId,
    usuarioId
  );
}

/* =========================================================
   GASTOS
   ========================================================= */

export async function createExpense(
  usuarioId: number,
  cuentaId: number,
  categoriaId: number | null,
  monto: number,
  fecha: string,
  nota?: string
) {
  const db = await getDatabase();

  if (monto <= 0) {
    throw new Error(
      'El monto del gasto debe ser mayor que cero.'
    );
  }

  await db.withTransactionAsync(async () => {
    const account = await db.getFirstAsync<{
      saldo_actual: number;
    }>(
      `
      SELECT saldo_actual
      FROM cuentas
      WHERE id = ?
      AND usuario_id = ?
      `,
      cuentaId,
      usuarioId
    );

    if (!account) {
      throw new Error(
        'La cuenta seleccionada no existe.'
      );
    }

    await db.runAsync(
      `
      INSERT INTO gastos (
        usuario_id,
        cuenta_id,
        categoria_id,
        monto,
        fecha,
        nota
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      usuarioId,
      cuentaId,
      categoriaId,
      monto,
      fecha,
      nota?.trim() || null
    );

    await db.runAsync(
      `
      UPDATE cuentas
      SET saldo_actual = saldo_actual - ?
      WHERE id = ?
      AND usuario_id = ?
      `,
      monto,
      cuentaId,
      usuarioId
    );
  });
}

export async function getExpenses(
  usuarioId: number
) {
  const db = await getDatabase();

  return await db.getAllAsync(
    `
    SELECT
      gastos.id,
      gastos.monto,
      gastos.fecha,
      gastos.nota,

      categorias.id AS categoria_id,
      categorias.nombre AS categoria,
      categorias.color AS categoria_color,

      cuentas.id AS cuenta_id,
      cuentas.nombre AS cuenta,
      cuentas.tipo AS tipo_cuenta

    FROM gastos

    INNER JOIN cuentas
      ON gastos.cuenta_id = cuentas.id

    LEFT JOIN categorias
      ON gastos.categoria_id = categorias.id

    WHERE gastos.usuario_id = ?

    ORDER BY gastos.fecha DESC,
             gastos.id DESC
    `,
    usuarioId
  );
}

export async function getRecentExpenses(
  usuarioId: number,
  limite = 5
) {
  const db = await getDatabase();

  return await db.getAllAsync(
    `
    SELECT
      gastos.id,
      gastos.monto,
      gastos.fecha,
      gastos.nota,
      categorias.nombre AS categoria,
      categorias.color AS categoria_color,
      cuentas.nombre AS cuenta,
      cuentas.tipo AS tipo_cuenta

    FROM gastos

    INNER JOIN cuentas
      ON gastos.cuenta_id = cuentas.id

    LEFT JOIN categorias
      ON gastos.categoria_id = categorias.id

    WHERE gastos.usuario_id = ?

    ORDER BY gastos.fecha DESC,
             gastos.id DESC

    LIMIT ?
    `,
    usuarioId,
    limite
  );
}

/* =========================================================
   PRESUPUESTOS
   ========================================================= */

export async function createBudget(
  usuarioId: number,
  categoriaId: number | null,
  montoLimite: number,
  periodo: string
) {
  const db = await getDatabase();

  const result = await db.runAsync(
    `
    INSERT INTO presupuestos (
      usuario_id,
      categoria_id,
      monto_limite,
      periodo
    )
    VALUES (?, ?, ?, ?)
    `,
    usuarioId,
    categoriaId,
    montoLimite,
    periodo
  );

  return result.lastInsertRowId;
}

export async function getBudgets(
  usuarioId: number
) {
  const db = await getDatabase();

  return await db.getAllAsync(
    `
    SELECT
      presupuestos.*,
      categorias.nombre AS categoria

    FROM presupuestos

    LEFT JOIN categorias
      ON presupuestos.categoria_id = categorias.id

    WHERE presupuestos.usuario_id = ?
    `,
    usuarioId
  );
}

/* =========================================================
   METAS
   ========================================================= */

export async function createGoal(
  usuarioId: number,
  nombre: string,
  montoObjetivo: number
) {
  const db = await getDatabase();

  const result = await db.runAsync(
    `
    INSERT INTO metas (
      usuario_id,
      nombre,
      monto_objetivo
    )
    VALUES (?, ?, ?)
    `,
    usuarioId,
    nombre.trim(),
    montoObjetivo
  );

  return result.lastInsertRowId;
}

export async function getGoals(
  usuarioId: number
) {
  const db = await getDatabase();

  return await db.getAllAsync(
    `
    SELECT *,
      CASE
        WHEN monto_objetivo > 0
        THEN (monto_acumulado / monto_objetivo) * 100
        ELSE 0
      END AS porcentaje

    FROM metas

    WHERE usuario_id = ?
    `,
    usuarioId
  );
}

/* =========================================================
   DASHBOARD
   ========================================================= */

export async function getTotalBalance(
  usuarioId: number
) {
  const db = await getDatabase();

  const result = await db.getFirstAsync<{
    total: number;
  }>(
    `
    SELECT
      COALESCE(SUM(saldo_actual), 0)
      AS total

    FROM cuentas

    WHERE usuario_id = ?
    `,
    usuarioId
  );

  return result?.total ?? 0;
}

export async function getExpenseCount(
  usuarioId: number
) {
  const db = await getDatabase();

  const result = await db.getFirstAsync<{
    total: number;
  }>(
    `
    SELECT COUNT(*) AS total
    FROM gastos
    WHERE usuario_id = ?
    `,
    usuarioId
  );

  return result?.total ?? 0;
}