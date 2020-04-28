/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-sync */

import * as fs from 'fs'
import * as path from 'path'

import { Client } from 'pg'

import config from '../config'
import logger from '../utils/logger'

/**
 * Syncs the database schema with our database (optionally seeds with test values).
 *
 * @param databaseConfig - Contains the database connection configuration, and some options for controlling behavior.
 */
export default async function syncDatabaseSchema(
  databaseConfig = config.database,
): Promise<void> {
  // Define the list of directories holding '*.sql' files, in the order we want to execute them
  const sqlDirectories = [
    'extensions',
    'schema',
    'functions',
    'triggers',
    'migrations',
  ]

  // Run the seed script if we are seeding our database
  if (databaseConfig.options.seedDatabase) {
    sqlDirectories.push('seed')
  }

  // Loop through directories holding SQL files and execute them against the database
  for (const directory of sqlDirectories) {
    const files = fs.readdirSync(path.join(__dirname, directory))

    // Note that this loops through the files in alphabetical order
    for (const file of files) {
      await executeSQLFile(
        path.join(__dirname, directory, file),
        databaseConfig,
      )
    }
  }
}

/**
 * HELPER FUNCTIONS
 */

/**
 * Run the SQL file containing queries on the database.
 *
 * @param string - A SQL file that we would like to execute against our database.
 */
async function executeSQLFile(
  file: string,
  databaseConfig = config.database,
): Promise<void> {
  const sql = fs.readFileSync(file, 'utf8')
  const client = new Client(databaseConfig.connection)

  try {
    // Connect to the database
    await client.connect()

    // Execute SQL query
    logger.debug(`Executing query:\n${sql}`)
    await client.query(sql)

    // Close the database connection
    await client.end()
  } catch (err) {
    logger.fatal('error running query', file, err.message)

    // If we can't execute our SQL, our app is in an indeterminate state, so kill it.
    process.exit(1)
  }
}
