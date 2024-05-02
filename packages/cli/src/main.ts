#! /usr/bin/env node
import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { Program } from './application/program'
const PKG_FILE = join(__dirname, '..', 'package.json')
const { name, description, version } = JSON.parse(readFileSync(PKG_FILE, 'utf-8'))


new Program(name, version, description).execute()
