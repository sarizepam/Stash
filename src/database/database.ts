import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'stash.db';

async function getDatabase() {
  return await SQLite.openDatabaseAsync(
    DATABASE_NAME
  );
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
      password TEXT NOT NULL,
      foto_perfil TEXT
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

  /*
    MIGRACIÓN:
    Si la base ya existía antes de agregar foto_perfil,
    CREATE TABLE IF NOT EXISTS no modifica la tabla existente.

    Por eso verificamos si la columna ya existe.
  */

  const userColumns =
    await db.getAllAsync<{
      name: string;
    }>(
      `
      PRAGMA table_info(usuarios)
      `
    );

  const hasProfilePhoto =
    userColumns.some(
      (column) =>
        column.name === 'foto_perfil'
    );

  if (!hasProfilePhoto) {
    await db.execAsync(`
      ALTER TABLE usuarios
      ADD COLUMN foto_perfil TEXT;
    `);
  }

  console.log(
    'Base de datos STASH inicializada'
  );

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

  const userId =
    result.lastInsertRowId;

  await createDefaultCategories(
    userId
  );

  return userId;
}

export async function getUserByEmail(
  correo: string
) {
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

export async function getUserById(
  usuarioId: number
) {
  const db = await getDatabase();

  return await db.getFirstAsync(
    `
    SELECT
      id,
      nombre,
      correo,
      foto_perfil

    FROM usuarios

    WHERE id = ?
    `,
    usuarioId
  );
}

export async function updateUserProfile(
  usuarioId: number,
  nombre: string,
  fotoPerfil: string | null
) {
  const db = await getDatabase();

  if (!nombre.trim()) {
    throw new Error(
      'El nombre es obligatorio.'
    );
  }

  await db.runAsync(
    `
    UPDATE usuarios

    SET
      nombre = ?,
      foto_perfil = ?

    WHERE id = ?
    `,
    nombre.trim(),
    fotoPerfil,
    usuarioId
  );
}

export async function updateUserPassword(
  usuarioId: number,
  passwordActual: string,
  passwordNueva: string
) {
  const db = await getDatabase();

  const user =
    await db.getFirstAsync<{
      password: string;
    }>(
      `
      SELECT password
      FROM usuarios
      WHERE id = ?
      `,
      usuarioId
    );

  if (!user) {
    throw new Error(
      'Usuario no encontrado.'
    );
  }

  if (
    user.password !==
    passwordActual
  ) {
    throw new Error(
      'La contraseña actual es incorrecta.'
    );
  }

  if (
    passwordNueva.length < 6
  ) {
    throw new Error(
      'La nueva contraseña debe tener al menos 6 caracteres.'
    );
  }

  await db.runAsync(
    `
    UPDATE usuarios
    SET password = ?
    WHERE id = ?
    `,
    passwordNueva,
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

export async function getCategoryById(
  categoriaId: number,
  usuarioId: number
) {
  const db = await getDatabase();

  return await db.getFirstAsync(
    `
    SELECT *
    FROM categorias
    WHERE id = ?
    AND usuario_id = ?
    `,
    categoriaId,
    usuarioId
  );
}

export async function createCategory(
  usuarioId: number,
  nombre: string,
  color: string
) {
  const db = await getDatabase();

  if (!nombre.trim()) {
    throw new Error(
      'El nombre de la categoría es obligatorio.'
    );
  }

  const existingCategory =
    await db.getFirstAsync(
      `
      SELECT id
      FROM categorias
      WHERE usuario_id = ?
      AND LOWER(nombre) = LOWER(?)
      `,
      usuarioId,
      nombre.trim()
    );

  if (existingCategory) {
    throw new Error(
      'Ya existe una categoría con ese nombre.'
    );
  }

  const result =
    await db.runAsync(
      `
      INSERT INTO categorias (
        usuario_id,
        nombre,
        color
      )
      VALUES (?, ?, ?)
      `,
      usuarioId,
      nombre.trim(),
      color
    );

  return result.lastInsertRowId;
}

export async function updateCategory(
  categoriaId: number,
  usuarioId: number,
  nombre: string,
  color: string
) {
  const db = await getDatabase();

  if (!nombre.trim()) {
    throw new Error(
      'El nombre de la categoría es obligatorio.'
    );
  }

  const duplicate =
    await db.getFirstAsync(
      `
      SELECT id
      FROM categorias

      WHERE usuario_id = ?
      AND LOWER(nombre) = LOWER(?)
      AND id != ?
      `,
      usuarioId,
      nombre.trim(),
      categoriaId
    );

  if (duplicate) {
    throw new Error(
      'Ya existe otra categoría con ese nombre.'
    );
  }

  await db.runAsync(
    `
    UPDATE categorias

    SET
      nombre = ?,
      color = ?

    WHERE id = ?
    AND usuario_id = ?
    `,
    nombre.trim(),
    color,
    categoriaId,
    usuarioId
  );
}

export async function deleteCategory(
  categoriaId: number,
  usuarioId: number
) {
  const db = await getDatabase();

  await db.runAsync(
    `
    DELETE FROM categorias
    WHERE id = ?
    AND usuario_id = ?
    `,
    categoriaId,
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

  const result =
    await db.runAsync(
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

export async function updateAccount(
  cuentaId: number,
  usuarioId: number,
  nombre: string,
  tipo: string,
  color: string
) {
  const db = await getDatabase();

  await db.runAsync(
    `
    UPDATE cuentas

    SET
      nombre = ?,
      tipo = ?,
      color = ?

    WHERE id = ?
    AND usuario_id = ?
    `,
    nombre.trim(),
    tipo,
    color,
    cuentaId,
    usuarioId
  );
}

export async function adjustAccountBalance(
  cuentaId: number,
  usuarioId: number,
  cantidad: number
) {
  const db = await getDatabase();

  await db.runAsync(
    `
    UPDATE cuentas

    SET saldo_actual =
      saldo_actual + ?

    WHERE id = ?
    AND usuario_id = ?
    `,
    cantidad,
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

  await db.withTransactionAsync(
    async () => {
      const account =
        await db.getFirstAsync<{
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

        SET saldo_actual =
          saldo_actual - ?

        WHERE id = ?
        AND usuario_id = ?
        `,
        monto,
        cuentaId,
        usuarioId
      );
    }
  );
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
      ON gastos.cuenta_id =
         cuentas.id

    LEFT JOIN categorias
      ON gastos.categoria_id =
         categorias.id

    WHERE gastos.usuario_id = ?

    ORDER BY
      gastos.fecha DESC,
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

      categorias.nombre
        AS categoria,

      categorias.color
        AS categoria_color,

      cuentas.nombre
        AS cuenta,

      cuentas.tipo
        AS tipo_cuenta

    FROM gastos

    INNER JOIN cuentas
      ON gastos.cuenta_id =
         cuentas.id

    LEFT JOIN categorias
      ON gastos.categoria_id =
         categorias.id

    WHERE gastos.usuario_id = ?

    ORDER BY
      gastos.fecha DESC,
      gastos.id DESC

    LIMIT ?
    `,
    usuarioId,
    limite
  );
}

export async function getExpenseById(
  gastoId: number,
  usuarioId: number
) {
  const db = await getDatabase();

  return await db.getFirstAsync(
    `
    SELECT
      gastos.id,
      gastos.usuario_id,
      gastos.cuenta_id,
      gastos.categoria_id,
      gastos.monto,
      gastos.fecha,
      gastos.nota,

      categorias.nombre
        AS categoria,

      categorias.color
        AS categoria_color,

      cuentas.nombre
        AS cuenta,

      cuentas.tipo
        AS tipo_cuenta

    FROM gastos

    INNER JOIN cuentas
      ON gastos.cuenta_id =
         cuentas.id

    LEFT JOIN categorias
      ON gastos.categoria_id =
         categorias.id

    WHERE gastos.id = ?
    AND gastos.usuario_id = ?
    `,
    gastoId,
    usuarioId
  );
}

export async function updateExpense(
  gastoId: number,
  usuarioId: number,
  nuevaCuentaId: number,
  nuevaCategoriaId:
    number | null,
  nuevoMonto: number,
  nuevaFecha: string,
  nuevaNota?: string
) {
  const db = await getDatabase();

  if (nuevoMonto <= 0) {
    throw new Error(
      'El monto del gasto debe ser mayor que cero.'
    );
  }

  await db.withTransactionAsync(
    async () => {
      const oldExpense =
        await db.getFirstAsync<{
          cuenta_id: number;
          monto: number;
        }>(
          `
          SELECT
            cuenta_id,
            monto

          FROM gastos

          WHERE id = ?
          AND usuario_id = ?
          `,
          gastoId,
          usuarioId
        );

      if (!oldExpense) {
        throw new Error(
          'El gasto no existe.'
        );
      }

      const newAccount =
        await db.getFirstAsync<{
          id: number;
        }>(
          `
          SELECT id
          FROM cuentas

          WHERE id = ?
          AND usuario_id = ?
          `,
          nuevaCuentaId,
          usuarioId
        );

      if (!newAccount) {
        throw new Error(
          'La nueva cuenta seleccionada no existe.'
        );
      }

      if (
        nuevaCategoriaId !== null
      ) {
        const category =
          await db.getFirstAsync<{
            id: number;
          }>(
            `
            SELECT id
            FROM categorias

            WHERE id = ?
            AND usuario_id = ?
            `,
            nuevaCategoriaId,
            usuarioId
          );

        if (!category) {
          throw new Error(
            'La categoría seleccionada no existe.'
          );
        }
      }

      /*
        1. Devolver el gasto anterior
           a la cuenta original.
      */

      await db.runAsync(
        `
        UPDATE cuentas

        SET saldo_actual =
          saldo_actual + ?

        WHERE id = ?
        AND usuario_id = ?
        `,
        oldExpense.monto,
        oldExpense.cuenta_id,
        usuarioId
      );

      /*
        2. Actualizar gasto.
      */

      await db.runAsync(
        `
        UPDATE gastos

        SET
          cuenta_id = ?,
          categoria_id = ?,
          monto = ?,
          fecha = ?,
          nota = ?

        WHERE id = ?
        AND usuario_id = ?
        `,
        nuevaCuentaId,
        nuevaCategoriaId,
        nuevoMonto,
        nuevaFecha,
        nuevaNota?.trim() ||
          null,
        gastoId,
        usuarioId
      );

      /*
        3. Descontar nuevo gasto.
      */

      await db.runAsync(
        `
        UPDATE cuentas

        SET saldo_actual =
          saldo_actual - ?

        WHERE id = ?
        AND usuario_id = ?
        `,
        nuevoMonto,
        nuevaCuentaId,
        usuarioId
      );
    }
  );
}

export async function deleteExpense(
  gastoId: number,
  usuarioId: number
) {
  const db = await getDatabase();

  await db.withTransactionAsync(
    async () => {
      const expense =
        await db.getFirstAsync<{
          cuenta_id: number;
          monto: number;
        }>(
          `
          SELECT
            cuenta_id,
            monto

          FROM gastos

          WHERE id = ?
          AND usuario_id = ?
          `,
          gastoId,
          usuarioId
        );

      if (!expense) {
        throw new Error(
          'El gasto no existe.'
        );
      }

      /*
        Devolver el dinero.
      */

      await db.runAsync(
        `
        UPDATE cuentas

        SET saldo_actual =
          saldo_actual + ?

        WHERE id = ?
        AND usuario_id = ?
        `,
        expense.monto,
        expense.cuenta_id,
        usuarioId
      );

      /*
        Eliminar gasto.
      */

      await db.runAsync(
        `
        DELETE FROM gastos

        WHERE id = ?
        AND usuario_id = ?
        `,
        gastoId,
        usuarioId
      );
    }
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

  const result =
    await db.runAsync(
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
      categorias.nombre
        AS categoria

    FROM presupuestos

    LEFT JOIN categorias
      ON presupuestos.categoria_id =
         categorias.id

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

  const result =
    await db.runAsync(
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

        THEN
          (
            monto_acumulado /
            monto_objetivo
          ) * 100

        ELSE 0
      END AS porcentaje

    FROM metas

    WHERE usuario_id = ?
    `,
    usuarioId
  );
}

export async function getGoalById(
  metaId: number,
  usuarioId: number
) {
  const db = await getDatabase();

  return await db.getFirstAsync(
    `
    SELECT *,

      CASE
        WHEN monto_objetivo > 0

        THEN
          (
            monto_acumulado /
            monto_objetivo
          ) * 100

        ELSE 0
      END AS porcentaje

    FROM metas

    WHERE id = ?
    AND usuario_id = ?
    `,
    metaId,
    usuarioId
  );
}

export async function updateGoal(
  metaId: number,
  usuarioId: number,
  nombre: string,
  montoObjetivo: number
) {
  const db = await getDatabase();

  if (!nombre.trim()) {
    throw new Error(
      'El nombre de la meta es obligatorio.'
    );
  }

  if (montoObjetivo <= 0) {
    throw new Error(
      'El monto objetivo debe ser mayor que cero.'
    );
  }

  await db.runAsync(
    `
    UPDATE metas

    SET
      nombre = ?,
      monto_objetivo = ?

    WHERE id = ?
    AND usuario_id = ?
    `,
    nombre.trim(),
    montoObjetivo,
    metaId,
    usuarioId
  );
}

export async function adjustGoalAmount(
  metaId: number,
  usuarioId: number,
  cantidad: number
) {
  const db = await getDatabase();

  const goal =
    await db.getFirstAsync<{
      monto_acumulado: number;
    }>(
      `
      SELECT monto_acumulado

      FROM metas

      WHERE id = ?
      AND usuario_id = ?
      `,
      metaId,
      usuarioId
    );

  if (!goal) {
    throw new Error(
      'La meta no existe.'
    );
  }

  const nuevoMonto =
    goal.monto_acumulado +
    cantidad;

  if (nuevoMonto < 0) {
    throw new Error(
      'No puedes retirar más dinero del que tienes ahorrado.'
    );
  }

  await db.runAsync(
    `
    UPDATE metas

    SET monto_acumulado = ?

    WHERE id = ?
    AND usuario_id = ?
    `,
    nuevoMonto,
    metaId,
    usuarioId
  );
}

export async function deleteGoal(
  metaId: number,
  usuarioId: number
) {
  const db = await getDatabase();

  await db.runAsync(
    `
    DELETE FROM metas

    WHERE id = ?
    AND usuario_id = ?
    `,
    metaId,
    usuarioId
  );
}

export async function getTotalSavings(
  usuarioId: number
) {
  const db = await getDatabase();

  const result =
    await db.getFirstAsync<{
      total: number;
    }>(
      `
      SELECT
        COALESCE(
          SUM(monto_acumulado),
          0
        ) AS total

      FROM metas

      WHERE usuario_id = ?
      `,
      usuarioId
    );

  return result?.total ?? 0;
}

export async function getSavingsProgress(
  usuarioId: number
) {
  const db = await getDatabase();

  const result =
    await db.getFirstAsync<{
      acumulado: number;
      objetivo: number;
    }>(
      `
      SELECT
        COALESCE(
          SUM(monto_acumulado),
          0
        ) AS acumulado,

        COALESCE(
          SUM(monto_objetivo),
          0
        ) AS objetivo

      FROM metas

      WHERE usuario_id = ?
      `,
      usuarioId
    );

  const acumulado =
    result?.acumulado ?? 0;

  const objetivo =
    result?.objetivo ?? 0;

  const porcentaje =
    objetivo > 0
      ? (
          acumulado /
          objetivo
        ) * 100
      : 0;

  return {
    acumulado,
    objetivo,
    porcentaje,
  };
}

/* =========================================================
   DASHBOARD
   ========================================================= */

export async function getTotalBalance(
  usuarioId: number
) {
  const db = await getDatabase();

  const result =
    await db.getFirstAsync<{
      total: number;
    }>(
      `
      SELECT
        COALESCE(
          SUM(saldo_actual),
          0
        ) AS total

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

  const result =
    await db.getFirstAsync<{
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